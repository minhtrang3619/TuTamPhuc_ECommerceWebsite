import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="page-transition min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-serif font-bold text-primary/30">404</h1>
        <h2 className="text-2xl font-serif font-bold">Trang không tồn tại</h2>
        <p className="text-muted-foreground">Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.</p>
        <Link
          to="/"
          className="inline-flex items-center px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
