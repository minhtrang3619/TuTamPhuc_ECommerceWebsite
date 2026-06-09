import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'

import { useWishlistStore } from '@/store/wishlistStore'
import { useMockCartStore } from '@/store/mockCartStore'
import { mapApiProductToMockProduct } from '@/utils/productMapper'
import ProductCard from '@/components/ui/ProductCard'
import QuickViewModal from '@/components/ui/QuickViewModal'
import Toast from '@/components/ui/Toast'
import type { Product } from '@/mockTypes'

export default function WishlistPage() {
  const navigate = useNavigate()
  const { items: apiItems, loading, fetchWishlist, removeFromWishlist } = useWishlistStore()
  const { addItem, openCheckout } = useMockCartStore()

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null)
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type?: 'success' | 'info' }>({
    message: '',
    isVisible: false,
    type: 'success',
  })

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, isVisible: true, type })
  }

  useEffect(() => {
    fetchWishlist()
  }, [fetchWishlist])

  // Map ApiProduct to MockProduct
  const products = useMemo(() => {
    return apiItems.map((p) => mapApiProductToMockProduct(p))
  }, [apiItems])

  const handleRemove = async (dbId?: number) => {
    if (!dbId) return
    try {
      await removeFromWishlist(dbId)
      showToast('Đã xóa sản phẩm khỏi danh mục yêu thích.', 'info')
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm yêu thích:', err)
      showToast('Không thể xóa sản phẩm. Vui lòng thử lại sau.', 'info')
    }
  }

  const handleAddToCart = (product: Product, color: { name: string; hex: string }, size: string, qty: number) => {
    addItem(product, color, size, qty)
    showToast(`Đã thêm ${qty} x ${product.name} vào giỏ hàng.`)
  }

  const handleBuyNow = (product: Product, color: { name: string; hex: string }, size: string, qty: number) => {
    addItem(product, color, size, qty)
    openCheckout()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="bg-[#fcfaf7] min-h-screen pt-12 pb-24 font-sans"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 w-full">
        {/* Header Title Block */}
        <div className="text-center mb-16">
          <span className="text-[10px] uppercase font-sans font-extrabold tracking-[0.25em] text-[#5d4037] mb-2.5 block">
            Danh sách của bạn
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-primary font-bold mb-4 tracking-wide leading-tight">
            Sản Phẩm Yêu Thích
          </h1>
          <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-xl mx-auto leading-relaxed opacity-90 pl-3 border-l-2 border-[#d4c3be]/30 md:border-l-0">
            Lưu giữ những thiết kế pháp phục tinh tế, an nhiên mà bạn yêu thích và có kế hoạch sở hữu.
          </p>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-24 text-center border border-dashed border-[#d4c3be]/40 bg-white rounded-xs p-10 flex flex-col items-center justify-center">
            <h4 className="font-serif text-base font-semibold text-primary mb-2 animate-pulse">
              Đang tải danh mục yêu thích...
            </h4>
          </div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-[#d4c3be]/40 bg-white rounded-xs p-10 flex flex-col items-center justify-center max-w-2xl mx-auto shadow-xs">
            <div className="p-4 rounded-full bg-primary/5 text-primary mb-6">
              <Heart size={36} className="stroke-[1.5] opacity-50" />
            </div>
            <h4 className="font-serif text-lg font-semibold text-primary mb-2">
              Danh sách yêu thích trống
            </h4>
            <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed mb-8">
              Quý khách chưa lưu sản phẩm nào. Hãy khám phá bộ sưu tập pháp phục của chúng tôi và lưu lại những thiết kế tâm đắc.
            </p>
            <Link
              to="/san-pham"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white text-xs tracking-widest uppercase font-bold hover:bg-[#2c160e] transition-colors rounded-xs shadow-md"
            >
              Xem sản phẩm <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {products.map((item) => (
              <div key={item.id} className="flex flex-col gap-3 group relative">
                <ProductCard
                  product={item}
                  onClick={() => navigate(`/san-pham/${item.id}`)}
                  onQuickView={(e) => {
                    e.stopPropagation()
                    setQuickViewProduct(item)
                  }}
                  onAddToCart={(e) => {
                    e.stopPropagation()
                    handleAddToCart(item, item.colors[0], 'M', 1)
                  }}
                />
                
                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item.dbId)}
                  className="mt-1 py-2 px-4 border border-outline-variant hover:border-red-200 hover:bg-red-50/30 text-on-surface-variant hover:text-red-500 font-medium text-xs rounded-sm transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                  title="Xóa khỏi danh sách"
                >
                  <Trash2 size={13} />
                  <span>Xóa khỏi yêu thích</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onViewDetails={(product) => {
          navigate(`/san-pham/${product.id}`)
        }}
      />

      {/* Toast alert notifications */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </motion.div>
  )
}
