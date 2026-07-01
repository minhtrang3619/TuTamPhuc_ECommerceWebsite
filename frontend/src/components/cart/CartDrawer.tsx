import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash, Ticket, ArrowRight, ShieldCheck } from 'lucide-react';
import { useMockCartStore } from '@/store/mockCartStore';
import { formatPrice } from '../ui/ProductCard';

export function CartDrawer() {
  const {
    cart,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    openCheckout,
    appliedPromo,
    setPromo,
    discountValue,
    toggleSelectItem,
    toggleAllItems,
  } = useMockCartStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const selectedItems = cart.filter((item) => item.selected !== false);
  const subTotal = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleApplyPromo = () => {
    setPromoError('');
    setPromoSuccess('');
    const code = promoInput.trim().toUpperCase();

    if (!code) {
      setPromoError('Vui lòng nhập mã giảm giá.');
      return;
    }

    if (code === 'TUTAM') {
      const discount = Math.round(subTotal * 0.1);
      setPromo('TUTAM', discount);
      setPromoSuccess('Áp dụng thành công mã TUTAM: Giảm 10% tổng đơn hàng.');
    } else if (code === 'ANNHIEN') {
      const discount = 100000;
      setPromo('ANNHIEN', discount);
      setPromoSuccess('Áp dụng thành công mã ANNHIEN: Giảm 100.000 ₫.');
    } else {
      setPromoError('Mã ưu đãi không tồn tại hoặc đã hết hạn.');
    }
  };

  const finalTotal = Math.max(0, subTotal - discountValue);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Underlay Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#f9f9f9] shadow-2xl z-50 flex flex-col justify-between font-sans border-l border-[#d4c3be]/40"
          >
            {/* Header */}
            <div>
              <div className="flex justify-between items-center px-6 py-5 border-b border-[#d4c3be]/30 bg-white">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-semibold uppercase text-primary tracking-wider">Giỏ Hàng</span>
                  <span className="text-[10px] py-0.5 px-2 bg-primary/10 text-primary font-bold rounded-full font-mono">
                    Đã chọn {selectedItems.length}/{cart.length} sản phẩm
                  </span>
                </div>
                <button
                  onClick={closeCart}
                  className="p-1 hover:bg-[#eeeeee] rounded-full transition-colors cursor-pointer text-on-surface-variant"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Select All Section */}
              {cart.length > 0 && (
                <div className="px-6 py-2.5 bg-white border-b border-[#eeeeee] flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cart.every((item) => item.selected !== false)}
                    onChange={(e) => toggleAllItems(e.target.checked)}
                    className="accent-primary w-4 h-4 cursor-pointer rounded border-[#d4c3be]"
                    id="select-all-cart-items"
                  />
                  <label htmlFor="select-all-cart-items" className="text-xs text-on-surface-variant font-medium cursor-pointer select-none">
                    Chọn tất cả ({cart.length})
                  </label>
                </div>
              )}

              {/* Items List */}
              <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-380px)] divide-y divide-[#eeeeee]">
                {cart.length === 0 ? (
                  <div className="py-20 text-center flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-gray-300 text-5xl mb-4">shopping_bag</span>
                    <h5 className="font-serif text-sm font-semibold text-primary mb-2">Giỏ hàng của bạn đang trống</h5>
                    <p className="text-xs text-on-surface-variant/80 max-w-xs leading-relaxed">
                      Giỏ hàng của bạn chưa có sản phẩm nào. Xin kính mời quý khách ghé thăm cửa hàng và lựa chọn các sản phẩm của Từ Tâm Phục.
                    </p>
                    <button
                      onClick={closeCart}
                      className="mt-6 px-6 py-2.5 bg-primary text-white text-xs tracking-wider uppercase font-semibold hover:bg-primary-container transition-colors cursor-pointer rounded-xs"
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="py-4 flex gap-3 items-start">
                      <input
                        type="checkbox"
                        checked={item.selected !== false}
                        onChange={() => toggleSelectItem(item.id)}
                        className="accent-primary w-4 h-4 cursor-pointer rounded border-[#d4c3be] self-center flex-shrink-0"
                      />
                      <img
                        alt={item.product.name}
                        src={item.product.images[0]}
                        className="w-16 aspect-[3/4] object-cover bg-surface-container rounded-xs flex-shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <h4 className="text-xs font-serif font-bold text-primary mb-0.5 line-clamp-1">{item.product.name}</h4>
                        <div className="text-[11px] text-on-surface-variant/80 space-x-2 flex items-center mb-1.5 font-medium">
                          <span className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full inline-block border border-gray-300" style={{ backgroundColor: item.color.hex }} />
                            {item.color.name}
                          </span>
                          <span>•</span>
                          <span>Cỡ: {item.size}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          {/* Quantity control */}
                          <div className="flex items-center border border-[#d4c3be] rounded-sm bg-white overflow-hidden h-6">
                            <button
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 px-1.5 hover:bg-[#f3f3f3] text-on-surface transition-colors"
                            >
                              <Minus size={10} />
                            </button>
                            <span className="px-2 text-[11px] font-mono font-bold text-center min-w-4">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 px-1.5 hover:bg-[#f3f3f3] text-on-surface transition-colors"
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                          {/* Price */}
                          <div className="flex items-center gap-2.5">
                            <span className="text-[11px] font-bold text-primary font-mono">{formatPrice(item.product.price * item.quantity)}</span>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-on-surface-variant/40 hover:text-red-700 transition-colors p-1"
                              title="Loại bỏ khỏi giỏ"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sticky Order Action Summary at footer of drawing block */}
            {cart.length > 0 && (
              <div className="border-t border-[#d4c3be]/40 bg-white p-6 shadow-[0_-12px_32px_rgba(68,42,34,0.02)]">
                {/* Vouchers Inputs */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Nhập ưu đãi (Ví dụ: TUTAM, ANNHIEN)"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        className="w-full bg-transparent border border-[#d4c3be] rounded-sm py-1.5 px-3 pr-7 text-xs focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-on-surface-variant/40 focus:outline-none uppercase font-semibold text-primary"
                      />
                      <Ticket size={14} className="absolute right-2.5 top-2.5 text-on-surface-variant/40" />
                    </div>
                    <button
                      onClick={handleApplyPromo}
                      className="px-4 bg-primary text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#2c160e] transition-colors rounded-sm cursor-pointer"
                    >
                      Áp dụng
                    </button>
                  </div>
                  {promoError && <p className="text-[10px] text-red-700 mt-1.5 font-medium">{promoError}</p>}
                  {promoSuccess && <p className="text-[10px] text-emerald-800 mt-1.5 font-medium">{promoSuccess}</p>}
                </div>

                {/* Totals */}
                <div className="space-y-1.5 text-xs mb-5 border-b border-[#eeeeee] pb-4 font-semibold text-on-surface-variant">
                  <div className="flex justify-between">
                    <span>Tạm tính</span>
                    <span className="font-mono text-on-surface">{formatPrice(subTotal)}</span>
                  </div>
                  {discountValue > 0 && (
                    <div className="flex justify-between text-emerald-800">
                      <span>Chiết khấu ({appliedPromo})</span>
                      <span className="font-mono">- {formatPrice(discountValue)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-primary font-bold pt-1.5">
                    <span>Tổng tiền</span>
                    <span className="font-mono text-base">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Complete Button action */}
                <button
                  disabled={selectedItems.length === 0}
                  onClick={() => {
                    closeCart();
                    openCheckout();
                  }}
                  className={`w-full py-4 text-xs tracking-widest uppercase font-bold transition-all duration-300 flex justify-center items-center gap-2 rounded-xs shadow-md cursor-pointer group ${
                    selectedItems.length === 0 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none' 
                      : 'bg-primary hover:bg-[#2c160e] text-white'
                  }`}
                >
                  Tiến hành thanh toán
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </button>

                <div className="mt-3 flex items-center justify-center gap-1 text-[10px] text-on-surface-variant/60">
                  <ShieldCheck size={12} className="text-emerald-700" />
                  <span>Sản phẩm được bảo đảm đổi size miễn phí trong 7 ngày.</span>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
export default CartDrawer;
