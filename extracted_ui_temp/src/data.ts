import { Product } from './types';

export const CATEGORIES = [
  'Đồ lam nam',
  'Đồ lam nữ',
  'Bộ cư sĩ',
  'Áo tràng',
  'Pháp Phục',
  'Túi vải',
];

export const COLORS = [
  { name: 'Nâu nhạt', hex: '#EADDD7' },
  { name: 'Nâu đất', hex: '#5D4037' },
  { name: 'Trắng ngà', hex: '#F5F5F5' },
  { name: 'Xanh rêu', hex: '#8D9B91' },
];

export const PRODUCTS: Product[] = [
  {
    id: 'bo-lam-tinh-tam',
    name: 'Bộ Lam Tĩnh Tâm',
    price: 1150000,
    oldPrice: 1250000,
    category: 'Đồ lam nữ',
    colors: [
      { name: 'Nâu nhạt', hex: '#EADDD7' },
      { name: 'Xanh rêu', hex: '#8D9B91' },
      { name: 'Trắng ngà', hex: '#F5F5F5' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-i99PGuf24vO5kvxg326vEO7jUuUSLTDT1n1BFFVtkuE9CvzkafJf5hh_pcEax4jWWbA8r5usOW5XIpFoUHtnaRrkonr9-wyhvaXIZK6gTYY6CwI6RCABXDpyPxu0ioSb3YLij-kW940L0YDvEkFYvH3GPQ06avEx77w5QDj7YABPaI4R3UM1Xq76cZrNv2lXRxpAwWH_yy5LNgTcDPgOz-i4opUNNMKLgL6ksKfzWsqjN1LDhNOIe3L2WFbcei39HxceMvxge9Ov'
    ],
    description: 'Sản phẩm được thiết kế với chất liệu linen cao cấp nhập khẩu, mang lại cảm giác thoáng mát tối đa và thấm hút mồ hôi tốt. Đường kim tỉ mỉ chuẩn mẫu thiền phục tế nhị tôn nét tự tại.',
    quote: 'Sự tĩnh tại toát ra từ sự tối giản, thuần khiết tự nhiên nâng niu từng bước chân an lành.',
    details: {
      material: 'Linen tự nhiên 100%',
      craftsmanship: 'Đường may vắt sổ cao cấp',
      details_desc: 'Kiểu khuy sườn cải tiến giúp thao tác mặc thuận lợi, giữ form phẳng phiu.'
    }
  },
  {
    id: 'ao-trang-an-nhien',
    name: 'Áo Tràng An Nhiên',
    price: 1650000,
    oldPrice: 1850000,
    category: 'Áo tràng',
    badge: 'Mới',
    colors: [
      { name: 'Trắng ngà', hex: '#F5F5F5' },
      { name: 'Nâu nhạt', hex: '#EADDD7' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCGIQZtJgyZL64jeOPXO-SBpVFLOh0hYPaX7T0TbIBnGZFeEyCd2BE8qwij6MFz-KiZs5rHFzFeojkyMTE8awGCPHNB8XVo8wLZooMeMaA4EL2LAMIiOFVP9e9iRBJjBbqSLyOgjxKNzIxr2vg6yf0rTYB_AkPFYhn6DV1zrXQlIsT8Gu1d-iD0IH4fAUJz0540gtOqTmsN9zhmCp-p3YerGiSkBzT0R2IvN5RvRXrVLP01l3la8ccg81L59kyplvWe3FFnVzPivbP5'
    ],
    description: 'Chất liệu vải rũ nhẹ nhàng tạo nên độ bồng bềnh tự nhiên, từng chuyển động mang nét nhẹ nhàng thoát tục. Đặc biệt phù hợp cho các Phật tử trong khóa tu tu trì tụng niệm ngắn dài.',
    quote: 'Mềm mại như làn sương mỏng dâng ban mai, nhẹ lòng thanh khí thanh nhã.',
    details: {
      material: 'Lụa pha đũi cao cấp',
      craftsmanship: 'Nẹp ren chìm thủ công',
      details_desc: 'Lấy nếp khơi tà rộng rãi giúp tà áo bay bổng trang trọng nhưng không quá rườm rà.'
    }
  },
  {
    id: 'bo-cu-si-thien-mon',
    name: 'Bộ Cư Sĩ Thiền Môn',
    price: 1450000,
    category: 'Bộ cư sĩ',
    colors: [
      { name: 'Nâu đất', hex: '#5D4037' },
      { name: 'Nâu nhạt', hex: '#EADDD7' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAnO1Maxeutb-jssEy8FeSFc2z-2xSMGU60H2jUoy58UiARCv_XaPIGNVETe7etHxfzi1baFOLFF1EoOAl0Hw9qyLkkZ8Wo975bLX-MYkY3WwV9tcb7rObSCjcYBJc3ivi6ITGBoRegW0HEKBjw4ZLMzWLgprYYxvNZaqCuiV4E_nyRIMN7Jb_gtXjxDQpywYFWCL_TQs5KsVy4GrScJUsbZaFLDgRfZik96lm4yd591Tp531H80VQdxlP4CZuCZMuyyeco2LDPRHdf'
    ],
    description: 'Thoải mái tự do di chuyển tinh thần, chất dệt co giãn tốt và mồ hôi được điều hòa tự nhiên. Cổ đứng khuy tết nút áo gỗ dừa mộc mạc lưu lại hơi hướng nho nhã sĩ phu thanh tịnh.',
    quote: 'Chân thật tìm lại ngọn nguồn thảnh thơi, gửi tâm nương tựa vạn pháp an nhàn.',
    details: {
      material: 'Đũi organic nhuộm củ nâu',
      craftsmanship: 'Kết cúc thắt truyền thống',
      details_desc: 'Cúc cài bọc vải dệt tay bền bỉ chắc chắn.'
    }
  },
  {
    id: 'bo-lam-nam-moc',
    name: 'Bộ Lam Nam Mộc',
    price: 1300000,
    category: 'Đồ lam nam',
    colors: [
      { name: 'Nâu đất', hex: '#5D4037' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAFZOddktb0Dpo8exTstX9GxgMa_JyDGiqMB_F2kQRJdrwgfPy4Rk-6dHBOpvkTrLLphJgVRLOsHKjmgKHLE8SAZh5VtR5FcN0xzTbf4UbHgiEkQQFpaQneSebziA5pf5Tr6zoWNO7EcpWCQSa2BR-ft1vffgyv6EctwP6aFvO25aGs0W1M8pMGL-6Kpf24duljgXHksLNIpt_rtsjWMxRjQOK1sZ_OY7ksrAiHoxzleI-DGvfu59XwHdEoHmH3wMF9r2tuDTBMU1a2'
    ],
    description: 'Tinh thần kiên trung bình đạm được gửi gắm trong thớ vải dệt sần gai mộc mạc. Màu xước đặc thù nhuộm vỏ cây tự nhiên trầm lắng đầy chiều sâu suy tư chiêm nghiệm.',
    quote: 'Thế đứng uy nghiêm, tâm hành khoan thứ. Vải bền giữ trọn cam nguyện tĩnh thu dưỡng chân.',
    details: {
      material: 'Gai dệt thô thiên nhiên',
      craftsmanship: 'Ráp vắt tinh tế khéo léo',
      details_desc: 'Túi quần giấu miệng tiện lợi sâu rộng vừa tầm lưu giữ tư can cá nhân nhỏ gọn.'
    }
  },
  {
    id: 'ao-trang-khinh-thanh',
    name: 'Áo Tràng Khinh Thanh',
    price: 2100000,
    category: 'Áo tràng',
    colors: [
      { name: 'Trắng ngà', hex: '#F5F5F5' },
      { name: 'Nâu nhạt', hex: '#EADDD7' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBQkWSlpPIPODRoiohVx_l6ZYVY8xkFuvZth6pCgpGjXJ3hFgf45Nyh9WlC-hs0Ma0EADm3-NtTyT4Y1q2XlEVT7XVATkDV-1456LM_LGIxRhITvdSvOylLbHIG_FkYI--mfVkxX-sb5fo53PxVUrFTk3meBb7VOavtUD5VYHs73K9e5c3c33nz5NMgWINRV8VUeWJmYtUkxIMsAYYilzMOZ7NdAgs4aqRnSWJOvZb9f1skrG9v5vqbVZNGWGgccivFepCmTH17j8aP'
    ],
    description: 'Chiếc áo nhẹ bay khẽ khàng đón ánh nắng từ ô cửa thiền thất. Được dệt tỉ lệ tơ tằm thưa giúp tà áo luôn bay mát và bồng huyễn nhẹ nhàng tựa như không trọng lượng.',
    quote: 'Tựa làn gió xuân thoảng qua sen trắng, mang sự mát lành rũ bỏ mọi hoài nghi.',
    details: {
      material: 'Tơ tằm tự nhiên pha sợi đũi lụa',
      craftsmanship: 'Độ chịu lực sợi bền chắc rủ bóng',
      details_desc: 'Thích hợp bậc nhất khi ngồi thiền tĩnh toạ trong không gian phòng tĩnh tâm ban mát.'
    }
  },
  {
    id: 'bo-lam-thu-thai',
    name: 'Bộ Lam Thư Thái',
    price: 1100000,
    oldPrice: 1250000,
    category: 'Đồ lam nữ',
    colors: [
      { name: 'Xanh rêu', hex: '#8D9B91' },
      { name: 'Trắng ngà', hex: '#F5F5F5' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBAP3KJm44zDv1xLDp7lM9R_v24qof1kgdKtqX2e6DgMH8Ht7UiOcUlPKPO9ZGyMMZ4zLIUMYe8oxpvoCLfa9M8OUuLV_mZgHsC_90Sfl3ubBTfJ1Xsy15vlbGpSOzOxksALSeUuAEb7FoBUZr9TX1Ievc-gu6R5gLBxXeCNIUFPF4nV7V9YxC9JpeH-EE8h_JtzG9kwd0USgW1yO5geWCIOym71EwtYYzZiK9ypIpXKlIzV4nuD3EyzS4S2DJFHenPqeupT6cnD1BB'
    ],
    description: 'Màu xanh lục rêu ngát làm dịu dịu thần thái bừng sắc trong sáng. Form áo cổ tròn xẻ V uyển chuyển tạo sự dễ thở, cổ áo cao thon thanh lịch nhưng trang nhã thuần phong.',
    quote: 'Chầm chậm bước qua nốt nhạc vội vã đời thường, khoác chiếc y bào rêu phong để thong dông.',
    details: {
      material: 'Đũi dệt thưa xước nhẹ',
      craftsmanship: 'Vắt mép nẹp viền tà trong',
      details_desc: 'Quần suông chun mông rộng rãi di chuyển dễ dàng hành thiện an nhiên.'
    }
  },
  {
    id: 'ao-dai-cach-tan-silk-trang',
    name: 'Áo Dài Cách Tân Silk Trắng',
    price: 2450000,
    category: 'Pháp Phục',
    colors: [
      { name: 'Trắng ngà', hex: '#F5F5F5' },
      { name: 'Nâu nhạt', hex: '#EADDD7' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDsIQym6pBS9548npqZ0goim9NHAV22TV3txuhEbomG3Q0hr2m6SF3TCsjzGLKEb8iQqEG7uW6Ygj5mku4jMzOhwhlkOVLUFJc7PvWgXxoi-gi70cvLNnqu593nTO5CXp2QnW68yFsN5cziye7vpIQl3H6dQ4x6QsMmcp3O-gzwfisPH_Py9x-hGN3PsMmHYTG6IrRk6TYORFXQLL5Z8hpcxPELuu2F2j8C79qn6g8qRSJfQtEi4bd_SDtaRjj6mPjDj_5pvGqxzyMv',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDUJFljnpOa2B9C7kBA4YrLTsNzLB2qxuf7m76WGV4gVLvw7raoS0UTeqQE_nRXa0z1mF9kGBhP1QksXgySgKASoAgn4E-enhpEbVqMsb-ULLQ85aVMRXuhdiMQ3_7dOc2RlL5dDQTYRmVokwzxCIQ7SdG_H2_UqMDIauB40P8z3Jn04eYTepIm39klCIlVR7noGxnFKwMfsWuMAW-tPP3-WzY7PcITdxL1K0_jtWmTY1qKyloRL6FysxIU-zhbZwZsdBHDTs6BKtO6',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCipQ_RDwv6eS7ad9qkllzjPcGtp-eT9utLCRPDhRYx9Kv_-wOBr8nMwvamhIMGtM4pmHO2F4xZzxv1OaFiGt2TAubOUrynCsM0B7MAzhcY7zEFL4-zI9R08SlxsmP4ZLJkyE4OUOtQ3ID2YYvT19Q2Ljw_GVoBDRZpDdTBPMxSz2SlYZ5J3p26K1h6TZWl--_slm26IxzeRWCcI4Ct7dwAU0nof3ycRK8uu_WqoPQa9IYTSq59TswpxPr4NKMOv9p4u8SQAIKDXfUg'
    ],
    description: 'Được dệt từ tơ tằm thượng hạng, chiếc áo là sự giao thoa giữa nét thanh tao cổ điển và hơi thở hiện đại, mang lại cảm giác nhẹ nhàng, thoát tục cho người mặc trong những khoảnh khắc tĩnh tại.',
    quote: '"Mềm mại như hơi thở của sớm mai, tinh khiết như giọt sương đọng trên cánh sen trắng."',
    details: {
      material: 'Lụa tơ tằm tự nhiên',
      craftsmanship: 'Thủ công tinh xảo',
      details_desc: 'Từng vạt cắt, khuy áo tết thủ công tỉ mỉ thể hiện bàn tay nâng niu trân quý của người nghệ nhân trong từng nếp chỉ.'
    }
  },
  {
    id: 'phap-phuc-linen-tu-nhien',
    name: 'Pháp Phục Linen Tự Nhiên',
    price: 1850000,
    category: 'Pháp Phục',
    colors: [
      { name: 'Nâu nhạt', hex: '#EADDD7' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA71H9m0QdoZzVVRJgrWeq7OtlKQjvsOvfwW6e35CAnORnG06Yo2TqvCrZLiXXGUiQDH0W-vis2v6YgIQhZlCJUYckWiD9jWP6IoEk1ouOqWie0iCtD56F5Ig_83zQUw3NWTGBb11c82UBsqzujvFx0fHf7FMjrka3lGvqhwwz_kF2Cj1hg_wG3AlXOVEsrrtERPDyMRTSXuhytImF-qM5wm9Ua35KrH-FODsaCKtoUkrDBV810ZMNLgpJK6ux_y0DFoyzsdYB2escl'
    ],
    description: 'Phong cách tối giản đương đại quy tụ trong tà áo thô mộc từ vạt linen dệt tự nhiên rũ mát cát vàng. Rất được tôn kính ưa chuộng bởi phật tử yêu mến sắc vóc dung dị.',
    quote: 'Chân chính với nguyên khí sơ khởi, giản lược đường nét để thăng hoa tâm niệm an nhàn.',
    details: {
      material: '100% Linen hạt dốc hạt cát',
      craftsmanship: 'Kéo khóa chìm sau lưng tơ',
      details_desc: 'Được dệt thớ thô vân đan sọc sắc cát tự nhiên bền bỉ mộc dịu.'
    }
  },
  {
    id: 'quan-ong-rong-thien-tap',
    name: 'Quần Ống Rộng Thiền Tập',
    price: 1250000,
    category: 'Đồ lam nữ',
    colors: [
      { name: 'Nâu đất', hex: '#5D4037' },
      { name: 'Trắng ngà', hex: '#F5F5F5' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCOhIUd5dJBys_O23V95lHYOocTIqIoHR6E6xc5V5ZBPJ8WKamVShYiZym_txJhpoYIPn7tal_cSp6070rGAAdZk6oj47lvWROGcI-cuodwQs5eARtsgyyto5EiTgY8UZLhN31TBVIHRglK45wuqfFbHM-hVufS-XbqGqcIMPPUBdVFOx30_ObjV0-hsNuDqadoJZaMtpfnP5LR_eAxoQv4tyiBskgE6zX0ZyRc8D65vLqPyRjBhmRzqp6pj9v1NuwEnVlYo_kjtVvT'
    ],
    description: 'Quần xếp vân ống dài thoáng rộng bậc nhất thích hợp cho yoga thiền tọa khí công an nhiên giải thoát. Chất tơ chun mềm lướt nhẹ mềm lỏng dãi rủ không tì tỳ vết nhăn dọ.',
    quote: 'Ống buông rộng thoáng tựa không lướt bước, vững chãi tâm định tại thâm căn khí chất tu hành.',
    details: {
      material: 'Chiffon đũi rũ mịn lấp sóng',
      craftsmanship: 'May đúp hai lớp kỹ càng',
      details_desc: 'Lớp lót tơ đũi mát mỏng ngăn vết xuyên sáng kín đáo nhã nhặn hoàn toàn.'
    }
  },
  {
    id: 'khan-lua-theu-sen',
    name: 'Khăn Lụa Thêu Sen',
    price: 850000,
    category: 'Pháp Phục',
    colors: [
      { name: 'Nâu nhạt', hex: '#EADDD7' },
      { name: 'Trắng ngà', hex: '#F5F5F5' }
    ],
    sizes: ['S'], // matching S size
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAfRAJShs_6Omj7sk4f4SSycTL4lHUoIDjTfXP0VRb8hew4ph-TTNaTMbj51acBTEDM1fV2sJbHcVcanmsJPIwujQQGTC_0BzUX6kAOFwY-kzY08zy_lGMNnVpMr6eR1R43rv44oZrxJ1oSzlJQj8BYW4j1BkNB7V2vgXOgmTBHfqIHWXqiNQHOd2GlTIlQtaCc0kxEVJylv2Aa1a54Oop4yPYGgvLCI_G9Q0udzoC1TQk9Rer_zabKT_phhCan7hN6bR01ag4sJJO9'
    ],
    description: 'Khăn lụa tơ tằm hoạ sen thêu tinh tế nhẹ tênh bên góc tơ thanh quý. Sản phẩm truyền tải tinh tế phong cốt Việt dung dị dịu ấm, dưỡng ẩm ấm cổ những đêm sương chùa thanh tịnh.',
    quote: 'Đóa bạch liên thêu thầm nhụy sáng, kề ôm tơ gấm dệt an định vô ngần.',
    details: {
      material: 'Tơ dệt đũi tơ tằm thô cao sang',
      craftsmanship: 'Thêu nhánh sen thủ công chỉ bạc',
      details_desc: 'Nhánh sen thêu tay đính chỉ kim ngân tinh khố từ làng thêu truyền thống.'
    }
  },
  {
    id: 'tui-vai-linen-theu-sen',
    name: 'Túi Vải Linen Thêu Sen',
    price: 350000,
    category: 'Túi vải',
    badge: 'Ưa chuộng',
    colors: [
      { name: 'Trắng ngà', hex: '#F5F5F5' },
      { name: 'Nâu nhạt', hex: '#EADDD7' }
    ],
    sizes: ['S'],
    images: [
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Túi vải thêu sen mềm mại, làm từ chất liệu tơ linen organic kết hợp sợi bông dệt thô dai chắc chắn. Thiết kế quai cầm dài vừa vặn, vô cùng thích hợp đựng kinh sách, chuỗi hạt hay tịnh vật cho thiền hữu.',
    quote: 'Mộc mạc nâng niu kinh sách quý, xách nhẹ an nhiên bước qua cửa thiền.',
    details: {
      material: 'Organic Linen tơ thô dệt',
      craftsmanship: 'Thêu sen thủ công truyền thống',
      details_desc: 'Kích thước đáy rộng và có ngăn khoá kéo phụ đựng đồ tiện lợi.'
    }
  },
  {
    id: 'tui-vai-tho-tu-tam',
    name: 'Túi Vải Thô Từ Tâm',
    price: 280000,
    category: 'Túi vải',
    colors: [
      { name: 'Nâu đất', hex: '#5D4037' },
      { name: 'Xanh rêu', hex: '#8D9B91' }
    ],
    sizes: ['S'],
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Chiếc túi đựng từ đũi vải thô mộc nhuộm thảo mộc tự nhiên thơm ngọt. Sợi dệt dẻo dai chống chịu nhiệt ẩm tốt, mang phong vị mộc mạc tinh tế, mang đến vạn sự cát tường, tịnh tâm.',
    quote: 'Gom tịnh lành đựng đầy trong chiếc túi, đi muôn nơi vẫn thấy lòng nhẹ tênh.',
    details: {
      material: 'Đũi dệt thô mộc 100%',
      craftsmanship: 'Khâu viền chắc chắn bền bỉ',
      details_desc: 'Thiết kế nút cài tre gỗ tự nhiên mộc mạc và hoài niệm.'
    }
  }
];

export const STORIES = [
  {
    id: 'monastic-simplicity',
    title: 'Sự tối giản trong triết lý mặc',
    excerpt: 'Tại Từ Tâm Phục, trang phục không phán xét, không ồn ào. Đó chính là sự nương tựa dịu nhẹ vào nguyên bản thô mộc giúp tâm tịnh mười phân.',
    author: 'Nhà Sáng Lập Từ Tâm Phục'
  },
  {
    id: 'the-art-of-linen',
    title: 'Hành trình từ thớ gai tự nhiên đến tà áo thiền',
    excerpt: 'Tìm hiểu thấu đáo quy trình nhuộm củ nâu, dệt chéo thô sần và tết khuy rơm thủ công tạo nên chất thiền không thể pha lẫn suốt ngàn năm lịch sử.',
    author: 'Nghệ Nhân Làng Dệt Trạch Xá'
  }
];
