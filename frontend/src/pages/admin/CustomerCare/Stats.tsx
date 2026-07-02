import { useState, useEffect } from 'react'
import { 
  MessageSquare, 
  Smile, 
  TrendingUp, 
  Star,
  Lightbulb,
  FileText,
  Clock
} from 'lucide-react'
import apiClient from '../../../services/apiClient'

interface ChatItem {
  id: number
  name: string
  initials: string
  topic: string
  status: string
  time: string
  color: string
}

interface ChartPoint {
  label: string
  value: number
}

interface CategoryBreakdown {
  name: string
  percentage: number
}

interface CSKHStats {
  total_messages: number
  message_growth: number
  csat: number
  total_reviews: number
  reviews_breakdown: Record<string, number>
  total_tickets: number
  pending_tickets: number
  solving_tickets: number
  closed_tickets: number
  resolution_rate: number
  chartData: ChartPoint[]
  categories: CategoryBreakdown[]
  recentChats: ChatItem[]
}



export default function AdminCustomerStats() {
  const [stats, setStats] = useState<CSKHStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const res = await apiClient.get<CSKHStats>('/analytics/cskh')
        setStats(res.data)
      } catch (err) {
        console.error("Failed to fetch CSKH statistics:", err)
        setError("Không thể tải báo cáo thống kê. Vui lòng tải lại trang.")
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant/80 tracking-wide font-serif animate-pulse">
          Đang tính toán lưu lượng và thống kê hội thoại...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12 bg-error/5 border border-error/20 rounded-xl space-y-4">
        <h3 className="font-serif text-lg font-bold text-error">Đã xảy ra lỗi</h3>
        <p className="text-xs text-on-surface-variant">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 cursor-pointer">
          Thử Lại
        </button>
      </div>
    )
  }

  if (!stats) return null

  // Calculate dynamic SVG coordinates for the volume chart
  const maxVal = Math.max(...stats.chartData.map(d => d.value), 5)
  const points = stats.chartData.map((d, i) => {
    const x = Math.round((i / 6) * 400)
    const y = Math.round(100 - 15 - (d.value / maxVal) * 70)
    return { x, y }
  })
  
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M${p.x},${p.y}` : `${acc} L${p.x},${p.y}`
  }, "")

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-16">
      {/* Header Section */}
      <div>
        <p className="text-xs font-bold text-primary tracking-[0.2em] mb-2 uppercase">PHÂN TÍCH HỆ THỐNG</p>
        <h3 className="text-3xl font-serif text-on-surface font-semibold">Báo cáo thống kê CSKH</h3>
        <p className="text-sm text-on-surface-variant mt-1">Theo dõi lưu lượng hội thoại và hiệu suất hỗ trợ của phòng CSKH.</p>
      </div>

      {/* Key Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Conversations */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
              <MessageSquare size={24} />
            </div>
            <p className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Tổng tin nhắn</p>
            <h4 className="text-3xl font-serif text-primary font-bold">{stats.total_messages.toLocaleString('vi-VN')}</h4>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-on-surface-variant opacity-80">
            <TrendingUp size={14} className={stats.message_growth >= 0 ? "text-green-600" : "text-red-600"} />
            <span>{stats.message_growth >= 0 ? `+${stats.message_growth}` : stats.message_growth}% so với tuần trước</span>
          </div>
        </div>

        {/* Support Tickets Pending */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
              <FileText size={24} />
            </div>
            <p className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Vé hỗ trợ chờ xử lý</p>
            <h4 className="text-3xl font-serif text-primary font-bold">{stats.pending_tickets} yêu cầu</h4>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-on-surface-variant opacity-80">
            <Clock size={14} className="text-amber-600 animate-pulse" />
            <span>Đang xử lý {stats.solving_tickets} / Tổng số {stats.total_tickets} vé</span>
          </div>
        </div>

        {/* CSAT */}
        <div className="bg-primary-container text-white p-8 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white mb-6">
              <Smile size={24} />
            </div>
            <p className="text-xs font-semibold opacity-85 mb-1 uppercase tracking-wider">Điểm hài lòng</p>
            <h4 className="text-3xl font-serif font-bold text-on-primary-container">{stats.csat}%</h4>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs opacity-85">
            <Star size={14} className="fill-current text-amber-400" />
            <span>Tỷ lệ đánh giá chất lượng từ 4★ trở lên</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Line Chart: Volume */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h5 className="text-lg font-serif font-semibold text-on-surface">Lưu lượng hội thoại</h5>
            <div className="text-xs text-on-surface-variant font-semibold">7 ngày qua</div>
          </div>
          <div className="relative h-64 w-full flex items-end justify-between gap-4 px-4 border-b border-outline-variant/20 pb-2">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
              <div className="border-b border-on-surface w-full h-0"></div>
              <div className="border-b border-on-surface w-full h-0"></div>
              <div className="border-b border-on-surface w-full h-0"></div>
              <div className="border-b border-on-surface w-full h-0"></div>
            </div>
            
            {/* SVG Line Chart */}
            <svg className="absolute inset-x-0 bottom-2 w-full h-40 overflow-visible" preserveAspectRatio="none" viewBox="0 0 400 100">
              <path d={pathD} fill="none" stroke="#5d4037" strokeWidth="2.5"></path>
              {points.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} fill="#5d4037" r="4.5"></circle>
              ))}
            </svg>
          </div>
          <div className="flex justify-between mt-4 text-xs font-semibold text-on-surface-variant opacity-60 px-2">
            {stats.chartData.map((d, idx) => (
              <span key={idx}>{d.label}</span>
            ))}
          </div>
        </div>

        {/* Bar Chart: Ticket Types */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm">
          <div className="mb-8">
            <h5 className="text-lg font-serif font-semibold text-on-surface">Phân loại yêu cầu</h5>
            <p className="text-xs text-on-surface-variant mt-1">Dựa trên các yêu cầu hỗ trợ thực tế của khách hàng</p>
          </div>
          <div className="space-y-6">
            {stats.categories.map((cat, idx) => {
              const bgClass = idx === 0 ? "bg-primary" : idx === 1 ? "bg-primary/70" : "bg-primary/45"
              return (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-on-surface">{cat.name}</span>
                    <span className="text-primary font-bold">{cat.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className={`h-full ${bgClass} rounded-full`} style={{ width: `${cat.percentage}%` }}></div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 p-4 border border-outline-variant/20 bg-surface-container-low/40 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-primary shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-primary mb-1">Gợi ý tối ưu</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Phân loại yêu cầu phản ánh thắc mắc thường gặp của khách hàng. Hãy sử dụng thông tin này để cập nhật thêm các hướng dẫn chi tiết trong mục Hỏi-Đáp (FAQ).
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed CSKH Statistics (Reviews Breakdown & Ticket Processing Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reviews Breakdown Block */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm animate-in fade-in duration-500">
          <div className="mb-6">
            <h5 className="text-lg font-serif font-semibold text-on-surface">Chi tiết đánh giá của khách hàng</h5>
            <p className="text-xs text-on-surface-variant mt-1">Phân bố xếp dạng sao trên tổng số {stats.total_reviews} lượt đánh giá thực tế</p>
          </div>
          
          <div className="space-y-4">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stats.reviews_breakdown[stars.toString()] || 0
              const percentage = stats.total_reviews > 0 ? Math.round((count / stats.total_reviews) * 100) : 0
              
              const barColor = stars >= 4 ? "bg-amber-500" : stars === 3 ? "bg-[#8d9b91]" : "bg-red-500"
              
              return (
                <div key={stars} className="flex items-center gap-4 text-xs" style={{ contentVisibility: 'auto' }}>
                  <span className="w-8 font-semibold text-on-surface-variant shrink-0 flex items-center gap-1">
                    {stars} <Star size={12} className="fill-amber-400 text-amber-400 inline shrink-0" />
                  </span>
                  <div className="flex-1 h-2 bg-outline-variant/20 rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full`} style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-16 text-right text-on-surface-variant opacity-80 shrink-0 font-medium">
                    {count} lượt ({percentage}%)
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Support Ticket Progress Block */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm animate-in fade-in duration-500">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h5 className="text-lg font-serif font-semibold text-on-surface">Tình trạng xử lý yêu cầu</h5>
              <p className="text-xs text-on-surface-variant mt-1">Tình trạng giải quyết yêu cầu hỗ trợ</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-primary bg-[#ece0dc]/60 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Đã đóng: {stats.resolution_rate}%
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-neutral-50 p-4 rounded-xl border border-outline-variant/10 text-center">
              <p className="text-lg font-serif font-bold text-red-600">{stats.pending_tickets}</p>
              <p className="text-[10px] text-on-surface-variant font-semibold mt-1">Chờ xử lý</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-xl border border-outline-variant/10 text-center">
              <p className="text-lg font-serif font-bold text-amber-600">{stats.solving_tickets}</p>
              <p className="text-[10px] text-on-surface-variant font-semibold mt-1">Đang giải quyết</p>
            </div>
            <div className="bg-neutral-50 p-4 rounded-xl border border-outline-variant/10 text-center">
              <p className="text-lg font-serif font-bold text-green-700">{stats.closed_tickets}</p>
              <p className="text-[10px] text-on-surface-variant font-semibold mt-1">Đã đóng vé</p>
            </div>
          </div>
          
          <div className="w-full h-2 bg-outline-variant/20 rounded-full overflow-hidden flex">
            <div className="h-full bg-red-500" style={{ width: `${stats.total_tickets > 0 ? (stats.pending_tickets / stats.total_tickets) * 100 : 0}%` }} />
            <div className="h-full bg-amber-500" style={{ width: `${stats.total_tickets > 0 ? (stats.solving_tickets / stats.total_tickets) * 100 : 0}%` }} />
            <div className="h-full bg-green-600" style={{ width: `${stats.total_tickets > 0 ? (stats.closed_tickets / stats.total_tickets) * 100 : 0}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-on-surface-variant mt-2 font-semibold opacity-70">
            <span>Đỏ: Chờ xử lý</span>
            <span>Vàng: Đang giải quyết</span>
            <span>Xanh: Đã hoàn tất</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-end mb-6">
          <h5 className="text-lg font-serif font-semibold text-on-surface">Tin nhắn mới nhất</h5>
          <a href="/admin/cskh-tin-nhan" className="text-xs font-semibold text-primary border-b border-primary/20 hover:border-primary pb-0.5 transition-colors">Trò chuyện ngay</a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="pb-3">Khách hàng</th>
                <th className="pb-3">Tin nhắn cuối</th>
                <th className="pb-3">Trạng thái</th>
                <th className="pb-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentChats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-on-surface-variant italic">
                    Chưa có hội thoại nào được thực hiện.
                  </td>
                </tr>
              ) : (
                stats.recentChats.map((chat) => {
                  const date = new Date(chat.time)
                  const timeFormatted = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('vi-VN')
                  
                  return (
                    <tr key={chat.id} className="group border-b border-outline-variant/10 hover:bg-surface-container-low/20 transition-colors">
                      <td className="py-4 flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${chat.color}`}>
                          {chat.initials}
                        </div>
                        <span className="text-sm font-medium text-on-surface">{chat.name}</span>
                      </td>
                      <td className="py-4 text-sm text-on-surface-variant max-w-xs truncate">{chat.topic}</td>
                      <td className="py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          chat.status === 'Hoạt động' 
                            ? 'bg-[#ece0dc] text-[#5d4037]' 
                            : 'bg-surface-container text-on-surface-variant'
                        }`}>
                          {chat.status}
                        </span>
                      </td>
                      <td className="py-4 text-right text-xs text-on-surface-variant">{timeFormatted}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
