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
          <div className="flex items-center gap-2 mt-2 font-caption text-caption text-outline">
            <MapPin size={14} className="text-primary" />
            Trụ sở: 2026 Từ Tâm Phục, Việt Nam
          </div>
        </div>

        {/* Core educational quick links */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">
            Khám Phá Từ Tâm
          </h4>
          <div className="flex flex-col gap-2">
            <button onClick={() => alert("Chương trình ‘Nghệ thuật Phục trang’ tôn vinh chất liệu tự nhiên thô mộc, hướng tới thiết kế tối giản, trang nhã và an bình.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left bg-transparent border-none p-0 cursor-pointer">
              Nghệ thuật Phục trang
            </button>
            <button onClick={() => alert("Bảo dưỡng vải linen dệt tơ: Giặt bằng tay với nước lạnh xà phòng dịu mát, không vặn xoắn cơ học, treo râm mát.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left bg-transparent border-none p-0 cursor-pointer">
              Hướng dẫn giặt là
            </button>
            <button onClick={() => alert("Quy tắc trang phục: Khuyên dùng trang phục lịch sự, che vai và đầu gối khi đến những nơi trang nghiêm như đền, chùa.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left bg-transparent border-none p-0 cursor-pointer">
              Quy tắc trang phục
            </button>
          </div>
        </div>

        {/* Help queries support topics */}
        <div className="flex flex-col gap-4">
          <h4 className="font-label-md text-label-md text-primary uppercase tracking-wider">
            Hỗ Trợ Khách Hàng
          </h4>
          <div className="flex flex-col gap-2">
            <button onClick={onOpenAssistant} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left flex items-start gap-1 bg-transparent border-none p-0 cursor-pointer">
              <Sparkles size={14} className="text-amber-800 self-center" /> AI đo size tự động
            </button>
            <button onClick={() => alert("Từ Tâm Phục cam kết phát triển bền vững, sử dụng chất liệu thiên nhiên và quy trình sản xuất thân thiện với môi trường.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left bg-transparent border-none p-0 cursor-pointer">
              Phát triển bền vững
            </button>
            <button onClick={() => alert("Thông tin cá nhân của quý khách được bảo mật an toàn tuyệt đối.")} className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors duration-300 text-left bg-transparent border-none p-0 cursor-pointer">
              Chính sách bảo mật
            </button>
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
