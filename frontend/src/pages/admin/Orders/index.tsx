import { useState } from 'react'
import { 
  Search, 
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Sparkles,
  Check
} from 'lucide-react'

interface OrderItem {
  id: string
  date: string
  customerName: string
  customerInitials: string
  avatarBg: string
  avatarText: string
  total: number
  paymentStatus: string
  shippingStatus: string
}

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('Tất cả')

  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: 'DH-0089',
      date: '02/06/2026',
      customerName: 'Trần Minh Thu',
      customerInitials: 'MT',
      avatarBg: 'bg-primary/10 text-primary',
      avatarText: 'text-primary',
      total: 2450000,
      paymentStatus: 'Đã thanh toán',
      shippingStatus: 'Đã giao'
    },
    {
      id: 'DH-0088',
      date: '02/06/2026',
      customerName: 'Nguyễn Văn Hoàng',
      customerInitials: 'VH',
      avatarBg: 'bg-primary/10 text-primary',
      avatarText: 'text-primary',
      total: 1890000,
      paymentStatus: 'Chờ xác nhận',
      shippingStatus: 'Đang chuẩn bị'
    },
    {
      id: 'DH-0087',
      date: '01/06/2026',
      customerName: 'Lê Anh Vũ',
      customerInitials: 'AV',
      avatarBg: 'bg-primary/10 text-primary',
      avatarText: 'text-primary',
      total: 3200000,
      paymentStatus: 'Đã thanh toán',
      shippingStatus: 'Đang vận chuyển'
    },
    {
      id: 'DH-0086',
      date: '31/05/2026',
      customerName: 'Phạm Thị Mỹ',
      customerInitials: 'TM',
      avatarBg: 'bg-primary/10 text-primary',
      avatarText: 'text-primary',
      total: 1250000,
      paymentStatus: 'Đã hủy',
      shippingStatus: 'Đã trả hàng'
    }
  ])

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)
  
  // Form fields for Edit
  const [editPaymentStatus, setEditPaymentStatus] = useState('')
  const [editShippingStatus, setEditShippingStatus] = useState('')

  // Add Manual Order Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newCustName, setNewCustName] = useState('')
  const [newTotal, setNewTotal] = useState(0)

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const tabs = ['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đã giao', 'Đã hủy']

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (activeTab === 'Tất cả') return matchesSearch
      if (activeTab === 'Chờ xác nhận') return matchesSearch && order.paymentStatus === 'Chờ xác nhận'
      if (activeTab === 'Đang xử lý') return matchesSearch && (order.shippingStatus === 'Đang chuẩn bị' || order.shippingStatus === 'Đang vận chuyển')
      if (activeTab === 'Đã giao') return matchesSearch && order.shippingStatus === 'Đã giao'
      if (activeTab === 'Đã hủy') return matchesSearch && order.paymentStatus === 'Đã hủy'
      
      return matchesSearch
    })
  }

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const handleOpenEdit = (order: OrderItem) => {
    setSelectedOrder(order)
    setEditPaymentStatus(order.paymentStatus)
    setEditShippingStatus(order.shippingStatus)
    setIsModalOpen(true)
  }

  const handleSaveOrder = () => {
    if (selectedOrder) {
      setOrders(prev => prev.map(o => {
        if (o.id === selectedOrder.id) {
          return {
            ...o,
            paymentStatus: editPaymentStatus,
            shippingStatus: editShippingStatus
          }
        }
        return o
      }))
      setIsModalOpen(false)
      setSelectedOrder(null)
    }
  }

  const handleCreateOrder = () => {
    if (!newCustName || newTotal <= 0) return
    const initials = newCustName.split(' ').map(n => n[0]).join('').toUpperCase()
    const newOrder: OrderItem = {
      id: `DH-0${89 + orders.length}`,
      date: 'Hôm nay',
      customerName: newCustName,
      customerInitials: initials || 'KH',
      avatarBg: 'bg-primary/10 text-primary',
      avatarText: 'text-primary',
      total: Number(newTotal),
      paymentStatus: 'Chờ xác nhận',
      shippingStatus: 'Đang chuẩn bị'
    }
    setOrders(prev => [newOrder, ...prev])
    setIsAddModalOpen(false)
    setNewCustName('')
    setNewTotal(0)
  }

  const handleExport = () => {
    setToastMessage('Đang tạo báo cáo đơn hàng... Báo cáo dạng Excel đã được tải xuống bộ nhớ tạm thành công!')
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  const filteredOrders = getFilteredOrders()

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="font-caption text-caption text-primary tracking-widest uppercase mb-1 text-xs">Trung tâm xử lý đơn hàng</p>
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Quản lý đơn hàng</h2>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-sm hover:bg-primary/5 transition-all font-label-md text-label-md text-xs uppercase shrink-0"
        >
          <Download size={16} />
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Status Tabs */}
        <div className="flex gap-8 border-b border-surface-container-highest overflow-x-auto whitespace-nowrap hide-scrollbar">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 font-label-md text-label-md text-xs uppercase tracking-wider relative transition-all duration-300 ${
                activeTab === tab 
                  ? 'text-primary font-semibold' 
                  : 'text-on-surface-variant/60 hover:text-primary/70'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in slide-in-from-left duration-300"></span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 w-full lg:w-80 transition-all focus-within:ring-1 focus-within:ring-primary/20">
          <Search size={18} className="text-on-surface-variant opacity-60" />
          <input 
            type="text" 
            placeholder="Tìm mã hoặc tên khách hàng..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 w-full font-label-md text-label-md placeholder:text-on-surface-variant/50 p-0 text-sm"
          />
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(93,64,55,0.06)] rounded-xl overflow-hidden border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Mã đơn hàng</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Ngày tạo</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Khách hàng</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Tổng tiền</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Thanh toán</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Vận chuyển</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredOrders.map((order, idx) => {
                const getPayColor = (st: string) => {
                  if (st === 'Đã thanh toán') return 'bg-emerald-50 text-emerald-700'
                  if (st === 'Chờ xác nhận') return 'bg-amber-50 text-amber-700'
                  return 'bg-red-50 text-red-700'
                }
                const getShipColor = (st: string) => {
                  if (st === 'Đã giao') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  if (st === 'Đang vận chuyển') return 'bg-blue-50 text-blue-700 border-blue-100'
                  if (st === 'Đang chuẩn bị') return 'bg-amber-50 text-amber-700 border-amber-100'
                  return 'bg-neutral-50 text-neutral-600 border-neutral-100'
                }

                return (
                  <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-8 py-4">
                      <span className="font-label-md text-primary font-bold text-sm">{order.id}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="font-caption text-on-surface-variant text-xs">{order.date}</span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${order.avatarBg} ${order.avatarText}`}>
                          {order.customerInitials}
                        </div>
                        <span className="font-body-md text-on-surface font-medium group-hover:text-primary transition-colors text-sm">{order.customerName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="font-body-md font-bold text-primary text-sm">{formatPrice(order.total)}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-2.5 py-1 rounded font-label-md text-[10px] uppercase font-semibold ${getPayColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-2.5 py-1 rounded border font-label-md text-[10px] uppercase font-semibold ${getShipColor(order.shippingStatus)}`}>
                        {order.shippingStatus}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <button 
                        onClick={() => handleOpenEdit(order)}
                        className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-8 py-12 text-center text-on-surface-variant/60 font-body-md">
                    Không tìm thấy đơn hàng phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info & pagination */}
        <div className="px-8 py-6 flex justify-between items-center border-t border-outline-variant/10">
          <p className="font-caption text-caption text-on-surface-variant text-xs">
            Hiển thị 1-{filteredOrders.length} của {filteredOrders.length} đơn hàng
          </p>
          <div className="flex gap-2">
            <button className="p-2 border border-outline-variant rounded hover:bg-surface-container-low transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="p-2 border border-outline-variant rounded bg-primary text-white font-label-md px-3 text-xs">1</button>
            <button className="p-2 border border-outline-variant rounded hover:bg-surface-container-low transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Zen Philosophy Info banner */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex flex-col md:flex-row gap-6 items-center justify-between shadow-[0_20px_40px_-4px_rgba(93,64,55,0.03)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0">
            <Sparkles size={22} strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-1">Chánh niệm trong dịch vụ</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">
              Đóng gói và bàn giao từng gói đồ lam hay áo tràng bằng sự nâng niu trân trọng nhất. Chăm sóc tận tâm khách hàng chính là cách chúng ta lan tỏa năng lượng bình an.
            </p>
          </div>
        </div>
      </div>

      {/* Edit Order Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Cập nhật đơn hàng</h3>
            
            {/* Simple UI Info Card */}
            <div className="bg-surface-container-low p-4 rounded-lg mb-6 flex justify-between items-center border border-outline-variant/10">
              <div>
                <p className="font-body-md text-on-surface font-semibold text-sm">Mã đơn: {selectedOrder.id}</p>
                <p className="font-caption text-on-surface-variant text-xs">Khách hàng: {selectedOrder.customerName}</p>
              </div>
              <p className="font-body-md font-bold text-primary text-sm">{formatPrice(selectedOrder.total)}</p>
            </div>

            {/* Inputs / Confirmation Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Trạng thái thanh toán</label>
                <select 
                  value={editPaymentStatus}
                  onChange={(e) => setEditPaymentStatus(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="Đã thanh toán">Đã thanh toán</option>
                  <option value="Chờ xác nhận">Chờ xác nhận</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Trạng thái vận chuyển</label>
                <select 
                  value={editShippingStatus}
                  onChange={(e) => setEditShippingStatus(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="Đã giao">Đã giao</option>
                  <option value="Đang chuẩn bị">Đang chuẩn bị</option>
                  <option value="Đang vận chuyển">Đang vận chuyển</option>
                  <option value="Đã trả hàng">Đã trả hàng</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSaveOrder}
                className="px-5 py-2 bg-primary text-white rounded font-label-md text-xs hover:bg-on-primary-fixed-variant transition-colors"
              >
                Xác nhận thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Manual Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Tạo đơn hàng thủ công</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Tên khách hàng</label>
                <input 
                  type="text" 
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="Ví dụ: Huỳnh Tâm"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Tổng tiền (VND)</label>
                <input 
                  type="number" 
                  value={newTotal || ''}
                  onChange={(e) => setNewTotal(Number(e.target.value))}
                  placeholder="Ví dụ: 1500000"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleCreateOrder}
                className="px-5 py-2 bg-primary text-white rounded font-label-md text-xs hover:bg-on-primary-fixed-variant transition-colors"
              >
                Tạo đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 border border-white/10">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Floating Action Button */}
      <button 
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-10 right-10 w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 transition-all border border-white/10 z-50"
        title="Tạo đơn hàng thủ công"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}
