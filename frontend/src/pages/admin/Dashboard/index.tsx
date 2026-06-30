import { useState, useEffect, useMemo } from 'react'
import {
  DollarSign,
  ShoppingBag,
  UserPlus,
  CheckCircle2,
  TrendingUp,
  Leaf,
  ChevronDown,
  Layers,
  AlertTriangle,
  Eye,
  X,
  Calendar,
  User as UserIcon,
  MapPin,
  FileText,
  CreditCard,
  Check
} from 'lucide-react'
import { useAuthStore } from '@/store'
import { orderService } from '@/services'
import { getImageUrl } from '@/utils/productMapper'
import { default as apiClient } from '@/services/apiClient'
import type { OrderStatus, PaymentStatus } from '@/types'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [animate, setAnimate] = useState(false)
  const [timeRange, setTimeRange] = useState('6 tháng qua')
  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'sales' | 'forecasting'>('inventory')
  const [bestSellersPeriod, setBestSellersPeriod] = useState<'7days' | '3months'>('7days')

  // API State
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [customersCount, setCustomersCount] = useState(0)
  const [forecastData, setForecastData] = useState<any>(null)
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Details Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null)
  const [editPaymentStatus, setEditPaymentStatus] = useState<PaymentStatus>('pending')
  const [editStatus, setEditStatus] = useState<OrderStatus>('pending')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const displayName = user?.full_name || 'Nhân viên'
  const role = user?.role?.toLowerCase() || 'admin'

  useEffect(() => {
    // Meditative entry transition
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (role === 'admin' || role === 'shop_staff') {
          try {
            const ordersRes = await apiClient.get('/orders?page_size=1000')
            setOrders(ordersRes.data?.items || [])

            const productsRes = await apiClient.get('/products?page_size=1000')
            setProducts(productsRes.data?.items || [])
          } catch (err) {
            console.warn('Could not fetch orders/products:', err)
          }
        }

        if (role === 'admin') {
          try {
            const customersRes = await apiClient.get('/customers?page_size=1000')
            setCustomersCount(customersRes.data?.length || 0)
          } catch (err) {
            console.warn('Could not fetch customers:', err)
          }
        }

        if (role === 'shop_staff') {
          try {
            const forecastRes = await apiClient.get('/analytics/forecast')
            setForecastData(forecastRes.data)
          } catch (err) {
            console.warn('Could not fetch forecast data:', err)
          }
        }

        if (role === 'staff') {
          try {
            const blogRes = await apiClient.get('/blog/manage?page_size=1000')
            setBlogPosts(blogRes.data?.items || [])
          } catch (err) {
            console.warn('Could not fetch blog posts:', err)
          }
        }
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err)
        setError(err?.response?.data?.detail || err?.message || 'Không thể tải dữ liệu thống kê.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [role])

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  // ----------------------------------------------------
  // ADMIN CALCULATIONS
  // ----------------------------------------------------
  const totalRevenueAdmin = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.total || 0), 0)
  }, [orders])

  const chartBarsAdmin = useMemo(() => {
    const months = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']
    const last6Months: Array<{ monthIndex: number; label: string; year: number; revenue: number }> = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      last6Months.push({
        monthIndex: d.getMonth(),
        label: months[d.getMonth()],
        year: d.getFullYear(),
        revenue: 0
      })
    }

    orders.forEach(order => {
      const orderDate = new Date(order.created_at)
      const mIdx = orderDate.getMonth()
      const y = orderDate.getFullYear()
      const match = last6Months.find(item => item.monthIndex === mIdx && item.year === y)
      if (match) {
        match.revenue += order.total
      }
    })

    const maxRevenue = Math.max(...last6Months.map(m => m.revenue), 1)
    return last6Months.map(m => ({
      label: m.label,
      height: `${(m.revenue / maxRevenue) * 85}%`,
      value: formatPrice(m.revenue)
    }))
  }, [orders])

  const statsAdmin = [
    {
      title: 'Tổng doanh thu',
      value: formatPrice(totalRevenueAdmin),
      change: '+12%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Tổng đơn hàng',
      value: orders.length.toString(),
      change: '+5.2%',
      isPositive: true,
      icon: ShoppingBag,
    },
    {
      title: 'Người dùng mới',
      value: customersCount.toString(),
      change: 'Mới',
      isPositive: true,
      icon: UserPlus,
    },
    {
      title: 'Sản phẩm đang bán',
      value: products.filter(p => p.status === 'active').length.toString(),
      change: 'Đang chạy',
      isPositive: true,
      icon: CheckCircle2,
    }
  ]

  const recentOrdersAdmin = useMemo(() => {
    return orders.slice(0, 5)
  }, [orders])

  // ----------------------------------------------------
  // SHOP STAFF CALCULATIONS (Inventory Tab)
  // ----------------------------------------------------
  const statsInventoryStaff = [
    {
      title: 'Tổng số lượng SKU',
      value: products.length.toString(),
      change: 'Thêm tuần này',
      isPositive: true,
      icon: Layers,
    },
    {
      title: 'Độ chính xác kho',
      value: '98.4%',
      change: 'Kiểm kê 2 ngày trước',
      isPositive: true,
      icon: CheckCircle2,
    },
    {
      title: 'Cảnh báo tồn kho thấp',
      value: products.filter(p => p.stock <= 5).length.toString(),
      change: 'Cần xử lý gấp',
      isPositive: false,
      icon: AlertTriangle,
    },
    {
      title: 'Vòng quay tồn kho',
      value: '3.2x',
      change: 'Chu kỳ tháng',
      isPositive: true,
      icon: TrendingUp,
    }
  ]

  const lowStockAlerts = useMemo(() => {
    return products
      .filter(p => p.stock <= 5)
      .slice(0, 3)
      .map(p => ({
        name: p.name,
        sku: p.sku || `SKU-${p.id}`,
        size: 'M',
        stock: p.stock,
        image: p.images?.[0]?.url
          ? getImageUrl(p.images[0].url)
          : 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80'
      }))
  }, [products])

  const topSellersInventoryChart = useMemo(() => {
    const now = new Date()
    const cutoffDate = new Date()
    if (bestSellersPeriod === '7days') {
      cutoffDate.setDate(now.getDate() - 7)
    } else {
      cutoffDate.setMonth(now.getMonth() - 3)
    }
    cutoffDate.setHours(0, 0, 0, 0)

    const productSales: { [key: number]: { name: string; count: number; image: string } } = {}
    orders.forEach(order => {
      const orderDate = new Date(order.created_at)
      if (orderDate >= cutoffDate) {
        order.items?.forEach((item: any) => {
          const pId = item.product_id
          const pName = item.product_snapshot?.name || item.product?.name || `Sản phẩm #${pId}`
          const pImg = item.product_snapshot?.image || item.product?.images?.[0]?.url || ''
          if (!productSales[pId]) {
            productSales[pId] = { name: pName, count: 0, image: pImg }
          }
          productSales[pId].count += item.quantity
        })
      }
    })
    const sorted = Object.values(productSales).sort((a, b) => b.count - a.count)
    const top4 = sorted.slice(0, 4)
    return top4.map(p => ({
      name: p.name,
      count: p.count,
      image: p.image
        ? getImageUrl(p.image)
        : 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80'
    }))
  }, [orders, bestSellersPeriod])

  const slowInventory = useMemo(() => {
    const candidates = products.filter(p => p.stock > 10)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const soldRecently = new Set<number>()
    orders.forEach(order => {
      const orderDate = new Date(order.created_at)
      if (orderDate >= thirtyDaysAgo) {
        order.items?.forEach((item: any) => {
          soldRecently.add(item.product_id)
        })
      }
    })

    const slow = candidates.filter(p => !soldRecently.has(p.id))
    return slow.slice(0, 3).map(p => ({
      name: p.name,
      stock: p.stock,
      days: 60 + (p.id % 5) * 6,
      image: p.images?.[0]?.url
        ? getImageUrl(p.images[0].url)
        : 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80'
    }))
  }, [products, orders])

  // ----------------------------------------------------
  // SHOP STAFF CALCULATIONS (Sales & Orders Tab)
  // ----------------------------------------------------
  const totalRevenueSales = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.total || 0), 0)
  }, [orders])

  const pendingOrdersSales = useMemo(() => {
    return orders.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length
  }, [orders])

  const completionRateSales = useMemo(() => {
    const nonCancelled = orders.filter(o => o.status !== 'cancelled').length
    if (nonCancelled === 0) return 0
    const delivered = orders.filter(o => o.status === 'delivered').length
    return (delivered / nonCancelled) * 100
  }, [orders])

  const statsSalesStaff = [
    {
      title: 'Tổng đơn hàng',
      value: orders.length.toString(),
      change: '+12% vs tuần trước',
      isPositive: true,
      icon: ShoppingBag,
    },
    {
      title: 'Doanh thu cửa hàng',
      value: formatPrice(totalRevenueSales),
      change: '+8.4%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Đơn hàng đang xử lý',
      value: pendingOrdersSales.toString(),
      change: 'Đang xử lý',
      isPositive: true,
      icon: AlertTriangle,
    },
    {
      title: 'Tỷ lệ hoàn tất',
      value: `${completionRateSales.toFixed(1)}%`,
      change: '98.2%',
      isPositive: true,
      icon: CheckCircle2,
    }
  ]

  const weeklyOrderTrend = useMemo(() => {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1)
    const startOfWeek = new Date(now.setDate(diff))
    startOfWeek.setHours(0, 0, 0, 0)

    const dailyCounts = [0, 0, 0, 0, 0, 0, 0] // Mon to Sun

    orders.forEach(order => {
      const orderDate = new Date(order.created_at)
      if (orderDate >= startOfWeek) {
        const dIndex = orderDate.getDay()
        const mappedIndex = dIndex === 0 ? 6 : dIndex - 1
        dailyCounts[mappedIndex]++
      }
    })

    const maxCount = Math.max(...dailyCounts, 1)
    const labels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
    return dailyCounts.map((count, idx) => ({
      label: labels[idx],
      height: `${(count / maxCount) * 80}%`,
      count: `${count} đơn`
    }))
  }, [orders])

  const topProductsSales = useMemo(() => {
    const productSales: { [key: number]: { name: string; count: number; image: string } } = {}
    orders.forEach(order => {
      order.items?.forEach((item: any) => {
        const pId = item.product_id
        const pName = item.product_snapshot?.name || item.product?.name || `Sản phẩm #${pId}`
        const pImg = item.product_snapshot?.image || item.product?.images?.[0]?.url || ''
        if (!productSales[pId]) {
          productSales[pId] = { name: pName, count: 0, image: pImg }
        }
        productSales[pId].count += item.quantity
      })
    })
    const sorted = Object.values(productSales).sort((a, b) => b.count - a.count)
    return sorted.slice(0, 3).map(p => ({
      name: p.name,
      count: `${p.count} đơn hàng`,
      image: p.image
        ? getImageUrl(p.image)
        : 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80'
    }))
  }, [orders])

  const recentOrdersSales = useMemo(() => {
    return orders.slice(0, 5)
  }, [orders])

  // ----------------------------------------------------
  // ACTION HANDLERS
  // ----------------------------------------------------
  const handleOpenEdit = (order: any) => {
    setSelectedOrder(order)
    setEditPaymentStatus(order.payment_status)
    setEditStatus(order.status)
    setIsModalOpen(true)
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


  const handleUpdateReturnRequestStatus = async (returnId: number, newStatus: 'approved' | 'rejected') => {
    if (!selectedOrder) return
    try {
      setLoading(true)
      await orderService.updateReturnRequestStatus(returnId, newStatus)
      const updatedOrder = await orderService.getById(selectedOrder.id)
      setOrders(prev => prev.map(o => o.id === selectedOrder.id ? updatedOrder : o))
      setSelectedOrder(updatedOrder)
      setEditPaymentStatus(updatedOrder.payment_status)
      setEditStatus(updatedOrder.status)
      setToastMessage(newStatus === 'approved' ? 'Đã duyệt yêu cầu trả hàng!' : 'Đã từ chối yêu cầu trả hàng!')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err: any) {
      console.error('Lỗi khi xử lý yêu cầu trả hàng:', err)
      alert(err?.response?.data?.detail || err?.message || 'Không thể cập nhật yêu cầu trả hàng.')
    } finally {
      setLoading(false)
    }
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

  // ----------------------------------------------------
  // STAFF (MARKETING) CALCULATIONS
  // ----------------------------------------------------
  const totalBlogViews = useMemo(() => {
    return blogPosts.reduce((sum, p) => sum + (p.view_count || 0), 0)
  }, [blogPosts])

  const publishedBlogCount = useMemo(() => {
    return blogPosts.filter(p => p.status === 'published').length
  }, [blogPosts])

  const topViewedPosts = useMemo(() => {
    return [...blogPosts].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5)
  }, [blogPosts])

  // Removed unused getPaymentStatusLabel

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Đang tải dữ liệu thống kê...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-red-600 min-h-[60vh]">
        <p className="text-sm font-medium mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-primary text-white text-xs rounded hover:opacity-90">
          Thử lại
        </button>
      </div>
    )
  }

  // ----------------------------------------------------
  // MARKETING STAFF DASHBOARD RENDER
  // ----------------------------------------------------
  if (role === 'staff') {
    return (
      <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-4 md:p-6 font-sans">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-primary mb-1">
              Thống kê chi tiết Blog & Tin Tức
            </h2>
            <p className="text-xs text-on-surface-variant font-medium">
              Chào buổi sáng, hãy xem hiệu suất các bài viết của bạn.
            </p>
          </div>
        </div>

        {/* Bento Grid - Primary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-sm p-6 border-t-4 border-[#d4a373] border-x border-b border-outline-variant/30 flex flex-col justify-between flex-1 shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#827470]">Tổng lượt xem</span>
              <h4 className="font-serif text-3xl font-bold text-primary mt-2">{totalBlogViews.toLocaleString()}</h4>
            </div>
            <div className="flex items-center gap-1 text-[#596244] mt-2 font-bold text-[10px]">
              <Eye size={14} />
              <span>Toàn bộ bài viết</span>
            </div>
          </div>

          <div className="bg-white rounded-sm p-6 border-t-4 border-[#dee7c0] border-x border-b border-outline-variant/30 flex flex-col justify-between flex-1 shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#827470]">Tổng bài viết</span>
              <h4 className="font-serif text-3xl font-bold text-primary mt-2">{blogPosts.length}</h4>
            </div>
            <div className="flex items-center gap-1 text-[#596244] mt-2 font-bold text-[10px]">
              <FileText size={14} />
              <span>Trên hệ thống</span>
            </div>
          </div>

          <div className="bg-white rounded-sm p-6 border-t-4 border-[#e1f3d8] border-x border-b border-outline-variant/30 flex flex-col justify-between flex-1 shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#827470]">Đã xuất bản</span>
              <h4 className="font-serif text-3xl font-bold text-primary mt-2">{publishedBlogCount}</h4>
            </div>
            <div className="flex items-center gap-1 text-[#67c23a] mt-2 font-bold text-[10px]">
              <CheckCircle2 size={14} />
              <span>Sẵn sàng hiển thị</span>
            </div>
          </div>
        </div>

        {/* Top Posts Table */}
        <div className="bg-white rounded-sm border border-outline-variant/30 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-[#fafaf9]">
            <div>
              <h3 className="font-serif text-lg font-bold text-primary">Top bài viết có lượt xem cao nhất</h3>
              <p className="text-[10px] text-[#827470] font-semibold uppercase tracking-wider mt-0.5">Đo lường mức độ quan tâm của độc giả</p>
            </div>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[#f4f2f0]/60 border-b border-outline-variant/30 text-[10px] uppercase font-bold text-[#827470] tracking-wider">
                  <th className="px-6 py-4">Tiêu đề bài viết</th>
                  <th className="px-6 py-4">Tác giả</th>
                  <th className="px-6 py-4">Lượt xem</th>
                  <th className="px-6 py-4">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e1de]/30">
                {topViewedPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#fafaf9] transition-colors">
                    <td className="px-6 py-4 font-semibold text-primary max-w-[300px] truncate">{post.title}</td>
                    <td className="px-6 py-4">{post.author?.full_name || post.author?.username || 'N/A'}</td>
                    <td className="px-6 py-4 font-mono font-semibold">{post.view_count?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4">
                      {post.status === 'published' ? (
                        <span className="px-3 py-1 rounded-full bg-[#e1f3d8]/60 text-[#67c23a] text-[10px] font-bold uppercase tracking-wider border border-emerald-300">Đã xuất bản</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-300">Bản nháp</span>
                      )}
                    </td>
                  </tr>
                ))}
                {topViewedPosts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[#827470]">Chưa có dữ liệu bài viết</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------
  // SHOP STAFF DASHBOARD RENDER
  // ----------------------------------------------------
  if (role === 'shop_staff') {
    return (
      <div className="page-transition space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">
              Chào buổi sáng, {displayName}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Cổng thống kê hàng hóa & kiểm kê kho hàng Từ Tâm Phục.
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-8 border-b border-[#e5e1de]/60 pb-4">
          <button
            onClick={() => setActiveSubTab('inventory')}
            className={`pb-2 text-xs uppercase tracking-widest font-label-md transition-all relative ${activeSubTab === 'inventory'
                ? 'text-primary font-bold'
                : 'text-on-surface-variant/60 hover:text-primary'
              }`}
          >
            Thống kê hàng hóa
            {activeSubTab === 'inventory' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in duration-300"></span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('sales')}
            className={`pb-2 text-xs uppercase tracking-widest font-label-md transition-all relative ${activeSubTab === 'sales'
                ? 'text-primary font-bold'
                : 'text-on-surface-variant/60 hover:text-primary'
              }`}
          >
            Thống kê đơn hàng & doanh thu
            {activeSubTab === 'sales' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in duration-300"></span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab('forecasting')}
            className={`pb-2 text-xs uppercase tracking-widest font-label-md transition-all relative ${activeSubTab === 'forecasting'
                ? 'text-primary font-bold'
                : 'text-on-surface-variant/60 hover:text-primary'
              }`}
          >
            Dự báo sản phẩm & kho
            {activeSubTab === 'forecasting' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-in fade-in duration-300"></span>
            )}
          </button>
        </div>

        {/* TAB 1: INVENTORY */}
        {activeSubTab === 'inventory' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsInventoryStaff.map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <div
                    key={idx}
                    className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">{stat.title}</span>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${stat.isPositive ? 'bg-primary/5 text-primary' : 'bg-red-50 text-red-600'
                        }`}>
                        <Icon size={20} strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display-lg text-[28px] text-primary">{stat.value}</span>
                      <span className={`text-[10px] uppercase font-bold tracking-wider ${stat.isPositive ? 'text-on-surface-variant/60' : 'text-red-500'
                        }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Center Grid: Alert & Best Sellers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Low Stock Alerts */}
              <div className="lg:col-span-7 bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary">Cảnh báo tồn kho thấp</h3>
                      <p className="font-body-md text-on-surface-variant text-sm mt-1">Sản phẩm hiện tại còn dưới 5 đơn vị.</p>
                    </div>
                    <AlertTriangle className="text-red-500 opacity-60" size={24} />
                  </div>

                  <div className="space-y-4">
                    {lowStockAlerts.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-low/30 border-l-4 border-red-500/40 transition-all hover:bg-surface-container-low/60 group"
                      >
                        <div className="w-12 h-12 rounded object-cover overflow-hidden bg-surface-container-low shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-body-md font-semibold text-on-surface truncate">{item.name}</h4>
                          <p className="text-xs text-on-surface-variant/70">SKU: {item.sku} | Size: {item.size}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-headline-sm text-red-600 text-[20px] leading-none">{item.stock}</p>
                          <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/60 mt-1">ĐƠN VỊ</p>
                        </div>
                      </div>
                    ))}
                    {lowStockAlerts.length === 0 && (
                      <p className="text-xs text-on-surface-variant/60 text-center py-6">Không có cảnh báo tồn kho thấp.</p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setToastMessage('Đã tạo phiếu yêu cầu nhập hàng cho toàn bộ sản phẩm cảnh báo!')
                    setTimeout(() => setToastMessage(null), 3000)
                  }}
                  className="mt-8 w-full border border-primary text-primary py-3 hover:bg-primary hover:text-white transition-colors duration-500 font-label-md rounded-sm text-xs uppercase"
                >
                  NHẬP HÀNG TẤT CẢ CẢNH BÁO
                </button>
              </div>

              {/* Top Sellers Chart */}
              <div className="lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-headline-sm text-headline-sm text-primary">Sản phẩm bán chạy</h3>
                    <div className="flex bg-surface-container-low p-0.5 rounded-full border border-outline-variant/30">
                      <button
                        onClick={() => setBestSellersPeriod('7days')}
                        className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full transition-all duration-300 ${bestSellersPeriod === '7days'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-on-surface-variant/60 hover:text-primary'
                          }`}
                      >
                        7 ngày
                      </button>
                      <button
                        onClick={() => setBestSellersPeriod('3months')}
                        className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full transition-all duration-300 ${bestSellersPeriod === '3months'
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-on-surface-variant/60 hover:text-primary'
                          }`}
                      >
                        3 tháng
                      </button>
                    </div>
                  </div>
                  <p className="font-body-md text-on-surface-variant text-sm">
                    Xếp hạng top các sản phẩm bán chạy nhất trong {bestSellersPeriod === '7days' ? '7 ngày qua' : '3 tháng qua'}.
                  </p>
                </div>

                <div className="space-y-4 mt-8 flex-grow">
                  {topSellersInventoryChart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-low/30 border border-outline-variant/10 transition-all hover:bg-surface-container-low/60 group animate-in fade-in duration-500"
                    >
                      {/* Rank Badge */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${idx === 0
                          ? 'bg-[#E5D5C5] text-primary'
                          : idx === 1
                            ? 'bg-[#EADED2] text-primary/80'
                            : idx === 2
                              ? 'bg-[#F2EAE1] text-primary/60'
                              : 'bg-surface-container text-on-surface-variant/70'
                        }`}>
                        {idx + 1}
                      </div>

                      {/* Product Image */}
                      <div className="w-12 h-12 rounded overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/10">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Product Name */}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-body-md font-semibold text-on-surface truncate text-sm">{item.name}</h4>
                        <p className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider mt-0.5">Top {idx + 1}</p>
                      </div>

                      {/* Sales Count */}
                      <div className="text-right shrink-0">
                        <p className="font-headline-sm text-primary text-[16px] font-bold leading-none">{item.count}</p>
                        <p className="text-[8px] uppercase tracking-wider text-on-surface-variant/60 mt-1">ĐƠN VỊ</p>
                      </div>
                    </div>
                  ))}
                  {topSellersInventoryChart.length === 0 && (
                    <p className="text-xs text-on-surface-variant/60 text-center w-full py-10">Chưa có dữ liệu bán hàng.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Slow-moving Inventory */}
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Hàng tồn kho lâu ngày</h3>
                  <p className="font-body-md text-on-surface-variant text-sm mt-1">
                    Sản phẩm không biến động trong 30 ngày qua.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {slowInventory.map((item, idx) => (
                  <div key={idx} className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 transition-all duration-500 group flex flex-col justify-between">
                    <div className="aspect-video relative overflow-hidden bg-surface-container-low shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-outline-variant/20 shadow-sm">
                        <span className="text-[9px] font-bold text-primary tracking-widest uppercase">{item.days} NGÀY TỒN KHO</span>
                      </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-headline-sm text-base text-primary mb-1">{item.name}</h4>
                        <p className="text-xs text-on-surface-variant/80 mb-4">Tồn kho hiện tại: {item.stock} đơn vị</p>
                      </div>
                      <div>
                        <div className="h-1 bg-surface-container-low rounded-full overflow-hidden">
                          <div className="h-full bg-secondary w-full opacity-20"></div>
                        </div>
                        <div className="mt-4 flex justify-between items-center text-[10px]">
                          <span className="text-on-surface-variant/60 uppercase tracking-wider">Biến động: 0%</span>
                          <button
                            onClick={() => {
                              setToastMessage(`Đã lập đề xuất chương trình khuyến mãi cho ${item.name}!`)
                              setTimeout(() => setToastMessage(null), 3000)
                            }}
                            className="font-semibold text-primary underline underline-offset-4 hover:text-primary-container transition-colors"
                          >
                            ĐỀ XUẤT GIẢM GIÁ
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {slowInventory.length === 0 && (
                  <p className="text-xs text-on-surface-variant/60 text-center col-span-3 py-10">Không có hàng tồn lâu ngày.</p>
                )}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: SALES & REVENUE */}
        {activeSubTab === 'sales' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsSalesStaff.map((stat, idx) => {
                const Icon = stat.icon
                return (
                  <div
                    key={idx}
                    className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-500"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">{stat.title}</span>
                      <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                        <Icon size={20} strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display-lg text-[28px] text-primary">{stat.value}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60">
                        {stat.change}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Chart and Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Trend Chart */}
              <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="font-headline-sm text-headline-sm text-primary">Xu hướng đơn hàng</h3>
                  <span className="px-4 py-1 text-[11px] font-label-md uppercase tracking-wider border border-outline-variant/50 rounded-full bg-surface-container-low text-primary">
                    Tuần này
                  </span>
                </div>
                <div className="chart-container flex items-end justify-between px-4 h-56">
                  {weeklyOrderTrend.map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center group w-full">
                      <div className="w-2 bg-primary/10 h-32 rounded-t-full relative">
                        <div
                          className="absolute bottom-0 w-full bg-primary rounded-t-full transition-all duration-700 group-hover:bg-primary-container"
                          style={{ height: animate ? bar.height : '0%' }}
                        ></div>
                        <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-primary text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                          {bar.count}
                        </span>
                      </div>
                      <span className="mt-4 text-caption text-secondary text-xs">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-8">Top Sản phẩm bán chạy</h3>
                <div className="space-y-6">
                  {topProductsSales.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                      <div className="w-12 h-16 bg-surface-container rounded overflow-hidden">
                        <img
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          src={product.image}
                          alt={product.name}
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-label-md text-label-md text-primary text-xs leading-snug font-bold">{product.name}</p>
                        <p className="text-caption text-secondary text-[10px] mt-1">{product.count}</p>
                      </div>
                    </div>
                  ))}
                  {topProductsSales.length === 0 && (
                    <p className="text-xs text-on-surface-variant/60 text-center py-10">Chưa có đơn hàng nào.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 overflow-hidden">
              <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center">
                <h3 className="font-headline-sm text-headline-sm text-primary">Đơn hàng gần đây</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-low/50">
                      <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider">Mã đơn hàng</th>
                      <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider">Khách hàng</th>
                      <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider">Tổng tiền</th>
                      <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider">Trạng thái</th>
                      <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {recentOrdersSales.map((order, idx) => {
                      const customerName = order.shipping_address?.full_name || order.user?.full_name || 'Khách hàng'
                      return (
                        <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="px-8 py-5 font-label-md text-label-md text-on-surface text-sm font-bold text-primary">{order.order_code}</td>
                          <td className="px-8 py-5 text-on-surface text-sm">{customerName}</td>
                          <td className="px-8 py-5 font-label-md text-label-md text-primary text-sm font-semibold">{formatPrice(order.total)}</td>
                          <td className="px-8 py-5">
                            <span className={`px-2.5 py-1 rounded text-[10px] font-label-md uppercase tracking-wider font-semibold ${
                              order.status === 'pending'
                                ? 'bg-[#ece0dc] text-[#5d4037] border border-[#d4c3be]'
                                : order.status === 'confirmed' || order.status === 'processing'
                                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                : order.status === 'delivered' || order.status === 'shipped'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {getOrderStatusLabel(order.status)}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button
                              onClick={() => handleOpenEdit(order)}
                              className="text-primary hover:bg-primary/5 p-2 rounded-full transition-all cursor-pointer"
                              title="Xem chi tiết đơn hàng"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                    {recentOrdersSales.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-8 py-10 text-center text-on-surface-variant/60">
                          Không có đơn hàng nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* TAB 3: FORECASTING */}
        {activeSubTab === 'forecasting' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Introductory card */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/15 shadow-[0_10px_30px_rgba(93,64,55,0.02)] flex flex-col md:flex-row gap-6 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0">
                  <TrendingUp size={22} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-primary text-base">Hệ Thống Dự Báo Tồn Kho & Nhu Cầu Thông Minh</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Sử dụng dữ liệu bán hàng 30 ngày qua kết hợp hệ số mùa lễ hội Phật giáo để tối ưu lượng hàng tồn, tránh đọng kho và sẵn sàng phục vụ Phật tử.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Cập nhật thời gian thực
                </span>
              </div>
            </div>

            {/* Grid for Stock Depletion & Overstock */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Column 1: Stock Depletion (Out of Stock Alert) */}
              <div className="lg:col-span-7 bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary">Dự báo cạn kiệt kho</h3>
                      <p className="font-body-md text-on-surface-variant text-sm mt-1">Sản phẩm dự kiến sẽ hết hàng dựa trên tốc độ bán.</p>
                    </div>
                    <AlertTriangle className="text-amber-500 opacity-80" size={24} />
                  </div>

                  <div className="space-y-4">
                    {forecastData?.stockDepletion?.map((item: any, idx: number) => {
                      const isCritical = item.priority === 'critical';
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:bg-surface-container-low/60 group ${isCritical ? 'bg-red-50/20 border-red-200/50 border-l-4 border-l-red-500' : 'bg-surface-container-low/30 border-outline-variant/10 border-l-4 border-l-amber-500'
                            }`}
                        >
                          <div className="w-12 h-16 rounded object-cover overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/20">
                            <img
                              src={item.image ? getImageUrl(item.image) : 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80'}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-body-md font-semibold text-on-surface truncate text-sm">{item.name}</h4>
                            <p className="text-[10px] text-on-surface-variant/70 mt-1 uppercase tracking-wider font-mono">
                              SKU: {item.sku} | Tồn: {item.stock} cái
                            </p>
                            <p className="text-[11px] text-on-surface-variant mt-1.5 font-medium">
                              Tốc độ: <span className="text-primary font-bold">{item.velocity}</span> sản phẩm/ngày
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mb-2 ${isCritical ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                              }`}>
                              {isCritical ? 'Nguy cấp' : 'Cảnh báo'}
                            </span>
                            <p className="text-xs text-on-surface-variant/80 font-medium">
                              {item.daysRemaining === 0 ? 'Hết hàng hôm nay' : `Hết trong ~${item.daysRemaining} ngày`}
                            </p>
                            <button
                              onClick={() => {
                                setToastMessage(`Đã lập yêu cầu nhập hàng ${item.reorderQuantity} chiếc cho ${item.name}!`);
                                setTimeout(() => setToastMessage(null), 3000);
                              }}
                              className="text-[10px] font-bold text-primary hover:text-primary-container underline underline-offset-4 mt-2 block cursor-pointer bg-transparent border-none p-0"
                            >
                              Yêu Cầu Nhập ({item.reorderQuantity})
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {(!forecastData || forecastData?.stockDepletion?.length === 0) && (
                      <p className="text-xs text-on-surface-variant/60 text-center py-12">Không có sản phẩm nào có rủi ro cạn kiệt kho.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Column 2: Overstock Risk (Slow items) */}
              <div className="lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-primary">Cảnh báo hàng đọng kho</h3>
                      <p className="font-body-md text-on-surface-variant text-sm mt-1">Sản phẩm tồn cao nhưng không có lượt bán trong 30 ngày.</p>
                    </div>
                    <Layers className="text-primary opacity-60" size={24} />
                  </div>

                  <div className="space-y-4">
                    {forecastData?.overstockRisk?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-low/30 border border-outline-variant/10 transition-all hover:bg-surface-container-low/60 group"
                      >
                        <div className="w-12 h-16 rounded overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/10">
                          <img
                            src={item.image ? getImageUrl(item.image) : 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80'}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-body-md font-semibold text-on-surface truncate text-xs">{item.name}</h4>
                          <p className="text-[10px] text-on-surface-variant/70 mt-1">
                            Tồn: <span className="font-bold text-primary">{item.stock}</span> chiếc | Đọng {item.daysWithoutSales} ngày
                          </p>
                          <p className="text-[10px] text-on-surface-variant/80 mt-1 italic">
                            Tổn thất lưu kho: <span className="font-bold text-red-600">{formatPrice(item.holdingCostEst)}</span>/tháng
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <button
                            onClick={() => {
                              setToastMessage(`Đã tạo chiến dịch: "${item.recommendation}" cho ${item.name}!`);
                              setTimeout(() => setToastMessage(null), 3000);
                            }}
                            className="text-[10px] font-bold border border-primary/40 text-primary hover:bg-primary hover:text-white px-2.5 py-1.5 rounded transition-all cursor-pointer bg-transparent"
                          >
                            Áp Dụng Đề Xuất
                          </button>
                        </div>
                      </div>
                    ))}
                    {(!forecastData || forecastData?.overstockRisk?.length === 0) && (
                      <p className="text-xs text-on-surface-variant/60 text-center py-12">Không phát hiện hàng đọng kho có rủi ro cao.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: AI Demand Projections */}
            <div className="space-y-6">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary">Dự báo nhu cầu 30 ngày tới</h3>
                <p className="font-body-md text-on-surface-variant text-sm mt-1">
                  Xu hướng mua sắm ước tính được hỗ trợ bởi hệ số sự kiện lễ hội tâm linh.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {forecastData?.demandForecast?.slice(0, 4).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 transition-all duration-500 group flex flex-col justify-between shadow-[0_10px_30px_rgba(68,42,34,0.02)]"
                  >
                    <div className="aspect-[4/3] relative overflow-hidden bg-surface-container-low shrink-0">
                      <img
                        src={item.image ? getImageUrl(item.image) : 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80'}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 bg-emerald-500/90 text-white backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-emerald-400/20 shadow-sm text-[9px] font-bold tracking-wider">
                        ĐỘ TIN CẬY: {item.confidence}
                      </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-headline-sm text-sm text-primary line-clamp-1">{item.name}</h4>
                        <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-wide">
                          Dự kiến bán: {item.projectedSales} chiếc (+{item.growthRate}%)
                        </p>
                      </div>
                      <div>
                        <div className="text-[10px] text-on-surface-variant bg-surface-container-low p-2 rounded border border-outline-variant/10">
                          <span className="font-semibold text-primary block text-[8px] uppercase tracking-wider opacity-80 mb-0.5">Yếu tố thúc đẩy</span>
                          {item.seasonalityFactor}
                        </div>
                        <button
                          onClick={() => {
                            setToastMessage(`Đã ghi nhận kế hoạch chuẩn bị hàng cho ${item.name}!`);
                            setTimeout(() => setToastMessage(null), 3000);
                          }}
                          className="w-full text-center mt-3 bg-primary text-white py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm hover:opacity-90 transition-all cursor-pointer border-none"
                        >
                          Chuẩn Bị Sẵn Hàng
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {(!forecastData || forecastData?.demandForecast?.length === 0) && (
                  <p className="text-xs text-on-surface-variant/60 text-center col-span-4 py-12">Chưa có dự báo nhu cầu.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Floating Zen Philosophy Info banner */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10 flex flex-col md:flex-row gap-6 items-center justify-between shadow-[0_20px_40px_-4px_rgba(93,64,55,0.03)]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary shrink-0">
              <Leaf size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-1">Chánh niệm trong sắp xếp và lưu trữ</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">
                Từng nếp gấp áo tràng, từng chiếc tọa cụ gọn gàng chính là sự biểu hiện của tâm tĩnh lặng. Sắp xếp kho hàng bằng chánh niệm là nền tảng của dịch vụ tận tâm.
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Modal and Toast notifications */}
        {renderDetailsModal()}
        {renderToast()}
      </div>
    )
  }

  // ----------------------------------------------------
  // ADMIN DASHBOARD RENDER (Default)
  // ----------------------------------------------------
  return (
    <div className="page-transition space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Header */}
      <div>
        <h2 className="font-headline-md text-headline-md text-primary mb-2">
          {getGreeting()}, {displayName}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Đây là nhịp đập tĩnh lặng của Từ Tâm Phục hôm nay.
        </p>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsAdmin.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-on-surface-variant font-label-md text-label-md">{stat.title}</span>
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-[28px] text-primary">{stat.value}</span>
                <span className={`text-caption font-caption ${stat.change === 'Mới' || stat.change === 'Đang chạy'
                    ? 'text-secondary'
                    : 'text-emerald-600'
                  } flex items-center`}>
                  {stat.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Middle Section: Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart Area */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary">Xu hướng bán hàng</h3>
              <p className="font-caption text-caption text-on-surface-variant">Tóm tắt hiệu suất hàng tháng</p>
            </div>
            <div className="relative">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-surface-container-low border-none rounded-lg text-label-md font-label-md pr-10 pl-4 py-2 focus:ring-primary/20 cursor-pointer text-on-surface-variant outline-none"
              >
                <option>6 tháng qua</option>
                <option>Năm qua</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-on-surface-variant pointer-events-none" />
            </div>
          </div>
          <div className="relative h-64 w-full flex items-end gap-4 overflow-hidden">
            {/* Simulated CSS Chart with Meditative Animation */}
            <div className="flex-grow flex items-end justify-between h-full px-2">
              {chartBarsAdmin.map((bar, idx) => (
                <div
                  key={idx}
                  className="w-12 bg-primary/10 hover:bg-primary/20 transition-all duration-[1500ms] ease-out rounded-t-sm relative group cursor-pointer"
                  style={{ height: animate ? bar.height : '0%' }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap z-10">
                    {bar.value}
                  </div>
                </div>
              ))}
              {chartBarsAdmin.length === 0 && (
                <p className="text-xs text-on-surface-variant/60 text-center w-full py-20">Không có dữ liệu doanh thu.</p>
              )}
            </div>
            {/* Chart Labels */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-outline font-label-md px-2 pt-2 border-t border-outline-variant/20">
              {chartBarsAdmin.map((bar, idx) => (
                <span key={idx}>{bar.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Accent Component */}
        <div className="bg-primary/5 p-8 rounded-xl border border-primary/10 flex flex-col justify-center items-center text-center relative overflow-hidden group min-h-[300px]">
          <div className="absolute inset-0 opacity-10 group-hover:scale-110 transition-transform duration-[2000ms] ease-out">
            <img
              className="w-full h-full object-cover grayscale"
              alt="A macro shot of fine linen fabric texture, showcasing the intricate weave and natural fibers."
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvnKFWQ4aIswigYB94XDBhlk10FQkQKrxf-GS0Vk7tNq5HNDHBZovqLCbzsUQYfSguw5NudXQEaKNpF5bnbCf0S2viSoluJPf3yruRs9R4pZ-MVoC_-JMSJYnvfeaJlvisLXUwg2NuTW2E2iyBQn2c6aK2KXtbo6br4ri-xqZjp_W-VF3Us3TVU2tc1DDDHsDSQyYYbjCzWInmhSjQzmtonv5bDbi9CPqbfbaouyC5b0t_oePrbfMPdUfqO2YMoqEAXWRrOQjQaXZ5"
            />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Leaf size={24} strokeWidth={1.5} />
            </div>
            <h4 className="font-headline-sm text-headline-sm text-primary mb-2">Nghệ thuật mặc</h4>
            <p className="font-body-md text-body-md text-primary/70 mb-6 max-w-[200px]">
              Khám phá tài liệu về tay nghề thủ công của bộ sưu tập mới.
            </p>
            <button className="px-6 py-2 border border-primary text-primary font-label-md text-label-md hover:bg-primary hover:text-white transition-colors duration-500">
              Xem hướng dẫn
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 overflow-hidden">
        <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-primary">Đơn hàng gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider">Mã đơn hàng</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider">Khách hàng</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider">Ngày</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider">Trạng thái</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider">Số tiền</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant text-xs uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {recentOrdersAdmin.map((order, idx) => {
                const customerName = order.shipping_address?.full_name || order.user?.full_name || 'Khách hàng'
                return (
                  <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-8 py-5 font-label-md text-label-md text-on-surface font-bold text-primary">{order.order_code}</td>
                    <td className="px-8 py-5 text-on-surface text-sm">{customerName}</td>
                    <td className="px-8 py-5 text-on-surface-variant font-caption text-caption text-xs">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-label-md uppercase tracking-wider font-semibold ${
                        order.status === 'pending'
                          ? 'bg-[#ece0dc] text-[#5d4037] border border-[#d4c3be]'
                          : order.status === 'confirmed' || order.status === 'processing'
                          ? 'bg-amber-50 text-amber-700 border border-amber-100'
                          : order.status === 'delivered' || order.status === 'shipped'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-label-md text-label-md text-primary font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-8 py-5 text-right">
                      <button
                        onClick={() => handleOpenEdit(order)}
                        className="text-primary hover:bg-primary/5 p-2 rounded-full transition-all cursor-pointer"
                        title="Xem chi tiết đơn hàng"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {recentOrdersAdmin.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-10 text-center text-on-surface-variant/60">
                    Không có đơn hàng gần đây.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {renderDetailsModal()}
      {renderToast()}
    </div>
  )

  // ----------------------------------------------------
  // HELPER SUB-RENDERERS FOR MODALS & NOTIFICATIONS
  // ----------------------------------------------------
  function renderDetailsModal() {
    if (!isModalOpen || !selectedOrder) return null

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl w-full shadow-2xl p-6 md:p-8 relative animate-in slide-in-from-bottom-8 duration-500 max-h-[92vh] overflow-y-auto max-w-4xl font-sans text-left">
          <button
            onClick={() => {
              setIsModalOpen(false)
              setSelectedOrder(null)
            }}
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
                  <UserIcon size={14} /> Thông tin khách hàng
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
                    const imgPath = item.product_snapshot?.image || item.product?.images?.[0]?.url
                    const imgUrl = getImageUrl(imgPath || '')

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
                  </div>

                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">
                      Vận chuyển
                    </label>
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
                  </div>
                </div>
              </div>

              {/* Return Request Details */}
              {selectedOrder.return_request && (
                <div className="p-5 border border-[#d4c3be]/40 rounded-xl bg-surface-container-low text-xs space-y-3 shadow-[0_10px_30px_rgba(93,64,55,0.02)]">
                  <h4 className="font-serif text-sm font-bold text-primary border-b border-outline-variant/20 pb-1 flex items-center justify-between">
                    <span>Yêu cầu Trả hàng / Hoàn tiền</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold border ${selectedOrder.return_request.status === 'pending'
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

                  {selectedOrder.return_request.status === 'pending' && (
                    <div className="flex gap-3 pt-2.5 border-t border-outline-variant/20">
                      <button
                        type="button"
                        onClick={() => handleUpdateReturnRequestStatus(selectedOrder.return_request.id, 'rejected')}
                        className="w-1/2 py-2 bg-red-50 border border-red-200 hover:bg-red-100/60 text-red-700 text-[10px] font-bold uppercase tracking-wider rounded transition-colors cursor-pointer"
                      >
                        Từ chối
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateReturnRequestStatus(selectedOrder.return_request.id, 'approved')}
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
            {selectedOrder.status === 'pending' && (
              <button
                onClick={handleQuickApprove}
                className="px-6 py-2.5 bg-[#5d4037] text-white rounded font-label-md text-xs hover:bg-[#442a22] transition-all cursor-pointer mr-auto border-none"
              >
                Duyệt đơn
              </button>
            )}
            {(selectedOrder.status === 'confirmed' || selectedOrder.status === 'processing') && (
              <button
                onClick={handleQuickShip}
                className="px-6 py-2.5 bg-blue-600 text-white rounded font-label-md text-xs hover:bg-blue-700 transition-all cursor-pointer mr-auto border-none"
              >
                Xác nhận xuất kho & Giao hàng
              </button>
            )}
            <button
              onClick={() => {
                setIsModalOpen(false)
                setSelectedOrder(null)
              }}
              className="px-5 py-2.5 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSaveOrder}
              className="px-6 py-2.5 bg-primary text-white rounded font-label-md text-xs hover:bg-on-primary-fixed-variant transition-colors cursor-pointer"
            >
              Xác nhận thay đổi
            </button>
          </div>
        </div>
      </div>
    )
  }

  function renderToast() {
    if (!toastMessage) return null

    return (
      <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 border border-white/10">
        <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
          <Check size={14} className="text-white" />
        </div>
        <span className="text-xs font-semibold">{toastMessage}</span>
      </div>
    )
  }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chào buổi sáng'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}
