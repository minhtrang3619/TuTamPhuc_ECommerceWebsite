import os
import sys
import json
from sqlalchemy import create_engine, MetaData, text
from sqlalchemy.orm import sessionmaker

# Add current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.database.session import Base
# Import all models to ensure they are registered in Base.metadata
import app.models

LOCAL_DB_URL = settings.DATABASE_URL
NEON_DB_URL = "postgresql://neondb_owner:npg_KA3YFR9WilOr@ep-noisy-bonus-ao4u1a7e.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

print(f"Local DB: {LOCAL_DB_URL}")
print(f"Neon DB: {NEON_DB_URL}")

def sync():
    # 1. Create engines
    local_engine = create_engine(LOCAL_DB_URL)
    neon_engine = create_engine(NEON_DB_URL)

    # 2. Get sorted tables (parents first, children last)
    sorted_tables = Base.metadata.sorted_tables
    
    print("\nDetected tables in dependency order:")
    for table in sorted_tables:
        print(f" - {table.name}")

    # 2b. Add WAREHOUSE_STAFF to userrole enum if missing (must be committed before transaction)
    try:
        # Run with AUTOCOMMIT on a separate temporary connection to ensure it runs outside any transaction block
        temp_conn = neon_engine.connect()
        autocommit_conn = temp_conn.execution_options(isolation_level="AUTOCOMMIT")
        autocommit_conn.execute(text("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'WAREHOUSE_STAFF'"))
        temp_conn.close()
        print("\nSuccessfully updated userrole enum on Neon.")
    except Exception as enum_err:
        print(f"\nWarning: Could not alter type userrole (maybe it doesn't exist yet or is different): {enum_err}")
    
    # 2c. Open fresh connections for the main data sync
    local_conn = local_engine.connect()
    neon_conn = neon_engine.connect()
    neon_trans = neon_conn.begin()
    try:
        # 3. Truncate/Delete child tables first (reversed dependency order)
        print("\nStep 1: Clearing Neon database tables...")
        for table in reversed(sorted_tables):
            print(f" - Truncating/Deleting table: {table.name}")
            try:
                neon_conn.execute(text(f"DELETE FROM {table.name}"))
            except Exception as delete_err:
                print(f"   [Error deleting {table.name}, trying CASCADE: {delete_err}]")
                neon_conn.execute(text(f"TRUNCATE TABLE {table.name} CASCADE"))
            
        print("\nStep 2: Copying data from local to Neon...")
        # 4. Insert data table-by-table (dependency order)
        for table in sorted_tables:
            # Query all rows from local
            result = local_conn.execute(text(f"SELECT * FROM {table.name}"))
            rows = result.fetchall()
            
            if not rows:
                print(f" - Table {table.name}: 0 rows (skipped)")
                continue
                
            print(f" - Table {table.name}: Copying {len(rows)} rows...")
            
            # Get column names
            columns = result.keys()
            
            # Prepare insert statement
            placeholders = ", ".join([f":{col}" for col in columns])
            insert_query = text(f"INSERT INTO {table.name} ({', '.join(columns)}) VALUES ({placeholders})")
            
            # Convert rows to list of dicts, serializing lists/dicts to JSON strings
            data = []
            for row in rows:
                row_dict = dict(zip(columns, row))
                for col, val in row_dict.items():
                    if isinstance(val, (list, dict)):
                        row_dict[col] = json.dumps(val)
                data.append(row_dict)
            
            # Execute batch insert on Neon
            neon_conn.execute(insert_query, data)
            
        # 5. Reset PostgreSQL auto-increment sequences
        print("\nStep 3: Resetting auto-increment sequences on Neon...")
        for table in sorted_tables:
            # Check if table has an 'id' column
            has_id = any(col.name == 'id' for col in table.columns)
            if has_id:
                try:
                    # PG query to reset sequence
                    seq_query = text(
                        f"SELECT setval(pg_get_serial_sequence('{table.name}', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM {table.name}"
                    )
                    neon_conn.execute(seq_query)
                    print(f" - Reset sequence for: {table.name}")
                except Exception as seq_err:
                    # Some tables might not use serial sequence for id, skip quietly
                    pass

        neon_trans.commit()
        print("\nSUCCESS: Database sync completed successfully! Local database has been mirrored to Neon DB.")
    except Exception as e:
        neon_trans.rollback()
        print(f"\nERROR: During database sync: {str(e).encode('ascii', 'ignore').decode('ascii')}")
        raise e
    finally:
        local_conn.close()
        neon_conn.close()

if __name__ == "__main__":
    sync()
