import { Link, NavLink, useLocation } from 'react-router-dom'
import { ShoppingCart, Heart, User, Menu, Search, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMockCartStore } from '@/store/mockCartStore'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { cn } from '@/lib/utils'
import { Marquee } from '@/components/ui/Marquee'

const navLinks = [
  { label: 'Trang Chủ', href: '/' },
  { label: 'Đồ Lam', href: '/san-pham?category=do-lam' },
  { label: 'Pháp Phục', href: '/san-pham?category=phap-phuc' },
  { label: 'Áo Tràng', href: '/san-pham?category=ao-trang' },
  { label: 'Blog', href: '/blog' },
]

export function Navbar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isAuthenticated, user } = useAuthStore()
  const { cart, openCart } = useMockCartStore()
  const { items: wishlistItems, fetchWishlist } = useWishlistStore()
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist()
    }
  }, [isAuthenticated, fetchWishlist])

  const marqueeItems = [
    "Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ",
    "•",
    "Gieo Mầm Từ Tâm — Trích 5% giá trị mỗi đơn hàng làm quỹ thiện nguyện",
    "•",
    "Pháp phục thiết kế cao cấp, chắt lọc tinh hoa văn hóa truyền thống",
    "•",
    "Hỗ trợ tư vấn kích cỡ & chất liệu 24/7 với Trợ lý AI thông minh",
    "•"
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant shadow-[0_32px_64px_-12px_rgba(68,42,34,0.06)] transition-all duration-300">
      <Marquee items={marqueeItems} speed="normal" className="bg-primary text-on-primary text-[10px] py-1 border-none justify-around" />
      <nav className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto w-full">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 py-1">
          <span className="font-headline-sm text-headline-sm text-primary tracking-wide transition-colors duration-300">
            Từ Tâm Phục
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(link => {
            const isActive = link.href === '/'
              ? location.pathname === '/'
              : link.href.startsWith('/san-pham')
                ? location.pathname === '/san-pham' && (
                    (link.href.includes('category=') && location.search === `?${link.href.split('?')[1]}`) ||
                    (!link.href.includes('category=') && !location.search)
                  )
                : location.pathname.startsWith(link.href);
            return (
              <li key={link.label}>
                <NavLink
                  to={link.href}
                  className={
                    cn(
                      'font-label-md text-label-md transition-colors duration-300 py-1 block',
                      isActive ? 'text-primary font-semibold border-b-2 border-primary' : 'text-on-surface-variant hover:text-primary'
                    )
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors duration-300"
            aria-label="Tìm kiếm"
          >
            <Search className="w-5 h-5" />
          </button>

          <Link
            to="/yeu-thich"
            className="relative p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors duration-300"
            aria-label="Yêu thích"
          >
            <Heart className="w-5 h-5" />
            {isAuthenticated && wishlistItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {wishlistItems.length}
              </span>
            )}
          </Link>

          <button
            onClick={openCart}
            className="relative p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors duration-300"
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <Link
              to="/tai-khoan"
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors duration-300"
            >
              <User className="w-5 h-5" />
              <span className="hidden lg:block font-label-md text-label-md max-w-[100px] truncate">
                {user?.full_name}
              </span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors duration-300"
            >
              Đăng nhập
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors duration-300"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-outline-variant overflow-hidden bg-surface"
          >
            <ul className="py-3 px-margin-mobile space-y-1">
              {navLinks.map(link => {
                const isActive = link.href === '/'
                  ? location.pathname === '/'
                  : link.href.startsWith('/san-pham')
                    ? location.pathname === '/san-pham' && (
                        (link.href.includes('category=') && location.search === `?${link.href.split('?')[1]}`) ||
                        (!link.href.includes('category=') && !location.search)
                      )
                    : location.pathname.startsWith(link.href);
                return (
                  <li key={link.href}>
                    <NavLink
                      to={link.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={
                        cn(
                          'block px-4 py-2.5 rounded-lg font-label-md text-label-md transition-colors duration-300',
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'hover:bg-surface-container text-on-surface-variant hover:text-primary'
                        )
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
