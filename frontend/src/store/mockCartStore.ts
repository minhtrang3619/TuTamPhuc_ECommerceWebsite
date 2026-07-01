import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, Product } from '../mockTypes';

interface MockCartState {
  cart: CartItem[];
  buyNowItem: CartItem | null;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  appliedPromo: string;
  discountValue: number;

  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  addItem: (product: Product, color: { name: string; hex: string }, size: string, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setPromo: (promo: string, discount: number) => void;
  setBuyNowItem: (product: Product, color: { name: string; hex: string }, size: string, quantity: number) => void;
  clearBuyNowItem: () => void;
  toggleSelectItem: (id: string) => void;
  toggleAllItems: (selected: boolean) => void;
  removeSelectedItems: () => void;
}

export const useMockCartStore = create<MockCartState>()(
  persist(
    (set) => ({
      cart: [],
      buyNowItem: null,
      isCartOpen: false,
      isCheckoutOpen: false,
      appliedPromo: '',
      discountValue: 0,

      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      openCheckout: () => set({ isCheckoutOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false, buyNowItem: null }),

      addItem: (product, color, size, quantity) =>
        set((state) => {
          const id = `${product.id}-${color.hex}-${size}`;
          const existingIndex = state.cart.findIndex((item) => item.id === id);
          let newCart = [...state.cart];

          if (existingIndex >= 0) {
            newCart[existingIndex] = {
              ...newCart[existingIndex],
              quantity: newCart[existingIndex].quantity + quantity,
            };
          } else {
            newCart.push({
              id,
              product,
              color,
              size,
              quantity,
              selected: true,
            });
          }
          return { cart: newCart };
        }),

      removeItem: (id) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ cart: [], appliedPromo: '', discountValue: 0 }),
      setPromo: (promo, discount) => set({ appliedPromo: promo, discountValue: discount }),
      setBuyNowItem: (product, color, size, quantity) =>
        set(() => {
          const id = `buynow-${product.id}-${color.hex}-${size}`;
          return {
            buyNowItem: {
              id,
              product,
              color,
              size,
              quantity,
            },
          };
        }),
      clearBuyNowItem: () => set({ buyNowItem: null }),
      toggleSelectItem: (id) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === id ? { ...item, selected: item.selected === false ? true : false } : item
          ),
        })),
      toggleAllItems: (selected) =>
        set((state) => ({
          cart: state.cart.map((item) => ({ ...item, selected })),
        })),
      removeSelectedItems: () =>
        set((state) => {
          const remainingCart = state.cart.filter((item) => item.selected === false);
          return {
            cart: remainingCart,
            appliedPromo: remainingCart.length === 0 ? '' : state.appliedPromo,
            discountValue: remainingCart.length === 0 ? 0 : state.discountValue,
          };
        }),
    }),
    {
      name: 'tutamphuc-mock-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        appliedPromo: state.appliedPromo,
        discountValue: state.discountValue,
      }),
    }
  )
);
