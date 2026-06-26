from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
import httpx
import logging
import json
import os

from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/shipping", tags=["Shipping"])

# GHN Dev Sandbox endpoints
GHN_BASE_URL = "https://dev-online-gateway.ghn.vn/shiip/public-api"

# Local JSON divisions database path
DIVISIONS_JSON_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "vietnam_divisions.json")

# --- LOCAL FALLBACK DATA (Simple baseline if file reading fails) ---
FALLBACK_PROVINCES = [
    {"ProvinceID": 201, "ProvinceName": "Hồ Chí Minh"},
    {"ProvinceID": 202, "ProvinceName": "Hà Nội"},
    {"ProvinceID": 203, "ProvinceName": "Đà Nẵng"},
    {"ProvinceID": 204, "ProvinceName": "Cần Thơ"},
    {"ProvinceID": 205, "ProvinceName": "Bình Dương"},
    {"ProvinceID": 206, "ProvinceName": "Đồng Nai"}
]

FALLBACK_DISTRICTS = {
    201: [
        {"DistrictID": 1441, "DistrictName": "Quận 1"},
        {"DistrictID": 1442, "DistrictName": "Quận Bình Thạnh"},
        {"DistrictID": 1443, "DistrictName": "Quận Gò Vấp"},
        {"DistrictID": 1444, "DistrictName": "Quận Phú Nhuận"}
    ],
    202: [
        {"DistrictID": 1451, "DistrictName": "Quận Hoàn Kiếm"},
        {"DistrictID": 1452, "DistrictName": "Quận Ba Đình"},
        {"DistrictID": 1453, "DistrictName": "Quận Đống Đa"},
        {"DistrictID": 1454, "DistrictName": "Quận Cầu Giấy"}
    ]
}

FALLBACK_WARDS = {
    1441: [
        {"WardCode": "20301", "WardName": "Phường Bến Nghé"},
        {"WardCode": "20302", "WardName": "Phường Đa Kao"},
        {"WardCode": "20303", "WardName": "Phường Tân Định"}
    ],
    1452: [
        {"WardCode": "20411", "WardName": "Phường Cống Vị"},
        {"WardCode": "20412", "WardName": "Phường Kim Mã"}
    ]
}

def load_divisions_data():
    if not os.path.exists(DIVISIONS_JSON_PATH):
        logger.warning(f"Divisions JSON file not found at: {DIVISIONS_JSON_PATH}")
        return []
    try:
        with open(DIVISIONS_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Failed to read/parse vietnam_divisions.json: {e}")
        return []

class FeeRequest(BaseModel):
    to_district_id: int
    to_ward_code: str
    weight: Optional[int] = 500  # Default 500g

@router.get("/provinces")
async def get_provinces():
    # Try loading from local divisions JSON first for full coverage
    data = load_divisions_data()
    if data:
        provinces = []
        for p in data:
            try:
                prov_id = int(p["Id"])
            except ValueError:
                prov_id = hash(p["Id"]) % 1000
            provinces.append({
                "ProvinceID": prov_id,
                "ProvinceName": p["Name"]
            })
        return provinces
        
    # Standard GHN API fallback
    headers = {"Token": settings.GHN_TOKEN}
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(f"{GHN_BASE_URL}/master-data/province", headers=headers)
            if response.status_code == 200:
                res_data = response.json()
                if res_data.get("code") == 200:
                    return res_data.get("data")
    except Exception as e:
        logger.warning(f"Failed to fetch provinces from GHN, using static fallback. Error: {e}")
    
    return FALLBACK_PROVINCES

@router.get("/districts")
async def get_districts(province_id: int):
    # Try loading from local divisions JSON first for full coverage
    data = load_divisions_data()
    if data:
        for p in data:
            try:
                prov_id = int(p["Id"])
            except ValueError:
                prov_id = hash(p["Id"]) % 1000
                
            if prov_id == province_id:
                districts = []
                for d in p.get("Districts", []):
                    try:
                        dist_id = int(d["Id"])
                    except ValueError:
                        dist_id = hash(d["Id"]) % 10000
                    districts.append({
                        "DistrictID": dist_id,
                        "DistrictName": d["Name"]
                    })
                return districts
                
    # Standard GHN API fallback
    headers = {"Token": settings.GHN_TOKEN}
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{GHN_BASE_URL}/master-data/district", 
                json={"province_id": province_id},
                headers=headers
            )
            if response.status_code == 200:
                res_data = response.json()
                if res_data.get("code") == 200:
                    return res_data.get("data")
    except Exception as e:
        logger.warning(f"Failed to fetch districts from GHN for province {province_id}, using fallback. Error: {e}")
    
    return FALLBACK_DISTRICTS.get(province_id, [
        {"DistrictID": province_id * 10 + i, "DistrictName": f"Huyện/Quận Giả Định {i+1}"}
        for i in range(3)
    ])

@router.get("/wards")
async def get_wards(district_id: int):
    # Try loading from local divisions JSON first for full coverage
    data = load_divisions_data()
    if data:
        for p in data:
            for d in p.get("Districts", []):
                try:
                    dist_id = int(d["Id"])
                except ValueError:
                    dist_id = hash(d["Id"]) % 10000
                    
                if dist_id == district_id:
                    wards = []
                    for w in d.get("Wards", []):
                        wards.append({
                            "WardCode": w["Id"],
                            "WardName": w["Name"]
                        })
                    return wards
                    
    # Standard GHN API fallback
    headers = {"Token": settings.GHN_TOKEN}
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{GHN_BASE_URL}/master-data/ward", 
                json={"district_id": district_id},
                headers=headers
            )
            if response.status_code == 200:
                res_data = response.json()
                if res_data.get("code") == 200:
                    return res_data.get("data")
    except Exception as e:
        logger.warning(f"Failed to fetch wards from GHN for district {district_id}, using fallback. Error: {e}")
    
    return FALLBACK_WARDS.get(district_id, [
        {"WardCode": f"W_{district_id}_{i}", "WardName": f"Xã/Phường Giả Định {i+1}"}
        for i in range(3)
    ])

@router.post("/fee")
async def calculate_fee(data: FeeRequest):
    headers = {
        "Token": settings.GHN_TOKEN,
        "ShopId": str(settings.GHN_SHOP_ID),
        "Content-Type": "application/json"
    }
    
    payload = {
        "from_district_id": 1442,
        "from_ward_code": "20311",
        "to_district_id": data.to_district_id,
        "to_ward_code": data.to_ward_code,
        "weight": data.weight,
        "length": 20,
        "width": 20,
        "height": 10,
        "service_type_id": 2
    }
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{GHN_BASE_URL}/v2/shipping-order/fee", 
                json=payload,
                headers=headers
            )
            if response.status_code == 200:
                res_data = response.json()
                if res_data.get("code") == 200:
                    return {"total": res_data.get("data", {}).get("total", 30000)}
    except Exception as e:
        logger.warning(f"Failed to calculate shipping fee from GHN, using fallback. Error: {e}")
    
    # Fallback fee calculator based on distance index
    is_same_province = abs(data.to_district_id - 1442) < 50
    if is_same_province:
        fee = 22000
    else:
        fee = 45000
        
    return {"total": fee}
