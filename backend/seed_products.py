import sys
import os

# Add the current directory to python path to resolve imports correctly
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.category import Category
from app.models.product import Product, ProductImage, ProductVariant, ProductStatus

MOCK_CATEGORIES = [
    {"name": "Đồ lam nam", "slug": "do-lam-nam", "description": "Trang phục thanh nhã dành cho cư sĩ nam"},
    {"name": "Đồ lam nữ", "slug": "do-lam-nu", "description": "Pháp phục đằm thắm dành cho nữ đạo hữu"},
    {"name": "Áo tràng", "slug": "ao-trang", "description": "Áo tràng tôn nghiêm dành cho các khóa tu và nghi lễ"},
    {"name": "Pháp Phục", "slug": "phap-phuc", "description": "Pháp phục cách tân cao cấp cho mọi hoạt động đời sống"}
]

MOCK_PRODUCTS = [
  {
    "id": "bo-lam-tinh-tam",
    "name": "Bộ Lam Tĩnh Tâm",
    "price": 1150000,
    "sale_price": 1250000, # mapping oldPrice
    "category": "Đồ lam nữ",
    "colors": [
      {"name": "Nâu nhạt", "hex": "#EADDD7"},
      {"name": "Xanh rêu", "hex": "#8D9B91"},
      {"name": "Trắng ngà", "hex": "#F5F5F5"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD-i99PGuf24vO5kvxg326vEO7jUuUSLTDT1n1BFFVtkuE9CvzkafJf5hh_pcEax4jWWbA8r5usOW5XIpFoUHtnaRrkonr9-wyhvaXIZK6gTYY6CwI6RCABXDpyPxu0ioSb3YLij-kW940L0YDvEkFYvH3GPQ06avEx77w5QDj7YABPaI4R3UM1Xq76cZrNv2lXRxpAwWH_yy5LNgTcDPgOz-i4opUNNMKLgL6ksKfzWsqjN1LDhNOIe3L2WFbcei39HxceMvxge9Ov"
    ],
    "description": "Sản phẩm được thiết kế với chất liệu linen cao cấp nhập khẩu, mang lại cảm giác thoáng mát tối đa và thấm hút mồ hôi tốt. Đường kim tỉ mỉ tôn nét tự nhiên và thanh lịch.",
    "short_description": "Sự tinh tế toát ra từ thiết kế tối giản, chất liệu tự nhiên tạo cảm giác nhẹ nhàng, êm ái.",
    "tags": ["linen", "lam-nu"]
  },
  {
    "id": "ao-trang-an-nhien",
    "name": "Áo Tràng An Nhiên",
    "price": 1650000,
    "sale_price": 1850000,
    "category": "Áo tràng",
    "is_featured": True,
    "colors": [
      {"name": "Trắng ngà", "hex": "#F5F5F5"},
      {"name": "Nâu nhạt", "hex": "#EADDD7"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCGIQZtJgyZL64jeOPXO-SBpVFLOh0hYPaX7T0TbIBnGZFeEyCd2BE8qwij6MFz-KiZs5rHFzFeojkyMTE8awGCPHNB8XVo8wLZooMeMaA4EL2LAMIiOFVP9e9iRBJjBbqSLyOgjxKNzIxr2vg6yf0rTYB_AkPFYhn6DV1zrXQlIsT8Gu1d-iD0IH4fAUJz0540gtOqTmsN9zhmCp-p3YerGiSkBzT0R2IvN5RvRXrVLP01l3la8ccg81L59kyplvWe3FFnVzPivbP5"
    ],
    "description": "Chất liệu vải rũ nhẹ nhàng tạo nên độ bồng bềnh tự nhiên, từng chuyển động mang nét thanh nhã. Phù hợp cho các sự kiện trang trọng hoặc mặc trong cuộc sống hằng ngày.",
    "short_description": "Mềm mại như làn sương mỏng ban mai, mang lại cảm giác thoáng mát dễ chịu.",
    "tags": ["lua", "ao-trang", "moi"]
  },
  {
    "id": "bo-cu-si-thien-mon",
    "name": "Bộ Cư Sĩ Thiền Môn",
    "price": 1450000,
    "category": "Pháp Phục",
    "colors": [
      {"name": "Nâu đất", "hex": "#5D4037"},
      {"name": "Nâu nhạt", "hex": "#EADDD7"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAnO1Maxeutb-jssEy8FeSFc2z-2xSMGU60H2jUoy58UiARCv_XaPIGNVETe7etHxfzi1baFOLFF1EoOAl0Hw9qyLkkZ8Wo975bLX-MYkY3WwV9tcb7rObSCjcYBJc3ivi6ITGBoRegW0HEKBjw4ZLMzWLgprYYxvNZaqCuiV4E_nyRIMN7Jb_gtXjxDQpywYFWCL_TQs5KsVy4GrScJUsbZaFLDgRfZik96lm4yd591Tp531H80VQdxlP4CZuCZMuyyeco2LDPRHdf"
    ],
    "description": "Thoải mái tự do di chuyển, chất dệt co giãn tốt và mồ hôi được điều hòa tự nhiên. Cổ đứng khuy tết nút áo gỗ dừa mộc mạc tạo nên nét hoài cổ tinh tế.",
    "short_description": "Mang lại cảm giác thong thả, tự do và thư thái trong mỗi bước đi.",
    "tags": ["dui", "phap-phuc"]
  },
  {
    "id": "bo-lam-nam-moc",
    "name": "Bộ Lam Nam Mộc",
    "price": 1300000,
    "category": "Đồ lam nam",
    "colors": [
      {"name": "Nâu đất", "hex": "#5D4037"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAFZOddktb0Dpo8exTstX9GxgMa_JyDGiqMB_F2kQRJdrwgfPy4Rk-6dHBOpvkTrLLphJgVRLOsHKjmgKHLE8SAZh5VtR5FcN0xzTbf4UbHgiEkQQFpaQneSebziA5pf5Tr6zoWNO7EcpWCQSa2BR-ft1vffgyv6EctwP6aFvO25aGs0W1M8pMGL-6Kpf24duljgXHksLNIpt_rtsjWMxRjQOK1sZ_OY7ksrAiHoxzleI-DGvfu59XwHdEoHmH3wMF9r2tuDTBMU1a2"
    ],
    "description": "Vẻ đẹp tối giản đầy nam tính được gửi gắm trong thớ vải dệt sần gai mộc mạc. Tông màu nhuộm tự nhiên trầm lắng, mộc mạc và thời thượng.",
    "short_description": "Form dáng đứng chuẩn nam tính, chất vải bền chắc mang lại sự thoải mái tối đa.",
    "tags": ["gai", "lam-nam"]
  },
  {
    "id": "ao-trang-khinh-thanh",
    "name": "Áo Tràng Khinh Thanh",
    "price": 2100000,
    "category": "Áo tràng",
    "colors": [
      {"name": "Trắng ngà", "hex": "#F5F5F5"},
      {"name": "Nâu nhạt", "hex": "#EADDD7"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBQkWSlpPIPODRoiohVx_l6ZYVY8xkFuvZth6pCgpGjXJ3hFgf45Nyh9WlC-hs0Ma0EADm3-NtTyT4Y1q2XlEVT7XVATkDV-1456LM_LGIxRhITvdSvOylLbHIG_FkYI--mfVkxX-sb5fo53PxVUrFTk3meBb7VOavtUD5VYHs73K9e5c3c33nz5NMgWINRV8VUeWJmYtUkxIMsAYYilzMOZ7NdAgs4aqRnSWJOvZb9f1skrG9v5vqbVZNGWGgccivFepCmTH17j8aP"
    ],
    "description": "Sản phẩm dệt từ tơ tằm tự nhiên cao cấp mang lại độ mềm mại, thông thoáng tối đa và nhẹ tênh khi mặc.",
    "short_description": "Nhẹ nhàng và thoáng mát, mang lại trải nghiệm thư thái nhất cho người mặc.",
    "tags": ["to-tam", "ao-trang"]
  },
  {
    "id": "bo-lam-thu-thai",
    "name": "Bộ Lam Thư Thái",
    "price": 1100000,
    "sale_price": 1250000,
    "category": "Đồ lam nữ",
    "colors": [
      {"name": "Xanh rêu", "hex": "#8D9B91"},
      {"name": "Trắng ngà", "hex": "#F5F5F5"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBAP3KJm44zDv1xLDp7lM9R_v24qof1kgdKtqX2e6DgMH8Ht7UiOcUlPKPO9ZGyMMZ4zLIUMYe8oxpvoCLfa9M8OUuLV_mZgHsC_90Sfl3ubBTfJ1Xsy15vlbGpSOzOxksALSeUuAEb7FoBUZr9TX1Ievc-gu6R5gLBxXeCNIUFPF4nV7V9YxC9JpeH-EE8h_JtzG9kwd0USgW1yO5geWCIOym71EwtYYzZiK9ypIpXKlIzV4nuD3EyzS4S2DJFHenPqeupT6cnD1BB"
    ],
    "description": "Màu xanh lục rêu ngát làm dịu tinh thần, bừng sắc tươi sáng. Form áo cổ tròn xẻ V uyển chuyển tạo sự thoải mái, cổ áo thanh lịch nhưng vẫn trang nhã, lịch sự.",
    "short_description": "Chầm chậm bước qua những ồn ào của cuộc sống, tận hưởng sự nhẹ nhàng và tự do.",
    "tags": ["dui", "lam-nu"]
  },
  {
    "id": "ao-dai-cach-tan-silk-trang",
    "name": "Áo Dài Cách Tân Silk Trắng",
    "price": 2450000,
    "category": "Pháp Phục",
    "colors": [
      {"name": "Trắng ngà", "hex": "#F5F5F5"},
      {"name": "Nâu nhạt", "hex": "#EADDD7"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDsIQym6pBS9548npqZ0goim9NHAV22TV3txuhEbomG3Q0hr2m6SF3TCsjzGLKEb8iQqEG7uW6Ygj5mku4jMzOhwhlkOVLUFJc7PvWgXxoi-gi70cvLNnqu593nTO5CXp2QnW68yFsN5cziye7vpIQl3H6dQ4x6QsMmcp3O-gzwfisPH_Py9x-hGN3PsMmHYTG6IrRk6TYORFXQLL5Z8hpcxPELuu2F2j8C79qn6g8qRSJfQtEi4bd_SDtaRjj6mPjDj_5pvGqxzyMv",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDUJFljnpOa2B9C7kBA4YrLTsNzLB2qxuf7m76WGV4gVLvw7raoS0UTeqQE_nRXa0z1mF9kGBhP1QksXgySgKASoAgn4E-enhpEbVqMsb-ULLQ85aVMRXuhdiMQ3_7dOc2RlL5dDQTYRmVokwzxCIQ7SdG_H2_UqMDIauB40P8z3Jn04eYTepIm39klCIlVR7noGxnFKwMfsWuMAW-tPP3-WzY7PcITdxL1K0_jtWmTY1qKyloRL6FysxIU-zhbZwZsdBHDTs6BKtO6",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCipQ_RDwv6eS7ad9qkllzjPcGtp-eT9utLCRPDhRYx9Kv_-wOBr8nMwvamhIMGtM4pmHO2F4xZzxv1OaFiGt2TAubOUrynCsM0B7MAzhcY7zEFL4-zI9R08SlxsmP4ZLJkyE4OUOtQ3ID2YYvT19Q2Ljw_GVoBDRZpDdTBPMxSz2SlYZ5J3p26K1h6TZWl--_slm26IxzeRWCcI4Ct7dwAU0nof3ycRK8uu_WqoPQa9IYTSq59TswpxPr4NKMOv9p4u8SQAIKDXfUg"
    ],
    "description": "Được dệt từ tơ tằm thượng hạng, chiếc áo là sự giao thoa giữa nét thanh tao cổ điển và hơi thở hiện đại, mang lại cảm giác nhẹ nhàng, dễ chịu cho người mặc.",
    "short_description": "Mềm mại như hơi thở của sớm mai, tinh tế và trang nhã trong từng chi tiết.",
    "tags": ["silk", "phap-phuc"]
  },
  {
    "id": "phap-phuc-linen-tu-nhien",
    "name": "Pháp Phục Linen Tự Nhiên",
    "price": 1850000,
    "category": "Pháp Phục",
    "colors": [
      {"name": "Nâu nhạt", "hex": "#EADDD7"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA71H9m0QdoZzVVRJgrWeq7OtlKQjvsOvfwW6e35CAnORnG06Yo2TqvCrZLiXXGUiQDH0W-vis2v6YgIQhZlCJUYckWiD9jWP6IoEk1ouOqWie0iCtD56F5Ig_83zQUw3NWTGBb11c82UBsqzujvFx0fHf7FMjrka3lGvqhwwz_kF2Cj1hg_wG3AlXOVEsrrtERPDyMRTSXuhytImF-qM5wm9Ua35KrH-FODsaCKtoUkrDBV810ZMNLgpJK6ux_y0DFoyzsdYB2escl"
    ],
    "description": "Phong cách tối giản đương đại quy tụ trong tà áo thô mộc từ vạt linen dệt tự nhiên rũ mát cát vàng. Được ưa chuộng bởi những ai yêu thích phong cách tối giản, nhẹ nhàng.",
    "short_description": "Tôn vinh vẻ đẹp tự nhiên, giản lược đường nét phức tạp để tạo sự thoải mái nhất.",
    "tags": ["linen", "phap-phuc"]
  },
  {
    "id": "quan-ong-rong-thien-tap",
    "name": "Quần Ống Rộng Tối Giản",
    "price": 1250000,
    "category": "Đồ lam nữ",
    "colors": [
      {"name": "Nâu đất", "hex": "#5D4037"},
      {"name": "Trắng ngà", "hex": "#F5F5F5"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCOhIUd5dJBys_O23V95lHYOocTIqIoHR6E6xc5V5ZBPJ8WKamVShYiZym_txJhpoYIPn7tal_cSp6070rGAAdZk6oj47lvWROGcI-cuodwQs5eARtsgyyto5EiTgY8UZLhN31TBVIHRglK45wuqfFbHM-hVufS-XbqGqcIMPPUBdVFOx30_ObjV0-hsNuDqadoJZaMtpfnP5LR_eAxoQv4tyiBskgE6zX0ZyRc8D65vLqPyRjBhmRzqp6pj9v1NuwEnVlYo_kjtVvT"
    ],
    "description": "Quần xếp vân ống dài thoáng rộng, thích hợp cho các buổi tập yoga, dạo phố hay thư giãn hằng ngày. Chất vải mềm mại, ít nhăn và giữ form tốt.",
    "short_description": "Dáng quần suông rộng rãi, mang lại sự năng động và thoải mái tuyệt đối.",
    "tags": ["dui", "lam-nu"]
  },
  {
    "id": "khan-lua-theu-sen",
    "name": "Khăn Lụa Thêu Sen",
    "price": 850000,
    "category": "Pháp Phục",
    "colors": [
      {"name": "Nâu nhạt", "hex": "#EADDD7"},
      {"name": "Trắng ngà", "hex": "#F5F5F5"}
    ],
    "sizes": ["S"],
    "images": [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAfRAJShs_6Omj7sk4f4SSycTL4lHUoIDjTfXP0VRb8hew4ph-TTNaTMbj51acBTEDM1fV2sJbHcVcanmsJPIwujQQGTC_0BzUX6kAOFwY-kzY08zy_lGMNnVpMr6eR1R43rv44oZrxJ1oSzlJQj8BYW4j1BkNB7V2vgXOgmTBHfqIHWXqiNQHOd2GlTIlQtaCc0kxEVJylv2Aa1a54Oop4yPYGgvLCI_G9Q0udzoC1TQk9Rer_zabKT_phhCan7hN6bR01ag4sJJO9"
    ],
    "description": "Khăn lụa tơ tằm hoạ sen thêu tinh tế nhẹ tênh. Sản phẩm truyền tải nét đẹp truyền thống Việt dung dị, giúp giữ ấm nhẹ nhàng trong những buổi tối se lạnh.",
    "short_description": "Họa tiết thêu tinh tế tạo điểm nhấn trang nhã cho trang phục.",
    "tags": ["lua", "theu-tay"]
  },
  {
    "id": "bo-lam-nam-tinh-tai",
    "name": "Bộ Lam Nam Tĩnh Tại",
    "price": 1350000,
    "category": "Đồ lam nam",
    "colors": [
      {"name": "Nâu đất", "hex": "#5D4037"},
      {"name": "Xanh rêu", "hex": "#8D9B91"}
    ],
    "sizes": ["M", "L", "XL"],
    "images": [
      "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80"
    ],
    "description": "Chất liệu linen dệt thô mộc, mát mẻ, hút ẩm tốt. Kiểu dáng cổ tàu cải tiến vừa trang trọng vừa hiện đại.",
    "short_description": "Nét tĩnh tại, vững chãi từ thớ vải dệt tay.",
    "tags": ["linen", "lam-nam"]
  },
  {
    "id": "bo-cu-si-cat-tuong",
    "name": "Bộ Cư Sĩ Cát Tường",
    "price": 1500000,
    "category": "Pháp Phục",
    "colors": [
      {"name": "Nâu nhạt", "hex": "#EADDD7"},
      {"name": "Trắng ngà", "hex": "#F5F5F5"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80"
    ],
    "description": "Bộ cư sĩ Cát Tường được may từ vải đũi lụa tự nhiên siêu mềm mịn. Kiểu dáng thoải mái, trang nhã cho việc hành thiền hoặc đón tiếp khách quý.",
    "short_description": "Mang lại sự bình an, hanh thông trong từng nếp áo.",
    "tags": ["dui", "phap-phuc"]
  },
  {
    "id": "ao-trang-thanh-luong",
    "name": "Áo Tràng Thanh Lương",
    "price": 1900000,
    "category": "Áo tràng",
    "is_featured": True,
    "colors": [
      {"name": "Xanh rêu", "hex": "#8D9B91"},
      {"name": "Trắng ngà", "hex": "#F5F5F5"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80"
    ],
    "description": "Kiểu dáng áo tràng truyền thống phối hợp với chất liệu đũi tơ mềm rủ nhẹ tênh. Mang lại cảm giác mát mẻ, an tĩnh trong từng bước đi.",
    "short_description": "Hơi thở thanh lương mát lành từ thiên nhiên tinh khiết.",
    "tags": ["dui-to", "ao-trang", "hot"]
  },
  {
    "id": "bo-lam-cat-tuong-nu",
    "name": "Bộ Lam Cát Tường Nữ",
    "price": 1200000,
    "category": "Đồ lam nữ",
    "colors": [
      {"name": "Nâu nhạt", "hex": "#EADDD7"},
      {"name": "Xanh rêu", "hex": "#8D9B91"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&q=80"
    ],
    "description": "Đồ lam nữ Cát Tường với chất linen đanh mịn, thấm hút mồ hôi vượt trội. Điểm xuyết hoa văn thêu tay tỉ mỉ ở ngực áo tạo nét duyên dáng tinh tế.",
    "short_description": "Sự kết hợp hoàn hảo giữa nét truyền thống và sự thoải mái hiện đại.",
    "tags": ["linen", "lam-nu"]
  },
  {
    "id": "phap-phuc-giao-linh-cai-tien",
    "name": "Pháp Phục Giao Lĩnh Cách Tân",
    "price": 2600000,
    "category": "Pháp Phục",
    "is_featured": True,
    "colors": [
      {"name": "Trắng ngà", "hex": "#F5F5F5"},
      {"name": "Nâu đất", "hex": "#5D4037"}
    ],
    "sizes": ["S", "M", "L", "XL"],
    "images": [
      "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80"
    ],
    "description": "Cảm hứng từ áo giao lĩnh truyền thống kết hợp vạt chéo xếp nếp tinh tế. Một thiết kế sang trọng lịch sự dành riêng cho các dịp lễ tết và nghi lễ đặc biệt.",
    "short_description": "Nâng tầm giá trị truyền thống Việt trong dòng chảy thời đại mới.",
    "tags": ["lua-to-tam", "doc-quyen"]
  }
]

def seed_products():
    db = SessionLocal()
    try:
        # Delete old products, images, and variants to avoid duplicate slugs
        db.query(ProductVariant).delete()
        db.query(ProductImage).delete()
        db.query(Product).delete()
        db.query(Category).delete()
        db.commit()
        
        # 1. Seed Categories
        category_map = {}
        for cat_data in MOCK_CATEGORIES:
            category = Category(
                name=cat_data["name"],
                slug=cat_data["slug"],
                description=cat_data["description"]
            )
            db.add(category)
            db.flush()
            category_map[cat_data["name"]] = category.id
            print(f"Created category: {cat_data['name']} (ID: {category.id})")
            
        # 2. Seed Products
        for prod_data in MOCK_PRODUCTS:
            cat_name = prod_data["category"]
            cat_id = category_map.get(cat_name)
            if not cat_id:
                print(f"Category '{cat_name}' not found for product '{prod_data['name']}', skipping.")
                continue
                
            product = Product(
                name=prod_data["name"],
                slug=prod_data["id"],
                price=prod_data["price"],
                sale_price=prod_data.get("sale_price"),
                description=prod_data["description"],
                short_description=prod_data["short_description"],
                stock=100, # Initial seed stock
                category_id=cat_id,
                tags=prod_data.get("tags", []),
                is_featured=prod_data.get("is_featured", False),
                rating_avg=5.0,
                rating_count=1,
                weight=350.0
            )
            db.add(product)
            db.flush()
            
            # Seed Product Images
            for i, img_url in enumerate(prod_data["images"]):
                img = ProductImage(
                    product_id=product.id,
                    url=img_url,
                    alt=product.name,
                    is_primary=(i == 0),
                    sort_order=i
                )
                db.add(img)
                
            # Seed Product Variants for Colors
            for color in prod_data.get("colors", []):
                v_color = ProductVariant(
                    product_id=product.id,
                    name="Màu",
                    value=color["name"],
                    additional_price=0.0,
                    stock=50
                )
                db.add(v_color)
                
            # Seed Product Variants for Sizes
            for size in prod_data.get("sizes", []):
                v_size = ProductVariant(
                    product_id=product.id,
                    name="Kích cỡ",
                    value=size,
                    additional_price=0.0,
                    stock=50
                )
                db.add(v_size)
                
            print(f"Created product: {prod_data['name']} (ID: {product.id})")
            
        db.commit()
        print("Product seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding products database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_products()
