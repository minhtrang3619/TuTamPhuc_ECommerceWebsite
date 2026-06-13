import { useState, useEffect } from 'react'
import { 
  Star, 
  CornerDownRight, 
  CheckCircle,
  MessageSquare,
  Sparkles,
  Send
} from 'lucide-react'
import { apiClient } from '@/services'
import { getImageUrl } from '@/utils/productMapper'

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238a726b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z'/%3E%3C/svg%3E"

const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đã xác nhận';
    case 'processing': return 'Chờ lấy hàng';
    case 'shipped': return 'Đang vận chuyển';
    case 'delivered': return 'Đã giao';
    case 'cancelled': return 'Đã hủy';
    case 'refunded': return 'Đã hoàn tiền';
    default: return status || 'N/A';
  }
};

const getPaymentMethodText = (method: string) => {
  switch (method) {
    case 'cod': return 'COD';
    case 'bank_transfer': return 'Chuyển khoản';
    case 'vnpay': return 'VNPAY';
    case 'momo': return 'Ví MoMo';
    default: return method || 'N/A';
  }
};

const getPaymentStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Chưa thanh toán';
    case 'paid': return 'Đã thanh toán';
    case 'failed': return 'Thanh toán thất bại';
    case 'refunded': return 'Đã hoàn tiền';
    default: return status || 'N/A';
  }
};

export default function AdminCustomerReviews() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'replied'>('all')
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({})
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const statusParam = filterStatus !== 'all' ? filterStatus : undefined
      const ratingParam = filterRating !== 'all' ? filterRating : undefined
      
      const response = await apiClient.get('/admin/reviews', {
        params: {
          status: statusParam,
          rating: ratingParam
        }
      })
      setReviews(response.data || [])
    } catch (err) {
      console.error("Lỗi khi lấy danh sách đánh giá từ API:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [filterStatus, filterRating])

  const handleReplyChange = (id: number, val: string) => {
    setReplyInputs(prev => ({ ...prev, [id]: val }))
  }

  const handleSendReply = async (id: number) => {
    const text = replyInputs[id]
    if (!text?.trim()) return

    try {
      await apiClient.post(`/reviews/${id}/reply`, { reply: text.trim() })
      // Update local reviews state to mark as replied
      setReviews(prev => prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            reply: text.trim()
          }
        }
        return r
      }))
      // Clear input
      setReplyInputs(prev => {
        const copy = { ...prev }
        delete copy[id]
        return copy
      })
    } catch (err) {
      console.error("Lỗi khi gửi phản hồi lên API:", err)
    }
  }

  const pendingCount = reviews.filter(r => !r.reply).length
  const totalRating = reviews.reduce((acc, r) => acc + r.rating, 0)
  const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : '0.0'

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-16">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
        <div>
          <h3 className="text-3xl font-serif text-primary font-semibold mb-2">Đánh giá của khách</h3>
          <p className="text-sm text-on-surface-variant max-w-lg">Xem và phản hồi ý kiến đóng góp từ khách hàng để nâng cao chất lượng dịch vụ.</p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Status Buttons */}
          <div className="flex bg-surface-container-low p-1 rounded-lg">
            <button 
              onClick={() => setFilterStatus('all')}
              className={`px-5 py-1.5 rounded text-xs font-semibold tracking-wider uppercase transition-all border-none cursor-pointer ${
                filterStatus === 'all' 
                  ? 'bg-white shadow-sm text-primary font-bold' 
                  : 'text-on-surface-variant hover:text-primary bg-transparent'
              }`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setFilterStatus('pending')}
              className={`px-5 py-1.5 rounded text-xs font-semibold tracking-wider uppercase transition-all border-none cursor-pointer ${
                filterStatus === 'pending' 
                  ? 'bg-white shadow-sm text-primary font-bold' 
                  : 'text-on-surface-variant hover:text-primary bg-transparent'
              }`}
            >
              Chờ xử lý
            </button>
            <button 
              onClick={() => setFilterStatus('replied')}
              className={`px-5 py-1.5 rounded text-xs font-semibold tracking-wider uppercase transition-all border-none cursor-pointer ${
                filterStatus === 'replied' 
                  ? 'bg-white shadow-sm text-primary font-bold' 
                  : 'text-on-surface-variant hover:text-primary bg-transparent'
              }`}
            >
              Đã phản hồi
            </button>
          </div>

          {/* Rating Dropdown */}
          <select 
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-surface-container-low border-none rounded-lg text-xs font-semibold tracking-wider uppercase px-4 py-2 text-primary focus:ring-1 focus:ring-primary/20 cursor-pointer outline-none"
          >
            <option value="all">Mọi mức sao</option>
            <option value="5">5 Sao</option>
            <option value="4">4 Sao</option>
            <option value="3">3 Sao</option>
            <option value="2">2 Sao</option>
            <option value="1">1 Sao</option>
          </select>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Reviews list */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white p-12 text-center rounded-xl border border-outline-variant/10 text-on-surface-variant/60 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-xs font-medium">Đang tải danh sách đánh giá...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-outline-variant/10 text-on-surface-variant/60">
              Không có đánh giá nào phù hợp bộ lọc.
            </div>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="bg-white p-8 rounded-xl border border-outline-variant/20 flex flex-col gap-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 border border-outline-variant/20 shrink-0">
                      <img 
                        alt={r.is_anonymous ? 'Ẩn danh' : (r.user?.full_name || 'Khách hàng')} 
                        className="w-full h-full object-cover" 
                        src={r.is_anonymous ? DEFAULT_AVATAR : (getImageUrl(r.user?.avatar || '') || DEFAULT_AVATAR)} 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-primary">
                        {r.is_anonymous ? 'Người dùng ẩn danh' : (r.user?.full_name || 'Khách hàng')}
                      </h4>
                      <p className="text-xs text-on-surface-variant opacity-75">Sản phẩm: {r.product_name}</p>
                      { (r.product_color || r.product_size) && (
                        <p className="text-[11px] text-on-surface-variant/80 mt-0.5">
                          Phân loại: {[r.product_color, r.product_size].filter(Boolean).join(', ')}
                        </p>
                      ) }
                      <div className="mt-1">
                        <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded font-semibold">
                          {r.order_code ? `Đơn hàng: #${r.order_code}` : `Mã đánh giá: #${r.id}`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx} 
                        size={16} 
                        className={idx < r.rating ? 'fill-current text-amber-400' : 'text-outline-variant/40'} 
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  {r.title && (
                    <h5 className="font-serif font-bold text-sm text-[#442a22]">{r.title}</h5>
                  )}
                  <p className="text-sm text-on-surface leading-relaxed italic">
                    "{r.content || 'Không có nội dung nhận xét.'}"
                  </p>
                </div>

                {r.order_code && (
                  <div className="p-5 bg-[#faf6f0]/40 rounded-lg border border-[#d4c3be]/40 text-xs text-on-surface-variant font-sans space-y-3">
                    <div className="flex items-center justify-between border-b border-[#d4c3be]/20 pb-2">
                      <span className="font-serif font-bold text-primary text-xs uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle size={14} className="text-emerald-600" />
                        Thông tin đơn hàng liên kết
                      </span>
                      <span className="font-mono font-bold text-primary text-sm">#{r.order_code}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                      <div className="space-y-1">
                        <p><span className="font-bold text-[#442a22]">Người nhận:</span> {r.order_recipient_name || 'N/A'}</p>
                        <p><span className="font-bold text-[#442a22]">Số điện thoại:</span> {r.order_recipient_phone || 'N/A'}</p>
                        <p><span className="font-bold text-[#442a22]">Địa chỉ nhận hàng:</span> {r.order_recipient_address || 'N/A'}</p>
                        {r.order_date && (
                          <p><span className="font-bold text-[#442a22]">Ngày mua:</span> {new Date(r.order_date).toLocaleString('vi-VN')}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p>
                          <span className="font-bold text-[#442a22]">Tổng thanh toán:</span>{' '}
                          <span className="font-mono font-bold text-primary text-sm">
                            {r.order_total ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.order_total) : '0 đ'}
                          </span>
                        </p>
                        <p>
                          <span className="font-bold text-[#442a22]">Thanh toán:</span>{' '}
                          <span className="font-semibold">{getPaymentMethodText(r.order_payment_method)}</span>
                          <span className={`ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${
                            r.order_payment_status === 'paid' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {getPaymentStatusText(r.order_payment_status)}
                          </span>
                        </p>
                        <p>
                          <span className="font-bold text-[#442a22]">Trạng thái đơn:</span>{' '}
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide border ${
                            r.order_status === 'delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : r.order_status === 'cancelled'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {getStatusText(r.order_status)}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reply section */}
                <div className="pt-6 border-t border-outline-variant/10">
                  {r.reply ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
                        <CornerDownRight size={14} />
                        <span>Đã phản hồi</span>
                      </div>
                      <p className="text-sm text-on-surface-variant bg-surface-container-low/40 p-4 rounded-lg border border-outline-variant/10 leading-relaxed">
                        {r.reply}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-surface-container-low/30 p-5 rounded-lg border border-outline-variant/10">
                      <label className="text-[10px] font-bold text-primary block mb-2 uppercase tracking-widest">Phản hồi của bạn</label>
                      <textarea 
                        value={replyInputs[r.id] || ''}
                        onChange={(e) => handleReplyChange(r.id, e.target.value)}
                        className="w-full bg-transparent border-none focus:ring-0 text-sm p-0 placeholder:text-outline-variant resize-none h-20 outline-none" 
                        placeholder="Nhập lời cảm ơn hoặc giải đáp..."
                      />
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={() => handleSendReply(r.id)}
                          className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary/95 transition-all flex items-center gap-1.5 border-none cursor-pointer"
                        >
                          <Send size={12} />
                          Gửi Phản Hồi
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))
          )}
        </div>

        {/* Right: Stats and summary */}
        <div className="space-y-6 sticky top-24">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary-container text-white p-6 rounded-xl flex flex-col justify-between shadow-sm">
              <Sparkles className="opacity-50 mb-6" size={24} />
              <div>
                <p className="text-3xl font-serif font-bold">{averageRating}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80 mt-1">Đánh giá trung bình</p>
              </div>
            </div>
            <div className="bg-secondary-container text-on-secondary-container p-6 rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant/15">
              <MessageSquare className="opacity-50 mb-6" size={24} />
              <div>
                <p className="text-3xl font-serif font-bold text-primary">{pendingCount}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70 mt-1">Chưa phản hồi</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm space-y-4">
            <h5 className="text-xs font-bold text-primary uppercase tracking-wider">Nguyên tắc giao tiếp</h5>
            <ul className="text-xs text-on-surface-variant space-y-3 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-primary shrink-0 mt-0.5" />
                <span>Thân thiện, nhã nhặn, tôn trọng sự an nhiên của khách hàng.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-primary shrink-0 mt-0.5" />
                <span>Lắng nghe chân thành, ghi nhận các ý kiến để cải tiến sản phẩm.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle size={14} className="text-primary shrink-0 mt-0.5" />
                <span>Giải quyết thấu đáo các khiếu nại về giao nhận hoặc chất lượng vải.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
