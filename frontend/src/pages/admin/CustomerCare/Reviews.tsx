import { useState } from 'react'
import { 
  Star, 
  CornerDownRight, 
  CheckCircle,
  MessageSquare,
  Sparkles,
  Send
} from 'lucide-react'

interface ReviewItem {
  id: number
  name: string
  avatar: string
  product: string
  orderId: string
  rating: number
  comment: string
  status: 'pending' | 'replied'
  reply?: string
}

export default function AdminCustomerReviews() {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'replied'>('all')
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [replyInputs, setReplyInputs] = useState<Record<number, string>>({})

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 1,
      name: 'Nguyễn Thị Minh An',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBuzLj071A4vLa0gg6_Ofmpl0kPeRxKlZr4XjIvrIMT4Awv6b39rqpIPxc7apN9e1UoA2wL3tMNoZvL66G-UGVwsoE9CK-zMY-25v92J-e3b46qiLy47zMEyQAZChOBuX7430y2FhUfj0bcidPyDwUxr9pUef7mG3f1vogF6263v5UTDzUXFDZEIEzmmkuoX7yoUNo1HlBHEKbQvKb-vXzroiwzFQUeoP-Jx3NRftjkZgNVb8IiUtXXOeTHzHOmAAB2hmUm3Kj8rO93',
      product: 'Áo Dài Tơ Tằm Liên Hoa',
      orderId: '#TTP-8921',
      rating: 5,
      comment: 'Chất liệu lụa tơ tằm thật sự tuyệt vời, cảm giác nhẹ nhàng như mây lướt trên da. Đường may tinh xảo, thể hiện được cái tâm của người thợ. Rất hài lòng với dịch vụ tư vấn tận tình.',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Trần Văn Hoàng',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0YjK6SYjRt6LoYrfZdJFoIwGXoD0LTQ3c2x7TnvnVJN3pGOyrxTX5--VnudJ_D2zYZqhfmeqpAzDM5K-9EhlM5BjXgKOIrBWPgJ4Jdz_JxuOrtNNVoCyp2WyX6A_tfMnpT5en7I1-7fBUCjxCluVB17znD_8Ukm_gJbTu4O-tXrNBAsUoNOUj5dKY19R6rrMp6BjLax6OeiPokYuvJYmWZ9g5pePjViITsgAgRFsIkekILVZFcN2HJkEI3D2_9YYs10VM7P5ANrah',
      product: 'Bộ Đồ Thiền Vô Thường (Linen)',
      orderId: '#TTP-8402',
      rating: 4,
      comment: 'Vải linen mặc rất mát, phom dáng chuẩn cho việc ngồi thiền. Tuy nhiên thời gian giao hàng hơi chậm hơn dự kiến 2 ngày. Hy vọng thương hiệu sẽ cải thiện khâu vận chuyển.',
      status: 'replied',
      reply: 'Từ Tâm Phục xin chân thành cảm ơn anh Hoàng đã góp ý. Chúng tôi rất xin lỗi vì sự chậm trễ trong khâu vận chuyển. Đội ngũ đang làm việc với đối tác để đảm bảo các đơn hàng sau sẽ đến tay khách hàng đúng hẹn hơn. Chúc anh thân tâm an lạc.'
    },
    {
      id: 3,
      name: 'Lê Bảo Trâm',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkVC2EtOLQg6wPscC_exY6PqS5or6HSo06HAEEOUpVTlyjPJ_a6Geh4rH6giU4LoHTwX8TFEhyUcynQK0b0qEft2JssJvj0KlsggzbYORvqhUAOicIwFSYryKEKdRkNQDBHlt7ikrtR7wAHji4faAsqZCmtRvzqJXP0JHk_E6pa6-86n1Q1maz-o0yLAAkcoAFhMHJ9SoRjfMxPIlYNVFVNziu-fgsiFxvOM8wrQAHU_VsNx7Y6KPwwLbV6cWDh9Gh1UshRpz00BeM',
      product: 'Khăn Quàng Lụa Vân Gấm',
      orderId: '#TTP-7911',
      rating: 5,
      comment: 'Màu sắc bên ngoài đẹp hơn cả trong ảnh. Họa tiết gấm chìm rất sang trọng. Đóng gói hộp gỗ rất chỉn chu, phù hợp để làm quà tặng. Sẽ tiếp tục ủng hộ!',
      status: 'pending'
    }
  ])

  const handleReplyChange = (id: number, val: string) => {
    setReplyInputs(prev => ({ ...prev, [id]: val }))
  }

  const handleSendReply = (id: number) => {
    const text = replyInputs[id]
    if (!text?.trim()) return

    setReviews(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'replied',
          reply: text
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
  }

  const filteredReviews = reviews.filter(r => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus
    const matchRating = filterRating === 'all' || r.rating === filterRating
    return matchStatus && matchRating
  })

  const pendingCount = reviews.filter(r => r.status === 'pending').length

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
              className={`px-5 py-1.5 rounded text-xs font-semibold tracking-wider uppercase transition-all ${
                filterStatus === 'all' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setFilterStatus('pending')}
              className={`px-5 py-1.5 rounded text-xs font-semibold tracking-wider uppercase transition-all ${
                filterStatus === 'pending' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Chờ xử lý
            </button>
            <button 
              onClick={() => setFilterStatus('replied')}
              className={`px-5 py-1.5 rounded text-xs font-semibold tracking-wider uppercase transition-all ${
                filterStatus === 'replied' 
                  ? 'bg-white shadow-sm text-primary' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Đã phản hồi
            </button>
          </div>

          {/* Rating Dropdown */}
          <select 
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-surface-container-low border-none rounded-lg text-xs font-semibold tracking-wider uppercase px-4 py-2 text-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
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
          {filteredReviews.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-outline-variant/10 text-on-surface-variant/60">
              Không có đánh giá nào phù hợp bộ lọc.
            </div>
          ) : (
            filteredReviews.map((r) => (
              <article key={r.id} className="bg-white p-8 rounded-xl border border-outline-variant/20 flex flex-col gap-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 border border-outline-variant/20 shrink-0">
                      <img alt={r.name} className="w-full h-full object-cover" src={r.avatar} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-primary">{r.name}</h4>
                      <p className="text-xs text-on-surface-variant opacity-75">Sản phẩm: {r.product}</p>
                      <div className="mt-1">
                        <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded font-semibold">
                          Đơn hàng: {r.orderId}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 text-primary">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star 
                        key={idx} 
                        size={16} 
                        className={idx < r.rating ? 'fill-current' : 'text-outline-variant/40'} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-on-surface leading-relaxed italic">
                  "{r.comment}"
                </p>

                {/* Reply section */}
                <div className="pt-6 border-t border-outline-variant/10">
                  {r.status === 'replied' ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider">
                        <CornerDownRight size={14} />
                        <span>Đã phản hồi</span>
                      </div>
                      <p className="text-sm text-on-surface-variant bg-surface-container-low/40 p-4 rounded-lg border border-outline-variant/10">
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
                          className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded hover:bg-primary/95 transition-all flex items-center gap-1.5"
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
                <p className="text-3xl font-serif font-bold">4.9</p>
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
