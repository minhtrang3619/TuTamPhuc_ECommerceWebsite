import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Heart } from 'lucide-react'
import { Marquee } from '@/components/ui/Marquee'
import { charityService, CharityCampaign } from '@/services/charityService'

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + ' ₫'
}

export default function HomePage() {
  const [campaign, setCampaign] = useState<CharityCampaign | null>(null)
  
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await charityService.getCampaigns()
        if (data && data.length > 0) {
          setCampaign(data[0])
        }
      } catch (err) {
        console.error("Failed to load charity campaign on homepage:", err)
      }
    }
    fetchCampaign()
  }, [])
  const scrollToCollections = () => {
    const collectionsEl = document.getElementById("collections")
    if (collectionsEl) {
      collectionsEl.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col" id="tutamphuc-app-root">
      {/* Hero Section */}
      <section className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            alt="Hero Background"
            className="w-full h-full object-cover object-center opacity-90"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDv4jjikVxIo47JIVjw3uW53hpuOLWQUv9H7ywNN_M5yhLbUmh0OdcQMw1eMFxPn69BVCeFn7pXSx2juQVtb8UlHBSl4auzzRmRR1m0rnfQXAbomNfSvN6W8_JJ4gl5mM1aaQFlx4NxwMQBNSFRYTedaR0Wzn3pV88Hzpn4TdEN045bM-c-VVMln2dj1s7SOTI_c9RNMriXIw3Z6NkYojhTECmZRd5Vs9s_aqaQGpptxXnhqIajydq2a1rk6YmyXdjPlxPIFlOs2KqT"
          />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-margin-mobile text-center flex flex-col items-center gap-8 bg-surface/60 backdrop-blur-md p-12 rounded-xl ambient-shadow">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary">Từ Tâm Phục</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant tracking-wide">Kinh doanh bằng sự thật, phát triển bằng niềm tin</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button
              onClick={scrollToCollections}
              className="px-8 py-3 border border-primary text-primary font-label-md text-label-md hover:bg-primary-fixed transition-colors duration-500 rounded flex items-center justify-center cursor-pointer bg-transparent"
            >
              Khám phá bộ sưu tập
            </button>
            <Link
              to="/san-pham"
              className="px-8 py-3 bg-primary text-on-primary font-label-md text-label-md hover:bg-primary/90 transition-colors duration-500 rounded flex items-center justify-center cursor-pointer"
            >
              Mua ngay
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Categories (Bento Grid) */}
      <section className="py-section-gap max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop" id="collections">
        <div className="text-center mb-16">
          <h2 className="font-headline-md text-headline-md text-primary mb-4">Danh Mục Nổi Bật</h2>
          <div className="w-12 h-px bg-outline mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter auto-rows-[300px]">
          {/* Large Card */}
          <Link
            to="/danh-muc/do-lam"
            className="relative group overflow-hidden md:col-span-2 md:row-span-2 bg-surface-container rounded-lg block w-full text-left cursor-pointer"
          >
            <img
              alt="Đồ Lam"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrBLlbUn5BS7L-jwLAR1k7adsxRmrMAs2hSn-gg5gYuDkyFwYoCvXEiyB6isu8-DwdXdUEqs4mBdaJZCtfshb3NpeZIZppZkMJXa0Wb_Kkvb-hCxD4eXudtDErx3AXxvQ7_q5iKmS0pV-xskdvUUWrk0KtLWdGxDNMFgqyeG8rByUjTACIMFOeN4PxwHx0wdUt71TG0R4NaxrMm7szu_N8KKpWFGbFv-TBzNZtrqTsLF8Jq52ATwZCyv_aishAV8S53raJbmLVBg77"
            />
            <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-surface-tint/80 to-transparent">
              <h3 className="font-headline-sm text-headline-sm text-on-primary mb-2">Đồ Lam</h3>
              <span className="font-label-md text-label-md text-on-primary flex items-center gap-2">
                Khám phá <ArrowRight size={16} />
              </span>
            </div>
          </Link>

          {/* Small Card 1 */}
          <Link
            to="/danh-muc/phap-phuc"
            className="relative group overflow-hidden bg-surface-container rounded-lg block w-full text-left cursor-pointer"
          >
            <img
              alt="Pháp phục"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDspV1XdurxzKoeaggAJu1hf74QDUZQVPisH2jNws0r1Rm9RFYwB98edJ8M0qBjP4rjdHgkRbxo013g9w2PiaIO3ZDDI8k0VoYw-zU03nNWjf06Bz6yXSnwQkhOQi0ltD9hdYCgCkiM6Zu6bfa4rdbry5DKqgYisL3yeyue1ljPTUkiXH0YIQtpB8cWgby5xCMsfp2iWC-oO6zb4bOaPDkBu6gBHvUQqmHt-bXoj1ojuVTfc8K20GXMLP1I0YIpyNiWb_WtO0GYICT9"
            />
            <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-surface-tint/80 to-transparent">
              <h3 className="font-headline-sm text-headline-sm text-on-primary mb-2">Pháp phục</h3>
            </div>
          </Link>

          {/* Small Card 2 */}
          <Link
            to="/danh-muc/ao-trang"
            className="relative group overflow-hidden bg-surface-container rounded-lg block w-full text-left cursor-pointer"
          >
            <img
              alt="Áo Tràng"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuNz0WOcI-jkHaVK-JlQ9uJ2qjzIci6n0ByCmYBpc0GsiVBkKrDeQp8OdvafAiFTmd_S3uuQ1iAzoafVZhL-7p78_GhxKahieBIuTy_ardkn1wfZGqZiVqoCeDsLS-zUiCPKKRuX6a_Bb4poaWDw0MX8iX3LPFcJ_VFYSTFydTDH5149BBLQfhP3-YXb2HnViiIixKdJi7WSVaZl9oK0Zjzh8FeuR2WfXbv9d01LbTd40GJVT2-qkMYGWbbN3Xx6TY5zTQx7Fz0XzQ"
            />
            <div className="absolute bottom-0 left-0 p-6 w-full bg-gradient-to-t from-surface-tint/80 to-transparent">
              <h3 className="font-headline-sm text-headline-sm text-on-primary mb-2">Áo Tràng</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* Decorative Zen Marquee */}
      <section className="py-4 bg-surface-container/20 border-y border-outline-variant/20 overflow-hidden select-none">
        <Marquee
          items={[
            "Tĩnh Tâm", "•", "An Nhiên", "•", "Tự Tại", "•",
            "Từ Bi", "•", "Trí Tuệ", "•", "Thanh Tịnh", "•",
            "Chánh Niệm", "•", "Diện Trang Nghiêm", "•", "Khởi Tâm Từ", "•"
          ]}
          speed="slow"
          className="bg-transparent border-none py-0 text-primary/10 font-serif text-2xl md:text-4xl tracking-widest uppercase"
          gap="gap-16"
          pauseOnHover={false}
        />
      </section>

      {/* Charity Campaign Section */}
      <section className="py-20 bg-[#faf6f0] border-t border-b border-[#ece0dc] relative">
        <div className="max-w-4xl mx-auto px-margin-mobile flex flex-col items-center">
          <span className="text-[10px] uppercase font-sans font-extrabold tracking-[0.25em] text-primary mb-3 text-center">
            Hành trình nhân ái xuyên suốt
          </span>
          <h2 className="font-serif text-2xl md:text-3.5xl text-primary font-bold mb-6 tracking-wide leading-tight text-center">
            Gieo Mầm Từ Tâm • Trích 5% Giá Bán
          </h2>
          
          {campaign ? (
            <Link 
              to="/blog?charity=true"
              className="w-full bg-white border border-[#e5e1de] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-xs max-w-3xl mt-4 cursor-pointer hover:shadow-md hover:scale-[1.002] transition-all duration-300 group block no-underline text-inherit"
            >
              <div className="w-full md:w-2/5 aspect-[4/3] rounded-lg overflow-hidden bg-surface-container flex-shrink-0">
                {campaign.image_url ? (
                  <img src={campaign.image_url} alt={campaign.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-primary/30">
                    <Heart size={48} />
                  </div>
                )}
              </div>
              <div className="w-full md:w-3/5 space-y-4 text-left">
                <div>
                  <h3 className="font-serif text-xl font-bold text-primary">{campaign.name}</h3>
                  {campaign.slogan && (
                    <p className="text-xs text-primary font-serif font-semibold italic mt-1">
                      {campaign.slogan}
                    </p>
                  )}
                </div>
                <p className="text-xs text-[#5d4037] leading-relaxed font-sans">
                  {campaign.description}
                </p>
                
                {/* Progress bar */}
                {(() => {
                  const rawPercent = campaign.target_amount > 0 ? (campaign.raised_amount / campaign.target_amount) * 100 : 0
                  const percent = rawPercent > 0 && rawPercent < 1 
                    ? parseFloat(rawPercent.toFixed(2)) 
                    : Math.min(100, Math.round(rawPercent))
                  return (
                    <div className="space-y-2 pt-2 border-t border-[#e5e1de]/60">
                      <div className="flex justify-between items-end text-[10px] font-semibold text-on-surface-variant/80">
                        <span>Đã đạt được: {percent}%</span>
                        <span className="font-bold text-primary text-xs">
                          {formatPrice(campaign.raised_amount)} / {formatPrice(campaign.target_amount)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#eeeeee] rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${campaign.raised_amount > 0 ? Math.max(percent, 1.5) : 0}%` }} />
                      </div>
                    </div>
                  )
                })()}
              </div>
            </Link>
          ) : (
            <div className="text-center">
              <p className="font-sans text-xs md:text-sm text-[#5d4037] leading-relaxed max-w-2xl opacity-90 mb-8 px-2 md:px-0">
                Từ Tâm Phục cam kết trích <strong>5% từ giá bán của sản phẩm</strong> từ mỗi đơn hàng được bán ra để quyên vào công quỹ của các chùa và tu viện. Nguồn quỹ này sẽ trực tiếp giúp đỡ những người già neo đơn không nơi nương tựa, và các em nhỏ mồ côi đang được nhà chùa cưu mang, chăm sóc dưới bóng Phật đài.
              </p>
              <div className="w-16 h-0.5 bg-[#d4c3be] mb-6 mx-auto"></div>
              <p className="font-serif italic text-xs text-on-surface-variant max-w-xl px-4">
                "Mỗi bộ pháp phục khoác lên mình không chỉ mang lại sự trang nghiêm thanh thoát, mà còn là một đóa sen nhân ái gửi gắm yêu thương đến những mảnh đời khó khăn."
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-section-gap bg-secondary-fixed">
        <div className="max-w-3xl mx-auto px-margin-mobile text-center flex flex-col items-center">
          <Leaf className="text-primary w-10 h-10 mb-6 opacity-80" />
          <h2 className="font-headline-md text-headline-md text-primary mb-8 leading-relaxed">
            Sự tĩnh tại trong từng nếp áo, sự tinh tế thoải mái trong từng đường kim mũi chỉ.
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-loose mb-10">
            Từ Tâm Phục không chỉ là những bộ pháp phục, mà là một không gian chánh niệm mang theo bên mình. Chúng tôi lựa chọn những chất liệu tự nhiên thuần khiết nhất, thiết kế tối giản để tôn vinh vẻ đẹp nội tâm, giúp người mặc tìm thấy sự bình yên giữa nhịp sống hối hả.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 font-label-md text-label-md text-primary hover:text-on-surface-variant transition-colors pb-1 border-b border-primary hover:border-on-surface-variant cursor-pointer"
          >
            Câu chuyện thương hiệu <ArrowRight size={16} />
          </Link>
        </div>
      </section>

    </div>
  )
}
