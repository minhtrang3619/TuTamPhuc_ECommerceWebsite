import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store'

export function AdminRoute() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const allowedRoles = ['admin', 'staff', 'shop_staff', 'customer_service'];
  const userRole = user?.role?.toLowerCase() || '';
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
