import { Navigate } from 'react-router-dom';

export default function OrdersPage() {
  return <Navigate to="/tai-khoan?tab=orders" replace />;
}
