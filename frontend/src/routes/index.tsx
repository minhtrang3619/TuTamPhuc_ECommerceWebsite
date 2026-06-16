import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/layouts/MainLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { LoadingPage } from '@/components/ui/LoadingPage'

// Lazy load pages
const HomePage = lazy(() => import('@/pages/Home'))
const ProductListPage = lazy(() => import('@/pages/ProductList'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetail'))
const CartPage = lazy(() => import('@/pages/Cart'))
const CheckoutPage = lazy(() => import('@/pages/Checkout'))
const LoginPage = lazy(() => import('@/pages/Login'))
const RegisterPage = lazy(() => import('@/pages/Register'))
const ProfilePage = lazy(() => import('@/pages/Profile'))
const OrdersPage = lazy(() => import('@/pages/Orders'))
const OrderDetailPage = lazy(() => import('@/pages/OrderDetail'))
const BlogPage = lazy(() => import('@/pages/Blog'))
const BlogDetailPage = lazy(() => import('@/pages/BlogDetail'))
const WishlistPage = lazy(() => import('@/pages/Wishlist'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))
const OrderSuccessPage = lazy(() => import('@/pages/OrderSuccess'))
const ChatPage = lazy(() => import('@/pages/Chat'))

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('@/pages/admin/Products'))
const AdminOrders = lazy(() => import('@/pages/admin/Orders'))
const AdminStaff = lazy(() => import('@/pages/admin/Staff'))
const AdminCustomers = lazy(() => import('@/pages/admin/Customers'))

const AdminBlog = lazy(() => import('@/pages/admin/Blog'))
const AdminReports = lazy(() => import('@/pages/admin/Reports'))
const AdminCharity = lazy(() => import('@/pages/admin/Charity'))
const AdminSettings = lazy(() => import('@/pages/admin/Settings'))
const AdminPromotions = lazy(() => import('@/pages/admin/Promotions'));

const AdminCustomerStats = lazy(() => import('@/pages/admin/CustomerCare/Stats'))
const AdminCustomerChat = lazy(() => import('@/pages/admin/CustomerCare/Chat'))
const AdminCustomerReviews = lazy(() => import('@/pages/admin/CustomerCare/Reviews'))


export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public Routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/san-pham" element={<ProductListPage />} />
          <Route path="/san-pham/:slug" element={<ProductDetailPage />} />
          <Route path="/danh-muc/:slug" element={<ProductListPage />} />
          <Route path="/gio-hang" element={<CartPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/thanh-toan" element={<CheckoutPage />} />
            <Route path="/tai-khoan" element={<ProfilePage />} />
            <Route path="/don-hang" element={<OrdersPage />} />
            <Route path="/don-hang/:id" element={<OrderDetailPage />} />
            <Route path="/yeu-thich" element={<WishlistPage />} />
            <Route path="/tin-nhan" element={<ChatPage />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/san-pham" element={<AdminProducts />} />
            <Route path="/admin/don-hang" element={<AdminOrders />} />
            <Route path="/admin/nhan-su" element={<AdminStaff />} />
            <Route path="/admin/khach-hang" element={<AdminCustomers />} />

            <Route path="/admin/blog" element={<AdminBlog />} />
            <Route path="/admin/bao-cao" element={<AdminReports />} />
            <Route path="/admin/tu-thien" element={<AdminCharity />} />
            <Route path="/admin/cai-dat" element={<AdminSettings />} />
            <Route path="/admin/khuyen-mai" element={<AdminPromotions />} />

            <Route path="/admin/cskh-thong-ke" element={<AdminCustomerStats />} />
            <Route path="/admin/cskh-tin-nhan" element={<AdminCustomerChat />} />
            <Route path="/admin/cskh-danh-gia" element={<AdminCustomerReviews />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
