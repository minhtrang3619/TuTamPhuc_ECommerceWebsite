import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  Settings,
  Star,
  FileText,
  LogOut,
  BarChart3,
  Headphones
} from 'lucide-react'

export function AdminSidebar() {
  const { user, logout } = useAuthStore()
  const location = useLocation()

  const role = user?.role?.toLowerCase() || 'admin' // Fallback for safety
  const isCSKH = role === 'customer_service'

  // CSKH Navigation List (exactly matching the user image)
  const cskhMenuItems = [
    {
      title: 'Thống kê',
      path: '/admin/cskh-thong-ke',
      icon: BarChart3
    },
    {
      title: 'Tin nhắn',
      path: '/admin/cskh-tin-nhan',
      icon: MessageSquare
    },
    {
      title: 'Yêu cầu hỗ trợ',
      path: '/admin/cskh-ho-tro',
      icon: Headphones
    },
    {
      title: 'Khách hàng',
      path: '/admin/khach-hang',
      icon: Users
    },
    {
      title: 'Đơn hàng',
      path: '/admin/don-hang',
      icon: ShoppingBag
    },
    {
      title: 'Đánh giá',
      path: '/admin/cskh-danh-gia',
      icon: Star
    }
  ]

  // Standard Admin Navigation List
  const allMenuItems = [
    {
      title: 'Tổng quan hệ thống',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      roles: ['admin']
    },
    {
      title: 'Báo cáo chuyên sâu',
      path: '/admin/bao-cao',
      icon: FileText,
      roles: ['admin']
    },
    {
      title: 'Thống kê hàng hóa',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
      roles: ['shop_staff']
    },
    {
      title: 'Quản lý Đơn hàng',
      path: '/admin/don-hang',
      icon: ShoppingBag,
      roles: ['admin', 'staff', 'shop_staff']
    },
    {
      title: 'Sản phẩm & Kho',
      path: '/admin/san-pham',
      icon: Package,
      roles: ['admin', 'staff', 'shop_staff']
    },
    {
      title: 'Quản lý Khách hàng',
      path: '/admin/khach-hang',
      icon: Users,
      roles: ['admin']
    },
    {
      title: 'Quản lý Nhân sự',
      path: '/admin/nhan-su',
      icon: Users,
      roles: ['admin']
    },
    {
      title: 'Cài đặt hệ thống',
      path: '/admin/cai-dat',
      icon: Settings,
      roles: ['admin']
    }
  ]

  if (isCSKH) {
    // Custom CSKH Sidebar Layout (Matches the Image Style)
    return (
      <aside className="w-60 bg-[#f4f2f0] flex flex-col flex-shrink-0 min-h-screen transition-all py-10 px-8 border-r border-[#e5e1de]/40">
        <div className="flex-1">
          <div className="mb-8 pb-6 border-b border-[#e5e1de]/60">
            <h2 className="text-sm font-serif font-bold text-[#442a22] tracking-wider uppercase">TỪ TÂM PHỤC</h2>
            <p className="text-[10px] text-[#827470] mt-2 tracking-wide uppercase font-semibold">
              Xin chào nhân viên chăm sóc khách hàng
            </p>
          </div>
          <nav className="flex flex-col space-y-6">
            {cskhMenuItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname.startsWith(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 py-2 text-sm font-sans tracking-wide transition-all ${
                    isActive
                      ? 'text-[#442a22] font-semibold border-b border-[#442a22]/20 pb-3 mb-1'
                      : 'text-[#827470] hover:text-[#442a22] font-normal'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#442a22]' : 'text-[#827470]'} />
                  <span>{item.title}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-[#e5e1de]">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full py-2 text-xs font-semibold tracking-wider text-[#827470] hover:text-[#442a22] transition-colors uppercase"
          >
            <LogOut size={16} />
            Đăng xuất
          </button>
        </div>
      </aside>
    )
  }

  // Standard Admin Sidebar Layout
  const menuItems = allMenuItems.filter(item => item.roles.includes(role))

  return (
    <aside className="w-64 bg-surface border-r border-outline-variant/30 flex flex-col flex-shrink-0 transition-all min-h-screen">
      <div className="p-6 border-b border-outline-variant/30">
        <h2 className="text-xl font-serif font-bold text-primary tracking-wider">TỪ TÂM PHỤC</h2>
        <div className="mt-2 inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium uppercase tracking-wider">
          {role === 'admin' ? 'Chủ cửa hàng' : role === 'shop_staff' ? 'NV Cửa hàng' : 'CSKH'}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
                  }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-outline-variant/30">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-colors"
        >
          <LogOut size={18} />
          Đăng xuất
        </button>
      </div>
    </aside>
  )
}
