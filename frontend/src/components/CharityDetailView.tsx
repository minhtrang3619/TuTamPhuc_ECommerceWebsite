import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Heart, ShieldCheck, MapPin } from 'lucide-react'
import { charityService, CharityCampaign, CharityTransaction } from '../services/charityService'
import { getImageUrl } from '../utils/productMapper'

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + ' ₫'
}

interface CharityDetailViewProps {
  campaign: CharityCampaign;
  onBack: () => void;
}

export default function CharityDetailView({ campaign, onBack }: CharityDetailViewProps) {
  const [total, setTotal] = useState(0)
  const [uniqueDonors, setUniqueDonors] = useState<number>(campaign.unique_donors_count || 0)
  const [donations, setDonations] = useState<CharityTransaction[]>([])
  const [expenses, setExpenses] = useState<CharityTransaction[]>([])
  const [selectedProofTx, setSelectedProofTx] = useState<CharityTransaction | null>(null)

  const maskName = (name: string) => {
    if (!name) return 'Khách hàng ẩn danh';
    if (name === 'Khách hàng ẩn danh') return name;

    let cleaned = name.replace(/^Khách\s+hàng\s+/i, '').trim();

    const words = cleaned.split(/\s+/);
    if (words.length <= 1) {
      return `Khách hàng ${cleaned}`;
    }

    const lastWord = words[words.length - 1];
    const initial = lastWord.charAt(0).toUpperCase();
    const body = words.slice(0, -1).join(' ');
    return `Khách hàng ${body} ${initial}...`;
  }

  const getRelativeTime = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    if (diffHours < 24) return `${diffHours} giờ trước`
    return `${diffDays} ngày trước`
  }

  useEffect(() => {
    setUniqueDonors(campaign.unique_donors_count || 0)

    const fetchData = async () => {
      try {
        const [donationsData, expensesData] = await Promise.all([
          charityService.getTransactions(1, 20, 'donation', campaign.id),
          charityService.getTransactions(1, 10, 'expense', campaign.id)
        ])
        setDonations(donationsData.items)
        setTotal(donationsData.total)
        setExpenses(expensesData.items)
      } catch (err) {
        console.error("Failed to load charity detailed data:", err)
      }
    }
    fetchData()
  }, [campaign])

  const rawPercent = campaign.target_amount > 0 ? (campaign.raised_amount / campaign.target_amount) * 100 : 0
  const percent = rawPercent > 0 && rawPercent < 1
    ? parseFloat(rawPercent.toFixed(2))
    : Math.min(100, Math.round(rawPercent))

  const statusLabel = campaign.status === 'completed'
    ? 'Đã hoàn thành'
    : campaign.status === 'closing'
      ? 'Sắp hoàn thành'
      : 'Đang thực hiện'

  const gallery = campaign.gallery_images
    ? campaign.gallery_images.split(',').map(url => getImageUrl(url.trim()))
    : [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDmgTqvtGLayp5gynaX-THb1e5lQCU-ZIevABluGx5vzuDAcXQSH0e8Hk-4HAPjXopP16YUrknTBl9UFHb93IwUaxBEsbWe7GS4JLj4l-yzWmSL9i9plsi3AZ5Qz79o5EYZf_TjfMwZRYYHxXuR5XvQUzd-HcXvqgiRCFF9M3kYdmHlNVoUQNKd-QxaO9I_is9LxlaQcwfebp02gZtmx7AJHfXcMCSbQ-N8YwHf-EIm_5roLb4irAF4xXiWH1VFJt9TKe1jVpxhuar4",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDl38GVlNn6eUEho54DpTApF1S5eqqPcqJM0DyqiOJ0XKhcKZulIWjsWD_Fo-bD0bsUMu8vJNOIH4VyJf_qc85cWFC5pKraW97G17sKf_YdNCbkw5WTeCRujCCbk2pE9SYpGY7WaXaVYQuxrJebNFoRAJW6eAgukT0mQ0nE_cckm8VpkRElnwUhHUz6mPQ5YVwcBOSft91YsGouai6TnH13zShqMomeIIgcZMva5SlB43lcnEsb2SzEUUC_r2cIFG03DyJ5nU9lsQKs"
    ];

  const coverImage = campaign.image_url ? getImageUrl(campaign.image_url) : "https://lh3.googleusercontent.com/aida-public/AB6AXuBdeKbecYkznlSBSLLz09GVshQ9CPCluO1Wy19JmAxxQKtjEmUDthQHmEVWz0F2TnrSdhW2KYw82Vd8-5DEuv-2tSbj6A_AtRIn2nsT4-kfwRkZ9CPyHxic9Z9RD7HXyHGlgPSN33UTcZt0-rESfcrDk0mzpJoN5ontiUV3MuQ0DHA9PFb4qfAN0B4LW07f1paigeabyR-jDhhkI-p_P61lhq4rjXvMjW-gGcH65x0Hk2nM1PyWXYnamfS7anaN_YgepRupgF2OBUbD";

  const mockContentParagraphs = [
    "Nằm sâu trong một con hẻm nhỏ tại huyện Nhà Bè, Chùa Lá Huyền Trang không chỉ là nơi tu tập, mà còn là mái nhà chung của hơn 100 cụ già không nơi nương tựa và trẻ em mồ côi. Mỗi sáng sớm, tiếng chuông chùa ngân vang như lời nhắc nhở về sự kết nối giữa những trái tim đồng điệu.",
    "Tụi mình ghé thăm chùa vào một buổi chiều nắng nhạt. Chứng kiến đôi mắt trong veo của các em nhỏ khi nhận lấy chiếc bánh, hay nụ cười hiền hậu của các cụ khi có người trò chuyện, Từ Tâm Phục hiểu rằng: Sứ mệnh của chúng mình không chỉ là mang đến những bộ trang phục đẹp, mà còn là nhịp cầu gieo những hạt mầm thiện lành.",
    "Dự án 'Hạt Lành Từ Tâm' ra đời với mong muốn cải thiện bữa ăn, cung cấp thuốc men và hỗ trợ chi phí sinh hoạt cho các cư dân tại mái ấm. Đây là một hành trình dài hơi, và mỗi bước chân của bạn đều có sự góp mặt của niềm tin và hy vọng."
  ];

  const quoteText = campaign.quote || "Hạnh phúc không phải là khi chúng ta nhận được nhiều, mà là khi chúng ta biết trao đi một phần nhỏ những gì mình có để sưởi ấm một cuộc đời khác.";

  const shelterAddress = campaign.address || "1261/15/10 Lê Văn Lương, Ấp 2, Xã Phước Kiển, Huyện Nhà Bè, TP.HCM.";

  return (
    <div className="space-y-12 animate-fade-in font-sans">
      {/* Back Button & Breadcrumbs */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary hover:text-primary-container transition-colors cursor-pointer border-none bg-transparent"
        >
          <ArrowLeft size={16} /> Quay lại trang Blog
        </button>
      </div>

      {/* Campaign Title Section */}
      <section className="border-b border-[#e5e1de]/60 pb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold uppercase tracking-widest rounded-full">
            {statusLabel}
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-4.5xl text-primary font-bold mb-4 leading-tight max-w-4xl">
          {campaign.name}
        </h1>
        <p className="font-serif text-lg md:text-xl text-secondary italic opacity-85">
          {campaign.slogan || "Gieo hạt từ bi – Lan tỏa phúc lành."}
        </p>
      </section>

      {/* Main Campaign Storytelling & Sticky Card Layout */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Left Column (Storytelling & Transparency Log) */}
        <div className="lg:col-span-2 space-y-12 text-left">
          {/* Main Cover Image */}
          <div className="relative group overflow-hidden rounded-xl shadow-md aspect-[16/9] bg-[#faf6f0] border border-[#eeeeee]">
            <img
              className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-102"
              src={coverImage}
              alt={campaign.name}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent flex items-end p-6 md:p-8">
              <p className="text-white font-serif text-sm italic opacity-95">
                {campaign.name} – {campaign.slogan || "Gieo hạt từ bi – Lan tỏa phúc lành."}
              </p>
            </div>
          </div>

          {/* Gallery Grid */}
          {gallery && gallery.length > 0 && (
            <div className={`grid gap-4 ${gallery.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {gallery.map((imgUrl, idx) => (
                <div key={idx} className="aspect-square rounded-xl overflow-hidden shadow-xs border border-[#eeeeee]">
                  <img
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    src={imgUrl}
                    alt={`Hình ảnh hoạt động ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Detailed Story Content */}
          <article className="space-y-6 text-[#5d4037] font-body-lg text-sm md:text-base leading-relaxed">
            {quoteText && (
              <blockquote className="border-l-4 border-primary pl-6 md:pl-8 my-8 py-1">
                <p className="font-serif text-lg md:text-xl text-primary italic leading-relaxed">
                  "{quoteText}"
                </p>
              </blockquote>
            )}

            {campaign.content ? (
              <div 
                className="max-w-none text-[#5d4037] leading-relaxed [&>p]:mb-4 [&>h1]:text-2xl [&>h1]:font-serif [&>h1]:mb-4 [&>h2]:text-xl [&>h2]:font-serif [&>h2]:mb-3 [&>h3]:text-lg [&>h3]:font-serif [&>h3]:mb-3 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&_img]:rounded-lg [&_img]:shadow-sm [&_img]:my-4 [&_a]:text-primary [&_a]:underline" 
                dangerouslySetInnerHTML={{ __html: campaign.content }} 
              />
            ) : (
              <>
                {mockContentParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </>
            )}
          </article>

          {/* Component 2: Transparency & Disbursement Log */}
          {expenses.length > 0 && (
            <div className="bg-white p-8 rounded-xl border border-[#e5e1de] space-y-6 text-[#5d4037] text-left">
              <div className="flex items-center gap-2 border-b border-[#e5e1de]/60 pb-3">
                <h4 className="font-serif font-bold text-lg text-primary">Nhật ký giải ngân</h4>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#faf6f0]/50 border-b border-[#e5e1de]/40 font-bold uppercase tracking-wider text-[10px] text-on-surface-variant/80">
                      <th className="px-4 py-2.5">Đợt / Giai đoạn</th>
                      <th className="px-4 py-2.5">Ngày thực hiện</th>
                      <th className="px-4 py-2.5">Giá trị giải ngân</th>
                      <th className="px-4 py-2.5">Minh chứng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {expenses.map((tx, idx) => {
                      const dateStr = new Date(tx.created_at).toLocaleDateString('vi-VN')
                      return (
                        <tr key={tx.id} className="hover:bg-[#fcfaf7]/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-[#442a22]">
                            Giai đoạn {idx + 1}
                          </td>
                          <td className="px-4 py-3 text-secondary">
                            {dateStr}
                          </td>
                          <td className="px-4 py-3 font-bold text-primary">
                            {formatPrice(Math.abs(tx.amount))}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => setSelectedProofTx(tx)}
                              className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer p-0 text-xs text-left"
                            >
                              [Xem biên nhận &amp; Ảnh nghiệm thu]
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Commitment Card */}
          <div className="bg-[#faf6f0] p-8 md:p-10 rounded-xl border border-[#e5e1de] space-y-6 shadow-xs text-[#5d4037]">
            <div className="flex items-start gap-4">
              <span className="p-2.5 bg-white rounded-full text-primary flex-shrink-0 border border-[#e5e1de]/60">
                <ShieldCheck size={24} />
              </span>
              <div>
                <h4 className="font-serif font-bold text-lg text-primary mb-2">Cam kết minh bạch</h4>
                <p className="text-xs md:text-sm leading-relaxed">
                  Số tiền trích quỹ được tính bằng 5% trên giá thực bán của từng sản phẩm pháp phục (không bao gồm chi phí vận chuyển và các mã giảm giá áp dụng riêng cho toàn bộ đơn hàng). Hệ thống tự động ghi nhận và cộng dồn ngay khi đơn hàng giao thành công.
                </p>
              </div>
            </div>
            <hr className="border-[#e5e1de]/60" />
            <div className="flex items-center gap-3 text-xs">
              <MapPin size={16} className="text-primary flex-shrink-0" />
              <p className="font-serif font-semibold">Địa chỉ mái ấm: {shelterAddress}</p>
            </div>
          </div>

        </div>

        {/* Right Column (Sticky Campaign Stats & Contribution CTA) */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 space-y-6">
            <div className="bg-white p-8 rounded-2xl border border-[#e5e1de] shadow-xs bg-gradient-to-br from-white to-[#faf6f0]">
              <div className="mb-6 text-left">
                <p className="text-[10px] font-bold text-[#5d4037] uppercase tracking-[0.15em] mb-2">Đã quyên góp được</p>
                <div className="flex items-baseline gap-1 text-[#442a22]">
                  <h3 className="text-4xl md:text-5xl font-black font-serif leading-none">
                    {campaign.raised_amount.toLocaleString('vi-VN')}
                  </h3>
                  <span className="text-lg font-bold font-serif">đ</span>
                </div>
                <p className="text-xs text-secondary mt-2.5">
                  Mục tiêu: <strong className="text-primary">{formatPrice(campaign.target_amount)}</strong>
                </p>
              </div>

              {/* Styled Progress Bar */}
              <div className="space-y-2">
                <div className="relative h-3 w-full bg-[#eeeeee] rounded-full overflow-hidden border border-[#e5e1de]/50">
                  <div
                    className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-[1200ms] ease-out"
                    style={{ width: `${campaign.raised_amount > 0 ? Math.max(percent, 1.5) : 0}%` }}
                  />
                </div>
                <p className="text-right text-[11px] font-bold text-primary">{percent}% hoàn thành</p>
              </div>

              {/* Info Text */}
              <div className="my-8 pt-6 border-t border-[#e5e1de]/60 text-left">
                <div className="flex gap-3 items-start">
                  <span className="text-primary mt-0.5">
                    <Heart size={16} fill="currentColor" />
                  </span>
                  <p className="text-xs text-[#5d4037] leading-relaxed font-sans">
                    {campaign.description || "Mỗi bộ trang phục bạn mua tại Từ Tâm Phục sẽ đóng góp trực tiếp vào quỹ để giúp đỡ những mảnh đời khó khăn."}
                  </p>
                </div>
              </div>

              {/* Call to Action Button */}
              <Link
                to="/san-pham"
                className="w-full py-4.5 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-[#5d4037] transition-all duration-300 rounded-lg shadow-sm flex items-center justify-center cursor-pointer no-underline group overflow-hidden relative border-none"
              >
                <span className="relative z-10">MUA ÁO GIEO DUYÊN NGAY</span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </Link>

              <p className="text-center mt-5 text-[10px] text-secondary opacity-80">
                Nhấn vào đây để xem Bộ sưu tập Linen & Silk mới nhất
              </p>
            </div>

            {/* Bento statistics card */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#faf6f0] border border-[#e5e1de]/80 p-5 rounded-xl text-center space-y-1">
                <p className="text-2xl font-black font-serif text-primary">{total}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-secondary">Đã trích quỹ</p>
              </div>
              <div className="bg-[#faf6f0] border border-[#e5e1de]/80 p-5 rounded-xl text-center space-y-1">
                <p className="text-2xl font-black font-serif text-primary">{uniqueDonors}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-secondary">Nhà hảo tâm</p>
              </div>
            </div>

            {/* Component 1: Live Contribution Feed */}
            <div className="bg-white p-6 rounded-2xl border border-[#e5e1de] shadow-xs text-left space-y-4">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-[#442a22] border-b border-[#e5e1de]/60 pb-2">
                Lịch sử gieo duyên
              </h4>
              <div className="max-h-[200px] overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                {donations.length === 0 ? (
                  <p className="text-[11px] text-secondary italic">Chưa có lượt gieo duyên nào.</p>
                ) : (
                  donations.map((tx) => (
                    <div key={tx.id} className="text-xs border-b border-[#faf6f0] pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-[#5d4037]">{maskName(tx.donor_recipient)}</span>
                        <span className="text-[10px] text-secondary whitespace-nowrap">{getRelativeTime(tx.created_at)}</span>
                      </div>
                      <p className="text-[11px] text-[#8a726a] mt-0.5">
                        đã đóng góp <strong className="text-emerald-700 font-semibold">{formatPrice(tx.amount)}</strong> {tx.order_code ? `từ đơn hàng #${tx.order_code}` : ''}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Proof Modal */}
      {selectedProofTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedProofTx(null)}
              className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-lg"
            >
              ✕
            </button>

            <div className="text-left space-y-4">
              <h3 className="font-serif font-bold text-xl text-primary">
                Minh chứng nghiệm thu &amp; giải ngân
              </h3>
              <p className="text-xs text-secondary">
                Chi tiết giải ngân ngày {new Date(selectedProofTx.created_at).toLocaleDateString('vi-VN')}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Styled Scanned Receipt Document */}
                <div className="border border-[#e5e1de] bg-[#faf6f0]/40 rounded-xl p-6 relative overflow-hidden font-mono text-[11px] text-[#5d4037] flex flex-col justify-between shadow-xs min-h-[250px]">
                  {/* Watermark/Stamp */}
                  <div className="absolute right-4 bottom-4 w-20 h-20 rounded-full border-4 border-red-600/30 flex items-center justify-center rotate-12 pointer-events-none select-none">
                    <span className="text-[9px] text-red-600/40 font-bold uppercase text-center leading-none">
                      ĐÃ XÁC NHẬN<br />CHÙA LÁ
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center border-b border-[#e5e1de]/60 pb-3">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-[#442a22]">
                        BIÊN NHẬN TỪ THIỆN
                      </h4>
                      <p className="text-[9px] text-secondary mt-1">Mái ấm Chùa Lá Huyền Trang</p>
                    </div>

                    <div className="space-y-2 text-left">
                      <p><span className="text-secondary">Đơn vị tài trợ:</span> Từ Tâm Phục</p>
                      <p><span className="text-secondary">Nội dung:</span> {selectedProofTx.description || 'Hỗ trợ nhu yếu phẩm và thuốc men'}</p>
                      <p><span className="text-secondary">Số tiền nhận:</span> {formatPrice(Math.abs(selectedProofTx.amount))}</p>
                      <p><span className="text-secondary">Ngày ký nhận:</span> {new Date(selectedProofTx.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>

                  <div className="border-t border-[#e5e1de] pt-4 mt-6 flex justify-between items-center text-[9px] text-secondary">
                    <div className="text-center">
                      <p className="font-bold">Đại diện mái ấm</p>
                      <p className="mt-8 italic">(Đã ký &amp; đóng dấu)</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">Người bàn giao</p>
                      <p className="mt-8 italic">(Từ Tâm Phục)</p>
                    </div>
                  </div>
                </div>

                {/* Charity Photos */}
                <div className="space-y-3">
                  <p className="text-xs font-bold text-[#442a22]">Hình ảnh hoạt động nghiệm thu</p>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#eeeeee]">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmgTqvtGLayp5gynaX-THb1e5lQCU-ZIevABluGx5vzuDAcXQSH0e8Hk-4HAPjXopP16YUrknTBl9UFHb93IwUaxBEsbWe7GS4JLj4l-yzWmSL9i9plsi3AZ5Qz79o5EYZf_TjfMwZRYYHxXuR5XvQUzd-HcXvqgiRCFF9M3kYdmHlNVoUQNKd-QxaO9I_is9LxlaQcwfebp02gZtmx7AJHfXcMCSbQ-N8YwHf-EIm_5roLb4irAF4xXiWH1VFJt9TKe1jVpxhuar4"
                        alt="Charity Activity"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="aspect-[4/3] rounded-lg overflow-hidden border border-[#eeeeee]">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDl38GVlNn6eUEho54DpTApF1S5eqqPcqJM0DyqiOJ0XKhcKZulIWjsWD_Fo-bD0bsUMu8vJNOIH4VyJf_qc85cWFC5pKraW97G17sKf_YdNCbkw5WTeCRujCCbk2pE9SYpGY7WaXaVYQuxrJebNFoRAJW6eAgukT0mQ0nE_cckm8VpkRElnwUhHUz6mPQ5YVwcBOSft91YsGouai6TnH13zShqMomeIIgcZMva5SlB43lcnEsb2SzEUUC_r2cIFG03DyJ5nU9lsQKs"
                        alt="Handover Ceremony"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
