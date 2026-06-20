import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  MessageSquare,
  Star,
  FileText,
  LogOut,
  BarChart3,
  Settings,
  X,
  Heart,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('zen-sidebar-collapsed') === 'true'
  })

  useEffect(() => {
    localStorage.setItem('zen-sidebar-collapsed', isCollapsed.toString())
  }, [isCollapsed])

  useEffect(() => {
    onClose()
  }, [location.pathname])

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

  // Standard Admin/Staff Navigation List
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
      title: 'Quỹ thiện nguyện',
      path: '/admin/tu-thien',
      icon: Heart,
      roles: ['admin']
    },
    {
      title: 'Thống kê chuyên sâu',
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
      title: 'Quản lý Sản phẩm',
      path: '/admin/san-pham',
      icon: Package,
      roles: ['admin', 'staff', 'shop_staff']
    },
    {
      title: 'Quản lý Kho',
      path: '/admin/kho',
      icon: Layers,
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

  const greetingText = role === 'admin'
    ? 'Xin chào chủ cửa hàng'
    : role === 'shop_staff'
      ? 'Xin chào nhân viên cửa hàng'
      : role === 'customer_service'
        ? 'Xin chào nhân viên chăm sóc khách hàng'
        : 'Xin chào nhân viên'

  const menuItems = isCSKH
    ? cskhMenuItems
    : allMenuItems.filter(item => item.roles.includes(role))

  return (
    <aside className={cn(
      "bg-[#f4f2f0] flex flex-col flex-shrink-0 min-h-screen transition-all py-10 border-r border-[#e5e1de]/40 ease-in-out duration-300 relative",
      "fixed inset-y-0 left-0 z-40 md:static md:translate-x-0",
      isCollapsed ? "w-64 md:w-20 px-6 md:px-4" : "w-64 px-6",
      isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
    )}>
      <div className="flex-1">
        <div className={cn("mb-8 pb-6 border-b border-[#e5e1de]/60 relative", isCollapsed && "md:border-none md:pb-2 md:mb-6")}>
          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex absolute -right-9 md:-right-[29px] top-4 items-center justify-center w-6 h-6 bg-white border border-[#e5e1de] rounded-full text-[#827470] hover:text-[#442a22] z-50 shadow-sm cursor-pointer"
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          {/* Close Button for Mobile */}
          <button
            onClick={onClose}
            className="absolute -top-6 -right-4 md:hidden p-1.5 rounded-full hover:bg-neutral-200/50 text-[#827470] transition-colors"
            title="Đóng menu"
          >
            <X size={18} />
          </button>
          <h2 className={cn("text-sm font-serif font-bold text-[#442a22] tracking-wider uppercase transition-opacity duration-300", isCollapsed && "md:opacity-0 md:hidden")}>TỪ TÂM PHỤC</h2>
          <p className={cn("text-[10px] text-[#827470] mt-2 tracking-wide uppercase font-semibold transition-opacity duration-300", isCollapsed && "md:opacity-0 md:hidden")}>
            {greetingText}
          </p>
        </div>
        <nav className="flex flex-col space-y-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 py-2 text-sm font-sans tracking-wide transition-all ${isActive
                    ? 'text-[#442a22] font-semibold border-b border-[#442a22]/20 pb-3 mb-1'
                    : 'text-[#827470] hover:text-[#442a22] font-normal'
                  } ${isCollapsed ? 'md:justify-center md:px-0 md:border-none md:pb-2' : ''}`}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive ? 'text-[#442a22]' : 'text-[#827470]', isCollapsed && 'md:scale-110')} />
                <span className={cn("whitespace-nowrap transition-opacity duration-300", isCollapsed && "md:opacity-0 md:hidden")}>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-[#e5e1de]">
        <button
          onClick={logout}
          className={cn("flex items-center gap-3 w-full py-2 text-xs font-semibold tracking-wider text-[#827470] hover:text-[#442a22] transition-colors uppercase", isCollapsed && "md:justify-center")}
          title={isCollapsed ? "Đăng xuất" : undefined}
        >
          <LogOut size={16} className={cn(isCollapsed && "md:scale-110")} />
          <span className={cn("whitespace-nowrap transition-opacity duration-300", isCollapsed && "md:opacity-0 md:hidden")}>Đăng xuất</span>
        </button>
      </div>
    </aside>
  )
}
