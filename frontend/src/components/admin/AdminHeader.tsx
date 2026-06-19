import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { cn } from '@/lib/utils'
import apiClient from '@/services/apiClient'
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  X,
  ShoppingBag,
  Package,
  MessageSquare,
  Star,
  FileText,
  AlertTriangle,
  Check
} from 'lucide-react'

interface AdminHeaderProps {
  onToggleSidebar: () => void
}

interface NotificationItem {
  id: string
  title: string
  description: string
  time: string
  unread: boolean
  type: 'order' | 'stock' | 'system' | 'chat' | 'ticket' | 'review'
  referenceId?: string
  path?: string
}

interface SearchItem {
  id: string
  title: string
  category: 'Sản phẩm' | 'Đơn hàng' | 'Khách hàng' | 'Trang quản trị' | 'Hỗ trợ'
  path: string
}

const getRelativeTimeString = (isoString: string): string => {
  try {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    if (diffMs < 0) return 'Vừa xong'
    
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Vừa xong'
    if (diffMins < 60) return `${diffMins} phút trước`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours} giờ trước`
    
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Hôm qua'
    return `${diffDays} ngày trước`
  } catch {
    return 'Gần đây'
  }
}

const getSearchItems = (role: string): SearchItem[] => {
  const normalizedRole = role.toLowerCase()
  const baseItems: SearchItem[] = [
    { id: 's-p1', title: 'Trà Sen Tây Hồ', category: 'Sản phẩm', path: '/admin/san-pham' },
    { id: 's-p2', title: 'Bột Matcha Hữu Cơ', category: 'Sản phẩm', path: '/admin/san-pham' },
    { id: 's-p3', title: 'Nhang Trầm Hương Cao Cấp', category: 'Sản phẩm', path: '/admin/san-pham' },
  ]

  if (normalizedRole === 'admin') {
    return [
      ...baseItems,
      { id: 's-o1', title: 'Đơn hàng #DH-2048 (Nguyễn Văn A)', category: 'Đơn hàng', path: '/admin/don-hang' },
      { id: 's-o2', title: 'Đơn hàng #DH-2047 (Trần Thị B)', category: 'Đơn hàng', path: '/admin/don-hang' },
      { id: 's-page1', title: 'Tổng quan hệ thống (Dashboard)', category: 'Trang quản trị', path: '/admin/dashboard' },
      { id: 's-page2', title: 'Báo cáo chuyên sâu', category: 'Trang quản trị', path: '/admin/bao-cao' },
      { id: 's-page3', title: 'Quỹ thiện nguyện Hạt Lành Từ Tâm', category: 'Trang quản trị', path: '/admin/tu-thien' },
      { id: 's-page4', title: 'Cài đặt hệ thống', category: 'Trang quản trị', path: '/admin/cai-dat' },
      { id: 's-page5', title: 'Quản lý Sản phẩm', category: 'Trang quản trị', path: '/admin/san-pham' },
      { id: 's-page6', title: 'Quản lý Kho', category: 'Trang quản trị', path: '/admin/kho' }
    ]
  } else if (normalizedRole === 'shop_staff' || normalizedRole === 'staff') {
    return [
      ...baseItems,
      { id: 's-o1', title: 'Đơn hàng #DH-2048 (Nguyễn Văn A)', category: 'Đơn hàng', path: '/admin/don-hang' },
      { id: 's-o3', title: 'Đơn hàng #DH-2042 (Lê Văn C)', category: 'Đơn hàng', path: '/admin/don-hang' },
      { id: 's-page1', title: 'Quản lý Sản phẩm', category: 'Trang quản trị', path: '/admin/san-pham' },
      { id: 's-page1-2', title: 'Quản lý Kho', category: 'Trang quản trị', path: '/admin/kho' },
      { id: 's-page2', title: 'Quản lý Đơn hàng', category: 'Trang quản trị', path: '/admin/don-hang' }
    ]
  } else if (normalizedRole === 'customer_service') {
    return [
      { id: 's-c1', title: 'Khách hàng: Minh Trang', category: 'Khách hàng', path: '/admin/khach-hang' },
      { id: 's-c2', title: 'Khách hàng: Trang Nguyễn', category: 'Khách hàng', path: '/admin/khach-hang' },
      { id: 's-t1', title: 'Vé hỗ trợ #TK-482 (Lỗi thanh toán VNPay)', category: 'Hỗ trợ', path: '/admin/cskh-thong-ke' },
      { id: 's-t2', title: 'Vé hỗ trợ #TK-483 (Hỏi về vận chuyển)', category: 'Hỗ trợ', path: '/admin/cskh-thong-ke' },
      { id: 's-page1', title: 'Báo cáo thống kê CSKH', category: 'Trang quản trị', path: '/admin/cskh-thong-ke' },
      { id: 's-page2', title: 'Hộp thư tin nhắn CSKH', category: 'Trang quản trị', path: '/admin/cskh-tin-nhan' },
      { id: 's-page3', title: 'Quản lý Đánh giá sản phẩm', category: 'Trang quản trị', path: '/admin/cskh-danh-gia' }
    ]
  }
  return baseItems
}

const roleTitles: Record<string, string> = {
  admin: 'Quản trị viên',
  shop_staff: 'Nhân viên Cửa hàng',
  staff: 'Nhân viên',
  customer_service: 'Chăm sóc Khách hàng'
}

const roleColors: Record<string, string> = {
  admin: 'bg-[#442a22]',
  shop_staff: 'bg-[#8d9b91]',
  staff: 'bg-[#655d5a]',
  customer_service: 'bg-[#655d5a]'
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tutamphuc-read-notifications') || '[]')
    } catch {
      return []
    }
  })
  const [clearedIds, setClearedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('tutamphuc-cleared-notifications') || '[]')
    } catch {
      return []
    }
  })

  const searchRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    if (!user) return
    try {
      const res = await apiClient.get('/analytics/notifications')
      const data = res.data || []
      setNotifications(data)
    } catch (err) {
      console.error("Lỗi khi tải thông báo:", err)
    }
  }

  // Poll notifications
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [user])

  // Handle outside clicks to close popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const userRole = user?.role?.toLowerCase() || 'staff'
  const displayName = user?.full_name || 'Hội viên'
  const email = user?.email || ''
  const avatarUrl = user?.avatar

  // Get first letter of full name for backup initials avatar
  const initials = useMemo(() => {
    if (!displayName) return 'T'
    const parts = displayName.trim().split(' ')
    const lastPart = parts[parts.length - 1]
    return lastPart ? lastPart.charAt(0).toUpperCase() : 'T'
  }, [displayName])

  // Get active notifications (excluding cleared ones)
  const activeNotifications = useMemo(() => {
    return notifications.filter(n => !clearedIds.includes(n.id))
  }, [notifications, clearedIds])

  // Unread notification count
  const unreadCount = useMemo(() => {
    return activeNotifications.filter(n => !readIds.includes(n.id)).length
  }, [activeNotifications, readIds])

  // Mark a notification as read
  const handleMarkAsRead = (id: string) => {
    if (!readIds.includes(id)) {
      const updated = [...readIds, id]
      setReadIds(updated)
      localStorage.setItem('tutamphuc-read-notifications', JSON.stringify(updated))
    }
  }

  // Handle clicking on notification item
  const handleNotificationClick = (item: NotificationItem) => {
    handleMarkAsRead(item.id)
    setIsNotificationsOpen(false)
    if (item.type === 'chat' && item.referenceId) {
      navigate(`/admin/cskh-tin-nhan?customerId=${item.referenceId}`)
    } else if (item.type === 'order' && item.referenceId) {
      navigate(`/admin/don-hang`)
    } else {
      navigate(item.path || '/admin/dashboard')
    }
  }

  // Mark all notifications as read
  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    const allIds = activeNotifications.map(n => n.id)
    const updated = Array.from(new Set([...readIds, ...allIds]))
    setReadIds(updated)
    localStorage.setItem('tutamphuc-read-notifications', JSON.stringify(updated))
  }

  // Clear all notifications
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    const allIds = activeNotifications.map(n => n.id)
    const updated = Array.from(new Set([...clearedIds, ...allIds]))
    setClearedIds(updated)
    localStorage.setItem('tutamphuc-cleared-notifications', JSON.stringify(updated))
  }

  // Role title translation
  const localizedRole = roleTitles[userRole] || 'Nhân viên'

  // Get search suggestions base
  const searchItems = useMemo(() => {
    return getSearchItems(userRole)
  }, [userRole])

  // Filter search results
  const filteredSearchItems = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchItems.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, searchItems])

  // Placeholder based on role
  const searchPlaceholder = useMemo(() => {
    if (userRole === 'admin') return 'Tìm kiếm đơn hàng, sản phẩm, cài đặt...'
    if (userRole === 'shop_staff' || userRole === 'staff') return 'Tìm hàng hóa, tồn kho, đơn hàng...'
    if (userRole === 'customer_service') return 'Tìm khách hàng, vé hỗ trợ, đánh giá...'
    return 'Tìm kiếm mọi thứ...'
  }, [userRole])

  const handleSearchItemClick = (path: string) => {
    navigate(path)
    setSearchQuery('')
    setIsSearchFocused(false)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingBag className="h-4 w-4 text-[#442a22]" />
      case 'stock':
        return <Package className="h-4 w-4 text-amber-600" />
      case 'chat':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'ticket':
        return <FileText className="h-4 w-4 text-purple-600" />
      case 'review':
        return <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-[#827470]" />
    }
  }

  const getNotificationIconBg = (type: string) => {
    switch (type) {
      case 'order':
        return 'bg-[#ece0dc]/50'
      case 'stock':
        return 'bg-amber-50'
      case 'chat':
        return 'bg-blue-50'
      case 'ticket':
        return 'bg-purple-50'
      case 'review':
        return 'bg-yellow-50'
      default:
        return 'bg-neutral-50'
    }
  }

  const handleLogoutClick = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="h-16 bg-white border-b border-[#e5e1de]/50 px-6 flex items-center justify-between shrink-0 relative z-30">
      {/* Left Area: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-neutral-100 text-[#827470] hover:text-[#442a22] transition-colors"
          title="Mở menu điều hướng"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block text-sm font-serif font-bold text-[#442a22] tracking-wide">
          {userRole === 'admin' 
            ? 'Quản trị Hệ thống' 
            : userRole === 'customer_service' 
              ? 'Chăm sóc Khách hàng' 
              : 'Quản lý Cửa hàng'}
        </div>
      </div>

      {/* Middle Area: Search Box */}
      <div className="relative flex-1 max-w-xs md:max-w-md mx-4" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#827470] h-4 w-4" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            className="w-full pl-10 pr-9 py-1.5 bg-[#f4f2f0]/60 border border-transparent rounded-full text-xs md:text-sm font-sans text-[#442a22] placeholder:text-[#827470]/70 outline-none focus:bg-white focus:border-[#442a22]/30 focus:ring-2 focus:ring-[#442a22]/5 transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#827470] hover:text-[#442a22] p-0.5 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {isSearchFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#e5e1de]/60 rounded-xl shadow-lg z-50 py-2 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {!searchQuery.trim() ? (
              <div>
                <div className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#827470]">
                  Gợi ý truy cập nhanh
                </div>
                <div className="mt-1">
                  {searchItems.slice(0, 4).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearchItemClick(item.path)}
                      className="w-full text-left px-4 py-2 hover:bg-[#fcfaf7] text-xs md:text-sm text-[#442a22] flex items-center justify-between transition-colors group"
                    >
                      <span className="truncate">{item.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f4f2f0] text-[#827470] font-medium group-hover:bg-[#ece0dc] group-hover:text-[#442a22] transition-colors">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : filteredSearchItems.length > 0 ? (
              <div>
                <div className="px-4 py-1.5 text-[10px] uppercase font-bold tracking-wider text-[#827470]">
                  Kết quả tìm thấy ({filteredSearchItems.length})
                </div>
                <div className="mt-1">
                  {filteredSearchItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSearchItemClick(item.path)}
                      className="w-full text-left px-4 py-2 hover:bg-[#fcfaf7] text-xs md:text-sm text-[#442a22] flex items-center justify-between transition-colors group"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Search className="h-3.5 w-3.5 text-[#827470] shrink-0" />
                        <span className="truncate font-medium">{item.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ece0dc]/60 text-[#442a22] font-medium shrink-0">
                        {item.category}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-xs text-[#827470] flex flex-col items-center justify-center gap-1.5">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Không có kết quả nào cho "{searchQuery}"</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Area: Notification Bell & User Profile Dropdown */}
      <div className="flex items-center gap-2.5 md:gap-4 shrink-0">
        
        {/* Notification Bell */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn(
              "p-2 rounded-full text-[#827470] hover:text-[#442a22] hover:bg-neutral-100 transition-all relative",
              isNotificationsOpen && "text-[#442a22] bg-neutral-100"
            )}
            title="Thông báo"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e5e1de]/60 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-2 border-b border-[#e5e1de]/40 flex justify-between items-center bg-[#fcfaf7]/50">
                <span className="font-serif font-bold text-sm text-[#442a22]">Thông báo</span>
                {activeNotifications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[10px] font-semibold text-[#827470] hover:text-[#442a22] transition-colors"
                      title="Đánh dấu tất cả đã đọc"
                    >
                      Đọc tất cả
                    </button>
                    <span className="text-[#e5e1de] text-xs">|</span>
                    <button
                      onClick={handleClearAll}
                      className="text-[10px] font-semibold text-[#827470] hover:text-red-600 transition-colors"
                      title="Xóa tất cả thông báo"
                    >
                      Xóa hết
                    </button>
                  </div>
                )}
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto">
                {activeNotifications.length > 0 ? (
                  activeNotifications.map((item) => {
                    const isUnread = !readIds.includes(item.id)
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={cn(
                          "px-4 py-3 hover:bg-[#fcfaf7] cursor-pointer transition-colors flex gap-3 border-b border-[#e5e1de]/20 last:border-0 relative",
                          isUnread && "bg-[#ece0dc]/15"
                        )}
                      >
                        {isUnread && (
                          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#442a22]" />
                        )}
                        
                        {/* Left Icon */}
                        <div className={cn("p-2 h-8 w-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", getNotificationIconBg(item.type))}>
                          {getNotificationIcon(item.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline gap-1">
                            <h4 className={cn("text-xs font-semibold text-[#442a22] truncate", isUnread && "font-bold")}>
                              {item.title}
                            </h4>
                            <span className="text-[9px] text-[#827470] shrink-0 whitespace-nowrap">{getRelativeTimeString(item.time)}</span>
                          </div>
                          <p className="text-[11px] text-[#827470] mt-0.5 leading-snug break-words">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="px-4 py-10 text-center flex flex-col items-center justify-center gap-2">
                    <Check className="h-6 w-6 text-green-600 bg-green-50 rounded-full p-1" />
                    <span className="text-xs font-semibold text-[#442a22]">Không có thông báo nào</span>
                    <span className="text-[10px] text-[#827470]">Bạn đã cập nhật thông tin mới nhất!</span>
                  </div>
                )}
              </div>

              {/* View all footer */}
              {activeNotifications.length > 0 && (
                <div className="px-4 py-2 border-t border-[#e5e1de]/30 text-center bg-[#fcfaf7]/30">
                  <span className="text-[10px] font-semibold text-[#827470] cursor-not-allowed">
                    Xem tất cả thông báo cũ hơn
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="h-6 w-[1px] bg-[#e5e1de]" />

        {/* User Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-1.5 md:gap-2.5 p-1 rounded-full hover:bg-[#f4f2f0]/60 transition-all text-left cursor-pointer group"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                className="w-8 h-8 md:w-9 h-9 rounded-full object-cover border border-[#e5e1de] shadow-inner"
              />
            ) : (
              <div className="w-8 h-8 md:w-9 h-9 rounded-full bg-[#ece0dc] text-[#442a22] flex items-center justify-center font-bold text-xs md:text-sm shadow-sm group-hover:bg-[#d4c3be] transition-colors">
                {initials}
              </div>
            )}
            
            <div className="hidden md:flex flex-col pr-1">
              <span className="text-xs font-semibold text-[#442a22] line-clamp-1 max-w-[100px] leading-tight">
                {displayName}
              </span>
              <span className="text-[9px] text-[#827470] font-medium leading-tight">
                {localizedRole}
              </span>
            </div>
            
            <ChevronDown size={14} className="text-[#827470] hidden md:block group-hover:text-[#442a22] transition-colors" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-[#e5e1de]/60 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Profile Header */}
              <div className="px-4 py-3 border-b border-[#e5e1de]/40 flex gap-3 items-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-10 h-10 rounded-full object-cover border border-[#e5e1de]"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#ece0dc] text-[#442a22] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-xs md:text-sm text-[#442a22] truncate leading-tight">
                    {displayName}
                  </h3>
                  <p className="text-[10px] text-[#827470] truncate mt-0.5 leading-tight">
                    {email}
                  </p>
                  <span className={cn(
                    "inline-block text-[8px] uppercase font-bold tracking-wider text-white px-2 py-0.5 rounded-full mt-1.5 leading-normal",
                    roleColors[userRole] || 'bg-[#655d5a]'
                  )}>
                    {localizedRole}
                  </span>
                </div>
              </div>

              {/* Profile Menu Links */}
              {userRole === 'admin' && (
                <div className="py-1">
                  <Link
                    to="/admin/cai-dat"
                    onClick={() => setIsProfileOpen(false)}
                    className="px-4 py-2 hover:bg-[#fcfaf7] text-xs text-[#827470] hover:text-[#442a22] flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <Settings size={14} className="text-[#827470]" />
                    Cài đặt hệ thống
                  </Link>
                </div>
              )}

              <div className="border-t border-[#e5e1de]/40 my-1" />

              {/* Logout Button */}
              <div className="px-1 py-0.5">
                <button
                  onClick={handleLogoutClick}
                  className="w-full px-3 py-1.5 text-left text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg flex items-center gap-2.5 transition-colors"
                >
                  <LogOut size={14} className="shrink-0" />
                  Đăng xuất tài khoản
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  )
}
