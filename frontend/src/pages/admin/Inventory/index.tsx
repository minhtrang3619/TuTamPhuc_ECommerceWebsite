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
  ChevronDown,
  Printer,
  CheckCircle2,
  X
} from 'lucide-react'
import apiClient from '@/services/apiClient'
import { getImageUrl } from '@/utils/productMapper'

interface SelectedVariant {
  sku: string
  size: string
  color: string
  colorHex?: string
  quantity: number
}

interface ReceiptVoucherItem {
  id: string
  name: string
  image: string
  sku: string
  price: number
  cost_price: number
  note: string
  variants: SelectedVariant[]
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
  const [successVoucher, setSuccessVoucher] = useState<any>(null)

  // Loading and Error States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // @ts-ignore
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

        // 1. Get unique colors and sizes for the product (prevent duplicate color/size definitions)
        const rawVariants = foundProduct.variants || []
        const colorItems = rawVariants.filter((v: any) => v.name === 'Màu')
        const sizeItems = rawVariants.filter((v: any) => v.name === 'Kích cỡ' || v.name === 'Size' || v.name === 'size')

        const uniqueColorsMap = new Map<string, string>()
        colorItems.forEach((c: any) => {
          const parts = c.value.split('|')
          const name = parts[0].trim()
          const hex = parts.length === 2 ? parts[1].trim() : '#ece0dc'
          uniqueColorsMap.set(name, hex)
        })
        const colors = Array.from(uniqueColorsMap.entries()).map(([name, hex]) => ({ name, hex }))
        if (colors.length === 0) {
          colors.push({ name: 'Mặc định', hex: '#ece0dc' })
        }

        const uniqueSizesMap = new Map<string, string>()
        
        if (sizeItems.length > 0) {
          const standardSizes = ['S', 'M', 'L', 'XL']
          standardSizes.forEach(sz => {
            uniqueSizesMap.set(sz, `${foundProduct.sku}-${sz}`)
          })
        }

        sizeItems.forEach((s: any) => {
          const name = s.value.trim()
          const sku = s.sku || `${foundProduct.sku}-${name}`
          uniqueSizesMap.set(name, sku)
        })
        const sizes = Array.from(uniqueSizesMap.entries()).map(([name, sku]) => ({ name, sku }))
        if (sizes.length === 0) {
          sizes.push({ name: 'Standard', sku: foundProduct.sku || '' })
        }

        // 2. Generate Cartesian product of colors x sizes
        const productVariants: SelectedVariant[] = []
        colors.forEach((col: { name: string; hex: string }) => {
          sizes.forEach((sz: { name: string; sku: string }) => {
            let initialQty = 10
            if (foundVariant) {
              // If a specific variant SKU was scanned, set its qty to 10 and others to 0
              const isSizeMatch = sz.name === foundVariant.value
              initialQty = isSizeMatch ? 10 : 0
            }

            productVariants.push({
              sku: sz.sku,
              size: sz.name,
              color: col.name,
              colorHex: col.hex,
              quantity: initialQty
            })
          })
        })

        const existingIdx = clean.findIndex(x => x.sku.toLowerCase() === foundProduct.sku.toLowerCase())
        if (existingIdx > -1) {
          // Product already exists in the voucher, update the specific variant's quantity
          const updated = [...clean]
          const existingItem = { ...updated[existingIdx] }

          if (foundVariant) {
            existingItem.variants = existingItem.variants.map(v => {
              if (v.size === foundVariant.value) {
                return { ...v, quantity: v.quantity === 0 ? 10 : v.quantity + 10 }
              }
              return v
            })
          } else {
            // Parent product was scanned/selected again: increment all variants by 10
            existingItem.variants = existingItem.variants.map(v => ({
              ...v,
              quantity: v.quantity + 10
            }))
          }

          updated[existingIdx] = existingItem
          return updated
        } else {
          // Add new product
          const newVoucherItem: ReceiptVoucherItem = {
            id: `prod-${foundProduct.id}`,
            name: foundProduct.name,
            image: imageUrl,
            sku: foundProduct.sku || '',
            price: foundProduct.price || 0,
            cost_price: Math.round(foundProduct.price * 0.48),
            note: '',
            variants: productVariants
          }
          return [...clean, newVoucherItem]
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
    const itemsToProcess = voucherItems.flatMap(item =>
      item.variants
        .filter(v => v.quantity > 0)
        .map(v => ({
          sku: item.sku.trim(),
          quantity: v.quantity,
          cost_price: item.cost_price,
          color: v.color !== 'Mặc định' ? `${v.color} - Size ${v.size}` : `Size ${v.size}`
        }))
    )

    if (itemsToProcess.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm và nhập số lượng lớn hơn 0.')
      return
    }

    const invalidItem = itemsToProcess.find(
      item => !item.sku.trim() || item.quantity <= 0 || item.cost_price < 0
    )
    if (invalidItem) {
      alert('Vui lòng điền đầy đủ mã SKU, số lượng > 0 và giá vốn >= 0 cho tất cả các dòng sản phẩm.')
      return
    }

    const supplierMap: Record<string, string> = {
      '1': 'Xưởng May Liên Hoa',
      '2': 'Xưởng Lụa Bảo Lộc',
      '3': 'Vải Chàm Sapa',
      '4': 'Xưởng may Khai Thanh (Quận Tân Phú)'
    }
    const supplierName = supplierMap[voucherSupplier] || 'Xưởng may Khai Thanh (Quận Tân Phú)'

    // Auto-compile line notes into the main notes block
    let compiledNotes = voucherNotes || ""
    const lineNotes = voucherItems
      .filter(item => item.note?.trim())
      .map(item => `${item.name}: ${item.note}`)
      .join("; ")
    if (lineNotes) {
      compiledNotes = compiledNotes
        ? `${compiledNotes} | Chi tiết: ${lineNotes}`
        : `Chi tiết: ${lineNotes}`
    }

    setLoading(true)
    setError(null)
    try {
      const payload = {
        voucher_code: voucherCode,
        supplier: supplierName,
        recipient: "Minh Tâm",
        notes: compiledNotes,
        items: itemsToProcess
      }

      await apiClient.post('/products/receive-stock', payload)

      const completedVoucher = {
        voucherCode,
        supplierName,
        recipient: "Minh Tâm",
        totalQuantity,
        totalValue,
        items: itemsToProcess,
        date: new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      }
      setSuccessVoucher(completedVoucher)

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
  const totalQuantity = voucherItems.reduce(
    (sum, item) => sum + item.variants.reduce((vSum, v) => vSum + v.quantity, 0),
    0
  )
  const totalValue = voucherItems.reduce(
    (sum, item) => sum + item.variants.reduce((vSum, v) => vSum + (v.quantity * item.cost_price), 0),
    0
  )

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-outline-variant/30 mb-6">
        <button
          className={`py-3 font-label-md text-sm transition-colors border-b-2 font-semibold ${activeTab === 'overview'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan kho
        </button>
        <button
          className={`py-3 font-label-md text-sm transition-colors border-b-2 font-semibold ${activeTab === 'update'
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
                                <span className={`px-2 py-0.5 text-[10px] rounded border uppercase tracking-wider font-semibold ${mov.type === 'Nhập'
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
                              <span className={`w-1.5 h-1.5 rounded-full ${inc.status === 'Đang vận chuyển' ? 'bg-primary animate-pulse' : 'bg-[#8d9b91]'
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
        <div className="animate-in fade-in duration-500 flex flex-col lg:flex-row gap-6 w-full text-left font-sans">
          {/* Left Panel (25% width) */}
          <aside className="w-full lg:w-[25%] 2xl:w-[20%] flex flex-col gap-6">
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

                  {showProductDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setShowProductDropdown(false)}
                      />
                      <div className="absolute left-0 right-0 bottom-full mb-1 z-50 max-h-60 overflow-y-auto bg-white border border-outline-variant/30 rounded-lg shadow-xl divide-y divide-outline-variant/10 scrollbar-thin">
                        {(() => {
                          const filtered = allProducts.filter(prod =>
                            !searchSku ||
                            (prod.sku || '').toLowerCase().includes(searchSku.toLowerCase()) ||
                            (prod.name || '').toLowerCase().includes(searchSku.toLowerCase())
                          )

                          if (filtered.length === 0) {
                            return (
                              <div className="p-4 text-center text-xs text-on-surface-variant opacity-60">
                                Không tìm thấy sản phẩm nào
                              </div>
                            )
                          }

                          return filtered.map(item => {
                            const imageUrl = getImageUrl(item.images?.[0]?.url)
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  handleSearchAndAdd(item.sku)
                                  setShowProductDropdown(false)
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-surface-container-low cursor-pointer transition-colors"
                              >
                                <div className="w-10 h-10 rounded bg-secondary-fixed overflow-hidden flex-shrink-0 border border-outline-variant/10">
                                  <img className="w-full h-full object-cover" src={imageUrl} alt={item.name} />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <p className="font-semibold text-primary text-xs truncate">{item.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-on-surface-variant">
                                    <span className="font-mono bg-surface-container px-1.5 py-0.5 rounded font-bold">{item.sku}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-[10px] rounded border border-red-200 leading-normal">
                    {error}
                  </div>
                )}
              </div>
            </section>
          </aside>

          {/* Right Panel (75% width) */}
          <div className="w-full lg:w-[75%] 2xl:w-[80%] flex flex-col gap-6">
            {/* Main Data Grid */}
            <section className="zen-card rounded-lg border border-outline-variant/30 overflow-hidden flex-grow flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30">
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant w-12 text-center uppercase tracking-wider">STT</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-[18%]">Sản Phẩm</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-[12%]">Giá Nhập</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-[30%]">Phân Loại &amp; Số Lượng</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-[25%]">Ghi Chú</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant text-right uppercase tracking-wider w-[10%]">Thành Tiền</th>
                      <th className="py-4 px-6 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {voucherItems.map((item, index) => {
                      // Group variants by color
                      const colorGroups: Record<string, { colorHex?: string, list: typeof item.variants }> = {}
                      item.variants.forEach(v => {
                        if (!colorGroups[v.color]) {
                          colorGroups[v.color] = { colorHex: v.colorHex, list: [] }
                        }
                        colorGroups[v.color].list.push(v)
                      })

                      const totalQty = item.variants.reduce((sum, v) => sum + v.quantity, 0)
                      const productTotalValue = totalQty * item.cost_price

                      return (
                        <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors group">
                          {/* STT */}
                          <td className="py-4 px-6 text-center text-on-surface-variant font-label-md align-middle">{String(index + 1).padStart(2, '0')}</td>

                          {/* Product Info */}
                          <td className="py-4 px-6 align-middle">
                            <div className="flex gap-3 items-center">
                              <div className="w-12 h-12 rounded bg-secondary-fixed overflow-hidden flex-shrink-0 border border-outline-variant/10">
                                <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-primary text-xs line-clamp-2 leading-snug">{item.name}</p>
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  <span className="font-mono text-[9px] text-on-surface-variant/80 font-bold">Mã: {item.sku}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Cost Price Column */}
                          <td className="py-4 px-6 align-middle">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <input
                                  className="w-20 bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary p-0.5 font-bold text-primary focus:ring-0 text-xs font-mono text-left"
                                  type="number"
                                  value={item.cost_price}
                                  min="0"
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0
                                    setVoucherItems(prev => prev.map(p => p.id === item.id ? { ...p, cost_price: val } : p))
                                  }}
                                />
                                <span className="text-xs text-primary font-bold">₫</span>
                              </div>
                              <span className="text-[9px] text-on-surface-variant/70 italic">(Gốc 48%: {Math.round(item.price * 0.48).toLocaleString('vi-VN')}₫)</span>
                            </div>
                          </td>

                          {/* Varieties & Quantities Grid */}
                          <td className="py-4 px-6 align-middle">
                            {(() => {
                              const uniqueSizes = Array.from(new Set(item.variants.map(v => v.size)))
                              const uniqueColors = Array.from(new Set(item.variants.map(v => v.color)))

                              // Case 1: Simple product (No colors and no sizes)
                              if (uniqueColors.length === 1 && uniqueColors[0] === 'Mặc định' && uniqueSizes.length === 1 && uniqueSizes[0] === 'Standard') {
                                return (
                                  <div className="flex items-center gap-1.5 justify-center py-1">
                                    <span className="text-xs text-on-surface-variant font-medium">Số lượng:</span>
                                    <input 
                                      className="w-16 bg-transparent border-0 border-b border-outline-variant/30 py-0.5 px-1 font-bold text-center focus:ring-0 text-xs font-mono" 
                                      type="number"
                                      value={item.variants[0].quantity}
                                      min="0"
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0
                                        setVoucherItems(prev => prev.map(pItem => {
                                          if (pItem.id !== item.id) return pItem
                                          const updatedVariants = [{ ...pItem.variants[0], quantity: val }]
                                          return { ...pItem, variants: updatedVariants }
                                        }))
                                      }}
                                    />
                                  </div>
                                )
                              }

                              // Case 2: Sizes only (No colors)
                              if (uniqueColors.length === 1 && uniqueColors[0] === 'Mặc định') {
                                return (
                                  <div className="flex flex-wrap gap-x-3 gap-y-2 py-1 justify-start">
                                    {item.variants.map((v, vIdx) => (
                                      <div key={v.sku} className="flex items-center gap-1 bg-surface-container-lowest px-1.5 py-0.5 rounded border border-outline-variant/10">
                                        <span className="text-[10px] text-on-surface-variant/80 font-bold min-w-[12px] text-center">{v.size}</span>
                                        <input 
                                          className={`w-9 bg-transparent border-0 border-b py-0.5 px-0.5 font-bold text-center focus:ring-0 text-xs font-mono transition-all ${
                                            v.quantity > 0 
                                              ? 'border-primary text-primary bg-primary/5 font-extrabold' 
                                              : 'border-outline-variant/20 text-on-surface-variant/30'
                                          }`}
                                          type="number"
                                          value={v.quantity}
                                          min="0"
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0
                                            setVoucherItems(prev => prev.map(pItem => {
                                              if (pItem.id !== item.id) return pItem
                                              const updatedVariants = [...pItem.variants]
                                              updatedVariants[vIdx] = { ...updatedVariants[vIdx], quantity: val }
                                              return { ...pItem, variants: updatedVariants }
                                            }))
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )
                              }

                              // Case 3: Color variants present (with or without sizes) - render structured grid
                              return (
                                <div className="overflow-x-auto min-w-[240px] max-w-[400px] border border-outline-variant/15 rounded-lg p-2.5 bg-surface-container-lowest/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.01)] scrollbar-thin">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="border-b border-outline-variant/20">
                                        <th className="pb-1.5 px-1 font-semibold text-on-surface-variant/70 text-[9px] uppercase tracking-wider">Màu</th>
                                        {uniqueSizes.map(sz => (
                                          <th key={sz} className="pb-1.5 px-1 text-center font-bold text-on-surface-variant/70 text-[9px] uppercase tracking-wider min-w-[36px]">
                                            {sz !== 'Standard' ? sz : 'Std'}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {uniqueColors.map(colorName => {
                                        const colorHex = item.variants.find(v => v.color === colorName)?.colorHex
                                        return (
                                          <tr key={colorName} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/10 transition-colors">
                                            <td className="py-1.5 px-1 font-semibold text-primary text-[10px] flex items-center gap-1.5 min-w-[70px]">
                                              {colorHex && (
                                                <span 
                                                  className="w-2.5 h-2.5 rounded-full border border-outline-variant/30 flex-shrink-0"
                                                  style={{ backgroundColor: colorHex }}
                                                />
                                              )}
                                              <span className="truncate max-w-[60px]" title={colorName}>{colorName}</span>
                                            </td>
                                            {uniqueSizes.map(sz => {
                                              const vIdx = item.variants.findIndex(x => x.color === colorName && x.size === sz)
                                              if (vIdx === -1) return <td key={sz} className="py-1.5 px-1 text-center text-on-surface-variant/10">-</td>
                                              const v = item.variants[vIdx]
                                              return (
                                                <td key={sz} className="py-1.5 px-0.5 text-center">
                                                  <input 
                                                    className={`w-9 bg-transparent border-0 border-b py-0.5 px-0.5 font-bold text-center focus:ring-0 text-xs font-mono transition-all ${
                                                      v.quantity > 0 
                                                        ? 'border-primary text-primary bg-primary/5 font-extrabold' 
                                                        : 'border-outline-variant/20 text-on-surface-variant/30'
                                                    }`}
                                                    type="number"
                                                    value={v.quantity}
                                                    min="0"
                                                    onChange={(e) => {
                                                      const val = parseInt(e.target.value) || 0
                                                      setVoucherItems(prev => prev.map(pItem => {
                                                        if (pItem.id !== item.id) return pItem
                                                        const updatedVariants = [...pItem.variants]
                                                        updatedVariants[vIdx] = { ...updatedVariants[vIdx], quantity: val }
                                                        return { ...pItem, variants: updatedVariants }
                                                      }))
                                                    }}
                                                  />
                                                </td>
                                              )
                                            })}
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )
                            })()}
                          </td>

                          {/* Note Input */}
                          <td className="py-4 px-6 align-middle">
                            <textarea
                              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded focus:border-primary p-2 font-normal text-on-surface focus:ring-1 focus:ring-primary/20 text-xs resize-y min-h-[60px]"
                              value={item.note || ''}
                              placeholder="Ghi chú dòng..."
                              rows={2}
                              onChange={(e) => {
                                const val = e.target.value
                                setVoucherItems(prev => prev.map(p => p.id === item.id ? { ...p, note: val } : p))
                              }}
                            />
                          </td>

                          {/* Product Total Value */}
                          <td className="py-4 px-6 text-right font-semibold text-primary align-middle font-mono text-sm">
                            {productTotalValue.toLocaleString('vi-VN')} ₫
                          </td>

                          {/* Delete Action */}
                          <td className="py-4 px-6 text-center align-middle">
                            <button
                              onClick={() => {
                                setVoucherItems(prev => prev.filter(x => x.id !== item.id))
                              }}
                              className="text-on-surface-variant/40 hover:text-error transition-colors p-1 bg-transparent border-none cursor-pointer"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}

                    {voucherItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-20 text-center text-on-surface-variant opacity-60">
                          <Package className="mx-auto mb-2 opacity-30" size={32} />
                          <p className="text-xs">Chưa có sản phẩm nào trong phiếu nhập. Hãy tìm kiếm sản phẩm bên trái để thêm.</p>
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

      {/* Success Modal */}
      {successVoucher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-emerald-50 p-6 flex flex-col items-center justify-center border-b border-emerald-100 relative">
              <button 
                onClick={() => setSuccessVoucher(null)}
                className="absolute top-4 right-4 p-2 text-emerald-700 hover:bg-emerald-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-emerald-800 text-center">Nhập Kho Thành Công!</h2>
              <p className="text-emerald-600 text-sm mt-1">Phiếu nhập kho đã được lưu vào hệ thống an toàn.</p>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm">
                <div>
                  <p className="text-on-surface-variant mb-1 font-medium">Mã Phiếu</p>
                  <p className="font-bold text-primary font-mono">{successVoucher.voucherCode}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant mb-1 font-medium">Thời Gian</p>
                  <p className="font-bold text-primary">{successVoucher.date}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant mb-1 font-medium">Nhà Cung Cấp</p>
                  <p className="font-bold text-primary">{successVoucher.supplierName}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant mb-1 font-medium">Người Nhập</p>
                  <p className="font-bold text-primary">{successVoucher.recipient}</p>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-6 flex items-center justify-between border border-outline-variant/30">
                <div className="flex flex-col items-center flex-1 border-r border-outline-variant/30">
                  <span className="text-on-surface-variant text-xs uppercase tracking-wider mb-2 font-semibold">Tổng Số Lượng</span>
                  <span className="text-2xl font-bold text-primary">{successVoucher.totalQuantity} <span className="text-sm font-normal text-on-surface-variant">sp</span></span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-on-surface-variant text-xs uppercase tracking-wider mb-2 font-semibold">Tổng Giá Trị</span>
                  <span className="text-2xl font-bold text-emerald-600 font-mono">{successVoucher.totalValue.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-surface-container-lowest p-6 border-t border-outline-variant/20 flex items-center gap-4 justify-end">
              <button 
                onClick={() => {
                  window.print()
                }}
                className="px-6 py-2.5 border border-outline-variant text-on-surface hover:bg-surface-container-low rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer bg-white"
              >
                <Printer size={16} />
                In Phiếu
              </button>
              <button 
                onClick={() => setSuccessVoucher(null)}
                className="px-8 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-lg font-bold text-sm transition-colors cursor-pointer border-none shadow-md shadow-primary/20"
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
