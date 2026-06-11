# Từ Tâm Phục - Premium E-Commerce Website

> **Từ Tâm Phục** là một dự án website thương mại điện tử cao cấp, chuyên cung cấp các sản phẩm đồ lam, pháp phục, áo tràng. Giao diện được thiết kế theo phong cách tối giản thanh lịch.



## Công Nghệ Sử Dụng

### Frontend (Ứng dụng Client)
- **Framework**: React.js + Vite (TypeScript)
- **Styling**: TailwindCSS + CSS Vanilla
- **Quản lý trạng thái**: Zustand
- **Truy vấn & Caching**: TanStack Query (React Query) + Axios
- **Form & Validation**: React Hook Form + Zod
- **Hiệu ứng & Animation**: Framer Motion + Lucide Icons

### Backend (Ứng dụng API)
- **Framework**: FastAPI (Python >= 3.11)
- **ORM & Database**: SQLAlchemy + PostgreSQL
- **Migrations**: Alembic
- **Xác thực**: JWT Authentication + Password Hashing (bcrypt)
- **Định dạng dữ liệu**: Pydantic v2

---

## Hướng Dẫn Cài Đặt và Chạy Dự Án

### 1. Clone dự án về máy
Mở terminal và chạy lệnh sau để tải mã nguồn dự án:
```bash
git clone https://github.com/minhtrang3619/TuTamPhuc_ECommerceWebsite.git
cd TuTamPhuc_ECommerceWebsite
```

### Yêu Cầu Hệ Thống
Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt:
- **Node.js**: Phiên bản 18 trở lên.
- **Python**: Phiên bản 3.11 trở lên.
- **PostgreSQL**: Phiên bản 15 trở lên.

---

### 2. Thiết Lập Backend (FastAPI)

1. **Di chuyển vào thư mục backend**:
   ```bash
   cd backend
   ```

2. **Khởi tạo và kích hoạt môi trường ảo (Virtual Environment)**:
   - Trên Windows:
     ```bash
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - Trên macOS/Linux:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Cài đặt các thư viện cần thiết**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Cấu hình biến môi trường (`.env`)**:
   - Sao chép file mẫu:
     ```bash
     cp .env.example .env
     ```
   - Mở file `.env` mới tạo và chỉnh sửa thông số kết nối cơ sở dữ liệu PostgreSQL của bạn ở biến `DATABASE_URL`:
     ```env
     DATABASE_URL=postgresql://<username>:<password>@localhost:5432/<database_name>
     ```

5. **Tạo Database**:
   - Truy cập vào pgAdmin hoặc terminal PostgreSQL, tạo một cơ sở dữ liệu trống khớp với tên cơ sở dữ liệu bạn đã đặt trong file `.env` (ví dụ: `tutamphuc_db`).

6. **Chạy Migrations để khởi tạo bảng dữ liệu**:
   ```bash
   alembic upgrade head
   ```

7. **Nạp dữ liệu mẫu (Seeding Database)**:
   Để có dữ liệu sản phẩm, danh mục và tài khoản thử nghiệm nhanh chóng, hãy chạy các script sau:
   - **Tạo các tài khoản mặc định (Admin, Staff, Customer)**:
     ```bash
     python seed_users.py
     ```
   - **Nạp các sản phẩm và biến thể mẫu**:
     ```bash
     python seed_products.py
     ```

8. **Chạy Server API**:
   ```bash
   uvicorn app.main:app --reload
   ```
   API sẽ chạy tại địa chỉ: [http://localhost:8000](http://localhost:8000)
   Bạn có thể xem tài liệu hướng dẫn API tương tác (Swagger UI) tại: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Thiết Lập Frontend (React + Vite)

1. **Di chuyển vào thư mục frontend**:
   ```bash
   cd ../frontend
   ```

2. **Cài đặt các gói phụ thuộc (Dependencies)**:
   ```bash
   npm install
   ```

3. **Cấu hình biến môi trường (`.env.local`)**:
   - Sao chép file mẫu:
     ```bash
     cp .env.example .env.local
     ```
   - File cấu hình chứa cổng mặc định trỏ về Backend API:
     ```env
     VITE_API_URL=http://localhost:8000
     VITE_APP_NAME=Từ Tâm Phục
     ```

4. **Khởi chạy Development Server**:
   ```bash
   npm run dev
   ```
   Ứng dụng Client sẽ chạy tại địa chỉ: [http://localhost:5173](http://localhost:5173) (hoặc cổng trống tiếp theo như `5174`).

---

## 4. Thiết Lập Nhanh Qua Docker (Tùy Chọn)

Nếu bạn có cài đặt **Docker** và **Docker Compose**, bạn có thể chạy toàn bộ dự án (bao gồm cả cơ sở dữ liệu PostgreSQL) chỉ với một lệnh duy nhất ở thư mục gốc:

```bash
docker-compose up -d --build
```
Lệnh này sẽ tự động tải các hình ảnh, tạo các container chạy Backend, Frontend và Database độc lập.

---

## Thông Tin Tài Khoản Mặc Định (Thử Nghiệm)

Sau khi chạy lệnh `python seed_users.py`, các tài khoản sau đã sẵn sàng để đăng nhập thử nghiệm:

### 1. Tài Khoản Quản Trị (Admin)
- **Email**: `admin@tutamphuc.vn`
- **Mật khẩu**: `Admin@123456`
- **Quyền hạn**: Truy cập bảng quản trị Dashboard, quản lý đơn hàng, duyệt yêu cầu trả hàng, quản lý danh mục và sản phẩm.

### 2. Tài Khoản Nhân Viên (Staff)
- **Email**: `staff@tutamphuc.vn`
- **Mật khẩu**: `Staff@123456`
- **Quyền hạn**: Quản lý đơn hàng và duyệt yêu cầu trả hàng.

### 3. Tài Khoản Khách Hàng (Customer)
- **Email**: `customer@tutamphuc.vn`
- **Mật khẩu**: `Customer@123456`
- **Quyền hạn**: Xem danh sách sản phẩm, đặt hàng, quản lý thông tin tài khoản cá nhân, xem chi tiết đơn hàng, gửi yêu cầu trả hàng/hoàn tiền.

---

## Cấu Trúc Dự Án

```
Tu_Tam_Phuc_E_Commerce_Website/
├── frontend/             # Ứng dụng Client React + Vite
│   ├── src/
│   │   ├── components/   # Các component dùng chung
│   │   ├── pages/        # Các trang màn hình chính (Home, OrderDetail, Admin, v.v.)
│   │   ├── services/     # Hook kết nối API với Axios Client
│   │   ├── store/        # Lưu trữ trạng thái xác thực và giỏ hàng (Zustand)
│   │   └── types/        # Định nghĩa các Interface TypeScript
├── backend/              # Ứng dụng API FastAPI
│   ├── app/
│   │   ├── models/       # Mô hình cơ sở dữ liệu SQLAlchemy
│   │   ├── schemas/      # Lớp kiểm duyệt dữ liệu Pydantic
│   │   ├── services/     # Logic nghiệp vụ (Order, Return Request, v.v.)
│   │   ├── routers/      # Định tuyến các Endpoint API (FASTAPI)
│   │   └── database/     # Kết nối Session DB
│   ├── alembic/          # Lưu trữ lịch sử nâng cấp Database Migrations
│   ├── seed_users.py     # Script tạo tài khoản mẫu
│   └── seed_products.py  # Script tạo sản phẩm mẫu
├── docker-compose.yml    # Quản lý Docker Containers
└── README.md             # Tài liệu dự án
```
