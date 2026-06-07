/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { CartItem } from "../types";
import { X, Trash2, Heart, HelpCircle, CheckCircle, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (index: number, newQty: number) => void;
  onRemoveItem: (index: number) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  if (!isOpen) return null;

  const [checkoutStep, setCheckoutStep] = React.useState<"cart" | "form" | "success">("cart");
  const [formData, setFormData] = React.useState({
    fullName: "",
    phoneNumber: "",
    deliveryAddress: "",
    notes: "",
  });

  React.useEffect(() => {
    if (isOpen) {
      setCheckoutStep("cart");
    }
  }, [isOpen]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + " ₫";
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fullName === "" || formData.phoneNumber === "" || formData.deliveryAddress === "") {
      alert("Quý phật tử vui lòng điền đầy đủ thông tin để Từ Tâm Phục khởi tạo đơn hàng.");
      return;
    }
    setCheckoutStep("success");
    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-overlay">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer content box */}
        <div
          className="w-screen max-w-md bg-brand-bg shadow-ambient flex flex-col justify-between border-l border-brand-sand/55"
          id="cart-drawer"
        >
          {/* Drawer Header */}
          <div className="px-5 py-6 bg-brand-ivory border-b border-brand-sand/40 flex justify-between items-center">
            <h2 className="font-serif-elegant text-lg text-brand-primary font-semibold flex items-center gap-2">
              <ShoppingBag size={18} />
              Giỏ y phục giao duyên
            </h2>
            <button
              onClick={onClose}
              className="text-brand-secondary hover:text-brand-primary cursor-pointer p-1 rounded-full hover:bg-brand-sand/40 transition-colors"
              id="close-cart-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Drawer Body content depends on step states */}
          <div className="flex-1 overflow-y-auto px-5 py-6">
            {checkoutStep === "cart" && (
              <>
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                    <p className="text-sm font-serif-elegant text-brand-secondary italic text-base">
                      "Túi rỗng không vô quẩn phiền, giỏ giao duyên đang chờ đạo hữu."
                    </p>
                    <p className="text-xs text-brand-secondary/70">
                      Kính mời đạo hữu ngắm nghía Pháp Phục & Đồ Lam của Từ Tâm Phục để tìm thấy mảnh ghép bình an.
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-brand-bg bg-brand-primary hover:bg-brand-brown rounded-sm"
                    >
                      Tiếp tục vãn cảnh shop
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {cartItems.map((item, index) => (
                      <div
                        key={`${item.product.id}-${item.selectedSize}`}
                        className="flex gap-4 pb-4 border-b border-brand-sand/40"
                      >
                        {/* Image asset */}
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-20 object-cover rounded-sm bg-brand-ivory flex-shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        {/* Meta information */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-serif-elegant text-sm font-semibold text-brand-primary tracking-wide">
                              {item.product.name}
                            </h4>
                            <p className="text-[10px] text-brand-secondary mt-0.5">
                              Size: {item.selectedSize} | Màu: {item.product.color}
                            </p>
                          </div>

                          {/* Unit price aggregate & quantity adjustments */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-brand-stone/30 rounded-sm">
                              <button
                                onClick={() => item.quantity > 1 && onUpdateQuantity(index, item.quantity - 1)}
                                className="px-2 py-0.5 text-brand-secondary hover:text-brand-primary text-xs"
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-bold text-brand-primary select-none w-5 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                                className="px-2 py-0.5 text-brand-secondary hover:text-brand-primary text-xs"
                              >
                                +
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-brand-brown">
                                {formatPrice(item.product.price * item.quantity)}
                              </span>
                              <button
                                onClick={() => onRemoveItem(index)}
                                className="text-brand-stone hover:text-red-700 p-1"
                                title="Gỡ y phục"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Simulated order form step */}
            {checkoutStep === "form" && (
              <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4 text-xs font-sans">
                <div className="p-3 bg-brand-sand/30 border border-brand-sand/50 rounded-sm mb-2 text-[11px] leading-relaxed italic text-brand-primary">
                  * "Phục trang nghiêm cẩn gieo thiện lành. Kính mong hữu duyên điền đúng thông tin liên lạc để bổn hiệu chuyển phát nhanh chóng tịnh an."
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-brand-primary uppercase tracking-wider">Họ và tên đạo hữu:</label>
                  <input
                    type="text"
                    required
                    placeholder="Bùi Thị Minh Tráng"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-brand-ivory border border-brand-stone/30 rounded-sm p-2.5 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-brand-primary uppercase tracking-wider">Số điện thoại liên lạc:</label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-brand-ivory border border-brand-stone/30 rounded-sm p-2.5 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-brand-primary uppercase tracking-wider">Địa chỉ tịnh nhận:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Địa chỉ nhà riêng hoặc đạo tràng tu viện nơi đạo hữu tu học..."
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    className="w-full bg-brand-ivory border border-brand-stone/30 rounded-sm p-2.5 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-bold text-brand-primary uppercase tracking-wider">Ghi chú gửi bổn hiệu (Nếu có):</label>
                  <textarea
                    rows={2}
                    placeholder="Lời căn dặn thêm về thiền phục, chiều cao cân nặng để shop đối soát..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-brand-ivory border border-brand-stone/30 rounded-sm p-2.5 focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-brand-primary text-brand-bg font-bold py-3 uppercase tracking-widest hover:bg-brand-brown transition-all shadow-md active:scale-98 cursor-pointer rounded-sm"
                >
                  Xác nhận tịnh gửi đơn hàng
                </button>

                <button
                  type="button"
                  onClick={() => setCheckoutStep("cart")}
                  className="w-full text-center text-brand-stone hover:text-brand-primary underline tracking-widest uppercase text-[10px] font-bold mt-2 py-1"
                >
                  Quay lại giỏ y phục
                </button>
              </form>
            )}

            {/* Meditative Success Message */}
            {checkoutStep === "success" && (
              <div className="flex flex-col items-center text-center justify-center py-10 gap-5">
                <CheckCircle size={48} className="text-emerald-800 animate-bounce" />
                <h3 className="font-serif-elegant text-xl text-brand-primary font-bold">
                  Bình An Đã Được Khởi Phát!
                </h3>
                <div className="text-xs text-brand-secondary/95 leading-relaxed flex flex-col gap-3">
                  <p>
                    A Di Đà Phật! Bổn hiệu Từ Tâm Phục đã nhận được lòng duyên lành thỉnh y phục của quý hữu: <strong>{formData.fullName}</strong>.
                  </p>
                  <p>
                    Hệ thống đã ghi nhận địa chỉ chuyển phát: <em>{formData.deliveryAddress}</em>. Nhân viên đạo tràng của chúng tôi sẽ gọi điện thoại tịnh xác định ngay hôm nay.
                  </p>
                  <p className="bg-brand-sand/40 p-3 italic text-brand-primary/90 border border-brand-sand/60 rounded-sm">
                    "Khởi tâm từ, diện trang nghiêm hằng ngày. Kính chúc đạo hữu tu học tinh tấn, phước huệ trang nghiêm, cát tường vô lượng."
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCheckoutStep("cart");
                    setFormData({ fullName: "", phoneNumber: "", deliveryAddress: "", notes: "" });
                    onClose();
                  }}
                  className="mt-6 w-full py-3 text-xs font-bold uppercase tracking-widest text-brand-bg bg-brand-primary hover:bg-brand-brown rounded-sm transition-all shadow-sm"
                >
                  Đóng tịnh tâm lại
                </button>
              </div>
            )}
          </div>

          {/* Drawer footer containing total price calculations */}
          {cartItems.length > 0 && checkoutStep === "cart" && (
            <div className="px-5 py-6 bg-brand-ivory border-t border-brand-sand/40">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-secondary">Subtotal gieo duyên:</span>
                <span className="text-base font-bold text-brand-primary tracking-wide">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[10px] text-brand-stone italic mb-4 leading-normal">
                * Miễn toàn bộ phí chuyển phát nhanh hoan hỷ cho mọi phật tử bái thỉnh.
              </p>
              <button
                onClick={() => setCheckoutStep("form")}
                className="w-full bg-brand-primary text-brand-bg py-3.5 text-xs font-bold uppercase tracking-widest hover:bg-brand-brown shadow-md transition-all active:scale-98 cursor-pointer rounded-sm text-center"
                id="cart-drawer-checkout-btn"
              >
                Tiến hành bái thỉnh y phục
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
