import { useState } from 'react'
import { 
  Search, 
  ChevronRight,
  Ban,
  UserCheck,
  UserPlus,
  X
} from 'lucide-react'

interface StaffItem {
  name: string
  email: string
  role: string
  date: string
  status: string
  img: string
}

export default function AdminStaff() {
  const [searchTerm, setSearchTerm] = useState('')
  const [staffList, setStaffList] = useState<StaffItem[]>([
    { name: 'Quản Trị Viên', email: 'admin@gmail.com', role: 'Admin', date: '01/01/2023', status: 'Hoạt động', img: 'https://avatar.vercel.sh/admin' },
    { name: 'Nhân viên cửa hàng', email: 'shop_staff@gmail.com', role: 'Shop Staff', date: '10/05/2023', status: 'Hoạt động', img: 'https://avatar.vercel.sh/shop' },
    { name: 'Nhân viên Chăm sóc khách hàng', email: 'customer_service@gmail.com', role: 'Customer Service', date: '15/06/2023', status: 'Hoạt động', img: 'https://avatar.vercel.sh/cs' }
  ])

  // Modals State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffItem | null>(null)
  const [tempRole, setTempRole] = useState('')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState('Shop Staff')

  const toggleStatus = (name: string) => {
    setStaffList(prev => prev.map(s => {
      if (s.name === name) {
        return { ...s, status: s.status === 'Hoạt động' ? 'Ngưng hoạt động' : 'Hoạt động' }
      }
      return s
    }))
  }

  const handleOpenEdit = (staff: StaffItem) => {
    setSelectedStaff(staff)
    setTempRole(staff.role)
    setIsModalOpen(true)
  }

  const handleSaveRole = () => {
    if (selectedStaff) {
      setStaffList(prev => prev.map(s => {
        if (s.name === selectedStaff.name) {
          return { ...s, role: tempRole }
        }
        return s
      }))
      setIsModalOpen(false)
      setSelectedStaff(null)
    }
  }

  const handleAddStaff = () => {
    if (!newName || !newEmail) return
    const newStaff: StaffItem = {
      name: newName,
      email: newEmail,
      role: newRole,
      date: 'Hôm nay',
      status: 'Hoạt động',
      img: `https://avatar.vercel.sh/${newName.substring(0, 3)}`
    }
    setStaffList(prev => [...prev, newStaff])
    setIsAddModalOpen(false)
    setNewName('')
    setNewEmail('')
    setNewRole('Shop Staff')
  }

  const filteredStaff = staffList.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Quản lý nhân sự</h2>
          <div className="flex items-center gap-2 font-caption text-caption text-on-surface-variant text-xs">
            <span>Hệ thống</span>
            <ChevronRight size={14} className="text-on-surface-variant/40" />
            <span className="text-primary font-medium">Nhân sự</span>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 border border-primary text-primary rounded-sm hover:bg-primary/5 transition-all font-label-md text-label-md text-xs uppercase shrink-0"
        >
          <UserPlus size={16} />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 w-full md:w-96 transition-all focus-within:ring-1 focus-within:ring-primary/20">
        <Search size={18} className="text-on-surface-variant opacity-60" />
        <input 
          type="text" 
          placeholder="Tìm kiếm nhân sự..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none focus:ring-0 w-full font-label-md text-label-md placeholder:text-on-surface-variant/50 p-0"
        />
      </div>

      {/* Table Container */}
      <div className="bg-surface-container-lowest shadow-[0_32px_64px_-12px_rgba(93,64,55,0.06)] rounded-xl overflow-hidden border border-outline-variant/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Thông tin nhân viên</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Vai trò</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Ngày tham gia</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px]">Trạng thái</th>
                <th className="px-8 py-5 font-label-md text-label-md text-on-surface-variant uppercase tracking-widest text-[11px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {filteredStaff.map((user, idx) => {
                const isAct = user.status === 'Hoạt động'
                return (
                  <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-8 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.img} 
                          alt={user.name} 
                          className="w-10 h-10 rounded-full bg-secondary-container"
                        />
                        <div>
                          <p className="font-body-md text-on-surface font-medium group-hover:text-primary transition-colors">{user.name}</p>
                          <p className="font-caption text-on-surface-variant opacity-70 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <span className="font-label-md text-on-surface-variant text-sm">{user.role}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className="font-caption text-on-surface-variant text-xs">{user.date}</span>
                    </td>
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full font-label-md text-[11px] ${
                        isAct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenEdit(user)}
                          className="font-label-md text-label-md text-primary border border-primary/20 px-3 py-1 hover:bg-primary hover:text-white transition-all rounded-sm text-xs"
                        >
                          Phân quyền
                        </button>
                        {user.role !== 'Admin' && (
                          <button 
                            onClick={() => toggleStatus(user.name)}
                            className="font-label-md text-label-md text-on-surface-variant hover:text-red-600 transition-all p-1"
                            title={isAct ? "Chặn nhân sự" : "Mở chặn nhân sự"}
                          >
                            {isAct ? <Ban size={18} /> : <UserCheck size={18} className="text-green-600" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredStaff.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant/60 font-body-md">
                    Không tìm thấy nhân sự phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Confirmation Modal */}
      {isModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Xác nhận chỉnh sửa nhân sự</h3>
            
            {/* Simple UI Info Card */}
            <div className="bg-surface-container-low p-4 rounded-lg mb-6 flex items-center gap-3 border border-outline-variant/10">
              <img 
                src={selectedStaff.img} 
                alt={selectedStaff.name} 
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-body-md text-on-surface font-semibold">{selectedStaff.name}</p>
                <p className="font-caption text-on-surface-variant text-xs">{selectedStaff.email}</p>
              </div>
            </div>

            {/* Inputs / Confirmation Fields */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Vai trò nhân sự</label>
                <select 
                  value={tempRole}
                  onChange={(e) => setTempRole(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="Admin">Admin</option>
                  <option value="Shop Staff">Shop Staff</option>
                  <option value="Customer Service">Customer Service</option>
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
                onClick={handleSaveRole}
                className="px-5 py-2 bg-primary text-white rounded font-label-md text-xs hover:bg-on-primary-fixed-variant transition-colors"
              >
                Xác nhận thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Thêm thành viên nhân sự mới</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ví dụ: Nguyên Hương"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Email đăng nhập</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Ví dụ: huong@ttphuc.vn"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Vai trò</label>
                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="Admin">Admin</option>
                  <option value="Shop Staff">Shop Staff</option>
                  <option value="Customer Service">Customer Service</option>
                </select>
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
                onClick={handleAddStaff}
                className="px-5 py-2 bg-primary text-white rounded font-label-md text-xs hover:bg-on-primary-fixed-variant transition-colors"
              >
                Lưu nhân sự
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
