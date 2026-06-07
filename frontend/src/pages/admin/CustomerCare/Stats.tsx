import { useState } from 'react'
import { 
  MessageSquare, 
  Timer, 
  Smile, 
  TrendingUp, 
  Zap, 
  Star,
  ChevronDown,
  Lightbulb
} from 'lucide-react'

export default function AdminCustomerStats() {
  const [recentChats] = useState([
    { id: 1, name: 'An Nguyễn', initials: 'AN', topic: 'Tư vấn chọn size', status: 'Hoạt động', time: '2 giờ trước', color: 'bg-secondary-container text-on-secondary-container' },
    { id: 2, name: 'Trần Minh', initials: 'TM', topic: 'Vấn đề vận chuyển #2094', status: 'Đang xử lý', time: '4 giờ trước', color: 'bg-tertiary-fixed text-on-tertiary-fixed' },
    { id: 3, name: 'Lê Hoa', initials: 'LH', topic: 'Yêu cầu đổi màu khăn lụa', status: 'Hoạt động', time: 'Hôm qua', color: 'bg-outline-variant text-on-surface' }
  ])

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
            <h4 className="text-3xl font-serif text-primary font-bold">1,284</h4>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-on-surface-variant opacity-80">
            <TrendingUp size={14} className="text-green-600" />
            <span>+12% so với tuần trước</span>
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
              <Timer size={24} />
            </div>
            <p className="text-xs font-semibold text-on-surface-variant mb-1 uppercase tracking-wider">Tốc độ phản hồi</p>
            <h4 className="text-3xl font-serif text-primary font-bold">12 phút</h4>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-on-surface-variant opacity-80">
            <Zap size={14} className="text-amber-600" />
            <span>Duy trì trạng thái ổn định</span>
          </div>
        </div>

        {/* CSAT */}
        <div className="bg-primary-container text-white p-8 rounded-xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
          <div>
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white mb-6">
              <Smile size={24} />
            </div>
            <p className="text-xs font-semibold opacity-85 mb-1 uppercase tracking-wider">Điểm hài lòng (CSAT)</p>
            <h4 className="text-3xl font-serif font-bold text-on-primary-container">98.4%</h4>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs opacity-85">
            <Star size={14} className="fill-current text-amber-400" />
            <span>Vượt mục tiêu quý 2%</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Line Chart: Volume */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h5 className="text-lg font-serif font-semibold text-on-surface">Lưu lượng hội thoại</h5>
            <button className="flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary transition-all">
              <span>Tuần này</span>
              <ChevronDown size={14} />
            </button>
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
              <path d="M0,75 Q55,60 110,80 T220,20 T330,55 T440,15" fill="none" stroke="#5d4037" strokeWidth="2.5"></path>
              <circle cx="0" cy="75" fill="#5d4037" r="4.5"></circle>
              <circle cx="110" cy="80" fill="#5d4037" r="4.5"></circle>
              <circle cx="220" cy="20" fill="#5d4037" r="4.5"></circle>
              <circle cx="330" cy="55" fill="#5d4037" r="4.5"></circle>
              <circle cx="440" cy="15" fill="#5d4037" r="4.5"></circle>
            </svg>
          </div>
          <div className="flex justify-between mt-4 text-xs font-semibold text-on-surface-variant opacity-60 px-2">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>
        </div>

        {/* Bar Chart: Ticket Types */}
        <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm">
          <div className="mb-8">
            <h5 className="text-lg font-serif font-semibold text-on-surface">Phân loại yêu cầu</h5>
            <p className="text-xs text-on-surface-variant mt-1">Dựa trên 324 yêu cầu mới nhất</p>
          </div>
          <div className="space-y-6">
            {/* Size Advice */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface">Tư vấn kích cỡ</span>
                <span className="text-primary font-bold">65%</span>
              </div>
              <div className="w-full h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            {/* Return Requests */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface">Yêu cầu đổi trả</span>
                <span className="text-primary font-bold">25%</span>
              </div>
              <div className="w-full h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary/70 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            {/* Complaints */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-on-surface">Khiếu nại</span>
                <span className="text-primary font-bold">10%</span>
              </div>
              <div className="w-full h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                <div className="h-full bg-primary/45 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 border border-outline-variant/20 bg-surface-container-low/40 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="text-primary shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-xs font-bold text-primary mb-1">Gợi ý tối ưu</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Phần lớn khách hàng cần tư vấn kích cỡ. Cân nhắc bổ sung bảng hướng dẫn chi tiết cho BST "Lụa Hà Đông" trên website.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white p-8 rounded-xl border border-outline-variant/20 shadow-sm">
        <div className="flex justify-between items-end mb-6">
          <h5 className="text-lg font-serif font-semibold text-on-surface">Tin nhắn mới nhất</h5>
          <button className="text-xs font-semibold text-primary border-b border-primary/20 hover:border-primary pb-0.5 transition-colors">Xem tất cả</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/20 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="pb-3">Khách hàng</th>
                <th className="pb-3">Chủ đề</th>
                <th className="pb-3">Trạng thái</th>
                <th className="pb-3 text-right">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {recentChats.map((chat) => (
                <tr key={chat.id} className="group border-b border-outline-variant/10 hover:bg-surface-container-low/20 transition-colors">
                  <td className="py-4 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${chat.color}`}>
                      {chat.initials}
                    </div>
                    <span className="text-sm font-medium text-on-surface">{chat.name}</span>
                  </td>
                  <td className="py-4 text-sm text-on-surface-variant">{chat.topic}</td>
                  <td className="py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      chat.status === 'Đang xử lý' 
                        ? 'bg-primary-container/10 text-primary-container' 
                        : 'bg-surface-container text-on-surface-variant'
                    }`}>
                      {chat.status}
                    </span>
                  </td>
                  <td className="py-4 text-right text-xs text-on-surface-variant">{chat.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
