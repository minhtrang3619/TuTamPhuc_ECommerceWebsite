import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Truck, ClipboardList, Leaf, ChevronDown, ChevronUp, MapPin, Edit3, Check } from 'lucide-react';
import { OrderInfo } from '../../mockTypes';
import { useMockCartStore } from '@/store/mockCartStore';
import { formatPrice } from './ProductCard';
import MapDistance from './MapDistance';
import { useAuthStore } from '../../store/authStore';
import { addressService, orderService } from '../../services';
import type { UserAddress } from '../../types';

const parseAddressString = (addressStr: string) => {
  const parts = addressStr.split(',').map(p => p.trim());
  let street = addressStr;
  let ward = 'Mặc định';
  let district = 'Mặc định';
  let province = 'Mặc định';

  if (parts.length >= 4) {
    province = parts[parts.length - 1];
    district = parts[parts.length - 2];
    ward = parts[parts.length - 3];
    street = parts.slice(0, parts.length - 3).join(', ');
  } else if (parts.length === 3) {
    province = parts[2];
    district = parts[1];
    ward = parts[0];
  } else if (parts.length === 2) {
    province = parts[1];
    district = parts[0];
  }
  return { street, ward, district, province };
};


export default function CheckoutModal() {
  const {
    cart,
    buyNowItem,
    isCheckoutOpen,
    closeCheckout,
    clearCart,
    clearBuyNowItem,
  } = useMockCartStore();

  const checkoutItems = buyNowItem ? [buyNowItem] : cart;

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [defaultAddress, setDefaultAddress] = useState('12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội');
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [form, setForm] = useState<OrderInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
    paymentMethod: 'cod',
    charityMessage: '',
    isCharityAnonymous: false,
  });

  useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (isCheckoutOpen && isAuthenticated) {
        try {
          const data: UserAddress[] = await addressService.getAddresses();
          const defaultAddrObj = data.find(addr => addr.isDefault);
          if (defaultAddrObj) {
            const formatted = `${defaultAddrObj.street}, ${defaultAddrObj.ward}, ${defaultAddrObj.district}, ${defaultAddrObj.province}`;
            setDefaultAddress(formatted);
            setForm(prev => ({
              ...prev,
              name: prev.name || defaultAddrObj.name || user?.full_name || 'Khách Hàng Từ Tâm',
              phone: prev.phone || defaultAddrObj.phone || user?.phone || '0912345678',
              email: prev.email || user?.email || 'customer@gmail.com',
              address: prev.address || formatted,
            }));
          } else if (data.length > 0) {
            const firstAddrObj = data[0];
            const formatted = `${firstAddrObj.street}, ${firstAddrObj.ward}, ${firstAddrObj.district}, ${firstAddrObj.province}`;
            setDefaultAddress(formatted);
            setForm(prev => ({
              ...prev,
              name: prev.name || firstAddrObj.name || user?.full_name || 'Khách Hàng Từ Tâm',
              phone: prev.phone || firstAddrObj.phone || user?.phone || '0912345678',
              email: prev.email || user?.email || 'customer@gmail.com',
              address: prev.address || formatted,
            }));
          } else {
            // No addresses in book, fall back to user profile info
            setForm(prev => ({
              ...prev,
              name: prev.name || user?.full_name || 'Khách Hàng Từ Tâm',
              phone: prev.phone || user?.phone || '0912345678',
              email: prev.email || user?.email || 'customer@gmail.com',
              address: prev.address || user?.customer?.address || defaultAddress,
            }));
          }
        } catch (err) {
          console.error("Lỗi khi tải địa chỉ mặc định:", err);
          setForm(prev => ({
            ...prev,
            name: prev.name || user?.full_name || 'Khách Hàng Từ Tâm',
            phone: prev.phone || user?.phone || '0912345678',
            email: prev.email || user?.email || 'customer@gmail.com',
            address: prev.address || user?.customer?.address || defaultAddress,
          }));
        }
      } else if (isCheckoutOpen) {
        // Guest user or not authenticated
        setForm(prev => ({
          ...prev,
          name: prev.name || 'Khách Hàng Từ Tâm',
          phone: prev.phone || '0912345678',
          email: prev.email || 'customer@gmail.com',
          address: prev.address || defaultAddress,
        }));
      }
    };

    fetchDefaultAddress();
  }, [isCheckoutOpen, isAuthenticated, user]);

  const [errors, setErrors] = useState<Partial<Record<keyof OrderInfo, string>>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const subTotal = checkoutItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const shippingCosts = {
    standard: { name: 'Giao hàng nhanh (2-3 ngày)', price: 30000 },
    express: { name: 'Hỏa tốc (2h-4h)', price: 50000 },
    economy: { name: 'Giao hàng tiết kiệm (4-6 ngày)', price: 15000 },
  };

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'economy'>('standard');
  const [promoVoucher, setPromoVoucher] = useState<string>('');
  const [shipVoucher, setShipVoucher] = useState<string>('');
  const [showCharityMsg, setShowCharityMsg] = useState(false);
  const [showPromoSection, setShowPromoSection] = useState(false);

  const selectedShippingCost = shippingCosts[shippingMethod].price;

  const promoDiscount = promoVoucher === 'TUTAMVIP15'
    ? Math.round(subTotal * 0.15)
    : promoVoucher === 'ANNHIEN100'
      ? 100000
      : promoVoucher === 'GIEOVUI50'
        ? 50000
        : 0;

  const shipDiscount = shipVoucher === 'FREESHIP'
    ? Math.min(selectedShippingCost, 30000)
    : shipVoucher === 'SHIPANNHIEN'
      ? Math.min(selectedShippingCost, 15000)
      : 0;

  const actualShippingFee = Math.max(0, selectedShippingCost - shipDiscount);
  const finalTotal = Math.max(0, subTotal - promoDiscount + actualShippingFee);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((prev) => ({ ...prev, [name]: val }));
    if (errors[name as keyof OrderInfo]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof OrderInfo, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Vui lòng điền đầy đủ họ tên.';
    if (!form.phone.trim()) {
      newErrors.phone = 'Vui lòng điền số điện thoại liên hệ.';
    } else if (!/^[0-9+() \-]{8,15}$/.test(form.phone.trim())) {
      newErrors.phone = 'Số điện thoại không hợp lệ.';
    }
    if (!form.address.trim()) newErrors.address = 'Vui lòng điền địa chỉ nhận hàng.';
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email.trim())) {
      newErrors.email = 'Email không hợp lệ.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const parsedAddress = parseAddressString(form.address);
      const items = checkoutItems.map(item => ({
        product_id: item.product.dbId || parseInt(item.product.id),
        quantity: item.quantity,
        color_name: item.color.name,
        color_hex: item.color.hex,
        size: item.size,
        price: item.product.price,
      }));

      const orderData = {
        shipping_address: {
          full_name: form.name,
          phone: form.phone,
          address: form.address,
          ward: parsedAddress.ward,
          district: parsedAddress.district,
          province: parsedAddress.province,
          charity_message: form.charityMessage,
          is_charity_anonymous: form.isCharityAnonymous,
        },
        payment_method: form.paymentMethod,
        notes: form.notes || undefined,
        coupon_code: promoVoucher || undefined,
        items: items,
        discount: promoDiscount + shipDiscount,
        shipping_fee: actualShippingFee,
      };

      const createdOrder = await orderService.create(orderData);

      // Clear appropriate items and close checkout modal
      if (buyNowItem) {
        clearBuyNowItem();
      } else {
        clearCart();
      }
      closeCheckout();

      // Redirect to Order Success page
      navigate(`/order-success?code=${createdOrder.order_code}&payment=${createdOrder.payment_method}&name=${encodeURIComponent(createdOrder.shipping_address.full_name)}&phone=${encodeURIComponent(createdOrder.shipping_address.phone)}&address=${encodeURIComponent(createdOrder.shipping_address.address)}`);
    } catch (err: any) {
      console.error("Lỗi khi tạo đơn hàng:", err);
      const errMsg = err?.response?.data?.detail || err?.message || 'Đã có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteAll = () => {
    if (buyNowItem) {
      clearBuyNowItem();
    } else {
      clearCart();
    }
    setIsSuccess(false);
    closeCheckout();
  };

  if (!isCheckoutOpen) return null;

  if (!isAuthenticated) {
    return (
      <AnimatePresence>
        {isCheckoutOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeCheckout}
              className="fixed inset-0 bg-black/45 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white p-8 max-w-md w-full rounded-sm shadow-xl border border-[#d4c3be]/40 z-10 text-center font-sans animate-in fade-in duration-300"
            >
              <h3 className="font-serif text-lg font-bold text-primary mb-3">Đăng Nhập Để Tiếp Tục</h3>
              <p className="text-xs text-on-surface-variant mb-6 font-sans">
                Vui lòng đăng nhập tài khoản của bạn để tiến hành đặt hàng và lưu trữ thông tin đơn hàng.
              </p>
              <div className="flex gap-4 font-sans">
                <button
                  type="button"
                  onClick={closeCheckout}
                  className="flex-1 py-2.5 border border-[#d4c3be] text-[#5d4037] text-xs font-bold rounded-xs cursor-pointer hover:bg-[#eeeeee]/50 transition-colors"
                >
                  Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    closeCheckout();
                    navigate('/login', { state: { from: window.location.pathname } });
                  }}
                  className="flex-1 py-2.5 bg-primary text-white text-xs font-bold rounded-xs cursor-pointer hover:bg-[#2c160e] transition-colors"
                >
                  Đăng nhập
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop screen */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCheckout}
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
              <h3 className="font-serif text-lg font-bold uppercase text-primary tracking-wider">Đặt hàng</h3>
              <button
                onClick={closeCheckout}
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
                  <form onSubmit={handleSubmit} className="md:col-span-7 p-6 md:p-8 space-y-4 font-sans">
                    <span className="block text-xs uppercase tracking-widest font-extrabold text-primary mb-4 border-b border-[#eeeeee] pb-2">
                      Thông tin giao hàng
                    </span>

                    {/* Conditional address summary or editing fields */}
                    {!isEditingAddress ? (
                      /* Simplified view displaying default address */
                      <div className="bg-[#faf6f0] border border-[#ece0dc] p-5 rounded-md relative font-sans space-y-3 shadow-sm animate-in fade-in duration-300">
                        <div className="flex justify-between items-center border-b border-[#ece0dc] pb-2.5">
                          <span className="text-[10px] uppercase tracking-widest font-extrabold text-primary flex items-center gap-1.5">
                            <MapPin size={13} className="text-primary" /> Địa chỉ giao hàng (Mặc định)
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsEditingAddress(true)}
                            className="text-[10px] uppercase font-bold tracking-wider text-primary hover:opacity-85 flex items-center gap-1 bg-transparent border-0 cursor-pointer transition-opacity"
                          >
                            <Edit3 size={11} /> Thay đổi
                          </button>
                        </div>
                        <div className="space-y-1.5 text-xs text-[#5d4037] pt-1">
                          <p className="flex justify-between"><span className="opacity-75">Người nhận:</span> <strong className="text-on-surface">{form.name}</strong></p>
                          <p className="flex justify-between"><span className="opacity-75">Số điện thoại:</span> <strong className="text-on-surface">{form.phone}</strong></p>
                          <p className="flex justify-between items-start gap-4"><span className="opacity-75 shrink-0">Địa chỉ:</span> <strong className="text-on-surface text-right">{form.address}</strong></p>
                        </div>
                      </div>
                    ) : (
                      /* Detailed editing view with Map and dynamic calculations */
                      <div className="space-y-4 p-5 bg-white border border-[#d4c3be]/40 rounded-md shadow-xs animate-in fade-in duration-300">
                        <span className="block text-[10px] uppercase tracking-widest font-extrabold text-primary mb-2 border-b border-[#eeeeee] pb-1.5">
                          Thay đổi thông tin nhận hàng
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Name */}
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-bold mb-1.5">
                              Họ tên khách hàng <span className="text-red-700">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              placeholder="Ví dụ: Bùi Minh Trang"
                              value={form.name}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            />
                            {errors.name && <p className="text-[10px] text-red-700 mt-1">{errors.name}</p>}
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-bold mb-1.5">
                              Số điện thoại nhận hàng <span className="text-red-700">*</span>
                            </label>
                            <input
                              type="text"
                              name="phone"
                              placeholder="Số điện thoại của bạn"
                              value={form.phone}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            />
                            {errors.phone && <p className="text-[10px] text-red-700 mt-1">{errors.phone}</p>}
                          </div>
                        </div>

                        {/* Address */}
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-bold mb-1.5">
                            Địa chỉ nhận hàng <span className="text-red-700">*</span>
                          </label>
                          <input
                            type="text"
                            name="address"
                            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố..."
                            value={form.address}
                            onChange={handleInputChange}
                            className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                          />
                          {errors.address && <p className="text-[10px] text-red-700 mt-1">{errors.address}</p>}
                        </div>

                        {/* Map Location Selector */}
                        <MapDistance customerAddress={form.address} />

                        <div className="flex justify-end gap-2 pt-2 border-t border-[#eeeeee]">
                          <button
                            type="button"
                            onClick={() => {
                              setForm(prev => ({
                                ...prev,
                                name: user?.full_name || 'Khách Hàng Từ Tâm',
                                phone: user?.phone || '0912345678',
                                address: defaultAddress
                              }));
                              setIsEditingAddress(false);
                            }}
                            className="px-4 py-2 border border-[#d4c3be] text-[#5d4037] text-[10px] uppercase font-bold tracking-wider rounded-xs hover:bg-[#eeeeee]/50 cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
                                validate();
                                return;
                              }
                              setDefaultAddress(form.address);
                              setIsEditingAddress(false);
                            }}
                            className="px-4 py-2 bg-primary text-white text-[10px] uppercase font-bold tracking-wider rounded-xs hover:bg-[#2c160e] flex items-center gap-1 cursor-pointer"
                          >
                            <Check size={12} /> Xác nhận địa chỉ
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-bold mb-1.5">
                        Lời nhắn giao hàng <span className="text-on-surface-variant/40 font-normal">(Không bắt buộc)</span>
                      </label>
                      <input
                        type="text"
                        name="notes"
                        placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                        value={form.notes}
                        onChange={handleInputChange}
                        className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                      />
                    </div>

                    {/* Charity toggle checkbox */}
                    <div className="pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#5d4037] font-semibold">
                        <input
                          type="checkbox"
                          checked={showCharityMsg}
                          onChange={(e) => setShowCharityMsg(e.target.checked)}
                          className="form-checkbox text-primary focus:ring-primary rounded-xs h-4 w-4 border-[#d4c3be]"
                        />
                        <span>Gửi lời chúc an lành tới các chùa & tu viện (Gieo Mầm Từ Tâm)</span>
                      </label>

                      {showCharityMsg && (
                        <div className="mt-3 p-3.5 bg-[#faf6f0] border border-[#ece0dc] rounded-sm space-y-3">
                          <div>
                            <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-bold mb-1">
                              Lời nhắn gửi kèm theo khoản đóng góp
                            </label>
                            <textarea
                              name="charityMessage"
                              rows={2}
                              placeholder="Lời chúc an vui hoặc gửi gắm yêu thương..."
                              value={form.charityMessage}
                              onChange={handleInputChange}
                              className="w-full bg-white border border-[#d4c3be] rounded-sm py-1.5 px-2.5 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
                            />
                          </div>
                          <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-[#5d4037]">
                            <input
                              type="checkbox"
                              name="isCharityAnonymous"
                              checked={form.isCharityAnonymous}
                              onChange={handleInputChange}
                              className="form-checkbox text-primary focus:ring-primary rounded-xs h-3.5 w-3.5 border-[#d4c3be]"
                            />
                            <span>Tôi muốn ẩn danh (Không hiển thị tên tôi trên bảng công đức)</span>
                          </label>
                        </div>
                      )}
                    </div>

                    {/* Shipping Method Selection */}
                    <div className="pt-1">
                      <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-bold mb-2">
                        Phương thức vận chuyển
                      </label>
                      <div className="flex gap-2 p-1 bg-[#eeeeee]/40 rounded-sm">
                        {(Object.keys(shippingCosts) as Array<keyof typeof shippingCosts>).map((key) => {
                          const method = shippingCosts[key];
                          const isSelected = shippingMethod === key;
                          return (
                            <button
                              type="button"
                              key={key}
                              onClick={() => setShippingMethod(key)}
                              className={`flex-1 py-2 text-center text-[10px] uppercase font-bold tracking-wider rounded-xs transition-all cursor-pointer ${isSelected ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-primary bg-transparent border-0'
                                }`}
                            >
                              {key === 'standard' ? 'Nhanh' : key === 'express' ? 'Hỏa tốc' : 'Tiết kiệm'} ({formatPrice(method.price)})
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment methods */}
                    <div className="pt-1">
                      <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-bold mb-2">
                        Phương thức thanh toán
                      </label>
                      <div className="flex gap-2 p-1 bg-[#eeeeee]/40 rounded-sm">
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'cod' }))}
                          className={`flex-1 py-2 text-center text-[10px] uppercase font-bold tracking-wider rounded-xs transition-all cursor-pointer ${form.paymentMethod === 'cod' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-primary bg-transparent border-0'
                            }`}
                        >
                          COD (Khi nhận hàng)
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm(prev => ({ ...prev, paymentMethod: 'bank_transfer' }))}
                          className={`flex-1 py-2 text-center text-[10px] uppercase font-bold tracking-wider rounded-xs transition-all cursor-pointer ${form.paymentMethod === 'bank_transfer' ? 'bg-primary text-white shadow-xs' : 'text-on-surface-variant hover:text-primary bg-transparent border-0'
                            }`}
                        >
                          Chuyển khoản
                        </button>
                      </div>
                    </div>

                    {submitError && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xs text-center font-medium animate-in fade-in duration-300">
                        {submitError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3.5 mt-4 bg-primary hover:bg-[#2c160e] text-white text-[11px] tracking-widest uppercase font-bold transition-all rounded-xs flex justify-center items-center gap-2 cursor-pointer shadow-md ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Đang xử lý...
                        </>
                      ) : (
                        'Xác nhận đặt hàng'
                      )}
                    </button>
                  </form>

                  {/* Right: Checkout overview basket list */}
                  <div className="md:col-span-5 p-6 md:p-8 bg-[#eeeeee]/20 flex flex-col justify-between">
                    <div>
                      <span className="block text-xs uppercase tracking-widest font-bold text-primary mb-4 border-b border-[#eeeeee] pb-2">
                        Tóm tắt đơn hàng
                      </span>

                      {/* Items loop */}
                      <div className="space-y-4 max-h-[220px] overflow-y-auto mb-6 pr-1.5 scrollbar-thin">
                        {checkoutItems.map((item) => (
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
                                <span className="text-[10px] text-on-surface-variant">Số lượng: {item.quantity}</span>
                                <span className="font-mono font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="w-full h-px bg-[#eeeeee] my-4" />

                      {/* Vouchers Accordion */}
                      <div className="mb-5 font-sans border border-[#d4c3be]/40 rounded-sm overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => setShowPromoSection(!showPromoSection)}
                          className="w-full flex justify-between items-center px-4 py-2.5 bg-[#ece0dc]/10 hover:bg-[#ece0dc]/20 text-[10px] font-bold text-primary tracking-wider uppercase transition-colors cursor-pointer select-none border-0"
                        >
                          <span>Áp dụng khuyến mãi</span>
                          {showPromoSection ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showPromoSection && (
                          <div className="p-4 space-y-4 border-t border-[#d4c3be]/30 bg-[#faf6f0]/30">
                            {/* Promo Voucher */}
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">
                                Khuyến mãi từ cửa hàng
                              </label>
                              <select
                                value={promoVoucher}
                                onChange={(e) => setPromoVoucher(e.target.value)}
                                className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 px-2.5 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                              >
                                <option value="">-- Chọn mã giảm giá --</option>
                                <option value="TUTAMVIP15">TUTAMVIP15 (Giảm 15% tổng hàng)</option>
                                <option value="ANNHIEN100">ANNHIEN100 (Giảm 100.000đ)</option>
                                <option value="GIEOVUI50">GIEOVUI50 (Giảm 50.000đ)</option>
                              </select>
                            </div>

                            {/* Shipping Voucher */}
                            <div>
                              <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">
                                Giảm giá phí vận chuyển (Freeship)
                              </label>
                              <select
                                value={shipVoucher}
                                onChange={(e) => setShipVoucher(e.target.value)}
                                className="w-full bg-white border border-[#d4c3be] rounded-sm py-2 px-2.5 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none cursor-pointer"
                              >
                                <option value="">-- Chọn mã vận chuyển --</option>
                                <option value="FREESHIP">FREESHIP (Giảm tối đa 30.000đ)</option>
                                <option value="SHIPANNHIEN">SHIPANNHIEN (Giảm tối đa 15.000đ)</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cash Breakdown list */}
                      <div className="space-y-2 text-xs font-semibold text-on-surface-variant">
                        <div className="flex justify-between">
                          <span>Tạm tính</span>
                          <span className="font-mono text-on-surface">{formatPrice(subTotal)}</span>
                        </div>
                        {promoDiscount > 0 && (
                          <div className="flex justify-between text-emerald-800">
                            <span>Chiết khấu cửa hàng ({promoVoucher})</span>
                            <span className="font-mono">- {formatPrice(promoDiscount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Phí vận chuyển</span>
                          <span className="font-mono text-on-surface">{formatPrice(selectedShippingCost)}</span>
                        </div>
                        {shipDiscount > 0 && (
                          <div className="flex justify-between text-emerald-800">
                            <span>Giảm giá vận chuyển ({shipVoucher})</span>
                            <span className="font-mono">- {formatPrice(shipDiscount)}</span>
                          </div>
                        )}

                        <div className="w-full h-px bg-[#eeeeee] my-2" />

                        <div className="flex justify-between text-base text-primary font-bold">
                          <span>Tổng thanh toán</span>
                          <span className="font-mono text-lg text-primary">{formatPrice(finalTotal)}</span>
                        </div>

                        <div className="w-full h-px bg-[#eeeeee] my-2" />

                        <div className="bg-[#faf6f0] border border-[#ece0dc] p-3 rounded-sm text-[10px] leading-relaxed text-[#5d4037] font-sans flex items-start gap-2.5 shadow-xs">
                          <Leaf className="text-primary shrink-0 mt-0.5" size={14} />
                          <div>
                            <span className="block font-bold text-primary mb-0.5">Gieo Mầm Từ Tâm:</span>
                            <span>Đơn hàng này trích 5% từ doanh thu để cúng dường các chùa và tu viện giúp đỡ các em nhỏ mồ côi và người già neo đơn.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Guarantees */}
                    <div className="mt-8 border border-[#d4c3be]/40 bg-white p-4 space-y-2.5 text-[11px] text-[#5d4037] rounded-sm">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-primary shrink-0" />
                        <span>Đóng gói cẩn thận, giao hàng toàn quốc từ 2-4 ngày.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-primary shrink-0" />
                        <span>Hỗ trợ đổi size dễ dàng trong vòng 15 ngày.</span>
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
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#5d4037] font-semibold mb-2">Đặt hàng thành công</span>
                  <h3 className="font-serif text-2xl font-bold text-primary mb-3">Đặt Hàng Thành Công</h3>

                  <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                    Mã đơn hàng của quý khách là <span className="font-mono font-bold text-primary text-sm">#TTP-ORDER-{Math.floor(100000 + Math.random() * 900000)}</span>.
                    Chúng tôi sẽ nhanh chóng chuẩn bị sản phẩm phẳng phiu, đóng gói chu đáo và giao tới địa chỉ của quý khách.
                  </p>

                  <div className="w-full bg-[#ece0dc]/30 border border-[#d4c3be]/40 p-5 rounded-md text-left text-xs text-[#5d4037] space-y-2 mb-8">
                    <h5 className="font-serif font-bold text-primary uppercase tracking-wider border-b border-[#eeeeee] pb-1.5 flex items-center gap-1.5">
                      <ClipboardList size={14} /> Thông tin chi tiết đơn hàng
                    </h5>
                    <div className="flex justify-between">
                      <span>Quý khách:</span>
                      <span className="font-bold text-on-surface">{form.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số điện thoại:</span>
                      <span className="font-bold text-on-surface">{form.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Địa chỉ giao hàng:</span>
                      <span className="font-bold text-on-surface text-right max-w-sm">{form.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hình thức vận chuyển:</span>
                      <span className="font-bold text-on-surface">{shippingCosts[shippingMethod].name}</span>
                    </div>

                    <div className="w-full h-px bg-[#eeeeee]/50 my-1" />

                    <div className="flex justify-between">
                      <span>Đóng góp quỹ chùa & tu viện:</span>
                      <span className="font-bold text-primary">5% Doanh thu</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Danh tính người gieo duyên:</span>
                      <span className="font-bold text-on-surface">{form.isCharityAnonymous ? 'Người gieo duyên ẩn danh' : form.name}</span>
                    </div>

                    {form.charityMessage?.trim() && (
                      <div className="pt-2 border-t border-[#eeeeee]/50 mt-1">
                        <span className="block text-[10px] uppercase font-bold text-[#8a726b] mb-1">Lời nhắn gửi kèm của người gieo duyên:</span>
                        <p className="p-2.5 bg-white/60 border border-[#d4c3be]/30 rounded-sm italic text-on-surface-variant text-[11px] leading-relaxed">
                          "{form.charityMessage}"
                        </p>
                      </div>
                    )}
                    {form.paymentMethod === 'bank_transfer' && (
                      <div className="bg-[#442a22] text-white p-3 rounded-sm mt-3 border border-[#655d5a] space-y-1.5 text-[11px]">
                        <p className="font-semibold text-center uppercase tracking-wider text-[#d4ada1]">Thông tin chuyển khoản</p>
                        <p className="text-center text-[10px] opacity-80">Quý khách vui lòng chuyển khoản thanh toán theo thông tin sau:</p>
                        <div className="flex justify-between font-mono pt-1 text-white border-t border-white/10">
                          <span>Ngân hàng:</span> <span>Techcombank (Techcombank)</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>Số tài khoản:</span> <span>1903 507 6432 026</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>Chủ tài khoản:</span> <span>TU TAM PHUC CO. LTD</span>
                        </div>
                        <div className="flex justify-between font-mono">
                          <span>Số tiền:</span> <span className="font-bold text-[#ffdbd0]">{formatPrice(finalTotal)}</span>
                        </div>
                        <p className="text-center text-[9px] opacity-70 italic pt-1">Cú pháp: Họ tên + Số điện thoại</p>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-on-surface-variant/70 italic max-w-md mx-auto mb-8">
                    "Cảm ơn quý khách đã tin tưởng lựa chọn sản phẩm của Từ Tâm Phục. Chúc quý khách luôn gặp nhiều may mắn và an nhiên."
                  </p>

                  <button
                    onClick={handleCompleteAll}
                    className="px-8 py-3 bg-primary hover:bg-[#2c160e] text-white font-semibold text-xs tracking-widest uppercase transition-colors rounded-xs shadow-md cursor-pointer"
                  >
                    Tiếp tục mua sắm
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
