import { Menu } from 'lucide-react'

interface AdminHeaderProps {
  onToggleSidebar: () => void
}

export function AdminHeader({ onToggleSidebar }: AdminHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-outline-variant/30 px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile Sidebar Hamburger Toggle Button */}
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 rounded-lg hover:bg-neutral-100 text-on-surface-variant hover:text-primary transition-colors"
          title="Mở menu điều hướng"
        >
          <Menu size={20} />
        </button>
        <div className="text-sm font-sans font-semibold text-primary">Trang quản trị</div>
      </div>
    </header>
  )
}
