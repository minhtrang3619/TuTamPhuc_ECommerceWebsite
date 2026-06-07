import { useState } from 'react'
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Search, 
  X, 
  Check, 
  AlertCircle
} from 'lucide-react'

interface PromotionItem {
  id: string
  name: string
  type: 'percentage' | 'fixed' | 'same_price'
  value: number
  applyTo: string
  startDate: string
  endDate: string
  status: 'active' | 'scheduled' | 'ended'
}

export default function AdminPromotions() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [promotions, setPromotions] = useState<PromotionItem[]>([
    {
      id: '1',
      name: 'Chào Hè An Yên',
      type: 'percentage',
      value: 15,
      applyTo: 'Đồ lam đi chùa',
      startDate: '2026-06-01',
      endDate: '2026-06-30',
      status: 'active'
    },
    {
      id: '2',
      name: 'Tri Ân Mùa Lễ Hội',
      type: 'fixed',
      value: 100000,
      applyTo: 'Lụa lễ hội',
      startDate: '2026-07-01',
      endDate: '2026-07-15',
      status: 'scheduled'
    },
    {
      id: '3',
      name: 'Khai Trương Cửa Hàng',
      type: 'percentage',
      value: 20,
      applyTo: 'Toàn bộ cửa hàng',
      startDate: '2026-05-01',
      endDate: '2026-05-15',
      status: 'ended'
    }
  ])

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState<PromotionItem | null>(null)

  // Form Fields
  const [name, setName] = useState('')
  const [type, setType] = useState<'percentage' | 'fixed' | 'same_price'>('percentage')
  const [value, setValue] = useState(0)
  const [applyTo, setApplyTo] = useState('Toàn bộ cửa hàng')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [promoToDelete, setPromoToDelete] = useState<PromotionItem | null>(null)

  const formatValue = (promo: PromotionItem) => {
    if (promo.type === 'percentage') {
      return `${promo.value}%`
    } else if (promo.type === 'fixed') {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.value)
    } else {
      return `Đồng giá ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(promo.value)}`
    }
  }

  const handleOpenAdd = () => {
    setSelectedPromo(null)
    setName('')
    setType('percentage')
    setValue(0)
    setApplyTo('Toàn bộ cửa hàng')
    setStartDate('')
    setEndDate('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (p: PromotionItem) => {
    setSelectedPromo(p)
    setName(p.name)
    setType(p.type)
    setValue(p.value)
    setApplyTo(p.applyTo)
    setStartDate(p.startDate)
    setEndDate(p.endDate)
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!name || value <= 0 || !startDate || !endDate) {
      alert('Vui lòng điền đầy đủ các thông tin cần thiết.')
      return
    }

    const todayStr = new Date().toISOString().split('T')[0]
    let calculatedStatus: 'active' | 'scheduled' | 'ended' = 'scheduled'
    if (todayStr >= startDate && todayStr <= endDate) {
      calculatedStatus = 'active'
    } else if (todayStr > endDate) {
      calculatedStatus = 'ended'
    }

    const newPromo: PromotionItem = {
      id: selectedPromo?.id || `${promotions.length + 1}`,
      name,
      type,
      value,
      applyTo,
      startDate,
      endDate,
      status: calculatedStatus
    }

    if (selectedPromo) {
      setPromotions(prev => prev.map(item => item.id === selectedPromo.id ? newPromo : item))
    } else {
      setPromotions(prev => [newPromo, ...prev])
    }

    setIsModalOpen(false)
  }

  const handleOpenDelete = (p: PromotionItem) => {
    setPromoToDelete(p)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (promoToDelete) {
      setPromotions(prev => prev.filter(item => item.id !== promoToDelete.id))
      setIsDeleteModalOpen(false)
      setPromoToDelete(null)
    }
  }

  const filteredPromotions = promotions.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.applyTo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Quản lý Khuyến mãi</h2>
          <p className="text-body-md text-on-surface-variant max-w-xl text-sm">
            Tạo và tinh chỉnh các chương trình ưu đãi, tri ân khách hàng trong hành trình lan tỏa phong cách sống an yên.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-8 py-3 border border-primary text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group rounded-sm shrink-0"
        >
          <Plus size={16} className="transition-transform group-hover:rotate-90" />
          <span className="font-label-md uppercase tracking-wider text-xs">Thêm khuyến mãi mới</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 w-full md:w-96 transition-all focus-within:ring-1 focus-within:ring-primary/20">
          <Search size={18} className="text-on-surface-variant opacity-60" />
          <input 
            type="text" 
            placeholder="Tìm chương trình khuyến mãi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 w-full font-label-md text-label-md placeholder:text-on-surface-variant/50 p-0"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {['all', 'active', 'scheduled', 'ended'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 text-xs uppercase tracking-wider font-label-md rounded border transition-all ${
                statusFilter === status 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-transparent text-on-surface-variant border-outline-variant/40 hover:bg-surface-container-low'
              }`}
            >
              {status === 'all' && 'Tất cả'}
              {status === 'active' && 'Đang chạy'}
              {status === 'scheduled' && 'Đã lên lịch'}
              {status === 'ended' && 'Đã kết thúc'}
            </button>
          ))}
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-surface shadow-sm overflow-hidden border border-outline-variant/10 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Tên chương trình</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Áp dụng</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Mức giảm</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Thời gian</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Trạng thái</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredPromotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-surface-container-low transition-colors group">
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-primary/5 flex items-center justify-center text-primary shrink-0">
                        <Tag size={18} />
                      </div>
                      <div>
                        <p className="font-headline-sm text-base text-primary font-medium">{promo.name}</p>
                        <p className="text-[10px] text-on-surface-variant">ID: PROMO-{promo.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-body-md text-on-surface-variant text-sm">{promo.applyTo}</td>
                  <td className="px-6 py-6 font-body-md font-semibold text-primary text-sm">{formatValue(promo)}</td>
                  <td className="px-6 py-6 font-body-md text-on-surface-variant text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="opacity-60" />
                      <span>{promo.startDate}</span>
                      <span className="opacity-60">đến</span>
                      <span>{promo.endDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-3 py-1 text-[11px] rounded-full font-label-md ${
                      promo.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : promo.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-surface-container-high text-on-surface-variant/60'
                    }`}>
                      {promo.status === 'active' && 'Đang hoạt động'}
                      {promo.status === 'scheduled' && 'Đã lên lịch'}
                      {promo.status === 'ended' && 'Đã kết thúc'}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right">
                    <div className="flex justify-end gap-1">
                      <button 
                        onClick={() => handleOpenEdit(promo)}
                        className="p-2 hover:bg-white rounded-full transition-all text-on-surface-variant hover:text-primary"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleOpenDelete(promo)}
                        className="p-2 hover:bg-white rounded-full transition-all text-on-surface-variant hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPromotions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant/60 font-body-md">
                    Không tìm thấy chương trình khuyến mãi nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal (Zen UI Card Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500 font-sans">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-4">
              {selectedPromo ? 'Cập nhật chương trình' : 'Thêm chương trình khuyến mãi'}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Tên chương trình</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Tri Ân Mùa Vu Lan"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Loại chiết khấu</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền mặt (VNĐ)</option>
                    <option value="same_price">Đồng giá (VNĐ)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Giá trị giảm</label>
                  <input 
                    type="number" 
                    value={value || ''}
                    onChange={(e) => setValue(Number(e.target.value))}
                    placeholder={type === 'percentage' ? 'Ví dụ: 10' : 'Ví dụ: 50000'}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Áp dụng cho</label>
                <input 
                  type="text" 
                  value={applyTo}
                  onChange={(e) => setApplyTo(e.target.value)}
                  placeholder="Ví dụ: Đồ lam đi chùa hoặc Toàn bộ cửa hàng"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Ngày kết thúc</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave}
                className="px-5 py-2 bg-primary text-white rounded font-label-md text-xs hover:bg-on-primary-fixed-variant transition-colors"
              >
                Lưu lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && promoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-sm w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500 font-sans">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Xóa chương trình khuyến mãi</h3>
            <p className="font-body-md text-on-surface-variant text-sm mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa chương trình <span className="font-semibold text-primary">"{promoToDelete.name}"</span>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDelete}
                className="px-5 py-2 bg-red-600 text-white rounded font-label-md text-xs hover:bg-red-700 transition-colors"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
