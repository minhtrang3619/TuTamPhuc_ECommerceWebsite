import { useState, useEffect } from 'react'
import { 
  Search, 
  User,
  Clock,
  X,
  Plus
} from 'lucide-react'
import { supportService } from '@/services/supportService'
import type { SupportTicket } from '@/types'

export default function AdminCustomerSupport() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'solving' | 'closed'>('all')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const fetchTickets = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await supportService.getAllTickets()
      setTickets(data)
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách yêu cầu hỗ trợ:", err)
      setError(err?.response?.data?.detail || "Không thể tải danh sách yêu cầu hỗ trợ từ máy chủ.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleUpdateTicketStatus = async (id: number, newStatus: string) => {
    setIsUpdatingStatus(true)
    try {
      const updated = await supportService.updateTicket(id, { status: newStatus })
      setTickets(prev => prev.map(t => t.id === id ? updated : t))
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(updated)
      }
    } catch (err: any) {
      console.error("Lỗi khi cập nhật trạng thái ticket:", err)
      alert(err?.response?.data?.detail || "Không thể cập nhật trạng thái.")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleUpdateTicketPriority = async (id: number, newPriority: string) => {
    setIsUpdatingStatus(true)
    try {
      const updated = await supportService.updateTicket(id, { priority: newPriority })
      setTickets(prev => prev.map(t => t.id === id ? updated : t))
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket(updated)
      }
    } catch (err: any) {
      console.error("Lỗi khi cập nhật độ ưu tiên ticket:", err)
      alert(err?.response?.data?.detail || "Không thể cập nhật độ ưu tiên.")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const filteredTickets = tickets.filter(t => {
    const customerName = t.user?.full_name || 'Khách hàng ẩn danh'
    const matchSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        t.ticket_code.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button 
            onClick={() => setStatusFilter('closed')}
            className={`px-5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              statusFilter === 'closed' 
                ? 'bg-white shadow-sm text-primary' 
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            Đã đóng
          </button>
        </div>
      </div>

      {error && (
        <div className="text-center py-6 text-red-700 bg-red-50 border border-red-200 rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm text-on-surface-variant">Đang tải danh sách yêu cầu hỗ trợ...</p>
        </div>
      ) : (
        /* Grid of tickets */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTickets.map((t) => (
            <div 
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className="bg-white p-6 rounded-xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group hover:border-primary/45"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-semibold text-primary/75">#{t.ticket_code}</span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                    t.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                    t.status === 'solving' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {t.status === 'pending' ? 'Chờ xử lý' :
                     t.status === 'solving' ? 'Đang xử lý' : 'Đã đóng'}
                  </span>
                </div>
                <h3 className="font-semibold text-base text-on-surface mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">{t.subject}</h3>
                <p className="text-xs text-on-surface-variant mb-4 flex items-center gap-1.5">
                  <User size={12} className="opacity-70" />
                  <span>Khách hàng: {t.user?.full_name || 'Ẩn danh'}</span>
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 mt-auto">
                <span className="text-[10px] text-on-surface-variant opacity-60 font-semibold">
                  {new Date(t.created_at).toLocaleDateString('vi-VN')}
                </span>
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

          {filteredTickets.length === 0 && (
            <div className="col-span-full py-16 text-center text-on-surface-variant/60 bg-white border border-outline-variant/20 rounded-xl">
              Không tìm thấy yêu cầu hỗ trợ nào.
            </div>
          )}
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
            >
              <X size={20} />
            </button>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-primary">#{selectedTicket.ticket_code}</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">{selectedTicket.category}</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-on-surface leading-snug">{selectedTicket.subject}</h3>
            </div>

            <div className="border-y border-outline-variant/10 py-3 text-xs space-y-2 text-on-surface-variant">
              <p className="flex items-center gap-2">
                <User size={14} className="opacity-70" />
                <span className="font-medium text-on-surface">Khách hàng:</span>
                <span>{selectedTicket.user?.full_name || "Ẩn danh"}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={14} className="opacity-70" />
                <span className="font-medium text-on-surface">Ngày gửi:</span>
                <span>{new Date(selectedTicket.created_at).toLocaleString('vi-VN')}</span>
              </p>
            </div>

            <div className="space-y-1 bg-surface-container-low p-3.5 rounded-lg border border-outline-variant/10">
              <p className="text-xs font-semibold text-primary/80">Nội dung chi tiết:</p>
              <p className="text-xs text-on-surface leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">{selectedTicket.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Trạng thái xử lý
                </label>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                  disabled={isUpdatingStatus}
                  className="w-full text-xs font-semibold p-2 border border-outline-variant/30 rounded-lg outline-none bg-white focus:border-primary disabled:opacity-50"
                >
                  <option value="pending">Chờ xử lý</option>
                  <option value="solving">Đang xử lý</option>
                  <option value="closed">Đã đóng</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-on-surface-variant mb-1.5">
                  Độ ưu tiên
                </label>
                <select
                  value={selectedTicket.priority}
                  onChange={(e) => handleUpdateTicketPriority(selectedTicket.id, e.target.value)}
                  disabled={isUpdatingStatus}
                  className="w-full text-xs font-semibold p-2 border border-outline-variant/30 rounded-lg outline-none bg-white focus:border-primary disabled:opacity-50"
                >
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Khẩn cấp</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
