import { useState, useEffect } from 'react'
import { 
  Search, 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Check,
  User,
  MapPin,
  CreditCard,
  Calendar,
  FileText
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { orderService } from '@/services'
import { getImageUrl } from '@/utils/productMapper'
import type { Order, OrderStatus, PaymentStatus } from '@/types'


export default function AdminOrders() {
  const { user } = useAuthStore()
  const role = user?.role?.toLowerCase() || 'admin'
  const isCSKH = role === 'customer_service'

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('Tất cả')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  
  // Form fields for Edit
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('pending')
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending')

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const tabs = ['Tất cả', 'Chờ xác nhận', 'Đang xử lý', 'Đã giao', 'Đã hủy']

  const getBackendStatusForTab = (tab: string): string | undefined => {
    switch (tab) {
      case 'Chờ xác nhận': return 'pending';
      case 'Đang xử lý': return 'processing';
      case 'Đã giao': return 'delivered';
      case 'Đã hủy': return 'cancelled';
      default: return undefined;
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const statusFilter = getBackendStatusForTab(activeTab)
      const data = await orderService.getAllOrders(page, statusFilter)
      setOrders(data.items)
      setTotalPages(data.total_pages)
      setTotalCount(data.total)
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách đơn hàng:', err)
      setError(err?.response?.data?.detail || err?.message || 'Không thể tải danh sách đơn hàng.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [page, activeTab])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Đang chuẩn bị';
      case 'shipped': return 'Đang vận chuyển';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      case 'refunded': return 'Đã trả hàng';
      default: return status;
    }
  }

  const getPaymentStatusLabel = (status: string, method: string) => {
    if (method === 'cod') {
      if (status === 'paid') return 'Đã thanh toán'
      return 'Thanh toán COD'
    }
    switch (status) {
      case 'pending': return 'Chờ thanh toán'
      case 'paid': return 'Đã thanh toán'
      case 'failed': return 'Thất bại'
      case 'refunded': return 'Đã hoàn tiền'
      default: return status
    }
  }

  const handleOpenEdit = (order: Order) => {
    setSelectedOrder(order)
    setEditPaymentStatus(order.payment_status)
    setEditStatus(order.status)
    setIsModalOpen(true)
  }

  const handleUpdateReturnRequestStatus = async (returnId: number, newStatus: 'approved' | 'rejected') => {
    if (!selectedOrder) return
    try {
      setLoading(true)
      await orderService.updateReturnRequestStatus(returnId, newStatus)
      
      // Fetch latest order details to update local state completely
      const updatedOrder = await orderService.getById(selectedOrder.id)
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o))
      setSelectedOrder(updatedOrder)
      setEditPaymentStatus(updatedOrder.payment_status)
      setEditStatus(updatedOrder.status)
      
      setToastMessage(newStatus === 'approved' ? 'Đã duyệt yêu cầu trả hàng / hoàn tiền!' : 'Đã từ chối yêu cầu trả hàng / hoàn tiền!')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err: any) {
      console.error('Lỗi khi duyệt/từ chối trả hàng:', err)
      alert(err?.response?.data?.detail || err?.message || 'Không thể cập nhật yêu cầu trả hàng.')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveOrder = async () => {

    if (selectedOrder) {
      try {
        setLoading(true)
        const updated = await orderService.updateStatus(selectedOrder.id, editStatus, editPaymentStatus)
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o))
        setIsModalOpen(false)
        setSelectedOrder(null)
        setToastMessage('Cập nhật trạng thái đơn hàng thành công!')
        setTimeout(() => setToastMessage(null), 3000)
      } catch (err: any) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', err)
        alert(err?.response?.data?.detail || err?.message || 'Không thể cập nhật trạng thái đơn hàng.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleQuickApprove = async () => {
    if (selectedOrder) {
      try {
        setLoading(true)
        const updated = await orderService.updateStatus(selectedOrder.id, 'processing', selectedOrder.payment_status)
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o))
        setIsModalOpen(false)
        setSelectedOrder(null)
        setToastMessage('Đã duyệt đơn hàng thành công! Trạng thái chuyển thành Đang chuẩn bị.')
        setTimeout(() => setToastMessage(null), 3000)
      } catch (err: any) {
        console.error('Lỗi khi duyệt đơn:', err)
        alert(err?.response?.data?.detail || err?.message || 'Không thể duyệt đơn hàng.')
      } finally {
        setLoading(false)
      }
    }
  }

  const handleQuickShip = async () => {
    if (selectedOrder) {
      try {
        setLoading(true)
        const updated = await orderService.updateStatus(selectedOrder.id, 'shipped', selectedOrder.payment_status)
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updated : o))
        setIsModalOpen(false)
        setSelectedOrder(null)
        setToastMessage('Xác nhận xuất kho & Giao hàng thành công! Tồn kho đã tự động cập nhật.')
        setTimeout(() => setToastMessage(null), 3000)
      } catch (err: any) {
        console.error('Lỗi khi giao hàng:', err)
        alert(err?.response?.data?.detail || err?.message || 'Không thể xác nhận xuất kho & giao hàng.')
      } finally {
        setLoading(false)
      }
    }
  }




  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (order.shipping_address?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="font-caption text-caption text-primary tracking-widest uppercase mb-1 text-xs">Trung tâm xử lý đơn hàng</p>
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Quản lý đơn hàng</h2>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Status Tabs */}
        <div className="flex gap-8 border-b border-surface-container-highest overflow-x-auto whitespace-nowrap hide-scrollbar">
          {tabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveTab(tab)
                setPage(1)
              }}
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-600">
              <p className="text-sm font-medium mb-4">{error}</p>
              <button onClick={fetchOrders} className="px-4 py-2 bg-primary text-white text-xs rounded hover:opacity-90">
                Thử lại
              </button>
            </div>
          ) : (
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
                {filteredOrders.map((order) => {
                  const getPayColor = (st: string, method: string) => {
                    if (st === 'paid') return 'bg-emerald-50 text-emerald-700'
                    if (method === 'cod') return 'bg-blue-50 text-blue-700'
                    if (st === 'pending') return 'bg-amber-50 text-amber-700'
                    return 'bg-red-50 text-red-700'
                  }
                  const getShipColor = (st: string) => {
                    if (st === 'pending') return 'bg-[#ece0dc] text-[#5d4037] border border-[#d4c3be]'
                    if (st === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    if (st === 'shipped') return 'bg-blue-50 text-blue-700 border-blue-100'
                    if (st === 'confirmed' || st === 'processing') return 'bg-amber-50 text-amber-700 border-amber-100'
                    return 'bg-neutral-50 text-neutral-600 border-neutral-100'
                  }

                  const customerName = order.shipping_address?.full_name || order.user?.full_name || 'Khách hàng'
                  const customerInitials = customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'KH'

                  return (
                    <tr key={order.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-8 py-4">
                        <span className="font-label-md text-primary font-bold text-sm">{order.order_code}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-caption text-on-surface-variant text-xs">
                          {new Date(order.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase bg-primary/10 text-primary">
                            {customerInitials}
                          </div>
                          <span className="font-body-md text-on-surface font-medium group-hover:text-primary transition-colors text-sm">{customerName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-body-md font-bold text-primary text-sm">{formatPrice(order.total)}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-2.5 py-1 rounded font-label-md text-[10px] uppercase font-semibold ${getPayColor(order.payment_status, order.payment_method)}`}>
                          {getPaymentStatusLabel(order.payment_status, order.payment_method)}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2.5 py-1 rounded border font-label-md text-[10px] uppercase font-semibold ${getShipColor(order.status)}`}>
                            {getOrderStatusLabel(order.status)}
                          </span>
                          {order.return_request && (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold border ${
                              order.return_request.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : order.return_request.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              Trả hàng: {order.return_request.status === 'pending' ? 'Chờ duyệt' : order.return_request.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                            </span>
                          )}
                        </div>
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
          )}
        </div>
        
        {/* Footer info & pagination */}
        {!loading && !error && (
          <div className="px-8 py-6 flex justify-between items-center border-t border-outline-variant/10">
            <p className="font-caption text-caption text-on-surface-variant text-xs">
              Hiển thị {orders.length > 0 ? (page - 1) * 20 + 1 : 0}-{Math.min(page * 20, totalCount)} của {totalCount} đơn hàng
            </p>
            <div className="flex gap-2">
              <button 
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-2 border border-outline-variant rounded hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="p-2 font-label-md px-3 text-xs text-on-surface">Trang {page} / {totalPages || 1}</span>
              <button 
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-2 border border-outline-variant rounded hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
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
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl w-full shadow-2xl p-6 md:p-8 relative animate-in slide-in-from-bottom-8 duration-500 max-h-[92vh] overflow-y-auto max-w-4xl font-sans text-left">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            
            <div className="border-b border-outline-variant/20 pb-4 mb-6">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-headline-sm text-2xl font-bold text-primary">Chi tiết đơn hàng</h3>
                <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-primary/5 text-primary rounded border border-primary/10">
                  {selectedOrder.order_code}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant/70 mt-1 flex items-center gap-1.5">
                <Calendar size={13} /> Ngày tạo: {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
              {/* Left Column: Customer & Delivery Info */}
              <div className="md:col-span-5 space-y-6">
                {/* Customer Info Card */}
                <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10 space-y-4 shadow-[0_10px_30px_rgba(93,64,55,0.02)]">
                  <h4 className="font-semibold text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                    <User size={14} /> Thông tin khách hàng
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-primary/10 text-primary">
                      {(selectedOrder.shipping_address?.full_name || selectedOrder.user?.full_name || 'KH')
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-primary text-sm">
                        {selectedOrder.shipping_address?.full_name || selectedOrder.user?.full_name}
                      </p>
                      <p className="text-xs text-on-surface-variant/65">
                        Email: {selectedOrder.user?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Delivery Info Card */}
                <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10 space-y-3 shadow-[0_10px_30px_rgba(93,64,55,0.02)]">
                  <h4 className="font-semibold text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                    <MapPin size={14} /> Địa chỉ giao hàng
                  </h4>
                  <div className="space-y-2 text-xs text-on-surface/90">
                    <p><span className="font-medium text-on-surface-variant">Số điện thoại:</span> {selectedOrder.shipping_address?.phone || 'N/A'}</p>
                    <p>
                      <span className="font-medium text-on-surface-variant">Địa chỉ:</span>{' '}
                      {selectedOrder.shipping_address?.address}, {selectedOrder.shipping_address?.ward},{' '}
                      {selectedOrder.shipping_address?.district}, {selectedOrder.shipping_address?.province}
                    </p>
                  </div>
                </div>

                {/* Charity Messages & Notes */}
                {(selectedOrder.shipping_address?.charity_message || selectedOrder.notes) && (
                  <div className="space-y-3">
                    {selectedOrder.shipping_address?.charity_message && (
                      <div className="italic text-xs text-primary bg-primary/5 p-4 rounded-xl border border-primary/10 shadow-[0_10px_30px_rgba(93,64,55,0.02)]">
                        <span className="font-medium block not-italic text-[10px] uppercase tracking-wider text-primary/70 mb-1">
                          Thông điệp gieo duyên
                        </span>
                        "{selectedOrder.shipping_address.charity_message}"
                        {selectedOrder.shipping_address.is_charity_anonymous && (
                          <span className="block text-[9px] text-on-surface-variant/65 mt-1.5 font-semibold">
                            (Yêu cầu gửi ẩn danh)
                          </span>
                        )}
                      </div>
                    )}

                    {selectedOrder.notes && (
                      <div className="text-xs text-amber-800 bg-amber-50/50 p-4 rounded-xl border border-amber-200/40 shadow-[0_10px_30px_rgba(93,64,55,0.02)]">
                        <span className="font-medium block text-[10px] uppercase tracking-wider text-amber-700/80 mb-1">
                          Ghi chú từ khách hàng
                        </span>
                        "{selectedOrder.notes}"
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Order Items & Pricing Breakdown */}
              <div className="md:col-span-7 space-y-6">
                {/* Product List */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                    <FileText size={14} /> Danh sách sản phẩm
                  </h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {selectedOrder.items?.map((item: any) => {
                      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
                      const imgPath = item.product_snapshot?.image || item.product?.images?.[0]?.url
                      const imgUrl = imgPath 
                        ? (imgPath.startsWith('http') ? imgPath : `${BASE_URL}${imgPath}`)
                        : 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80'

                      const name = item.product_snapshot?.name || item.product?.name || 'Sản phẩm Từ Tâm Phục'
                      const color = item.product_snapshot?.color || item.variant?.value
                      const size = item.product_snapshot?.size || (item.variant?.name === 'Size' ? item.variant?.value : '')

                      return (
                        <div key={item.id} className="flex items-center justify-between gap-4 p-3 bg-surface-container-low rounded-xl border border-outline-variant/10 group/item hover:border-primary/25 transition-all">
                          <div className="flex items-center gap-3">
                            <img 
                              src={imgUrl} 
                              alt={name} 
                              className="w-10 h-14 object-cover rounded border border-outline-variant/20 bg-white" 
                            />
                            <div>
                              <p className="font-semibold text-primary text-xs leading-snug">{name}</p>
                              <p className="text-[10px] text-on-surface-variant/60 mt-1">
                                {color && `Màu: ${color}`} {size && ` | Size: ${size}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary text-xs">{formatPrice(item.price)}</p>
                            <p className="text-[10px] text-on-surface-variant/60">x{item.quantity}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10 space-y-2 text-xs shadow-[0_10px_30px_rgba(93,64,55,0.02)]">
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Tạm tính</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Mã giảm giá</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-on-surface-variant">
                    <span>Phí vận chuyển</span>
                    <span>{formatPrice(selectedOrder.shipping_fee)}</span>
                  </div>
                  <div className="flex justify-between text-primary font-bold text-sm border-t border-outline-variant/25 pt-2 mt-2">
                    <span>Tổng thanh toán</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>

                {/* Status Update section */}
                <div className="bg-surface-container-low p-5 rounded-xl border border-outline-variant/10 space-y-4 shadow-[0_10px_30px_rgba(93,64,55,0.02)]">
                  <h4 className="font-semibold text-primary uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-outline-variant/20 pb-2">
                    <CreditCard size={14} /> Cập nhật trạng thái xử lý
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">
                        Thanh toán
                      </label>
                      {isCSKH ? (
                        <span className="inline-block px-3 py-2 bg-surface-container-high border border-outline-variant/10 rounded text-xs text-primary font-semibold w-full">
                          {getPaymentStatusLabel(selectedOrder.payment_status, selectedOrder.payment_method)}
                        </span>
                      ) : (
                        <select 
                          value={editPaymentStatus}
                          onChange={(e) => setEditPaymentStatus(e.target.value as PaymentStatus)}
                          className="w-full bg-white border border-outline-variant/30 rounded px-3 py-2 text-xs text-primary focus:ring-1 focus:ring-primary/20 cursor-pointer outline-none transition-all"
                        >
                          <option value="pending">
                            {selectedOrder.payment_method === 'cod' ? 'Thanh toán COD' : 'Chờ thanh toán'}
                          </option>
                          <option value="paid">Đã thanh toán</option>
                          <option value="failed">Thất bại</option>
                          <option value="refunded">Đã hoàn tiền</option>
                        </select>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">
                        Vận chuyển
                      </label>
                      {isCSKH ? (
                        <span className="inline-block px-3 py-2 bg-surface-container-high border border-outline-variant/10 rounded text-xs text-primary font-semibold w-full">
                          {getOrderStatusLabel(selectedOrder.status)}
                        </span>
                      ) : (
                        <select 
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value as OrderStatus)}
                          className="w-full bg-white border border-outline-variant/30 rounded px-3 py-2 text-xs text-primary focus:ring-1 focus:ring-primary/20 cursor-pointer outline-none transition-all"
                        >
                          <option value="pending">Chờ xác nhận</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="processing">Đang chuẩn bị</option>
                          <option value="shipped">Đang vận chuyển</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Đã hủy</option>
                          <option value="refunded">Đã trả hàng</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* Return Request Details (if exists) */}
                {selectedOrder.return_request && (
                  <div className="p-5 border border-[#d4c3be]/40 rounded-xl bg-surface-container-low text-xs space-y-3 shadow-[0_10px_30px_rgba(93,64,55,0.02)]">
                    <h4 className="font-serif text-sm font-bold text-primary border-b border-outline-variant/20 pb-1 flex items-center justify-between">
                      <span>Yêu cầu Trả hàng / Hoàn tiền</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold border ${
                        selectedOrder.return_request.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : selectedOrder.return_request.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {selectedOrder.return_request.status === 'pending' ? 'Chờ duyệt' : selectedOrder.return_request.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                      </span>
                    </h4>
                    
                    <p><span className="font-semibold text-primary">Lý do:</span> {selectedOrder.return_request.reason}</p>
                    {selectedOrder.return_request.description && (
                      <p><span className="font-semibold text-primary">Chi tiết:</span> {selectedOrder.return_request.description}</p>
                    )}
                    <p><span className="font-semibold text-primary">Hình thức trả hàng:</span> {selectedOrder.return_request.shipping_method === 'pickup' ? 'Shipper lấy tận nơi' : 'Tự mang ra bưu cục'}</p>
                    
                    <div className="bg-white p-3 rounded border border-outline-variant/10 text-[11px] leading-relaxed">
                      <p className="font-semibold mb-1 text-primary">Thông tin tài khoản hoàn tiền:</p>
                      <p><span className="font-medium text-on-surface-variant">Ngân hàng:</span> {selectedOrder.return_request.bank_name}</p>
                      <p><span className="font-medium text-on-surface-variant">Số tài khoản:</span> {selectedOrder.return_request.account_number}</p>
                      <p><span className="font-medium text-on-surface-variant">Chủ tài khoản:</span> {selectedOrder.return_request.account_holder}</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-1 text-primary">Ảnh minh chứng:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedOrder.return_request.images?.map((url, i) => (
                          <a href={getImageUrl(url)} key={i} target="_blank" rel="noopener noreferrer" className="block relative group">
                            <img src={getImageUrl(url)} className="w-16 h-16 object-cover rounded border border-outline-variant/20 hover:opacity-90 transition-opacity" alt="Proof" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {selectedOrder.return_request.status === 'pending' && !isCSKH && (
                      <div className="flex gap-3 pt-2.5 border-t border-outline-variant/20">
                        <button
                          type="button"
                          onClick={() => handleUpdateReturnRequestStatus(selectedOrder.return_request!.id, 'rejected')}
                          className="w-1/2 py-2 bg-red-50 border border-red-200 hover:bg-red-100/60 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                        >
                          Từ chối
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateReturnRequestStatus(selectedOrder.return_request!.id, 'approved')}
                          className="w-1/2 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/60 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                        >
                          Duyệt trả
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 border-t border-outline-variant/15 pt-5">
              {isCSKH ? (
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 bg-primary text-white rounded font-label-md text-xs hover:bg-opacity-90 transition-colors"
                >
                  Đóng
                </button>
              ) : (
                <>
                  {selectedOrder.status === 'pending' && (
                    <button
                      onClick={handleQuickApprove}
                      className="px-6 py-2.5 bg-[#5d4037] text-white rounded font-label-md text-xs hover:bg-[#442a22] transition-all cursor-pointer mr-auto"
                    >
                      Duyệt đơn
                    </button>
                  )}
                  {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'processing') && (
                    <button
                      onClick={handleQuickShip}
                      className="px-6 py-2.5 bg-blue-600 text-white rounded font-label-md text-xs hover:bg-blue-700 transition-all cursor-pointer mr-auto"
                    >
                      Xác nhận xuất kho & Giao hàng
                    </button>
                  )}
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={handleSaveOrder}
                    className="px-6 py-2.5 bg-primary text-white rounded font-label-md text-xs hover:bg-on-primary-fixed-variant transition-colors"
                  >
                    Xác nhận thay đổi
                  </button>
                </>
              )}
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
    </div>
  )
}
