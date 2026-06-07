import { useState } from 'react'
import { 
  Search, 
  User,
  Plus
} from 'lucide-react'

interface Ticket {
  id: string
  customer: string
  subject: string
  category: string
  status: 'pending' | 'solving' | 'closed'
  priority: 'low' | 'medium' | 'high'
  date: string
}

export default function AdminCustomerSupport() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'solving' | 'closed'>('all')

  const [tickets] = useState<Ticket[]>([
    { id: '#TKT-1082', customer: 'Nguyễn Văn Nam', subject: 'Lỗi thanh toán QR code không nhận diện', category: 'Thanh toán', status: 'pending', priority: 'high', date: '10 phút trước' },
    { id: '#TKT-1081', customer: 'Lê Thị Mai', subject: 'Yêu cầu thay đổi địa chỉ giao hàng', category: 'Giao hàng', status: 'solving', priority: 'medium', date: '1 giờ trước' },
    { id: '#TKT-1079', customer: 'Phạm Minh Đức', subject: 'Tư vấn chất liệu linen cho da nhạy cảm', category: 'Tư vấn', status: 'closed', priority: 'low', date: 'Hôm qua' },
  ])

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = statusFilter === 'all' || t.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-primary font-semibold">Yêu cầu hỗ trợ</h2>
          <p className="text-on-surface-variant text-sm mt-1">Quản lý và giải quyết các khiếu nại, yêu cầu từ khách hàng.</p>
        </div>
        <button 
          onClick={() => alert('Chức năng tạo yêu cầu thủ công đang được phát triển.')}
          className="flex items-center justify-center gap-2 border border-primary text-primary px-5 py-2.5 hover:bg-primary/5 transition-all rounded-sm text-xs font-semibold uppercase tracking-wider"
        >
          <Plus size={14} />
          <span>Tạo yêu cầu</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-xl border border-outline-variant/10 shadow-sm">
        <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 w-full md:w-80">
          <Search size={16} className="text-on-surface-variant mr-2 opacity-70" />
          <input 
            type="text" 
            placeholder="Tìm kiếm yêu cầu..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-outline p-0 w-full outline-none"
          />
        </div>

        <div className="flex bg-surface-container-low p-1 rounded-lg">
          <button 
            onClick={() => setStatusFilter('all')}
            className={`px-5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              statusFilter === 'all' 
                ? 'bg-white shadow-sm text-primary' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Tất cả
          </button>
          <button 
            onClick={() => setStatusFilter('pending')}
            className={`px-5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              statusFilter === 'pending' 
                ? 'bg-white shadow-sm text-primary' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Chờ xử lý
          </button>
          <button 
            onClick={() => setStatusFilter('solving')}
            className={`px-5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              statusFilter === 'solving' 
                ? 'bg-white shadow-sm text-primary' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Đang xử lý
          </button>
        </div>
      </div>

      {/* Grid of tickets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTickets.map((t) => (
          <div 
            key={t.id}
            className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-semibold text-primary/75">{t.id}</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                  t.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                  t.status === 'solving' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {t.status === 'pending' ? 'Chờ xử lý' :
                   t.status === 'solving' ? 'Đang xử lý' : 'Đã đóng'}
                </span>
              </div>
              <h3 className="font-semibold text-base text-on-surface mb-2 leading-snug">{t.subject}</h3>
              <p className="text-xs text-on-surface-variant mb-6 flex items-center gap-1.5">
                <User size={12} className="opacity-70" />
                <span>Khách hàng: {t.customer}</span>
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 mt-auto">
              <span className="text-[10px] text-on-surface-variant opacity-60 font-semibold">{t.date}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded uppercase tracking-wider font-bold ${
                t.priority === 'high' ? 'bg-red-50 text-red-700' :
                t.priority === 'medium' ? 'bg-amber-50 text-amber-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {t.priority === 'high' ? 'Khẩn cấp' :
                 t.priority === 'medium' ? 'Trung bình' : 'Thấp'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
