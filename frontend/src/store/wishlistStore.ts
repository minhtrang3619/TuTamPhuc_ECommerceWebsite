import { create } from 'zustand'
import type { Product } from '@/types'
import { wishlistService } from '@/services/wishlistService'

interface WishlistState {
  items: Product[]
  loading: boolean
  fetchWishlist: () => Promise<void>
  addToWishlist: (product: Product) => Promise<void>
  removeFromWishlist: (productId: number) => Promise<void>
  isInWishlist: (productId: number) => boolean
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true })
    try {
      const items = await wishlistService.getWishlist()
      set({ items, loading: false })
    } catch (err) {
      console.error('Lỗi khi tải danh sách yêu thích:', err)
      set({ loading: false })
    }
  },

  addToWishlist: async (product: Product) => {
    try {
      await wishlistService.addToWishlist(product.id)
      set((state) => ({ items: [...state.items, product] }))
    } catch (err) {
      console.error('Lỗi khi thêm vào danh sách yêu thích:', err)
      throw err
    }
  },

  removeFromWishlist: async (productId: number) => {
    try {
      await wishlistService.removeFromWishlist(productId)
      set((state) => ({
        items: state.items.filter((item) => item.id !== productId),
      }))
    } catch (err) {
      console.error('Lỗi khi xóa khỏi danh sách yêu thích:', err)
      throw err
    }
  },

  isInWishlist: (productId: number) => {
    return get().items.some((item) => item.id === productId)
  },

  clearWishlist: () => set({ items: [] }),
}))

export default useWishlistStore
