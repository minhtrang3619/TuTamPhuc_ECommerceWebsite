import { useState } from 'react'
import { 
  Star, 
  MessageSquare, 
  EyeOff, 
  Eye, 
  Check, 
  ChevronDown, 
  CornerDownRight,
  Search
} from 'lucide-react'

export default function AdminReviews() {
  const [ratingFilter, setRatingFilter] = useState('Tất cả')
  const [searchTerm, setSearchTerm] = useState('')
  const [replyTextMap, setReplyTextMap] = useState<Record<number, string>>({})
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null)

  const ratingOptions = ['Tất cả', '5 sao', '4 sao', '3 sao', '2 sao', '1 sao']

  const [reviews, setReviews] = useState([
    {
      id: 1,
      customer: 'Nguyễn Minh Anh',
      avatar: 'A',
      rating: 5,
      date: '24/10/2024',
      product: 'Áo choàng thiền Linen - Ngà',
      comment: 'Vải linen mặc rất nhẹ và thoáng, đường may tỉ mỉ, thêu sắc nét. Mặc đi chùa cảm giác rất trang nghiêm, tôn kính. Sẽ tiếp tục mua ủng hộ Từ Tâm Phục.',
      replies: [
        { sender: 'Từ Tâm Phục', text: 'Từ Tâm Phục xin kính chúc đạo hữu Minh Anh luôn an lạc và hanh thông trên con đường tu học gieo duyên lành ạ.' }
      ],
      hidden: false
    },
    {
      id: 2,
      customer: 'Trần Đại Nghĩa',
      avatar: 'N',
      rating: 4,
      date: '23/10/2024',
      product: 'Đai thêu trang nghiêm',
      comment: 'Đai thêu rất đẹp, họa tiết sắc sảo. Hơi cứng một chút khi đeo lần đầu nhưng giặt vài lần thì mềm hơn. Rất hài lòng.',
      replies: [],
      hidden: false
    },
    {
      id: 3,
      customer: 'Lê Hoài Thu',
      avatar: 'T',
      rating: 3,
      date: '22/10/2024',
      product: 'Khăn lụa tơ tằm - Indigo',
      comment: 'Khăn lụa mềm mượt nhưng màu indigo thực tế hơi tối hơn so với hình ảnh trên web. Giao hàng hơi chậm.',
      replies: [],
      hidden: false
    },
    {
      id: 4,
      customer: 'Spam Account',
      avatar: 'S',
      rating: 1,
      date: '20/10/2024',
      product: 'Áo Tunic Cotton Linen - Đất',
      comment: 'MUA HÀNG GIẢM GIÁ 70% TẠI LINK RÁC NÀY NÈ MỌI NGƯỜI !!! CLICK NGAY !!!',
      replies: [],
      hidden: true
    }
  ])

  const toggleHideReview = (id: number) => {
    setReviews(prev => prev.map(rev => 
      rev.id === id ? { ...rev, hidden: !rev.hidden } : rev
    ))
  }

  const handleReplySubmit = (id: number) => {
    const text = replyTextMap[id]
    if (!text || !text.trim()) return

    setReviews(prev => prev.map(rev => {
      if (rev.id === id) {
        return {
          ...rev,
          replies: [...rev.replies, { sender: 'Từ Tâm Phục', text: text }]
        }
      }
      return rev
    }))

    setReplyTextMap(prev => ({ ...prev, [id]: '' }))
    setActiveReplyId(null)
  }

  const filteredReviews = reviews.filter(rev => {
    const matchesSearch = rev.customer.toLowerCase().includes(searchTerm.toLowerCase()) || rev.product.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRating = ratingFilter === 'Tất cả' || `${rev.rating} sao` === ratingFilter
    return matchesSearch && matchesRating
  })

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary">Đánh giá</h1>
        <p className="text-on-surface-variant mt-1">Lắng nghe phản hồi của khách hàng và quản lý bình luận.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10">
        <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 w-full md:w-80">
          <Search size={16} className="text-on-surface-variant mr-2" />
          <input 
            type="text" 
            placeholder="Tìm sản phẩm, tên khách..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-body-md placeholder:text-outline p-0 w-full"
          />
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
          <div className="relative">
            <select 
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="appearance-none bg-surface-container-low border-none rounded-lg text-label-md font-label-md pr-10 pl-4 py-2.5 focus:ring-primary/20 cursor-pointer text-on-surface-variant"
            >
              {ratingOptions.map((opt, idx) => (
                <option key={idx} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-on-surface-variant pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {filteredReviews.map((rev) => (
          <div 
            key={rev.id} 
            className={`bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border transition-all duration-300 ${
              rev.hidden 
                ? 'border-red-200/40 bg-red-50/5 opacity-60' 
                : 'border-outline-variant/10 hover:border-primary/20'
            }`}
          >
            {/* Header of review card */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                  {rev.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-on-surface">{rev.customer}</span>
                    <span className="text-[10px] text-on-surface-variant/40">•</span>
                    <span className="text-xs text-on-surface-variant/50">{rev.date}</span>
                  </div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-surface-container-high'} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-on-surface-variant/50 block">Đánh giá sản phẩm:</span>
                <span className="text-xs font-semibold text-primary hover:underline cursor-pointer">{rev.product}</span>
              </div>
            </div>

            {/* Comment */}
            <p className="font-body-md text-sm text-on-surface leading-relaxed mb-6 bg-surface-container-low/20 p-4 rounded border border-outline-variant/5">
              {rev.comment}
            </p>

            {/* Existing replies */}
            {rev.replies.length > 0 && (
              <div className="space-y-3 mb-6 pl-4 border-l-2 border-primary/20">
                {rev.replies.map((reply, ridx) => (
                  <div key={ridx} className="flex gap-2 text-xs">
                    <CornerDownRight size={14} className="text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-primary">{reply.sender}: </span>
                      <span className="text-on-surface-variant leading-relaxed">{reply.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
              <button 
                onClick={() => setActiveReplyId(activeReplyId === rev.id ? null : rev.id)}
                className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-colors"
              >
                <MessageSquare size={14} />
                <span>Trả lời</span>
              </button>

              <button 
                onClick={() => toggleHideReview(rev.id)}
                className={`flex items-center gap-1 text-xs transition-colors ${
                  rev.hidden 
                    ? 'text-red-500 hover:text-red-700' 
                    : 'text-on-surface-variant hover:text-red-500'
                }`}
              >
                {rev.hidden ? (
                  <>
                    <Eye size={14} />
                    <span>Hiện đánh giá</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={14} />
                    <span>Ẩn bình luận</span>
                  </>
                )}
              </button>
            </div>

            {/* Reply Input Form */}
            {activeReplyId === rev.id && (
              <div className="mt-4 pt-4 border-t border-outline-variant/10 animate-in fade-in duration-300">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Viết lời cảm ơn hoặc tư vấn phản hồi..." 
                    value={replyTextMap[rev.id] || ''}
                    onChange={(e) => setReplyTextMap(prev => ({ ...prev, [rev.id]: e.target.value }))}
                    className="flex-grow bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-xs font-body-md"
                  />
                  <button 
                    onClick={() => handleReplySubmit(rev.id)}
                    className="px-4 py-2 bg-primary text-on-primary hover:bg-primary/95 text-xs font-semibold flex items-center gap-1 transition-all rounded"
                  >
                    <Check size={12} />
                    <span>Gửi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {filteredReviews.length === 0 && (
          <div className="bg-surface-container-lowest p-12 text-center text-on-surface-variant/60 rounded-xl border border-outline-variant/10 font-body-md">
            Không tìm thấy đánh giá nào phù hợp.
          </div>
        )}
      </div>
    </div>
  )
}
