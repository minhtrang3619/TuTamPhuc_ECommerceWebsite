/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, BlogItem } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Bộ Lam Tĩnh Tâm",
    price: 1250000,
    category: "Đồ lam nữ",
    color: "Nâu nhạt",
    colorHex: "#EADDD7",
    sizes: ["S", "M", "L", "XL"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD-i99PGuf24vO5kvxg326vEO7jUuUSLTDT1n1BFFVtkuE9CvzkafJf5hh_pcEax4jWWbA8r5usOW5XIpFoUHtnaRrkonr9-wyhvaXIZK6gTYY6CwI6RCABXDpyPxu0ioSb3YLij-kW940L0YDvEkFYvH3GPQ06avEx77w5QDj7YABPaI4R3UM1Xq76cZrNv2lXRxpAwWH_yy5LNgTcDPgOz-i4opUNNMKLgL6ksKfzWsqjN1LDhNOIe3L2WFbcei39HxceMvxge9Ov",
    description: "Được dệt từ sợi đũi tự nhiên 100% cực kỳ thông thoáng khí. Với gam màu nâu dịu dàng của đất cát hiền lành, bộ lam mang dáng vẻ mộc mạc thanh nhã, tôn lên phẩm hạnh khiêm nhường vô ưu chốn từ quang.",
    fabric: "Đũi mộc tự nhiên dệt tay",
    meaning: "Hạnh nguyện lắng nghe tựa nhành tơ",
    care: "Giặt tay nhẹ nhàng bằng nước lạnh sạch. Tránh chất tẩy mạnh. Vắt nước khẽ khàng và phơi trong hiên mát."
  },
  {
    id: "p2",
    name: "Áo Tràng An Nhiên",
    price: 1850000,
    category: "Áo tràng",
    color: "Trắng ngà",
    colorHex: "#F5F5F5",
    sizes: ["S", "M", "L"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGIQZtJgyZL64jeOPXO-SBpVFLOh0hYPaX7T0TbIBnGZFeEyCd2BE8qwij6MFz-KiZs5rHFzFeojkyMTE8awGCPHNB8XVo8wLZooMeMaA4EL2LAMIiOFVP9e9iRBJjBbqSLyOgjxKNzIxr2vg6yf0rTYB_AkPFYhn6DV1zrXQlIsT8Gu1d-iD0IH4fAUJz0540gtOqTmsN9zhmCp-p3YerGiSkBzT0R2IvN5RvRXrVLP01l3la8ccg81L59kyplvWe3FFnVzPivbP5",
    tag: "Mới",
    description: "Thiết kế đoan nghiêm cho những buổi đảnh lễ đại từ rộng mở. Sợi lanh pha lụa mướt mịn rủ dọc cơ thể theo từng bước đi kinh hành, giúp giữ oai nghi đoan trang, tịnh hóa thân tâm.",
    fabric: "Lanh lụa tơ bóng nhẹ",
    meaning: "Nét bình yên tinh khiết tựa giọt sương mai",
    care: "Ủi hơi nước nhẹ độ ẩm trung bình. Nên giặt khô hoặc giặt tay nhẹ."
  },
  {
    id: "p3",
    name: "Bộ Cư Sĩ Thiền Môn",
    price: 1450000,
    category: "Bộ cư sĩ",
    color: "Nâu nhạt",
    colorHex: "#EADDD7",
    sizes: ["S", "M", "L", "XL"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnO1Maxeutb-jssEy8FeSFc2z-2xSMGU60H2jUoy58UiARCv_XaPIGNVETe7etHxfzi1baFOLFF1EoOAl0Hw9qyLkkZ8Wo975bLX-MYkY3WwV9tcb7rObSCjcYBJc3ivi6ITGBoRegW0HEKBjw4ZLMzWLgprYYxvNZaqCuiV4E_nyRIMN7Jb_gtXjxDQpywYFWCL_TQs5KsVy4GrScJUsbZaFLDgRfZik96lm4yd591Tp531H80VQdxlP4CZuCZMuyyeco2LDPRHdf",
    description: "Bộ cư sĩ mang cổ tàu khâu viền ẩn thủ công sắc sảo. Phù hợp cho cả nam và nữ Phật tử tu dưỡng tinh tấn, mang phong khí khoáng đạt của kẻ sĩ tự tại ngắm núi mờ, sông rộng.",
    fabric: "Đũi tơ xước dệt dày dặn",
    meaning: "Mở rộng lòng bao dung với muôn loài vạn vật",
    care: "Giặt tay bằng sữa tắm hoặc xà phòng nhẹ. Phơi phẳng trong bóng râm mát."
  },
  {
    id: "p4",
    name: "Bộ Lam Nam Mộc",
    price: 1300000,
    category: "Đồ lam nam",
    color: "Nâu đất",
    colorHex: "#5D4037",
    sizes: ["M", "L", "XL"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFZOddktb0Dpo8exTstX9GxgMa_JyDGiqMB_F2kQRJdrwgfPy4Rk-6dHBOpvkTrLLphJgVRLOsHKjmgKHLE8SAZh5VtR5FcN0xzTbf4UbHgiEkQQFpaQneSebziA5pf5Tr6zoWNO7EcpWCQSa2BR-ft1vffgyv6EctwP6aFvO25aGs0W1M8pMGL-6Kpf24duljgXHksLNIpt_rtsjWMxRjQOK1sZ_OY7ksrAiHoxzleI-DGvfu59XwHdEoHmH3wMF9r2tuDTBMU1a2",
    description: "Thiết kế đơn giản mà mực thước dành cho nam cư sĩ. Sắc nâu gỗ quý báu trầm lắng, kết hợp nút tàu vải mộc và ống rộng giúp tâm thế vững chãi như núi cao vững bền trong mọi tư thế tọa thiền.",
    fabric: "Vải đũi thô cổ điển dệt dày",
    meaning: "Vững chãi trước phong ba bão táp hồng trần",
    care: "Giặt riêng lần đầu vì màu sẫm nguyên bản từ vỏ cây mộc có thể phai màu nhẹ."
  },
  {
    id: "p5",
    name: "Áo Tràng Khinh Thanh",
    price: 2100000,
    category: "Áo tràng",
    color: "Trắng ngà",
    colorHex: "#F5F5F5",
    sizes: ["S", "M", "L", "XL"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQkWSlpPIPODRoiohVx_l6ZYVY8xkFuvZth6pCgpGjXJ3hFgf45Nyh9WlC-hs0Ma0EADm3-NtTyT4Y1q2XlEVT7XVATkDV-1456LM_LGIxRhITvdSvOylLbHIG_FkYI--mfVkxX-sb5fo53PxVUrFTk3meBb7VOavtUD5VYHs73K9e5c3c33nz5NMgWINRV8VUeWJmYtUkxIMsAYYilzMOZ7NdAgs4aqRnSWJOvZb9f1skrG9v5vqbVZNGWGgccivFepCmTH17j8aP",
    description: "Tựa như gió mát thoảng qua khóm trúc, Áo Tràng Khinh Thanh được chế tác từ sợi lụa dệt mỏng cực kỳ bay bổng và bay phất phơ thanh thanh. Thích hợp dâng hoa bái Phật oai nghi oanh liệt.",
    fabric: "Lụa tơ tằm vân mây mộc",
    meaning: "Gió mát thổi tan đi bụi trần gột rửa phiền não",
    care: "Ưu tiên giặt hấp hoặc giặt tay siêu nhẹ bằng nước ấm. Không vắt xoắn."
  },
  {
    id: "p6",
    name: "Bộ Lam Thư Thái",
    price: 1250000,
    category: "Đồ lam nữ",
    color: "Xanh rêu",
    colorHex: "#8D9B91",
    sizes: ["S", "M", "L"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAP3KJm44zDv1xLDp7lM9R_v24qof1kgdKtqX2e6DgMH8Ht7UiOcUlPKPO9ZGyMMZ4zLIUMYe8oxpvoCLfa9M8OUuLV_mZgHsC_90Sfl3ubBTfJ1Xsy15vlbGpSOzOxksALSeUuAEb7FoBUZr9TX1Ievc-gu6R5gLBxXeCNIUFPF4nV7V9YxC9JpeH-EE8h_JtzG9kwd0USgW1yO5geWCIOym71EwtYYzZiK9ypIpXKlIzV4nuD3EyzS4S2DJFHenPqeupT6cnD1BB",
    description: "Bộ đũi tay lửng mang sắc xanh thanh quý của rêu cổ kính tự viện. Cho tà áo tự thăng hoa nét tươi mát, thư thái của tâm hồn thanh tịnh nhè nhẹ thoát khỏi phiền ưu bận rộn hằng ngày.",
    fabric: "Đũi tơ mềm giặt sấy sần mặt vải",
    meaning: "Tự tại thong thả bước chân an nhiên",
    care: "Phơi nơi khô ráo, tránh ánh nắng mặt trời gắt gao làm bạc màu rêu tự nhiên."
  },
  // Extra products for pagination page 2 & page 3
  {
    id: "p7",
    name: "Bộ Hải Sái Vô Ưu",
    price: 1550000,
    category: "Đồ lam nam",
    color: "Nâu đất",
    colorHex: "#5D4037",
    sizes: ["M", "L", "XL"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFZOddktb0Dpo8exTstX9GxgMa_JyDGiqMB_F2kQRJdrwgfPy4Rk-6dHBOpvkTrLLphJgVRLOsHKjmgKHLE8SAZh5VtR5FcN0xzTbf4UbHgiEkQQFpaQneSebziA5pf5Tr6zoWNO7EcpWCQSa2BR-ft1vffgyv6EctwP6aFvO25aGs0W1M8pMGL-6Kpf24duljgXHksLNIpt_rtsjWMxRjQOK1sZ_OY7ksrAiHoxzleI-DGvfu59XwHdEoHmH3wMF9r2tuDTBMU1a2",
    description: "Thiết kế quần thụng bo nhẹ chân tôn trọng tư thái kinh hành tụng chú. Vải thô dày dặn vừa ôm mà không gò bó xước nhẹ mộc mạc, bền bỉ cùng năm tháng cư sĩ thanh tu học đạo pháp.",
    fabric: "Vải đũi xước dệt cơ học dẻo dai",
    meaning: "Vô ưu tự đắc hành nghìn cây số ngắm cỏ hoa",
    care: "Ủi là ở nhiệt độ vải cotton thông thường, giữ phẳng oai nghi."
  },
  {
    id: "p8",
    name: "Áo Tràng Mộng Hoa",
    price: 2250000,
    category: "Áo tràng",
    color: "Trắng ngà",
    colorHex: "#F5F5F5",
    sizes: ["S", "M", "L"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGIQZtJgyZL64jeOPXO-SBpVFLOh0hYPaX7T0TbIBnGZFeEyCd2BE8qwij6MFz-KiZs5rHFzFeojkyMTE8awGCPHNB8XVo8wLZooMeMaA4EL2LAMIiOFVP9e9iRBJjBbqSLyOgjxKNzIxr2vg6yf0rTYB_AkPFYhn6DV1zrXQlIsT8Gu1d-iD0IH4fAUJz0540gtOqTmsN9zhmCp-p3YerGiSkBzT0R2IvN5RvRXrVLP01l3la8ccg81L59kyplvWe3FFnVzPivbP5",
    tag: "Giới Hạn",
    description: "Nghệ thuật khâu thêu vân ẩn hoa sen tuyệt đỉnh chìm sâu dưới thớ lanh quý giá. Áo rủ nếp thanh tú, che chắn gió sương bảo bọc đạo quả tu hành bứt pháp hanh thông.",
    fabric: "Vải lanh tơ thêu chìm hoa văn Việt cổ",
    meaning: "Đóa hoa bừng sáng soi tỏ lối tìm về",
    care: "Giặt bọc lưới giặt nhẹ nhàng hoắc tuyệt nhất là nâng niu vò tay."
  },
  {
    id: "p9",
    name: "Bộ Lam Liên Hoa",
    price: 1180000,
    category: "Đồ lam nữ",
    color: "Xanh rêu",
    colorHex: "#8D9B91",
    sizes: ["S", "M", "L"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAP3KJm44zDv1xLDp7lM9R_v24qof1kgdKtqX2e6DgMH8Ht7UiOcUlPKPO9ZGyMMZ4zLIUMYe8oxpvoCLfa9M8OUuLV_mZgHsC_90Sfl3ubBTfJ1Xsy15vlbGpSOzOxksALSeUuAEb7FoBUZr9TX1Ievc-gu6R5gLBxXeCNIUFPF4nV7V9YxC9JpeH-EE8h_JtzG9kwd0USgW1yO5geWCIOym71EwtYYzZiK9ypIpXKlIzV4nuD3EyzS4S2DJFHenPqeupT6cnD1BB",
    description: "Với thêu đóa sen tịnh tinh bên tà vai trái thuần thiết dịu mát. Phom dệt rủ ôm lửng thoáng tự nhiên, mang trọn tinh hoa của tịnh xá về dâng hiến nét hoan hỷ cho người đối diện.",
    fabric: "Đũi tơ tầm thuần chay",
    meaning: "Khởi phát tín tâm đoan lương",
    care: "Phơi trong hiên thoáng gió, không dùng sấy nhiệt dễ co vải mộc mạc."
  }
];

export const BLOGS: BlogItem[] = [
  {
    id: "b1",
    title: "Y phục tăng ni và cư sĩ - Tinh hoa tịnh khiết",
    excerpt: "Nghệ thuật gìn giữ oai nghi tế hạnh từ trang phục rộng rãi thanh mộc khi viếng cảnh chùa thanh nghiêm.",
    content: "Bước chân vào Phật tự, oai nghi hành niệm của cư sĩ dường như gánh một phần trách nhiệm gieo trồng phước báo cho bản thân hữu duyên. Diện bộ đồ lam gọn gàng, kín đáo, sắc nâu hiền mộc tựa cát sông Hằng hay dường lam của trời lành vô sắc gieo lòng tin tinh khiết. Áo thiền Từ Tâm Phục đề cao cấu trúc phồng cánh tà để khi đạo hữu cung kính lột khăn sụp ngũ bái sấm tụng vương dính không hề gò bó, mang cảm giác bình yên đến lạ lùng.",
    date: "12 tháng 5, 2026",
    readTime: "5 phút đọc",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnO1Maxeutb-jssEy8FeSFc2z-2xSMGU60H2jUoy58UiARCv_XaPIGNVETe7etHxfzi1baFOLFF1EoOAl0Hw9qyLkkZ8Wo975bLX-MYkY3WwV9tcb7rObSCjcYBJc3ivi6ITGBoRegW0HEKBjw4ZLMzWLgprYYxvNZaqCuiV4E_nyRIMN7Jb_gtXjxDQpywYFWCL_TQs5KsVy4GrScJUsbZaFLDgRfZik96lm4yd591Tp531H80VQdxlP4CZuCZMuyyeco2LDPRHdf",
    category: "Nghi lễ & Đời sống"
  },
  {
    id: "b2",
    title: "Bí quyết thong dong: Chăm sóc tơ linen thuần chay",
    excerpt: "Cách gìn giữ thớ đũi thủ công mộc mạc luôn mềm rủ và bền bỉ trong sương gội giặt dạo lành.",
    content: "Đũi dệt thô mộc xước dăm vốn không chạy tìm dòng hóa chất dẻo mượt. Nó sống như cỏ cây: cứng cáp ban đầu rồi rủ mềm tuyệt đẹp sau mỗi bận gội giặt mộc. Hãy nâng niu tà áo của quý phật tử tựa tĩnh tâm tu chứng: Giặt chúng khẽ khàng bằng tay thảnh thơi, treo tản trong bóng mát mái tranh che hiên. Khi sợi mộc được uống gió trời thảo dã, tà áo không nhăn dúm mà rủ sóng sang trang, ấp ôm làn da tôn kính quý hữu lành.",
    date: "18 tháng 5, 2026",
    readTime: "4 phút đọc",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGIQZtJgyZL64jeOPXO-SBpVFLOh0hYPaX7T0TbIBnGZFeEyCd2BE8qwij6MFz-KiZs5rHFzFeojkyMTE8awGCPHNB8XVo8wLZooMeMaA4EL2LAMIiOFVP9e9iRBJjBbqSLyOgjxKNzIxr2vg6yf0rTYB_AkPFYhn6DV1zrXQlIsT8Gu1d-iD0IH4fAUJz0540gtOqTmsN9zhmCp-p3YerGiSkBzT0R2IvN5RvRXrVLP01l3la8ccg81L59kyplvWe3FFnVzPivbP5",
    category: "Lối sống thiền"
  },
  {
    id: "b3",
    title: "Sắc Nâu Đất Đai - Sắc thái nguyên sơ của giác ngộ",
    excerpt: "Sự thảng hoặc của tâm vô sở đắc rọi chiếu sâu xa vào sự lựa chọn trang nghiêm của Tổ Sư.",
    content: "Tại sao y phật lại ngự chọn màu hoại sắc - nâu đất bạc, vàng úa cỏ tàn? Đó chính là sự đồng điệu tối thượng với cát bụi bình thường của tinh cầu dưới chân bái Phật dâng an tịnh. Từ Tâm Phục khôi phục sắc 'Mộc Nam Gỗ' và 'Sen Tịnh Khô' sương muối cổ xưa, mang tinh thần rũ bỏ thói mị tực điểm trang lộng lẫy, để phật tử thâm nhập Phật điện thưa dạ cung kính tột cùng.",
    date: "22 tháng 5, 2026",
    readTime: "6 phút đọc",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFZOddktb0Dpo8exTstX9GxgMa_JyDGiqMB_F2kQRJdrwgfPy4Rk-6dHBOpvkTrLLphJgVRLOsHKjmgKHLE8SAZh5VtR5FcN0xzTbf4UbHgiEkQQFpaQneSebziA5pf5Tr6zoWNO7EcpWCQSa2BR-ft1vffgyv6EctwP6aFvO25aGs0W1M8pMGL-6Kpf24duljgXHksLNIpt_rtsjWMxRjQOK1sZ_OY7ksrAiHoxzleI-DGvfu59XwHdEoHmH3wMF9r2tuDTBMU1a2",
    category: "Ý nghĩa thương hiệu"
  }
];
