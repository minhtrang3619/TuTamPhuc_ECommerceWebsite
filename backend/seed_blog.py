import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.session import SessionLocal
from app.models.blog import BlogPost, BlogStatus
from app.models.user import User, UserRole

def seed_blog():
    db = SessionLocal()
    try:
        # Find admin user
        admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if not admin:
            print("No admin user found! Run seed_users.py first.")
            return

        existing = db.query(BlogPost).count()
        if existing > 0:
            print(f"Blog posts already exist ({existing} posts). Skipping.")
            return

        posts = [
            {
                "title": "Nguồn gốc và ý nghĩa của đồ lam trong Phật giáo Việt Nam",
                "slug": "nguon-goc-y-nghia-do-lam-phat-giao-viet-nam",
                "excerpt": "Đồ lam – màu áo của từ bi và trí tuệ. Hãy cùng khám phá hành trình lịch sử và ý nghĩa tâm linh sâu sắc của trang phục Phật giáo truyền thống Việt Nam.",
                "content": """
<h2>Lịch sử hình thành trang phục Phật giáo tại Việt Nam</h2>
<p>Trong dòng chảy lịch sử hơn 2000 năm của Phật giáo tại Việt Nam, trang phục của người tu hành và Phật tử đã trải qua nhiều biến đổi, nhưng luôn giữ được nét đặc trưng riêng, phản ánh sự giao thoa tinh tế giữa văn hóa bản địa và giáo lý nhà Phật.</p>
<p>Màu lam – gam màu đặc trưng của đồ lam Phật giáo – không phải ngẫu nhiên được chọn lựa. Trong triết học Phật giáo, màu xanh lam tượng trưng cho bầu trời rộng lớn, cho sự thanh thản và trí tuệ không bị che khuất bởi phiền não.</p>
<h2>Ý nghĩa tâm linh của màu lam</h2>
<p>Theo kinh điển Phật giáo, màu xanh lam là một trong năm màu cơ bản trong biểu tượng Phật giáo, đại diện cho đức hạnh của Phật A Súc Bệ (Akshobhya). Màu này mang ý nghĩa của sự kiên định, không dao động trước mọi hoàn cảnh – phẩm chất mà người học Phật luôn hướng đến.</p>
<p>Khi mặc đồ lam, người Phật tử như được nhắc nhở về con đường tu tập: sống thanh thản, buông bỏ chấp ngã, nuôi dưỡng từ bi và trí tuệ trong từng khoảnh khắc của cuộc sống hàng ngày.</p>
<h2>Sự phát triển qua các thời kỳ</h2>
<p>Từ những ngôi chùa đầu tiên tại Dâu (Bắc Ninh) được xây dựng vào thế kỷ thứ 3, trang phục Phật giáo Việt Nam đã dần được định hình. Qua các triều đại Lý, Trần, Lê – những thời kỳ mà Phật giáo trở thành quốc giáo – đồ lam ngày càng được chuẩn hóa và trở thành một phần không thể thiếu trong sinh hoạt tín ngưỡng của người Việt.</p>
<p>Ngày nay, đồ lam không chỉ là trang phục của người xuất gia mà còn là trang phục quen thuộc của hàng triệu Phật tử tại gia khi tham dự các khóa lễ, tu tập hay thực hành các nghi lễ tâm linh.</p>
                """.strip(),
                "thumbnail": "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=800&q=80",
                "status": BlogStatus.PUBLISHED,
                "tags": ["đồ lam", "Phật giáo", "văn hóa", "tâm linh", "lịch sử"],
                "is_featured": True,
                "view_count": 1240,
            },
            {
                "title": "Hướng dẫn chọn pháp phục đúng chuẩn cho Phật tử tại gia",
                "slug": "huong-dan-chon-phap-phuc-dung-chuan-phat-tu-tai-gia",
                "excerpt": "Chọn pháp phục phù hợp không chỉ thể hiện sự tôn kính với Tam Bảo mà còn giúp tâm hồn bạn được an định hơn trong quá trình tu tập.",
                "content": """
<h2>Pháp phục là gì?</h2>
<p>Pháp phục (hay còn gọi là pháp y) là trang phục được may theo quy định của giới luật Phật giáo, dành cho cả tăng ni và Phật tử tại gia khi tham gia các hoạt động tu tập, lễ bái. Pháp phục không chỉ là trang phục thông thường mà còn là biểu tượng của sự quy y Tam Bảo và cam kết trên con đường học đạo.</p>
<h2>Các loại pháp phục phổ biến</h2>
<h3>1. Áo tràng</h3>
<p>Áo tràng là loại pháp phục phổ biến nhất dành cho Phật tử tại gia. Với thiết kế đơn giản, trang nhã, áo tràng thường có màu lam, nâu hoặc xám, tượng trưng cho sự khiêm nhường và buông bỏ.</p>
<h3>2. Pháp phục giao lĩnh</h3>
<p>Pháp phục giao lĩnh mang đậm nét truyền thống với cổ áo chéo đặc trưng. Loại áo này thường được mặc trong các dịp lễ lớn hoặc khi tham gia khóa tu dài ngày.</p>
<h3>3. Đồ lam thường nhật</h3>
<p>Dành cho việc tu tập hàng ngày tại nhà, đồ lam thường nhật có thiết kế thoải mái hơn nhưng vẫn giữ được sự trang nghiêm cần thiết.</p>
<h2>Tiêu chí chọn pháp phục</h2>
<ul>
<li><strong>Chất liệu:</strong> Ưu tiên vải tự nhiên như lụa, cotton, đũi để thoáng mát và thân thiện với môi trường.</li>
<li><strong>Màu sắc:</strong> Chọn theo truyền thống của tông phái hoặc theo hướng dẫn của thầy.</li>
<li><strong>Kích cỡ:</strong> Pháp phục nên rộng rãi, không ôm sát, tạo cảm giác thoải mái khi ngồi thiền hay lễ bái.</li>
<li><strong>Chất lượng đường may:</strong> Đường may phải chắc chắn, không bị sổ chỉ hay phai màu.</li>
</ul>
                """.strip(),
                "thumbnail": "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
                "status": BlogStatus.PUBLISHED,
                "tags": ["pháp phục", "hướng dẫn", "Phật tử tại gia", "áo tràng"],
                "is_featured": True,
                "view_count": 876,
            },
            {
                "title": "Cách bảo quản và giặt đồ lam đúng cách để bền đẹp lâu dài",
                "slug": "cach-bao-quan-giat-do-lam-dung-cach-ben-dep-lau-dai",
                "excerpt": "Đồ lam là trang phục tâm linh cần được bảo quản cẩn thận. Tìm hiểu những bí quyết giúp pháp phục của bạn luôn bền đẹp và giữ nguyên màu sắc qua năm tháng.",
                "content": """
<h2>Tại sao việc bảo quản đồ lam lại quan trọng?</h2>
<p>Đồ lam không chỉ là trang phục thông thường – đó là trang phục tâm linh, gắn liền với việc tu tập và lễ bái. Bảo quản đồ lam đúng cách không chỉ giúp kéo dài tuổi thọ của trang phục mà còn thể hiện sự tôn trọng đối với pháp phục và việc tu tập.</p>
<h2>Hướng dẫn giặt đồ lam</h2>
<h3>Giặt tay – phương pháp tốt nhất</h3>
<p>Đối với đồ lam chất liệu lụa hoặc đũi, nên giặt tay bằng nước lạnh hoặc ấm (không quá 30°C). Sử dụng xà phòng trung tính hoặc nước giặt dành riêng cho đồ lụa. Nhẹ nhàng vò nhẹ, không chà xát mạnh để tránh làm hỏng vải.</p>
<h3>Giặt máy – khi cần thiết</h3>
<p>Nếu cần giặt máy, hãy chọn chương trình giặt nhẹ (delicate/hand wash), dùng túi giặt đồ lót để bảo vệ vải. Nhiệt độ không quá 30°C và không dùng chế độ vắt mạnh.</p>
<h2>Cách phơi và là đồ lam</h2>
<p>Sau khi giặt xong, không vắt xoắn mà hãy nhẹ nhàng ép bớt nước rồi phơi nơi thoáng mát, tránh ánh nắng trực tiếp để không bị bạc màu. Khi là (ủi), nên dùng nhiệt độ thấp và để một tờ vải mỏng giữa bàn là và áo để bảo vệ chất liệu.</p>
<h2>Bảo quản khi không sử dụng</h2>
<p>Gấp áo cẩn thận, bảo quản trong túi vải hoặc hộp kín, đặt thêm túi chống ẩm và chống mối mọt. Tránh để trong tủ cùng với các loại hóa chất tẩy rửa hay nước hoa có mùi nồng.</p>
                """.strip(),
                "thumbnail": "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80",
                "status": BlogStatus.PUBLISHED,
                "tags": ["bảo quản", "giặt đồ lam", "mẹo hay", "chăm sóc trang phục"],
                "is_featured": False,
                "view_count": 654,
            },
            {
                "title": "Áo tràng – trang phục tu tập và ý nghĩa trong đời sống Phật giáo",
                "slug": "ao-trang-trang-phuc-tu-tap-y-nghia-doi-song-phat-giao",
                "excerpt": "Áo tràng không chỉ là trang phục – đó là biểu tượng của sự quy y, của tâm nguyện học đạo và phụng sự. Cùng tìm hiểu sâu hơn về loại pháp phục đặc biệt này.",
                "content": """
<h2>Lịch sử của áo tràng</h2>
<p>Áo tràng có nguồn gốc từ thời kỳ đầu của Phật giáo, khi các Phật tử tại gia muốn có một trang phục riêng để phân biệt thời gian tu tập với sinh hoạt thông thường. Qua nhiều thế kỷ, áo tràng đã trở thành biểu tượng không thể thiếu trong đời sống Phật giáo Việt Nam.</p>
<h2>Cấu trúc và đặc điểm của áo tràng</h2>
<p>Áo tràng truyền thống thường có thiết kế dài đến gần mắt cá chân, tay áo rộng, cổ áo có thể là cổ tròn hoặc cổ chéo tùy theo phong cách của từng tông phái. Màu sắc phổ biến nhất là màu lam (xanh), nâu đất, xám và trắng.</p>
<h3>Ý nghĩa của từng màu áo tràng</h3>
<ul>
<li><strong>Màu lam:</strong> Tượng trưng cho trí tuệ, sự thanh thản và bầu trời vô tận</li>
<li><strong>Màu nâu:</strong> Tượng trưng cho đất – sự khiêm nhường, bình dị và kiên nhẫn</li>
<li><strong>Màu xám:</strong> Tượng trưng cho sự trung dung, không thiên vị</li>
<li><strong>Màu trắng:</strong> Tượng trưng cho sự trong sáng, thanh tịnh</li>
</ul>
<h2>Khi nào nên mặc áo tràng?</h2>
<p>Áo tràng thường được mặc trong các dịp như: tham dự các khóa lễ tụng kinh, ngồi thiền tại chùa hoặc tại nhà, tham gia các khóa tu học, trong các dịp lễ Phật quan trọng như lễ Phật Đản, Vu Lan, hay đơn giản là khi muốn tạo không gian tâm linh riêng cho bản thân.</p>
                """.strip(),
                "thumbnail": "https://images.unsplash.com/photo-1591025207163-942350e47db2?auto=format&fit=crop&w=800&q=80",
                "status": BlogStatus.PUBLISHED,
                "tags": ["áo tràng", "tu tập", "Phật giáo", "pháp phục"],
                "is_featured": False,
                "view_count": 432,
            },
            {
                "title": "Từ Tâm Phục – Câu chuyện về một thương hiệu pháp phục thuần Việt",
                "slug": "tu-tam-phuc-cau-chuyen-thuong-hieu-phap-phuc-thuan-viet",
                "excerpt": "Hành trình tạo ra những bộ pháp phục mang tâm huyết Việt, từ chất liệu thuần tự nhiên đến từng đường kim mũi chỉ được thực hiện với sự thành kính và trân trọng.",
                "content": """
<h2>Khởi nguồn từ tâm nguyện</h2>
<p>Từ Tâm Phục ra đời từ một ước nguyện đơn giản nhưng sâu sắc: mang đến cho người Phật tử Việt Nam những bộ pháp phục chất lượng cao, được làm từ nguyên liệu thuần tự nhiên, với giá thành hợp lý và dịch vụ tận tâm.</p>
<p>Người sáng lập đã dành nhiều năm nghiên cứu về lịch sử trang phục Phật giáo Việt Nam, học hỏi từ các nghệ nhân lành nghề, kết hợp với kiến thức hiện đại về thiết kế và chất liệu vải để tạo ra những sản phẩm vừa truyền thống vừa phù hợp với cuộc sống hiện đại.</p>
<h2>Triết lý sản xuất</h2>
<p>Mỗi sản phẩm của Từ Tâm Phục được tạo ra với tinh thần "Tâm – Tín – Tịnh":</p>
<ul>
<li><strong>Tâm:</strong> Làm với tâm huyết, không vì lợi nhuận mà bỏ qua chất lượng</li>
<li><strong>Tín:</strong> Giữ chữ tín với khách hàng, cam kết những gì đã hứa</li>
<li><strong>Tịnh:</strong> Quy trình sản xuất sạch, nguyên liệu thuần tự nhiên, thân thiện môi trường</li>
</ul>
<h2>Cam kết về chất lượng</h2>
<p>Từ Tâm Phục cam kết sử dụng 100% vải tự nhiên (lụa, cotton, đũi) được dệt thủ công hoặc từ các nhà máy có chứng nhận thân thiện môi trường. Mỗi sản phẩm đều trải qua kiểm tra chất lượng nghiêm ngặt trước khi đến tay khách hàng.</p>
<h2>Chương trình từ thiện</h2>
<p>5% doanh thu từ mỗi đơn hàng được trích vào quỹ từ thiện, hỗ trợ các chương trình giáo dục Phật giáo cho trẻ em nghèo và các hoạt động bảo tồn văn hóa Phật giáo truyền thống Việt Nam.</p>
                """.strip(),
                "thumbnail": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
                "status": BlogStatus.PUBLISHED,
                "tags": ["Từ Tâm Phục", "thương hiệu", "câu chuyện", "từ thiện"],
                "is_featured": True,
                "view_count": 2103,
            },
        ]

        for post_data in posts:
            post = BlogPost(
                author_id=admin.id,
                **post_data
            )
            db.add(post)

        db.commit()
        print(f"✅ Successfully seeded {len(posts)} blog posts!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding blog posts: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_blog()
