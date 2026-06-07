import { Product } from './mockTypes';

export const CATEGORIES = [
  'Đồ lam nam',
  'Đồ lam nữ',
  'Áo tràng',
  'Pháp Phục',
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
    description: 'Sản phẩm được thiết kế với chất liệu linen cao cấp nhập khẩu, mang lại cảm giác thoáng mát tối đa và thấm hút mồ hôi tốt. Đường kim tỉ mỉ tôn nét tự nhiên và thanh lịch.',
    quote: 'Sự tinh tế toát ra từ thiết kế tối giản, chất liệu tự nhiên tạo cảm giác nhẹ nhàng, êm ái.',
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
    description: 'Chất liệu vải rũ nhẹ nhàng tạo nên độ bồng bềnh tự nhiên, từng chuyển động mang nét thanh nhã. Phù hợp cho các sự kiện trang trọng hoặc mặc trong cuộc sống hằng ngày.',
    quote: 'Mềm mại như làn sương mỏng ban mai, mang lại cảm giác thoáng mát dễ chịu.',
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
    category: 'Pháp Phục',
    colors: [
      { name: 'Nâu đất', hex: '#5D4037' },
      { name: 'Nâu nhạt', hex: '#EADDD7' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAnO1Maxeutb-jssEy8FeSFc2z-2xSMGU60H2jUoy58UiARCv_XaPIGNVETe7etHxfzi1baFOLFF1EoOAl0Hw9qyLkkZ8Wo975bLX-MYkY3WwV9tcb7rObSCjcYBJc3ivi6ITGBoRegW0HEKBjw4ZLMzWLgprYYxvNZaqCuiV4E_nyRIMN7Jb_gtXjxDQpywYFWCL_TQs5KsVy4GrScJUsbZaFLDgRfZik96lm4yd591Tp531H80VQdxlP4CZuCZMuyyeco2LDPRHdf'
    ],
    description: 'Thoải mái tự do di chuyển, chất dệt co giãn tốt và mồ hôi được điều hòa tự nhiên. Cổ đứng khuy tết nút áo gỗ dừa mộc mạc tạo nên nét hoài cổ tinh tế.',
    quote: 'Mang lại cảm giác thong thả, tự do và thư thái trong mỗi bước đi.',
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
    description: 'Vẻ đẹp tối giản đầy nam tính được gửi gắm trong thớ vải dệt sần gai mộc mạc. Tông màu nhuộm tự nhiên trầm lắng, mộc mạc và thời thượng.',
    quote: 'Form dáng đứng chuẩn nam tính, chất vải bền chắc mang lại sự thoải mái tối đa.',
    details: {
      material: 'Gai dệt thô thiên nhiên',
      craftsmanship: 'Ráp vắt tinh tế khéo léo',
      details_desc: 'Túi quần giấu miệng tiện lợi sâu rộng vừa tầm lưu giữ đồ dùng cá nhân nhỏ gọn.'
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
    description: 'Sản phẩm dệt từ tơ tằm tự nhiên cao cấp mang lại độ mềm mại, thông thoáng tối đa và nhẹ tênh khi mặc.',
    quote: 'Nhẹ nhàng và thoáng mát, mang lại trải nghiệm thư thái nhất cho người mặc.',
    details: {
      material: 'Tơ tằm tự nhiên pha sợi đũi lụa',
      craftsmanship: 'Độ chịu lực sợi bền chắc rủ bóng',
      details_desc: 'Phù hợp cho các hoạt động tĩnh tâm như tập yoga, đọc sách hoặc thư giãn.'
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
    description: 'Màu xanh lục rêu ngát làm dịu tinh thần, bừng sắc tươi sáng. Form áo cổ tròn xẻ V uyển chuyển tạo sự thoải mái, cổ áo thanh lịch nhưng vẫn trang nhã, lịch sự.',
    quote: 'Chầm chậm bước qua những ồn ào của cuộc sống, tận hưởng sự nhẹ nhàng và tự do.',
    details: {
      material: 'Đũi dệt thưa xước nhẹ',
      craftsmanship: 'Vắt mép nẹp viền tà trong',
      details_desc: 'Quần suông chun mông rộng rãi di chuyển dễ dàng trong mọi hoạt động.'
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
    description: 'Được dệt từ tơ tằm thượng hạng, chiếc áo là sự giao thoa giữa nét thanh tao cổ điển và hơi thở hiện đại, mang lại cảm giác nhẹ nhàng, dễ chịu cho người mặc.',
    quote: 'Mềm mại như hơi thở của sớm mai, tinh tế và trang nhã trong từng chi tiết.',
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
    description: 'Phong cách tối giản đương đại quy tụ trong tà áo thô mộc từ vạt linen dệt tự nhiên rũ mát cát vàng. Được ưa chuộng bởi những ai yêu thích phong cách tối giản, nhẹ nhàng.',
    quote: 'Tôn vinh vẻ đẹp tự nhiên, giản lược đường nét phức tạp để tạo sự thoải mái nhất.',
    details: {
      material: '100% Linen hạt dốc hạt cát',
      craftsmanship: 'Kéo khóa chìm sau lưng tơ',
      details_desc: 'Được dệt thớ thô vân đan sọc sắc cát tự nhiên bền bỉ mộc dịu.'
    }
  },
  {
    id: 'quan-ong-rong-thien-tap',
    name: 'Quần Ống Rộng Tối Giản',
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
    description: 'Quần xếp vân ống dài thoáng rộng, thích hợp cho các buổi tập yoga, dạo phố hay thư giãn hằng ngày. Chất vải mềm mại, ít nhăn và giữ form tốt.',
    quote: 'Dáng quần suông rộng rãi, mang lại sự năng động và thoải mái tuyệt đối.',
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
    sizes: ['S'],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAfRAJShs_6Omj7sk4f4SSycTL4lHUoIDjTfXP0VRb8hew4ph-TTNaTMbj51acBTEDM1fV2sJbHcVcanmsJPIwujQQGTC_0BzUX6kAOFwY-kzY08zy_lGMNnVpMr6eR1R43rv44oZrxJ1oSzlJQj8BYW4j1BkNB7V2vgXOgmTBHfqIHWXqiNQHOd2GlTIlQtaCc0kxEVJylv2Aa1a54Oop4yPYGgvLCI_G9Q0udzoC1TQk9Rer_zabKT_phhCan7hN6bR01ag4sJJO9'
    ],
    description: 'Khăn lụa tơ tằm hoạ sen thêu tinh tế nhẹ tênh. Sản phẩm truyền tải nét đẹp truyền thống Việt dung dị, giúp giữ ấm nhẹ nhàng trong những buổi tối se lạnh.',
    quote: 'Họa tiết thêu tinh tế tạo điểm nhấn trang nhã cho trang phục.',
    details: {
      material: 'Tơ dệt đũi tơ tằm thô cao sang',
      craftsmanship: 'Thêu nhánh sen thủ công chỉ bạc',
      details_desc: 'Nhánh sen thêu tay đính chỉ kim ngân tinh khố từ làng thêu truyền thống.'
    }
  },


  {
    id: 'bo-lam-nam-tinh-tai',
    name: 'Bộ Lam Nam Tĩnh Tại',
    price: 1350000,
    category: 'Đồ lam nam',
    colors: [
      { name: 'Nâu đất', hex: '#5D4037' },
      { name: 'Xanh rêu', hex: '#8D9B91' }
    ],
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Chất liệu linen dệt thô mộc, mát mẻ, hút ẩm tốt. Kiểu dáng cổ tàu cải tiến vừa trang trọng vừa hiện đại.',
    quote: 'Nét tĩnh tại, vững chãi từ thớ vải dệt tay.',
    details: {
      material: 'Linen Organic dệt tay',
      craftsmanship: 'Đường may vắt nẹp thủ công',
      details_desc: 'Cúc cài khuy tàu gỗ tự nhiên.'
    }
  },
  {
    id: 'bo-cu-si-cat-tuong',
    name: 'Bộ Cư Sĩ Cát Tường',
    price: 1500000,
    category: 'Pháp Phục',
    colors: [
      { name: 'Nâu nhạt', hex: '#EADDD7' },
      { name: 'Trắng ngà', hex: '#F5F5F5' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Bộ cư sĩ Cát Tường được may từ vải đũi lụa tự nhiên siêu mềm mịn. Kiểu dáng thoải mái, trang nhã cho việc hành thiền hoặc đón tiếp khách quý.',
    quote: 'Mang lại sự bình an, hanh thông trong từng nếp áo.',
    details: {
      material: 'Đũi lụa organic',
      craftsmanship: 'Nẹp tà kép kín đáo',
      details_desc: 'Ống tay áo lửng vừa vặn, vạt áo xẻ nhẹ hai bên tạo sự năng động.'
    }
  },
  {
    id: 'ao-trang-thanh-luong',
    name: 'Áo Tràng Thanh Lương',
    price: 1900000,
    category: 'Áo tràng',
    badge: 'Bán chạy',
    colors: [
      { name: 'Xanh rêu', hex: '#8D9B91' },
      { name: 'Trắng ngà', hex: '#F5F5F5' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Kiểu dáng áo tràng truyền thống phối hợp với chất liệu đũi tơ mềm rủ nhẹ tênh. Mang lại cảm giác mát mẻ, an tĩnh trong từng bước đi.',
    quote: 'Hơi thở thanh lương mát lành từ thiên nhiên tinh khiết.',
    details: {
      material: 'Đũi tơ cao cấp',
      craftsmanship: 'May dấu mũi chỉ thủ công',
      details_desc: 'Thiết kế cổ áo đứng 3 phân đứng dáng, tà rộng rãi bay bổng.'
    }
  },

  {
    id: 'bo-lam-cat-tuong-nu',
    name: 'Bộ Lam Cát Tường Nữ',
    price: 1200000,
    category: 'Đồ lam nữ',
    colors: [
      { name: 'Nâu nhạt', hex: '#EADDD7' },
      { name: 'Xanh rêu', hex: '#8D9B91' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Đồ lam nữ Cát Tường với chất linen đanh mịn, thấm hút mồ hôi vượt trội. Điểm xuyết hoa văn thêu tay tỉ mỉ ở ngực áo tạo nét duyên dáng tinh tế.',
    quote: 'Sự kết hợp hoàn hảo giữa nét truyền thống và sự thoải mái hiện đại.',
    details: {
      material: 'Linen bột cao cấp',
      craftsmanship: 'Thêu họa tiết hoa sen nổi',
      details_desc: 'Thiết kế khuy cài nút gỗ mộc mạc, quần ống đứng lịch sự.'
    }
  },
  {
    id: 'phap-phuc-giao-linh-cai-tien',
    name: 'Pháp Phục Giao Lĩnh Cách Tân',
    price: 2600000,
    category: 'Pháp Phục',
    badge: 'Độc quyền',
    colors: [
      { name: 'Trắng ngà', hex: '#F5F5F5' },
      { name: 'Nâu đất', hex: '#5D4037' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80'
    ],
    description: 'Cảm hứng từ áo giao lĩnh truyền thống kết hợp vạt chéo xếp nếp tinh tế. Một thiết kế sang trọng lịch sự dành riêng cho các dịp lễ tết và nghi lễ đặc biệt.',
    quote: 'Nâng tầm giá trị truyền thống Việt trong dòng chảy thời đại mới.',
    details: {
      material: 'Lụa tơ tằm dệt jacquard vân chìm',
      craftsmanship: 'Nẹp cổ giao chéo thủ công',
      details_desc: 'Dây buộc giấu bên hông tinh tế giúp tùy chỉnh độ ôm vừa vặn của áo.'
    }
  }
];

export const STORIES = [
  {
    id: 'monastic-simplicity',
    title: 'Sự tối giản trong triết lý mặc',
    excerpt: 'Tại Từ Tâm Phục, pháp phục không phán xét, không ồn ào. Đó chính là sự nương tựa dịu nhẹ vào nguyên bản thô mộc của tự nhiên.',
    author: 'Nhà Sáng Lập Từ Tâm Phục'
  },
  {
    id: 'the-art-of-linen',
    title: 'Hành trình từ thớ gai tự nhiên đến pháp phục hằng ngày',
    excerpt: 'Tìm hiểu thấu đáo quy trình nhuộm củ nâu, dệt chéo thô sần và tết khuy rơm thủ công tạo nên phong cách độc đáo suốt ngàn năm lịch sử.',
    author: 'Nghệ Nhân Làng Dệt Trạch Xá'
  }
];
