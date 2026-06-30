import { useState, useMemo, useEffect } from 'react'
import {
  Gift,
  Trash2,
  Edit3,
  Search,
  QrCode,
  Share2,
  Download,
  List,
  Play,
  Pause,
  Image as ImageIcon,
  ChevronDown,
  Check
} from 'lucide-react'
import { promotionService, PromotionItem } from '@/services/promotionService'
import { productService } from '@/services/productService'

interface PartnerQR {
  partnerName: string
  code: string
  discount: string
  qrUrl: string
}

export default function AdminPromotions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [promotions, setPromotions] = useState<PromotionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form Fields for Create New Voucher
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<'percentage' | 'fixed' | 'free_shipping'>('percentage')
  const [value, setValue] = useState<number>(0)
  const [minOrder, setMinOrder] = useState<number>(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [applicableProducts, setApplicableProducts] = useState<string[]>([])
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false)

  const [products, setProducts] = useState<any[]>([])

  // Edit Mode state
  const [editingPromoId, setEditingPromoId] = useState<string | number | null>(null)

  // Partner QR Code generation state
  const [partners, setPartners] = useState<PartnerQR[]>([])
  const [newPartnerName, setNewPartnerName] = useState('')
  const [newPartnerCode, setNewPartnerCode] = useState('')
  const [newPartnerDiscount, setNewPartnerDiscount] = useState('10%')
  const [generatedQRUrl, setGeneratedQRUrl] = useState<string | null>(null)
  const [lastGeneratedCode, setLastGeneratedCode] = useState('')
  const [partnerSuccessMsg, setPartnerSuccessMsg] = useState<string | null>(null)
  const [partnerErrorMsg, setPartnerErrorMsg] = useState<string | null>(null)
  const [promoSuccessMsg, setPromoSuccessMsg] = useState<string | null>(null)
  const [promoErrorMsg, setPromoErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    const partnerPromos = promotions.filter(p => p.name.startsWith('Mã đối tác:'))
    let siteUrl = window.location.origin
    if (siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')) {
      siteUrl = 'https://tutamphuc.vn' // Replace with your production domain
    }
    const mappedPartners = partnerPromos.map(p => {
      const partnerName = p.name.replace('Mã đối tác: ', '')
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${siteUrl}/?promo=${p.code}`)}`

      let discountText = `Giảm ${p.value}%`
      if (p.type === 'fixed') {
        discountText = `Giảm ${p.value.toLocaleString()} ₫`
      } else if (p.type === 'free_shipping') {
        discountText = `Freeship`
      }

      return {
        partnerName,
        code: p.code,
        discount: discountText,
        qrUrl
      }
    })
    setPartners(mappedPartners)
  }, [promotions])

  // Download QR Code helper
  const handleDownloadQR = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${filename}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error("Lỗi khi tải ảnh QR:", err)
      window.open(url, '_blank')
    }
  }

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const data = await promotionService.getPromotions({ limit: 100 })
      setPromotions(data.items)
    } catch (err) {
      console.error(err)
      setError('Lỗi khi tải dữ liệu ưu đãi.')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const data = await productService.getAll({ page: 1, page_size: 1000, status: 'all' } as any)
      // Sort by stock descending (highest stock = slow selling)
      const sortedProducts = (data.items || []).sort((a, b) => (b.stock || 0) - (a.stock || 0))
      setProducts(sortedProducts)
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm', err)
    }
  }

  useEffect(() => {
    fetchPromotions()
    fetchProducts()
  }, [])

  const formatValue = (promo: PromotionItem) => {
    if (promo.type === 'percentage') {
      return `Giảm ${promo.value}%`
    } else if (promo.type === 'fixed') {
      return `-${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.value)}`
    } else {
      return 'Miễn phí vận chuyển'
    }
  }

  // Handle Save (Create / Update)
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim() || !name.trim()) {
      alert('Vui lòng nhập Mã giảm giá và Tên chương trình.')
      return
    }

    try {
      if (editingPromoId) {
        await promotionService.updatePromotion(editingPromoId, {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          type,
          value: type === 'free_shipping' ? 0 : value,
          min_order: minOrder,
          start_date: startDate || new Date().toISOString().split('T')[0],
          end_date: endDate || null,
          applicable_products: applicableProducts.length > 0 ? applicableProducts.join(',') : null
        })
      } else {
        await promotionService.createPromotion({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          type,
          value: type === 'free_shipping' ? 0 : value,
          min_order: minOrder,
          start_date: startDate || new Date().toISOString().split('T')[0],
          end_date: endDate || null,
          applicable_products: applicableProducts.length > 0 ? applicableProducts.join(',') : null
        })
      }

      await fetchPromotions()

      setPromoSuccessMsg('Đã lưu mã giảm giá thành công!')
      setPromoErrorMsg(null)
      setTimeout(() => setPromoSuccessMsg(null), 5000)
      
      // Reset Form fields
      setEditingPromoId(null)
      setCode('')
      setName('')
      setType('percentage')
      setValue(0)
      setMinOrder(0)
      setStartDate('')
      setEndDate('')
      setApplicableProducts([])
    } catch (err: any) {
      setPromoErrorMsg(err?.response?.data?.detail || 'Lỗi khi lưu mã giảm giá')
      setPromoSuccessMsg(null)
    }
  }

  // Prepare edit
  const handleEditPromo = (promo: PromotionItem) => {
    setEditingPromoId(promo.id)
    setCode(promo.code)
    setName(promo.name)
    setType(promo.type)
    setValue(promo.value)
    setMinOrder(promo.min_order)
    setStartDate(promo.start_date)
    setEndDate(promo.end_date || '')
    setApplicableProducts(promo.applicable_products ? promo.applicable_products.split(',') : [])
  }

  // Toggle status (Active / Paused)
  const handleToggleStatus = async (promo: PromotionItem) => {
    try {
      await promotionService.updatePromotion(promo.id, {
        status: promo.status === 'active' ? 'paused' : 'active'
      })
      await fetchPromotions()
    } catch (err) {
      alert('Lỗi cập nhật trạng thái')
    }
  }

  // Delete Promo
  const handleDeletePromo = async (promoId: string | number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mã ưu đãi này?')) {
      try {
        await promotionService.deletePromotion(promoId)
        await fetchPromotions()
      } catch (err) {
        alert('Lỗi khi xóa')
      }
    }
  }

  // Generate QR Code for Affiliate partner
  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPartnerName.trim()) {
      alert('Vui lòng nhập tên đối tác / Chùa.')
      return
    }

    const cleanCode = newPartnerCode.trim()
      ? newPartnerCode.trim().toUpperCase()
      : `TTP-${newPartnerName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '').slice(0, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`

    // Parse discount value and type
    let discountVal = parseFloat(newPartnerDiscount.replace(/[^0-9.]/g, '')) || 10
    let discountType: 'percentage' | 'fixed' = 'percentage'
    if (newPartnerDiscount.includes('k') || newPartnerDiscount.includes('đ') || discountVal > 100) {
      discountType = 'fixed'
      if (newPartnerDiscount.includes('k')) {
        discountVal *= 1000
      }
    }

    try {
      await promotionService.createPromotion({
        code: cleanCode,
        name: `Mã đối tác: ${newPartnerName}`,
        type: discountType,
        value: discountVal,
        min_order: 0,
        start_date: new Date().toISOString().split('T')[0],
        end_date: null,
        applicable_products: null
      })

      let siteUrl = window.location.origin
      if (siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1')) {
        siteUrl = 'https://tutamphuc.vn' // Replace with your production domain
      }
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${siteUrl}/?promo=${cleanCode}`)}`

      setGeneratedQRUrl(qrUrl)
      setLastGeneratedCode(cleanCode)
      setNewPartnerName('')
      setNewPartnerCode('')
      setNewPartnerDiscount('10%')

      await fetchPromotions()
      setPartnerSuccessMsg(`Đã tạo thành công mã liên kết đối tác: ${cleanCode}`)
      setPartnerErrorMsg(null)
      setTimeout(() => setPartnerSuccessMsg(null), 5000)
    } catch (err: any) {
      setPartnerErrorMsg(err?.response?.data?.detail || 'Lỗi khi tạo mã liên kết đối tác')
      setPartnerSuccessMsg(null)
    }
  }

  // Filter promotions list
  const filteredPromotions = useMemo(() => {
    return promotions.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.code.toLowerCase().includes(searchTerm.toLowerCase())

      if (statusFilter === 'active') return matchesSearch && p.status === 'active'
      if (statusFilter === 'paused') return matchesSearch && p.status === 'paused'
      return matchesSearch
    })
  }, [promotions, searchTerm, statusFilter])

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 md:p-6 font-sans">

      {/* Header section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e5e1de] pb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-primary mb-2 flex items-center gap-2">
            <Gift className="text-primary" size={28} /> Quản lý Khuyến mãi
          </h2>
          <p className="text-xs text-on-surface-variant font-medium max-w-2xl">
            Quản lý các chương trình ưu đãi, mã giảm giá và đối tác liên kết để tối ưu hóa chiến dịch marketing.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-[#442a22]/5 rounded-xs text-xs font-bold uppercase tracking-wider transition-colors shrink-0">
          <Download size={14} /> Xuất báo cáo
        </button>
      </header>

      {/* Top Grid: New Code Form & Affiliate QR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Form: Create New Voucher */}
        <section className="lg:col-span-7 bg-white rounded-sm p-6 border border-outline-variant/30 flex flex-col gap-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
            <h3 className="font-serif text-base font-bold text-primary">
              {editingPromoId ? 'Sửa thông tin mã' : 'Tạo mã ưu đãi mới'}
            </h3>
          </div>

          {promoSuccessMsg && (
            <div className="p-3 bg-[#e1f3d8] border border-[#a2d88a] rounded-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <div className="w-5 h-5 rounded-full bg-[#67c23a] flex items-center justify-center shrink-0">
                <Check className="text-white" size={12} strokeWidth={3} />
              </div>
              <p className="text-xs text-[#4d5c3d] font-bold">{promoSuccessMsg}</p>
            </div>
          )}
          
          {promoErrorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <div className="text-red-500 shrink-0 font-bold">⚠️</div>
              <p className="text-xs text-red-700 font-bold">{promoErrorMsg}</p>
            </div>
          )}

          <form onSubmit={handleSavePromo} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">Mã giảm giá</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Vd: ANLAC20"
                  className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">Tên chương trình</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Vd: Tri ân khách hàng mới"
                  className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">Loại giảm giá</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                >
                  <option value="percentage">Phần trăm (%)</option>
                  <option value="fixed">Số tiền cố định (VND)</option>
                  <option value="free_shipping">Miễn phí vận chuyển</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">Giá trị giảm</label>
                <div className="relative">
                  <input
                    type="number"
                    disabled={type === 'free_shipping'}
                    value={value || ''}
                    onChange={(e) => setValue(Number(e.target.value))}
                    placeholder="Vd: 20"
                    className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none pr-8 disabled:bg-neutral-50"
                  />
                  <span className="absolute right-3 top-2 text-[#827470] text-xs font-bold">
                    {type === 'percentage' ? '%' : 'đ'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">Đơn hàng tối thiểu</label>
                <div className="relative">
                  <input
                    type="number"
                    value={minOrder || ''}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    placeholder="Vd: 300000"
                    className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none pr-8"
                  />
                  <span className="absolute right-3 top-2 text-[#827470] text-xs font-bold">đ</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">Sản phẩm áp dụng</label>
              <div
                className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer flex justify-between items-center"
                onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
              >
                <span className="truncate pr-4 text-[#827470]">
                  {applicableProducts.length > 0
                    ? `Đã chọn ${applicableProducts.length} sản phẩm`
                    : 'Để trống nếu áp dụng cho tất cả'}
                </span>
                <ChevronDown size={14} className="text-[#827470] shrink-0" />
              </div>

              {isProductDropdownOpen && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-[#d4c3be] rounded-xs shadow-lg max-h-60 overflow-y-auto">
                  {products.map(p => {
                    const isSelected = applicableProducts.includes(p.id.toString())
                    return (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 px-3 py-2 hover:bg-[#fafaf9] cursor-pointer text-xs"
                        onClick={() => {
                          const idStr = p.id.toString()
                          if (isSelected) {
                            setApplicableProducts(prev => prev.filter(id => id !== idStr))
                          } else {
                            setApplicableProducts(prev => [...prev, idStr])
                          }
                        }}
                      >
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary' : 'border-[#d4c3be]'}`}>
                          {isSelected && <Check size={12} className="text-white" />}
                        </div>
                        <span className="truncate flex-1">{p.name}</span>
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 border border-amber-200">Tồn: {p.stock || 0}</span>
                      </div>
                    )
                  })}
                  {products.length === 0 && (
                    <div className="px-3 py-2 text-xs text-[#827470] italic text-center">Không có sản phẩm nào</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">Ngày kết thúc (Để trống nếu Vô hạn)</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-3">
              {editingPromoId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPromoId(null)
                    setCode('')
                    setName('')
                    setType('percentage')
                    setValue(0)
                    setMinOrder(0)
                    setStartDate('')
                    setEndDate('')
                    setApplicableProducts([])
                  }}
                  className="px-4 py-2 border border-[#d4c3be] text-[#5d4037] text-[10px] uppercase font-bold tracking-wider rounded-xs hover:bg-[#eeeeee]/50 cursor-pointer"
                >
                  Hủy sửa
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white text-[10px] uppercase font-bold tracking-wider rounded-xs hover:bg-[#2c160e] cursor-pointer shadow-md transition-colors"
              >
                {editingPromoId ? 'Cập Nhật & Lưu' : 'Lưu và Kích hoạt mã'}
              </button>
            </div>
          </form>
        </section>

        {/* Affiliate QR Section */}
        <section className="lg:col-span-5 bg-white rounded-sm p-6 border border-outline-variant/30 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
              <h3 className="font-serif text-base font-bold text-primary">Mã liên kết đối tác</h3>
            </div>

            {partnerSuccessMsg && (
              <div className="mb-4 p-3 bg-[#e1f3d8] border border-[#a2d88a] rounded-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-[#67c23a] flex items-center justify-center shrink-0">
                  <Check className="text-white" size={12} strokeWidth={3} />
                </div>
                <p className="text-xs text-[#4d5c3d] font-bold">{partnerSuccessMsg}</p>
              </div>
            )}
            
            {partnerErrorMsg && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xs flex items-start gap-2 animate-in fade-in slide-in-from-top-2 shadow-sm">
                <div className="text-red-500 shrink-0 font-bold">⚠️</div>
                <p className="text-xs text-red-700 font-bold">{partnerErrorMsg}</p>
              </div>
            )}

            <form onSubmit={handleGenerateQR} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold">Tên đối tác / Tên Chùa</label>
                <input
                  type="text"
                  required
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  placeholder="Vd: Chùa Hoằng Pháp"
                  className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold">Mã tự tạo</label>
                  <input
                    type="text"
                    value={newPartnerCode}
                    onChange={(e) => setNewPartnerCode(e.target.value)}
                    placeholder="Vd: CHUAHONGP26"
                    className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold">Mức giảm</label>
                  <input
                    type="text"
                    value={newPartnerDiscount}
                    onChange={(e) => setNewPartnerDiscount(e.target.value)}
                    placeholder="Vd: Giảm 15% hoặc 20%"
                    className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#442a22] hover:bg-[#2c160e] text-white text-[10px] uppercase font-bold tracking-wider rounded-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <QrCode size={14} /> Tạo mã QR liên kết
              </button>
            </form>
          </div>

          <div className="pt-6 border-t border-[#e5e1de]/60 text-center mt-6 flex flex-col items-center justify-center">
            {generatedQRUrl || partners.length > 0 ? (
              <div className="space-y-3 w-full">
                <div className="w-32 h-32 mx-auto bg-white rounded-xs flex items-center justify-center border border-[#d4c3be] p-2">
                  <img src={generatedQRUrl || partners[0].qrUrl} alt="QR Code Preview" className="w-full h-full" />
                </div>
                <p className="text-[10px] text-primary font-bold">
                  MÃ: <span className="font-mono bg-neutral-100 px-2 py-0.5 rounded text-sm">{generatedQRUrl ? lastGeneratedCode : partners[0].code}</span>
                </p>
                <p className="text-[9px] text-[#827470] uppercase font-bold">
                  {generatedQRUrl ? 'Quét mã QR để kích hoạt liên kết mua sắm' : `Áp dụng: ${partners[0].discount}`}
                </p>
                <button
                  type="button"
                  onClick={() => handleDownloadQR(generatedQRUrl || partners[0].qrUrl, generatedQRUrl ? lastGeneratedCode : partners[0].code)}
                  className="px-4 py-1.5 bg-[#442a22] text-white text-[9px] uppercase font-bold tracking-wider rounded-xs hover:bg-[#2c160e] flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <Download size={10} /> Tải ảnh mã QR
                </button>
              </div>
            ) : (
              <>
                <div className="w-32 h-32 mx-auto mb-4 bg-neutral-50 rounded-xs flex items-center justify-center border-2 border-dashed border-[#d4c3be]">
                  <ImageIcon size={32} className="text-neutral-300 animate-pulse" />
                </div>
                <p className="text-[10px] text-[#827470] font-medium italic">Mã QR tự động sẽ hiển thị tại đây sau khi tạo</p>
              </>
            )}
          </div>
        </section>
      </div>

      {/* Active Promo List Section */}
      <section className="bg-white border border-outline-variant/30 rounded-sm overflow-hidden shadow-xs">
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 bg-[#fafaf9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <List size={18} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-primary">Danh sách mã đang hoạt động</h3>
              <p className="text-[10px] text-[#827470] font-semibold uppercase tracking-wider mt-0.5">
                Chỉnh sửa hoặc bật/tắt hoạt động của các chương trình khuyến mãi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Tìm mã hoặc tên ưu đãi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-[#d4c3be] rounded-xs py-1.5 px-3 pl-9 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
              />
              <Search className="absolute left-3 top-2 text-[#827470]" size={14} />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#d4c3be] rounded-xs py-1.5 px-3 text-xs outline-none cursor-pointer focus:ring-1 focus:ring-primary"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang chạy</option>
              <option value="paused">Tạm dừng</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f4f2f0]/60 border-b border-outline-variant/30 text-[10px] uppercase font-bold text-[#827470] tracking-wider">
                <th className="px-6 py-4">Mã / Tên</th>
                <th className="px-6 py-4">Loại giảm</th>
                <th className="px-6 py-4 text-center">Lượt dùng</th>
                <th className="px-6 py-4">Thời hạn</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e1de]/30">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#827470] font-medium">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-500 font-medium">
                    {error}
                  </td>
                </tr>
              ) : filteredPromotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-[#fafaf9] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="p-2 bg-[#f4f2f0] text-primary font-mono font-bold rounded-xs text-[11px] border border-[#e5e1de]">
                        {promo.code}
                      </span>
                      <div>
                        <p className="font-semibold text-[#2c160e]">{promo.name}</p>
                        <p className="text-[10px] text-[#827470]">Yêu cầu tối thiểu: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.min_order)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 bg-[#dee7c0] text-[#5f6849] rounded-xs text-[10px] font-bold uppercase tracking-wider border border-[#dee7c0]">
                      {formatValue(promo)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-serif text-base font-bold text-primary">{promo.uses}</span>
                      <span className="text-[9px] text-[#827470] uppercase font-bold">Lượt sử dụng</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant font-medium">
                    {promo.end_date ? (
                      <div className="font-mono">
                        <p>{promo.start_date}</p>
                        <p className="text-[#827470] text-[10px]">đến {promo.end_date}</p>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-0.5 rounded-xs">Vô thời hạn</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleToggleStatus(promo)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border inline-flex items-center gap-1 ${promo.status === 'active'
                        ? 'bg-[#e1f3d8]/60 text-[#67c23a] border-emerald-300 hover:bg-[#e1f3d8]'
                        : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                        }`}
                      title="Click để thay đổi nhanh trạng thái"
                    >
                      {promo.status === 'active' ? (
                        <>
                          <Play size={10} className="fill-[#67c23a]" /> Đang chạy
                        </>
                      ) : (
                        <>
                          <Pause size={10} className="fill-amber-700" /> Tạm dừng
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleEditPromo(promo)}
                        className="p-2 border border-[#d4c3be]/60 text-primary hover:bg-[#f4f2f0] rounded-xs cursor-pointer transition-colors"
                        title="Chỉnh sửa ưu đãi"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeletePromo(promo.id)}
                        className="p-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-xs cursor-pointer transition-colors"
                        title="Xóa ưu đãi"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !error && filteredPromotions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#827470] font-medium">
                    Không tìm thấy mã khuyến mãi nào phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Partner List Section */}
      <section className="bg-white border border-outline-variant/30 rounded-sm p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-6">
          <h3 className="font-serif text-base font-bold text-primary flex items-center gap-2">
            <Share2 size={18} /> Danh sách đối tác liên kết
          </h3>
          <span className="text-[10px] uppercase font-bold text-primary bg-[#dee7c0] px-2 py-0.5 rounded-xs">
            {partners.length} đối tác
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {partners.map((partner, idx) => (
            <div key={idx} className="border border-[#e5e1de] p-4 rounded-xs flex gap-4 items-center bg-neutral-50 hover:bg-white transition-colors duration-300">
              <div className="w-16 h-16 shrink-0 bg-white border border-[#d4c3be] p-1">
                <img src={partner.qrUrl} alt="Partner QR Code" className="w-full h-full" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-serif text-sm font-bold text-primary truncate" title={partner.partnerName}>{partner.partnerName}</h4>
                <p className="font-mono text-xs text-[#827470] mt-0.5">{partner.code}</p>
                <span className="inline-block mt-2 bg-[#dee7c0] text-[#5f6849] px-2 py-0.5 rounded-xs text-[9px] font-bold uppercase">
                  {partner.discount}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(partner.code)
                    alert(`Đã copy mã: ${partner.code}`)
                  }}
                  className="text-[#827470] hover:text-primary transition-colors border-none bg-transparent cursor-pointer p-1"
                  title="Copy mã đối tác"
                >
                  <Share2 size={14} />
                </button>
                <button
                  onClick={() => handleDownloadQR(partner.qrUrl, partner.code)}
                  className="text-[#827470] hover:text-primary transition-colors border-none bg-transparent cursor-pointer p-1"
                  title="Tải ảnh QR"
                >
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}
