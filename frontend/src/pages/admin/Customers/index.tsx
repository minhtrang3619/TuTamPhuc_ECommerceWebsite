import { useState, useEffect } from 'react'
import { 
  Search, 
  ChevronRight,
  Ban,
  UserCheck,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  X
} from 'lucide-react'
import { customerService } from '@/services'
import type { Customer } from '@/types'

const getTierBadgeStyle = (tier?: string) => {
  switch (tier) {
    case 'Khách hàng Kim Cương':
      return 'bg-purple-100 text-purple-800 border border-purple-200';
    case 'Khách hàng Vàng':
      return 'bg-amber-100 text-amber-800 border border-amber-200';
    case 'Khách hàng Bạc':
      return 'bg-slate-100 text-slate-800 border border-slate-200';
    default:
      return 'bg-[#f4ebe6] text-[#8a726b] border border-[#e5d4cb]';
  }
};

export default function AdminCustomers() {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [tempTier, setTempTier] = useState('')

  const fetchCustomers = async () => {
    try {
      setIsLoading(true)
      setErrorMsg(null)
      const data = await customerService.getAll()
      setCustomers(data)
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách khách hàng:", err)
      setErrorMsg(err.response?.data?.detail || err.message || String(err))
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const updated = await customerService.update(id, { is_active: !currentStatus })
      setCustomers(prev => prev.map(c => c.id === id ? updated : c))
    } catch (err) {
      console.error("Lỗi khi thay đổi trạng thái khách hàng:", err)
    }
  }

  const handleOpenEdit = (customer: Customer) => {
    setSelectedCustomer(customer)
    setTempTier(customer.tier || '')
    setIsModalOpen(true)
  }

  const handleSaveTier = async () => {
    if (selectedCustomer) {
      try {
        const updated = await customerService.update(selectedCustomer.id, { tier: tempTier })
        setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? updated : c))
        setIsModalOpen(false)
        setSelectedCustomer(null)
      } catch (err) {
        console.error("Lỗi khi cập nhật hạng thành viên:", err)
      }
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.tier || 'Tiêu chuẩn').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238a726b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z'/%3E%3C/svg%3E";

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumbs & Header */}
      <div>
        <h2 className="font-headline-md text-headline-md text-primary mb-2">Quản lý khách hàng</h2>
        <div className="flex items-center gap-2 font-caption text-caption text-on-surface-variant text-xs">
          <span>Hệ thống</span>
          <ChevronRight size={14} className="text-on-surface-variant/40" />
          <span className="text-primary font-medium">Khách hàng</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 w-full md:w-96 transition-all focus-within:ring-1 focus-within:ring-primary/20">
        <Search size={18} className="text-on-surface-variant opacity-60" />
        <input 
          type="text" 
          placeholder="Tìm kiếm khách hàng..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none focus:ring-0 w-full font-label-md text-label-md placeholder:text-on-surface-variant/50 p-0"
        />
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-sans flex items-center gap-2">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Table Container */}
      <div className="bg-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(93,64,55,0.06)] rounded-xl overflow-hidden border border-outline-variant/10">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 text-center font-body-md text-on-surface-variant/60">
              Đang tải danh sách khách hàng...
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/50">
                  <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Thông tin khách hàng</th>
                  <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Hạng thành viên</th>
                  <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Ngày tham gia</th>
                  <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Trạng thái</th>
                  <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px] text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {filteredCustomers.map((user) => {
                  const isAct = user.is_active
                  const displayDate = user.created_at ? new Date(user.created_at).toLocaleDateString('vi-VN') : '---'
                  return (
                    <tr key={user.id} className="hover:bg-surface-container-low/30 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar || DEFAULT_AVATAR} 
                            alt={user.full_name} 
                            className="w-10 h-10 rounded-full bg-secondary-container object-cover"
                          />
                          <div>
                            <p className="font-body-md text-on-surface font-medium group-hover:text-primary transition-colors">{user.full_name}</p>
                            <p className="font-caption text-on-surface-variant opacity-70 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        {user.tier ? (
                          <span className={`inline-block px-2.5 py-0.5 rounded-sm font-label-md text-xs font-semibold ${getTierBadgeStyle(user.tier)}`}>
                            {user.tier}
                          </span>
                        ) : (
                          <span className="text-on-surface-variant/40 text-xs italic">Chưa phân hạng</span>
                        )}
                      </td>
                      <td className="px-8 py-4">
                        <span className="font-caption text-on-surface-variant text-xs">{displayDate}</span>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`px-3 py-1 rounded-full font-label-md text-[11px] ${
                          isAct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {isAct ? 'Hoạt động' : 'Ngưng hoạt động'}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEdit(user)}
                            className="font-label-md text-label-md text-primary border border-primary/20 px-3 py-1 hover:bg-primary hover:text-white transition-all rounded-sm text-xs"
                          >
                            Chỉnh sửa
                          </button>
                          <button 
                            onClick={() => toggleStatus(user.id, user.is_active)}
                            className="font-label-md text-label-md text-on-surface-variant hover:text-red-600 transition-all p-1"
                            title={isAct ? "Chặn khách hàng" : "Mở chặn khách hàng"}
                          >
                            {isAct ? <Ban size={18} /> : <UserCheck size={18} className="text-green-600" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant/60 font-body-md">
                      Không tìm thấy khách hàng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        <div className="px-8 py-6 flex justify-between items-center border-t border-outline-variant/10">
          <p className="font-caption text-caption text-on-surface-variant text-xs">
            Hiển thị 1 đến {filteredCustomers.length} trong số {filteredCustomers.length} khách hàng
          </p>
          <div className="flex gap-2">
            <button className="p-2 border border-outline-variant rounded hover:bg-surface-container-low transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="p-2 border border-outline-variant rounded bg-primary text-white font-label-md px-3 text-xs">1</button>
            <button className="p-2 border border-outline-variant rounded hover:bg-surface-container-low transition-colors">
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Confirmation Modal */}
      {isModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Chỉnh sửa thông tin khách hàng</h3>
            
            {/* Simple UI Info Card */}
            <div className="bg-surface-container-low p-4 rounded-lg mb-6 flex items-center gap-3 border border-outline-variant/10">
              <img 
                src={selectedCustomer.avatar || DEFAULT_AVATAR} 
                alt={selectedCustomer.full_name} 
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-body-md text-on-surface font-semibold">{selectedCustomer.full_name}</p>
                <p className="font-caption text-on-surface-variant text-xs">{selectedCustomer.email}</p>
              </div>
            </div>

            {/* Inputs / Confirmation Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Hạng thành viên</label>
                <select 
                  value={tempTier}
                  onChange={(e) => setTempTier(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="Khách hàng Kim Cương">Khách hàng Kim Cương</option>
                  <option value="Khách hàng Vàng">Khách hàng Vàng</option>
                  <option value="Khách hàng Bạc">Khách hàng Bạc</option>
                  <option value="">Chưa phân hạng</option>
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
                onClick={handleSaveTier}
                className="px-5 py-2 bg-primary text-white rounded font-label-md text-xs hover:bg-on-primary-fixed-variant transition-colors"
              >
                Xác nhận thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ambient Atmospheric Visual */}
      <div className="mt-20 flex flex-col lg:flex-row items-center justify-between gap-12 opacity-80">
        <div className="w-full lg:w-1/2">
          <img 
            alt="Zen Meditation Hall" 
            className="w-full h-64 object-cover rounded-xl grayscale-[0.2]" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXTR72mS_tpYaUzngptRVjEUZgqtyRYEudz2Y4vddpWGZFG-U7ADCdjMD8AKaFqF-jdR1biH3_nw2CnPaCMa1IRuRjJUPh9Oq8Ks5LnyzSWYq5Lss2dut-ZZkDKLfUrp8ULPnmT42aw_eETQTCE2K3L63cB5-Ljkg5ihzU1N3kjE8_sP_KBkytjZicEcZIZeXplCh7AyK90q_WgnHoC0wdx4ivBbBeiQIMEqK7H8J0oDlmGi5In6WTHZABXqguPiTuv3YRDHW1l0tf"
          />
        </div>
        <div className="w-full lg:w-1/2 lg:pr-12">
          <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Gieo duyên cộng đồng</h3>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-sm">
            Tại Từ Tâm Phục, chúng tôi coi mỗi người dùng là một người bạn đồng hành trên hành trình tâm linh. Việc quản lý nền tảng của chúng tôi được dẫn dắt bởi sự tỉnh thức và rõ ràng, đảm bảo mọi tương tác đều nhẹ nhàng như tơ lụa chúng tôi dệt nên.
          </p>
        </div>
      </div>
    </div>
  )
}
