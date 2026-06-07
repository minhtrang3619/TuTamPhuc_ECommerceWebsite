/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ShieldCheck, Truck, ClipboardList, HelpCircle } from 'lucide-react';
import { CartItem, OrderInfo } from '../types';
import { formatPrice } from './ProductCard';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  finalTotal: number;
  discountValue: number;
  appliedPromo: string;
  onOrderSuccess: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  finalTotal,
  discountValue,
  appliedPromo,
  onOrderSuccess,
}: CheckoutModalProps) {
  const [form, setForm] = useState<OrderInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    paymentMethod: 'cod',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof OrderInfo, string>>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const subTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof OrderInfo]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof OrderInfo, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Kính mời quý huynh đệ điền đầy đủ danh tính.';
    if (!form.phone.trim()) {
      newErrors.phone = 'Quý huynh đệ vui lòng để lại số liên lạc để bưu điện báo phát.';
    } else if (!/^[0-9+() \-]{8,15}$/.test(form.phone.trim())) {
      newErrors.phone = 'Số liên lạc không hợp lệ.';
    }
    if (!form.address.trim()) newErrors.address = 'Xin huynh đệ điền địa chỉ để nhận áo.';
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {
      newErrors.email = 'Email không hợp lệ.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSuccess(true);
  };

  const handleCompleteAll = () => {
    onOrderSuccess(); // empty cart
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs"
          />

          {/* Checkout Stage */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-[#f9f9f9] w-full max-w-4xl rounded-xs shadow-2xl overflow-hidden font-sans border border-[#d4c3be]/40 z-10 max-h-[90vh] flex flex-col"
          >
            {/* Header tab */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#d4c3be]/30 bg-white shrink-0">
              <h3 className="font-serif text-lg font-bold uppercase text-primary tracking-wider">Đặt áo tu duyên</h3>
              <button
                onClick={onClose}
                className="p-1 px-1.5 rounded-full hover:bg-surface-container-low cursor-pointer transition-colors"
                title="Quay lại"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {!isSuccess ? (
                <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#d4c3be]/30">
                  
                  {/* Left: Shipper Form */}
                  <form onSubmit={handleSubmit} className="md:col-span-7 p-6 md:p-8 space-y-5">
                    <span className="block text-xs uppercase tracking-widest font-bold text-primary mb-4 border-b border-[#eeeeee] pb-2">
                      Thông tin thỉnh pháp phục
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-[11px] uppercase tracking-widest text-[#5d4037] font-semibold mb-1.5">
                          Danh tính huynh đệ <span className="text-red-700">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Ví dụ: Bùi Minh Trang"
                          value={form.name}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                        />
                        {errors.name && <p className="text-[10px] text-red-700 mt-1">{errors.name}</p>}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-[11px] uppercase tracking-widest text-[#5d4037] font-semibold mb-1.5">
                          Số điện thoại báo phát <span className="text-red-700">*</span>
                        </label>
                        <input
                          type="text"
                          name="phone"
                          placeholder="Số gửi chuyển phát"
                          value={form.phone}
                          onChange={handleInputChange}
                          className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                        />
                        {errors.phone && <p className="text-[10px] text-red-700 mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-[#5d4037] font-semibold mb-1.5">
                        Địa chỉ thư điện tử (Email) <span className="text-on-surface-variant/40 font-normal">(Không bắt buộc)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="Để nhận hóa đơn số"
                        value={form.email}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                      />
                      {errors.email && <p className="text-[10px] text-red-700 mt-1">{errors.email}</p>}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-[#5d4037] font-semibold mb-1.5">
                        Địa chỉ nhận áo phát tâm <span className="text-red-700">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        placeholder="Số nhà, đường phố, phường/xã, quận/huyện, thành phố..."
                        value={form.address}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 .5 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden"
                      />
                      {errors.address && <p className="text-[10px] text-red-700 mt-1">{errors.address}</p>}
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-[#5d4037] font-semibold mb-1.5">
                        Lời nhắn gửi tới Từ Tâm Phục
                      </label>
                      <textarea
                        name="notes"
                        rows={3}
                        placeholder="Yêu cầu riêng về kích thước hoặc thời gian phát (ví dụ: giao giờ hành chính, ướp thêm trầm hương...)"
                        value={form.notes}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-hidden resize-none"
                      />
                    </div>

                    {/* Payment methods */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-widest text-[#5d4037] font-semibold mb-2">
                        Phương thức tạ duyên (Thanh toán)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
                        <label className={`border rounded-sm p-3.5 flex items-start gap-2.5 cursor-pointer hover:border-primary transition-all ${
                          form.paymentMethod === 'cod' ? 'border-primary bg-[#ece0dc]/10' : 'border-[#d4c3be]'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="cod"
                            checked={form.paymentMethod === 'cod'}
                            onChange={handleInputChange}
                            className="form-radio text-primary focus:ring-primary mt-0.5 cursor-pointer h-4 w-4"
                          />
                          <div>
                            <span className="block text-xs font-bold text-primary">COD (Thanh toán khi nhận)</span>
                            <span className="block text-[10px] text-on-surface-variant/80 mt-0.5">Nhận tà áo, kiểm tra ưng ý rồi gửi tạ duyên bưu tá.</span>
                          </div>
                        </label>

                        <label className={`border rounded-sm p-3.5 flex items-start gap-2.5 cursor-pointer hover:border-primary transition-all ${
                          form.paymentMethod === 'bank_transfer' ? 'border-primary bg-[#ece0dc]/10' : 'border-[#d4c3be]'
                        }`}>
                          <input
                            type="radio"
                            name="paymentMethod"
                            value="bank_transfer"
                            checked={form.paymentMethod === 'bank_transfer'}
                            onChange={handleInputChange}
                            className="form-radio text-primary focus:ring-primary mt-0.5 cursor-pointer h-4 w-4"
                          />
                          <div>
                            <span className="block text-xs font-bold text-primary">Hành chuyển khoản ngân hàng</span>
                            <span className="block text-[10px] text-on-surface-variant/80 mt-0.5">Chuyển trực tiếp dâng mẫu trầm để xưởng chuẩn bị chu đáo nhất.</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 mt-4 bg-primary hover:bg-[#2c160e] text-white text-xs tracking-widest uppercase font-bold transition-all rounded-sm flex justify-center items-center gap-2 cursor-pointer shadow-md"
                    >
                      Xác nhận thỉnh thành công đơn hàng
                    </button>
                  </form>

                  {/* Right: Checkout overview basket list */}
                  <div className="md:col-span-5 p-6 md:p-8 bg-[#eeeeee]/20 flex flex-col justify-between">
                    <div>
                      <span className="block text-xs uppercase tracking-widest font-bold text-primary mb-4 border-b border-[#eeeeee] pb-2">
                        Tóm lược tinh phẩm thỉnh tạ
                      </span>

                      {/* Items loop */}
                      <div className="space-y-4 max-h-[220px] overflow-y-auto mb-6 pr-1.5 scrollbar-thin">
                        {cart.map((item) => (
                          <div key={item.id} className="flex gap-3 text-xs items-start">
                            <img
                              alt={item.product.name}
                              src={item.product.images[0]}
                              className="w-12 aspect-[3/4] object-cover bg-surface-container rounded-xs"
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1">
                              <h4 className="font-serif font-bold text-primary">{item.product.name}</h4>
                              <p className="text-[10px] text-on-surface-variant/80 mt-0.5 font-medium">
                                Cỡ: {item.size} • {item.color.name}
                              </p>
                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[10px] text-on-surface-variant">Lượng: {item.quantity}</span>
                                <span className="font-mono font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="w-full h-px bg-[#eeeeee] my-4" />

                      {/* Cash Breakdown list */}
                      <div className="space-y-2 text-xs font-semibold text-on-surface-variant">
                        <div className="flex justify-between">
                          <span>Duyên tiền tạm tính</span>
                          <span className="font-mono text-on-surface">{formatPrice(subTotal)}</span>
                        </div>
                        {discountValue > 0 && (
                          <div className="flex justify-between text-emerald-800">
                            <span>Chiết khấu từ xưởng xơ ({appliedPromo})</span>
                            <span className="font-mono">- {formatPrice(discountValue)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Chi phí chuyển phát hành trà</span>
                          <span className="text-emerald-800 uppercase font-bold text-[10px]">Tịnh tâm trợ phí (Miễn phí)</span>
                        </div>
                        
                        <div className="w-full h-px bg-[#eeeeee] my-2" />
                        
                        <div className="flex justify-between text-base text-primary font-bold">
                          <span>Tổng tạ duyên</span>
                          <span className="font-mono text-lg text-primary">{formatPrice(finalTotal)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Guarantees */}
                    <div className="mt-8 border border-[#d4c3be]/40 bg-white p-4 space-y-2.5 text-[11px] text-[#5d4037] rounded-sm">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-primary shrink-0" />
                        <span>Đóng gói mộc hũ, chuyển nhanh toàn quốc trong 2-4 ngày tụ linh.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-primary shrink-0" />
                        <span>Phục tùng tịnh chí, đổi size tận tà trong vòng nửa tháng tịnh cốc.</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Success screen display inside modal */
                <div className="p-10 text-center flex flex-col items-center justify-center max-w-2xl mx-auto my-6 font-sans">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-white shadow-md mb-6"
                  >
                    <CheckCircle2 size={44} className="stroke-[1.5]" />
                  </motion.div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#5d4037] font-semibold mb-2">Thỉnh tà áo viên mãn</span>
                  <h3 className="font-serif text-2xl font-bold text-primary mb-3">Tâm Ý Đã Nhận • Gửi Trọn Thành Kính</h3>
                  
                  <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                    Mã đơn tu duyên của quý thiền hữu là <span className="font-mono font-bold text-primary text-sm">#TTP-ORDER-{Math.floor(100000 + Math.random() * 900000)}</span>. 
                    Chúng tôi sẽ nhanh chóng chuẩn bị tà áo phẳng phiu, chuốt sọi tự nhiên, ướp thơm làn khói nhang trầm quế rồi đóng gói chu đáo gửi tới địa chỉ của huynh đệ.
                  </p>

                  <div className="w-full bg-[#ece0dc]/30 border border-[#d4c3be]/40 p-5 rounded-md text-left text-xs text-[#5d4037] space-y-2 mb-8">
                    <h5 className="font-serif font-bold text-primary uppercase tracking-wider border-b border-[#eeeeee] pb-1.5 flex items-center gap-1.5">
                      <ClipboardList size={14} /> Tóm lược tịnh đơn kính gửi
                    </h5>
                    <div className="flex justify-between">
                      <span>Thiền hữu:</span>
                      <span className="font-bold text-on-surface">{form.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Liên hệ báo phát:</span>
                      <span className="font-bold text-on-surface">{form.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nơi nhận tinh phẩm:</span>
                      <span className="font-bold text-on-surface text-right max-w-sm">{form.address}</span>
                    </div>
                    {form.paymentMethod === 'bank_transfer' && (
                      <div className="bg-[#442a22] text-white p-3 rounded-sm mt-3 border border-[#655d5a] space-y-1.5 text-[11px]">
                        <p className="font-semibold text-center uppercase tracking-wider text-[#d4ada1]">Thông tin thỉnh duyên</p>
                        <p className="text-center text-[10px] opacity-80">Quý huynh vui lòng chuyển tạ duyên theo thông tin sau:</p>
                        <div className="flex justify-between font-mono pt-1 text-white border-t border-white/10">
                          <span>Ngân hàng:</span> <span>Techcombank (TCB)</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>Số tài khoản:</span> <span>1903 507 6432 026</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>Chủ tài khoản:</span> <span>TU TAM PHUC CO. LTD</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>Số tiền tạ:</span> <span className="font-bold text-[#ffdbd0]">{formatPrice(finalTotal)}</span>
                        </div>
                        <p className="text-center text-[9px] opacity-70 italic pt-1">Cú pháp: Họ tên + SĐT đặt áo</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-on-surface-variant/70 italic max-w-md mx-auto mb-8">
                    "Khởi tâm từ, diện trang nghiêm. Cầu chúc cho quý thiền hữu mỗi lần khoác tấm áo Từ Tâm đều cảm nhận được mười phần tĩnh lặng bên trong."
                  </p>

                  <button
                    onClick={handleCompleteAll}
                    className="px-8 py-3 bg-primary hover:bg-[#2c160e] text-white font-semibold text-xs tracking-widest uppercase transition-colors rounded-xs shadow-md cursor-pointer"
                  >
                    Trở về tịnh trai
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
