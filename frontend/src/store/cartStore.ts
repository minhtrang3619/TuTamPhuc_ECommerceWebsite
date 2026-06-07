import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '@/types'

interface CartState {
  items: CartItem[]
  isOpen: boolean

  // Computed
  totalItems: number
  subtotal: number

  // Actions
  setItems: (items: CartItem[]) => void
  addItem: (item: CartItem) => void
  removeItem: (itemId: number) => void
  updateQuantity: (itemId: number, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      get totalItems() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      get subtotal() {
        return get().items.reduce((sum, item) => sum + item.subtotal, 0)
      },

      setItems: (items) => set({ items }),

      addItem: (newItem) =>
        set(state => {
          const existingIndex = state.items.findIndex(
            item => item.id === newItem.id
          )
          if (existingIndex >= 0) {
            const updated = [...state.items]
            updated[existingIndex].quantity += newItem.quantity
            updated[existingIndex].subtotal =
              updated[existingIndex].price * updated[existingIndex].quantity
            return { items: updated }
          }
          return { items: [...state.items, newItem] }
        }),

      removeItem: (itemId) =>
        set(state => ({
          items: state.items.filter(item => item.id !== itemId),
        })),

      updateQuantity: (itemId, quantity) =>
        set(state => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity, subtotal: item.price * quantity }
              : item
          ),
        })),

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),
    }),
    {
      name: 'tutamphuc-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ items: state.items }),
    }
  )
)
