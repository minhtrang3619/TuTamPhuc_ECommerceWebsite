import { useState, useEffect } from 'react'
import { 
  Search, 
  Check, 
  Coins, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Plus, 
  ClipboardCheck,
  Package,
  Trash2,
  ChevronDown
} from 'lucide-react'
import apiClient from '@/services/apiClient'
import { getImageUrl } from '@/utils/productMapper'

interface ReceiptVoucherItem {
  id: string
  name: string
  image: string
  sku: string
  size: string
  cost_price: number
  quantity: number
  isVariant: boolean
}

export default function AdminInventory() {
  const [activeTab, setActiveTab] = useState<'overview' | 'update'>('overview')

  // Dashboard States
  const [analyticsData, setAnalyticsData] = useState<any | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // Voucher Receipt States
  const [voucherCode, setVoucherCode] = useState(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    return `PNK-${today}-001`
  })
  const [voucherSupplier, setVoucherSupplier] = useState('4') // Default: Xưởng may Khai Thanh
  const [voucherItems, setVoucherItems] = useState<ReceiptVoucherItem[]>([])
  const [voucherNotes, setVoucherNotes] = useState('')
  const [searchSku, setSearchSku] = useState('')
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [showProductDropdown, setShowProductDropdown] = useState(false)

  // Loading and Error States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const res = await apiClient.get('/analytics/inventory')
      setAnalyticsData(res.data)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu phân tích kho:', err)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchAllProductsForDropdown = async () => {
    try {
      const res = await apiClient.get('/products?page_size=200&status=all')
      setAllProducts(res.data?.items || [])
    } catch (err) {
      console.error('Lỗi khi tải danh sách sản phẩm:', err)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    fetchAllProductsForDropdown()
  }, [])

  const handleSearchAndAdd = async (skuVal: string) => {
    const targetSku = skuVal || searchSku
    if (!targetSku.trim()) return
    setLoading(true)
    setError(null)
    try {
      // 1. Search in preloaded allProducts list first
      let foundProduct = allProducts.find((item: any) => item.sku?.toLowerCase() === targetSku.trim().toLowerCase())
      let foundVariant = null
      
      if (!foundProduct) {
        for (const item of allProducts) {
          const v = item.variants?.find((varItem: any) => {
            const variantSku = varItem.sku || `${item.sku}-${varItem.value}`
            return variantSku.toLowerCase() === targetSku.trim().toLowerCase()
          })
          if (v) {
            foundProduct = item
            foundVariant = v
            break
          }
        }
      }

      // 2. If not found, fallback to API query with a large page size
      if (!foundProduct) {
        const res = await apiClient.get('/products?page_size=1000&status=all')
        const items = res.data?.items || []
        
        foundProduct = items.find((item: any) => item.sku?.toLowerCase() === targetSku.trim().toLowerCase())
        if (!foundProduct) {
          for (const item of items) {
            const v = item.variants?.find((varItem: any) => {
              const variantSku = varItem.sku || `${item.sku}-${varItem.value}`
              return variantSku.toLowerCase() === targetSku.trim().toLowerCase()
            })
            if (v) {
              foundProduct = item
              foundVariant = v
              break
            }
          }
        }
      }
      
      if (!foundProduct) {
        setError('Không tìm thấy sản phẩm hoặc biến thể nào có mã SKU này.')
        return
      }
      
      const imageUrl = getImageUrl(foundProduct.images?.[0]?.url)
      
      // Clean up mock rows on first real item insert to keep data clean
      setVoucherItems(prev => {
        const clean = prev.filter(x => !x.id.startsWith('mock-'))
        
        if (foundVariant) {
          // Add this specific variant
          const newRow: ReceiptVoucherItem = {
            id: `var-${foundVariant.id}`,
            name: foundProduct.name,
            image: imageUrl,
            sku: foundVariant.sku || foundProduct.sku,
            size: foundVariant.value,
            cost_price: Math.round(foundProduct.price * 0.48),
            quantity: 10,
            isVariant: true
          }
          if (clean.some(x => x.sku.toLowerCase() === newRow.sku.toLowerCase())) return clean
          return [...clean, newRow]
        } else {
          // If product has size variants, add all of them
          const sizes = foundProduct.variants?.filter((v: any) => v.name === 'Kích cỡ' || v.name === 'Size' || v.name === 'size') || []
          if (sizes.length > 0) {
            const newRows: ReceiptVoucherItem[] = sizes.map((sizeVar: any) => ({
              id: `var-${sizeVar.id}`,
              name: foundProduct.name,
              image: imageUrl,
              sku: sizeVar.sku || `${foundProduct.sku}-${sizeVar.value}`,
              size: sizeVar.value,
              cost_price: Math.round(foundProduct.price * 0.48),
              quantity: 10,
              isVariant: true
            }))
            const filtered = newRows.filter(nr => !clean.some(x => x.sku.toLowerCase() === nr.sku.toLowerCase()))
            return [...clean, ...filtered]
          } else {
            // Add the main product
            const newRow: ReceiptVoucherItem = {
              id: `prod-${foundProduct.id}`,
              name: foundProduct.name,
              image: imageUrl,
              sku: foundProduct.sku,
              size: 'Standard',
              cost_price: Math.round(foundProduct.price * 0.48),
              quantity: 10,
              isVariant: false
            }
            if (clean.some(x => x.sku.toLowerCase() === newRow.sku.toLowerCase())) return clean
            return [...clean, newRow]
          }
        }
      })
      
      setSearchSku('')
    } catch (err) {
      console.error(err)
      setError('Lỗi khi tải thông tin sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickUpdateTransition = (actionSku?: string) => {
    setActiveTab('update')
    if (actionSku) {
      handleSearchAndAdd(actionSku)
    }
  }

  const handleConfirmVoucher = async () => {
    const realItems = voucherItems.filter(x => !x.id.startsWith('mock-'))
    const itemsToProcess = realItems.length > 0 ? realItems : voucherItems

    if (itemsToProcess.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm vào phiếu nhập kho.')
      return
    }

    const invalidItem = itemsToProcess.find(
      item => !item.sku.trim() || item.quantity <= 0 || item.cost_price < 0
    )
    if (invalidItem) {
      alert('Vui lòng điền đầy đủ SKU, số lượng > 0 và giá vốn >= 0 cho tất cả các dòng.')
      return
    }

    const supplierMap: Record<string, string> = {
      '1': 'Xưởng May Liên Hoa',
      '2': 'Xưởng Lụa Bảo Lộc',
      '3': 'Vải Chàm Sapa',
      '4': 'Xưởng may Khai Thanh (Quận Tân Phú)'
    }
    const supplierName = supplierMap[voucherSupplier] || 'Xưởng may Khai Thanh (Quận Tân Phú)'

    setLoading(true)
    setError(null)
    try {
      const payload = {
        voucher_code: voucherCode,
        supplier: supplierName,
        recipient: "Minh Tâm",
        notes: voucherNotes || "",
        items: itemsToProcess.map(item => ({
          sku: item.sku.trim(),
          quantity: item.quantity,
          cost_price: item.cost_price
        }))
      }
      
      await apiClient.post('/products/receive-stock', payload)
      
      setToastMsg(`Chốt sổ phiếu ${voucherCode} thành công! Đã đồng bộ số lượng & giá vốn.`)
      setTimeout(() => setToastMsg(null), 4000)
      
      // Reset form
      setVoucherItems([])
      setVoucherNotes('')
      
      // Generate new voucher code
      const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      setVoucherCode(`PNK-${today}-${String(Math.floor(Math.random() * 900) + 100)}`)
      
      // Refresh dashboard analytics & dropdown list
      fetchAnalytics()
      fetchAllProductsForDropdown()
    } catch (err: any) {
      console.error(err)
      alert(err?.response?.data?.detail || 'Lỗi khi xác nhận chốt sổ phiếu nhập kho.')
    } finally {
      setLoading(false)
    }
  }

  // Calculations for Summary
  const totalQuantity = voucherItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = voucherItems.reduce((sum, item) => sum + (item.quantity * item.cost_price), 0)

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-outline-variant/30 mb-6">
        <button
          className={`py-3 font-label-md text-sm transition-colors border-b-2 font-semibold ${
            activeTab === 'overview'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan kho
        </button>
        <button
          className={`py-3 font-label-md text-sm transition-colors border-b-2 font-semibold ${
            activeTab === 'update'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-primary'
          }`}
          onClick={() => setActiveTab('update')}
        >
          Nhập &amp; Kiểm kho
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-12 animate-in fade-in duration-500">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-left">
              <h1 className="font-headline-md text-3xl text-primary font-bold font-serif mb-2">Tổng quan kho hàng</h1>
              <p className="font-body-md text-sm text-on-surface-variant opacity-75">
                Chào buổi sáng, Quản lý kho. Dưới đây là tình trạng hàng hóa hôm nay.
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('update')}
                className="px-6 py-2.5 border border-primary text-primary font-semibold text-xs tracking-wider rounded-lg hover:bg-primary/5 transition-all duration-300 flex items-center gap-2 cursor-pointer bg-transparent"
              >
                <Plus size={16} />
                Tạo phiếu nhập kho mới
              </button>
              <button 
                onClick={() => handleQuickUpdateTransition()}
                className="px-6 py-2.5 bg-primary text-white font-semibold text-xs tracking-wider rounded-lg hover:opacity-90 transition-all duration-300 flex items-center gap-2 cursor-pointer border-none font-bold"
              >
                <ClipboardCheck size={16} />
                Kiểm kê
              </button>
            </div>
          </div>

          {analyticsLoading && !analyticsData ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium">Đang tải phân tích kho hàng từ hệ thống...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Stock Value */}
                <div className="bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2.5 bg-secondary-container/40 text-primary rounded-full">
                      <Coins size={20} />
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 uppercase">+2.4%</span>
                  </div>
                  <div>
                    <p className="font-label-md text-[10px] text-on-surface-variant/80 uppercase tracking-widest mb-1 font-semibold">Tổng giá trị tồn kho</p>
                    <p className="font-headline-sm text-lg text-primary font-bold font-serif">
                      {(analyticsData?.stats?.total_stock_value || 0).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2.5 bg-red-50 text-error rounded-full border border-red-100">
                      <AlertTriangle size={20} />
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-[10px] text-on-surface-variant/80 uppercase tracking-widest mb-1 font-semibold">Cảnh báo tồn kho thấp</p>
                    <p className="font-headline-sm text-lg text-error font-bold font-serif">
                      {analyticsData?.stats?.low_stock_count || 0} Sản phẩm
                    </p>
                  </div>
                </div>

                {/* Pending Shipments */}
                <div className="bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2.5 bg-secondary-container/40 text-primary rounded-full">
                      <Clock size={20} />
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-[10px] text-on-surface-variant/80 uppercase tracking-widest mb-1 font-semibold">Đơn hàng chờ xuất</p>
                    <p className="font-headline-sm text-lg text-primary font-bold font-serif">
                      {analyticsData?.stats?.pending_shipments || 0} Kiện hàng
                    </p>
                  </div>
                </div>

                {/* Inventory Accuracy */}
                <div className="bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2.5 bg-secondary-container/40 text-primary rounded-full">
                      <ShieldCheck size={20} />
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-[10px] text-on-surface-variant/80 uppercase tracking-widest mb-1 font-semibold">Độ chính xác tồn kho</p>
                    <p className="font-headline-sm text-lg text-primary font-bold font-serif">
                      {analyticsData?.stats?.accuracy || 99.2}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Bento Grid Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                {/* Recent Stock Movements */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 flex flex-col h-[500px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline-sm text-lg text-primary font-bold font-serif">Biến động kho gần đây</h3>
                    <button className="text-primary font-label-md text-xs font-semibold hover:underline bg-transparent border-none cursor-pointer">Xem tất cả</button>
                  </div>
                  <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
                    {(!analyticsData?.recent_movements || analyticsData.recent_movements.length === 0) ? (
                      <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-60">
                        <Package className="mb-2 opacity-40" size={32} />
                        <p className="text-xs">Không có lịch sử biến động kho gần đây.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white border-b border-outline-variant/20 z-10">
                          <tr>
                            <th className="py-3 font-label-md text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">Sản phẩm</th>
                            <th className="py-3 font-label-md text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">SKU</th>
                            <th className="py-3 font-label-md text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">Loại</th>
                            <th className="py-3 font-label-md text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">Số lượng</th>
                            <th className="py-3 font-label-md text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">Thời gian</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {analyticsData.recent_movements.map((mov: any, index: number) => (
                            <tr key={index} className="hover:bg-surface-container-low transition-colors group">
                              <td className="py-4 font-semibold text-primary text-sm group-hover:text-primary transition-colors">{mov.product_name}</td>
                              <td className="py-4 text-on-surface-variant text-xs font-medium font-mono">{mov.sku}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 text-[10px] rounded border uppercase tracking-wider font-semibold ${
                                  mov.type === 'Nhập'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                    : 'bg-red-50 text-error border-red-100'
                                }`}>
                                  {mov.type}
                                </span>
                              </td>
                              <td className={`py-4 font-bold text-sm ${mov.type === 'Nhập' ? 'text-emerald-700' : 'text-primary'}`}>{mov.quantity}</td>
                              <td className="py-4 text-on-surface-variant/70 text-xs">{mov.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Incoming Shipments */}
                <div className="bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 h-[500px] flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline-sm text-lg text-primary font-bold font-serif mb-6">Lô hàng đang về</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[340px] pr-1">
                      {analyticsData?.incoming_shipments?.map((inc: any) => (
                        <div key={inc.id} className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/10 flex gap-4">
                          <div className="flex flex-col items-center justify-center bg-secondary-container/40 px-3 py-1 rounded text-primary min-w-[50px]">
                            <span className="text-[9px] uppercase font-bold tracking-wider">{inc.month}</span>
                            <span className="text-base font-bold">{inc.day}</span>
                          </div>
                          <div className="flex-grow text-left">
                            <p className="font-semibold text-primary text-xs leading-snug">{inc.name}</p>
                            <p className="text-[10px] text-on-surface-variant/70 mt-0.5">Nguồn: {inc.source}</p>
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                inc.status === 'Đang vận chuyển' ? 'bg-primary animate-pulse' : 'bg-[#8d9b91]'
                              }`}></span>
                              <span className="text-[9px] text-on-surface-variant italic font-semibold uppercase tracking-wider">{inc.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/10">
                    <button className="w-full py-2.5 bg-surface-container-low hover:bg-secondary-container/20 text-primary font-bold text-xs rounded transition-all cursor-pointer border-none uppercase tracking-wider font-sans">
                      Xem lịch trình chi tiết
                    </button>
                  </div>
                </div>
              </div>

              {/* Low Stock Items */}
              <div className="mt-12 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
                  <div>
                    <h3 className="font-headline-sm text-lg text-primary font-bold font-serif">Sản phẩm sắp hết hàng</h3>
                    <p className="font-body-md text-xs text-on-surface-variant opacity-75 mt-1">
                      Cần ưu tiên đặt hàng sớm để đảm bảo cung ứng đầy đủ.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('update')}
                    className="text-error hover:text-error/90 font-bold text-xs flex items-center gap-2 bg-transparent border-none cursor-pointer uppercase tracking-wider font-sans"
                  >
                    <ClipboardCheck size={16} />
                    Tạo phiếu nhập kho mới
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyticsData?.low_stock_items?.map((item: any, idx: number) => (
                    <div 
                      key={idx}
                      onClick={() => handleQuickUpdateTransition(item.sku)}
                      className="bg-white p-4 rounded-xl border border-outline-variant/30 flex gap-4 group hover:scale-[1.02] transition-all duration-500 hover:shadow-[0_24px_48px_-15px_rgba(68,42,34,0.06)] cursor-pointer"
                    >
                      <div className="w-20 h-20 rounded bg-surface-container-high overflow-hidden shrink-0">
                        <img 
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500" 
                          src={getImageUrl(item.image)} 
                          alt={item.name} 
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-primary text-sm line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-mono">SKU: {item.sku}</p>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-on-surface-variant font-medium">Tồn kho: {item.stock} / {item.total_capacity}</span>
                            <span className="text-error font-bold">{item.percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                            <div className="bg-error h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in duration-500 flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full text-left font-sans">
          {/* Left Panel (30% width) */}
          <aside className="w-full lg:w-[30%] flex flex-col gap-6">
            <div className="mb-2">
              <h1 className="font-headline-md text-headline-md text-primary mb-1">Phiếu Nhập Kho</h1>
              <p className="text-on-surface-variant font-caption text-caption uppercase tracking-widest">Hệ Thống Quản Trị Zen</p>
            </div>

            {/* General Info Card */}
            <section className="zen-card p-6 rounded-lg border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <span className="text-on-surface-variant font-label-md text-label-md">Thông Tin Chung</span>
              </div>
              <div className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption text-on-surface-variant">Mã Phiếu</label>
                  <input 
                    className="bg-surface-container-low border-0 border-b border-outline-variant/50 py-2 font-medium text-on-surface cursor-not-allowed font-mono focus:ring-0 w-full" 
                    disabled 
                    type="text" 
                    value={voucherCode}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption text-on-surface-variant">Nhân Viên Tiếp Nhận</label>
                  <input 
                    className="bg-surface-container-low border-0 border-b border-outline-variant/50 py-2 font-medium text-on-surface cursor-not-allowed focus:ring-0 w-full" 
                    disabled 
                    type="text" 
                    value="Minh Tâm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption text-on-surface-variant">Nhà Cung Cấp</label>
                  <div className="relative">
                    <select 
                      value={voucherSupplier}
                      onChange={(e) => setVoucherSupplier(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-2 pr-8 font-medium text-on-surface appearance-none focus:ring-0 cursor-pointer"
                    >
                      <option value="4">Xưởng may Khai Thanh (Quận Tân Phú)</option>
                      <option value="1">Xưởng May Liên Hoa</option>
                      <option value="2">Xưởng Lụa Bảo Lộc</option>
                      <option value="3">Vải Chàm Sapa</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-4 h-4" />
                  </div>
                </div>
              </div>
            </section>

            {/* Scanner Control Card */}
            <section className="zen-card p-6 rounded-lg border border-outline-variant/30 relative">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant font-label-md text-label-md">Thêm Sản Phẩm</span>
                </div>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><Search size={16} /></span>
                  <input 
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant py-3 pl-10 pr-10 transition-all duration-300 focus:border-primary text-sm focus:ring-0 font-medium placeholder:text-on-surface-variant/40" 
                    placeholder="Tìm kiếm sản phẩm..." 
                    type="text"
                    value={searchSku}
                    onChange={(e) => {
                      setSearchSku(e.target.value)
                      setShowProductDropdown(true)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchAndAdd(searchSku)}
                    onFocus={() => setShowProductDropdown(true)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
                
                {showProductDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40 bg-transparent" 
                      onClick={() => setShowProductDropdown(false)}
                    />
                    <div className="absolute left-6 right-6 z-50 mt-1 max-h-60 overflow-y-auto bg-white border border-outline-variant/30 rounded-lg shadow-xl divide-y divide-outline-variant/10 scrollbar-thin">
                      {(() => {
                        const dropdownItems: { sku: string; name: string; size: string; image: string }[] = []
                        allProducts.forEach(prod => {
                          const imageUrl = getImageUrl(prod.images?.[0]?.url)
                          const sizes = prod.variants?.filter((v: any) => v.name === 'Kích cỡ' || v.name === 'Size' || v.name === 'size') || []
                          if (sizes.length > 0) {
                            sizes.forEach((sv: any) => {
                              dropdownItems.push({
                                sku: sv.sku || `${prod.sku}-${sv.value}`,
                                name: prod.name,
                                size: sv.value,
                                image: imageUrl
                              })
                            })
                          } else {
                            dropdownItems.push({
                              sku: prod.sku || '',
                              name: prod.name,
                              size: 'Standard',
                              image: imageUrl
                            })
                          }
                        })

                        const filtered = dropdownItems.filter(item => 
                          !searchSku || 
                          item.sku.toLowerCase().includes(searchSku.toLowerCase()) || 
                          item.name.toLowerCase().includes(searchSku.toLowerCase())
                        )

                        if (filtered.length === 0) {
                          return (
                            <div className="p-4 text-center text-xs text-on-surface-variant opacity-60">
                              Không tìm thấy sản phẩm nào
                            </div>
                          )
                        }

                        return filtered.map(item => (
                          <div 
                            key={item.sku}
                            onClick={() => {
                              handleSearchAndAdd(item.sku)
                              setShowProductDropdown(false)
                            }}
                            className="flex items-center gap-3 p-3 hover:bg-surface-container-low cursor-pointer transition-colors"
                          >
                            <div className="w-10 h-10 rounded bg-secondary-fixed overflow-hidden flex-shrink-0 border border-outline-variant/10">
                              <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="font-semibold text-primary text-xs truncate">{item.name}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-[10px] text-on-surface-variant">
                                <span className="font-mono bg-surface-container px-1.5 py-0.5 rounded font-bold">{item.sku}</span>
                                <span>Size: {item.size}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      })()}
                    </div>
                  </>
                )}

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-[10px] rounded border border-red-200 leading-normal">
                    {error}
                  </div>
                )}
              </div>
            </section>
          </aside>

          {/* Right Panel (70% width) */}
          <div className="w-full lg:w-[70%] flex flex-col gap-6">
            {/* Main Data Grid */}
            <section className="zen-card rounded-lg border border-outline-variant/30 overflow-hidden flex-grow flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30">
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant w-12 text-center uppercase tracking-wider">STT</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Sản Phẩm</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">SKU</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Giá Nhập</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-20">Số Lượng</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant text-right uppercase tracking-wider">Thành Tiền</th>
                      <th className="py-4 px-6 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {voucherItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors group">
                        <td className="py-4 px-6 text-center text-on-surface-variant font-label-md">{String(index + 1).padStart(2, '0')}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded bg-secondary-fixed overflow-hidden flex-shrink-0 border border-outline-variant/10">
                              <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                            </div>
                            <div>
                              <p className="font-headline-sm text-[16px] text-primary">{item.name}</p>
                              <p className="font-caption text-caption text-on-surface-variant">Size: {item.size}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-label-md text-on-surface-variant font-mono">{item.sku}</td>
                        <td className="py-4 px-6">
                          <input 
                            className="w-32 bg-transparent border-0 border-b border-transparent focus:border-primary-container p-1 font-medium text-on-surface transition-all text-left focus:ring-0" 
                            type="number" 
                            value={item.cost_price}
                            min="0"
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0
                              setVoucherItems(prev => {
                                const copy = [...prev]
                                copy[index] = { ...copy[index], cost_price: val }
                                return copy
                              })
                            }}
                          />
                        </td>
                        <td className="py-4 px-6">
                          <input 
                            className="w-16 bg-transparent border-0 border-b border-transparent focus:border-primary-container p-1 font-medium text-on-surface transition-all text-center focus:ring-0" 
                            type="number" 
                            value={item.quantity}
                            min="1"
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0
                              setVoucherItems(prev => {
                                const copy = [...prev]
                                copy[index] = { ...copy[index], quantity: val }
                                return copy
                              })
                            }}
                          />
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-primary">
                          {(item.quantity * item.cost_price).toLocaleString('vi-VN')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button 
                            onClick={() => {
                              setVoucherItems(prev => prev.filter(x => x.id !== item.id))
                            }}
                            className="text-on-surface-variant/40 hover:text-error transition-colors p-1 bg-transparent border-none cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {voucherItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-20 text-center text-on-surface-variant opacity-60">
                          <Package className="mx-auto mb-2 opacity-30" size={32} />
                          <p className="text-xs">Chưa có sản phẩm nào trong phiếu nhập. Hãy quét/nhập SKU bên trái để thêm.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Footer Summary Card */}
            <footer className="zen-card p-8 rounded-lg border border-outline-variant/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {/* Left: Notes */}
                <div className="flex flex-col gap-3">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Ghi chú nhập kho</label>
                  <textarea 
                    value={voucherNotes}
                    onChange={(e) => setVoucherNotes(e.target.value)}
                    className="w-full h-32 bg-surface-container-low border border-outline-variant/30 rounded p-4 text-body-md focus:ring-1 focus:ring-primary-container resize-none leading-relaxed text-primary" 
                    placeholder="Nhập ghi chú hoặc hướng dẫn bảo quản đặc biệt cho lô hàng này..."
                  />
                </div>
                
                {/* Right: Financials & Actions */}
                <div className="flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant font-body-md">Tổng Số Lượng</span>
                      <span className="font-bold text-primary font-headline-sm text-[20px]">{totalQuantity} sản phẩm</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                      <span className="text-on-surface-variant font-body-lg">Tổng Giá Trị Nhập</span>
                      <span className="font-bold text-primary font-headline-md">{totalValue.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-8">
                    <button 
                      onClick={() => setVoucherItems([])}
                      className="flex-1 px-6 py-3 border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors duration-300 font-label-md text-label-md uppercase tracking-wider rounded cursor-pointer bg-transparent"
                    >
                      Hủy Bỏ
                    </button>
                    <button 
                      onClick={handleConfirmVoucher}
                      disabled={loading}
                      className="flex-[2] px-6 py-3 bg-primary-container text-on-primary-container hover:opacity-90 transition-opacity duration-300 font-label-md text-label-md uppercase tracking-widest rounded flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      {loading ? 'Đang xử lý...' : 'Xác Nhận Nhập Kho'}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 border border-white/10">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}
    </div>
  )
}
