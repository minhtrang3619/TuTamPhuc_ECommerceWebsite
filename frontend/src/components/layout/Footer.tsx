import { useState } from 'react'
import { MapPin, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

interface FooterProps {
  onOpenAssistant?: () => void
}

export function Footer({ onOpenAssistant }: FooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Đăng ký nhận tin thành công! Quý khách vui lòng kiểm tra hòm thư.')
    setNewsletterEmail('')
  }

  return (
    <footer className="bg-surface-container py-16 border-t border-outline-variant" id="tutamphuc-footer">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-4 gap-gutter">
        {/* Brand Intro column */}
        <div className="flex flex-col gap-6">
          <span className="font-headline-sm text-headline-sm text-primary">Từ Tâm Phục</span>
          <p className="font-body-md text-body-md text-on-surface-variant italic">
            "Trang phục trang nhã, thiết kế tinh tế."<br/>
            Mang lại cảm giác an yên, nhẹ nhàng và thoải mái trong cuộc sống thường nhật.
          </p>
        </div>

        {/* Core educational quick links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">
            Khám Phá Từ Tâm
          </h4>
          <div className="flex flex-col gap-2">
            <button onClick={() => toast.info("Hỗ trợ đổi trả miễn phí trong vòng 7 ngày đối với sản phẩm lỗi hoặc không vừa size, yêu cầu còn nguyên tem mác.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left bg-transparent border-none p-0 cursor-pointer">
              Chính sách đổi trả
            </button>
            <button onClick={() => toast.info("Từ Tâm Phục nhận may đo theo số đo riêng, đảm bảo trang phục vừa vặn hoàn hảo và mang lại cảm giác thoải mái nhất.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left bg-transparent border-none p-0 cursor-pointer">
              Dịch vụ may đo
            </button>
            <button onClick={() => toast.info("Dịch vụ thêu tên hoặc pháp danh thủ công tinh tế lên trang phục, tạo dấu ấn cá nhân mang đậm chất thiền.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left bg-transparent border-none p-0 cursor-pointer">
              Thêu tên riêng
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">
            Liên Hệ
          </h4>
          <div className="flex flex-col gap-3 font-body-md text-body-md text-on-surface-variant">
            <p><strong>Hotline:</strong> 083889344</p>
            <p><strong>Zalo hỗ trợ:</strong> 0838893442</p>
            <p><strong>Email:</strong> tutamphuc2026@gmail.com</p>
            <p className="leading-relaxed"><strong>Địa chỉ:</strong> số 1 Lê Văn Việt, Tăng Nhơn Phú, TP Hồ Chí Minh</p>
          </div>
        </div>

        {/* Newsletter registration panel */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">
            Đăng ký nhận bản tin
          </h4>
          <p className="font-body-md text-body-md text-on-surface-variant mb-2">
            Quý khách vui lòng điền email để nhận thông tin ưu đãi và sản phẩm mới nhất.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
            <input
              type="email"
              required
              placeholder="Email của quý khách..."
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              className="px-4 py-2 border border-outline bg-surface text-on-surface rounded-lg w-full font-body-md outline-none"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors duration-500 rounded-lg whitespace-nowrap cursor-pointer"
              id="newsletter-submit-btn"
            >
              Đăng ký
            </button>
          </form>
        </div>
      </div>

      {/* Footer brand copyright notes */}
      <div className="mt-16 text-center font-caption text-caption text-on-surface-variant/70 border-t border-outline-variant/40 pt-6 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        © 2026 Từ Tâm Phục. Tất cả sản phẩm được thiết kế và sản xuất với sự tỉ mỉ, chất lượng cao nhất.
      </div>
    </footer>
  )
}
