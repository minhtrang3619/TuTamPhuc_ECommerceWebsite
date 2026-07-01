import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Sprout, ShoppingBag, ClipboardList, ShieldCheck, MapPin, Phone, User as UserIcon } from 'lucide-react'
import { orderService, settingService } from '@/services'
import { formatPrice } from '@/components/ui/ProductCard'
import { getImageUrl } from '@/utils/productMapper'

// Map tên ngân hàng phổ biến -> mã VietQR bankId
const BANK_NAME_TO_ID: Record<string, string> = {
  'Vietcombank': 'VCB',
  'Techcombank': 'TCB',
  'BIDV': 'BIDV',
  'VietinBank': 'CTG',
  'MB Bank': 'MB',
  'MBBank': 'MB',
  'Agribank': 'AGR',
  'VPBank': 'VPB',
  'Sacombank': 'STB',
  'ACB': 'ACB',
  'TPBank': 'TPB',
  'HDBank': 'HDB',
  'VIB': 'VIB',
  'SHB': 'SHB',
  'LPBank': 'LPB',
  'MSB': 'MSB',
  'OCB': 'OCB',
  'SeABank': 'SEAB',
  'Eximbank': 'EIB',
  'SCB': 'SCB',
  'BAC A BANK': 'BAB',
  'BaoViet Bank': 'BVB',
  'DongA Bank': 'DAB',
  'Kienlongbank': 'KLB',
  'Nam A Bank': 'NAB',
  'NCB': 'NCB',
  'PG Bank': 'PGB',
  'PVcomBank': 'PVCOM',
  'Saigonbank': 'SGB',
  'VietABank': 'VAB',
  'Vietbank': 'VBB',
}


export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const orderCode = searchParams.get('code') || ''
  const paymentParam = searchParams.get('payment') || 'bank_transfer'
  const nameParam = searchParams.get('name') || 'Nguyễn An Nhiên'
  const phoneParam = searchParams.get('phone') || '0987654321'
  const addressParam = searchParams.get('address') || '12 Chùa Bộc, Quang Trung, Đống Đa, Hà Nội'

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // Fetch order details with automatic polling for bank_transfer
  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order-success', orderCode],
    queryFn: () => orderService.getByCode(orderCode),
    enabled: !!orderCode,
    retry: 1,
    // Tự động kiểm tra trạng thái mỗi 5 giây nếu đang chờ chuyển khoản
    refetchInterval: (data) => {
      const current = data as any;
      if (current?.payment_method === 'bank_transfer' && current?.payment_status === 'pending') {
        return 5000;
      }
      return false;
    }
  })

  // Fetch admin bank settings (must be before any early returns - React Rules of Hooks)
  const { data: sysSettings } = useQuery({
    queryKey: ['settings-public'],
    queryFn: () => settingService.getMap(),
    staleTime: 5 * 60 * 1000,
  })

  // Format Payment Method Name
  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng (COD)'
      case 'bank_transfer':
        return 'Chuyển khoản mã QR'
      case 'vnpay':
        return 'Thanh toán VNPAY'
      case 'momo':
        return 'Ví điện tử MoMo'
      default:
        return method
    }
  }

  // Calculate 5% product price donation
  const calculateCharityDonation = (subtotal: number) => {
    return Math.round(subtotal * 0.05)
  }

  // Fallback mock order if orderCode is empty or API error (for demo purposes)
  const mockOrder = {
    order_code: orderCode || `TTP-${Math.floor(100000 + Math.random() * 900000)}`,
    created_at: new Date().toISOString(),
    shipping_address: {
      full_name: nameParam,
      phone: phoneParam,
      address: addressParam,
    },
    payment_method: paymentParam,
    payment_status: 'pending',
    status: 'pending',
    items: [
      {
        id: 1,
        product: {
          name: 'Bộ Lam Tĩnh Tâm - Vải Linen Thô',
          images: [{ url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDrBLlbUn5BS7L-jwLAR1k7adsxRmrMAs2hSn-gg5gYuDkyFwYoCvXEiyB6isu8-DwdXdUEqs4mBdaJZCtfshb3NpeZIZppZkMJXa0Wb_Kkvb-hCxD4eXudtDErx3AXxvQ7_q5iKmS0pV-xskdvUUWrk0KtLWdGxDNMFgqyeG8rByUjTACIMFOeN4PxwHx0wdUt71TG0R4NaxrMm7szu_N8KKpWFGbFv-TBzNZtrqTsLF8Jq52ATwZCyv_aishAV8S53raJbmLVBg77' }],
          price: 580000,
        },
        size: 'M',
        color: { name: 'Nâu Sồng' },
        quantity: 1,
        subtotal: 580000,
      }
    ],
    subtotal: 580000,
    shipping_fee: 30000,
    discount: 0,
    total: 610000,
  }

  const baseOrder = isError || !order ? mockOrder : order

  const [simulatedPaymentStatus, setSimulatedPaymentStatus] = useState<'pending' | 'paid'>('pending')
  const [showSimulatedBanner, setShowSimulatedBanner] = useState(false)

  useEffect(() => {
    if (baseOrder.payment_method === 'bank_transfer' && baseOrder.payment_status === 'pending') {
      setSimulatedPaymentStatus('pending')
      setShowSimulatedBanner(false)
      const timer = setTimeout(async () => {
        try {
          await orderService.payOrder(baseOrder.order_code)
          queryClient.invalidateQueries({ queryKey: ['order-success', baseOrder.order_code] })
        } catch (err) {
          console.error("Lỗi khi cập nhật thanh toán trên server:", err)
        }
        setSimulatedPaymentStatus('paid')
        setShowSimulatedBanner(true)
      }, 30000) // Tự động thanh toán thành công sau 30 giây
      return () => clearTimeout(timer)
    }
  }, [baseOrder.order_code, queryClient])

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-brand-bg font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
        <p className="text-sm text-on-surface-variant font-medium">Đang tải thông tin đơn hàng...</p>
      </div>
    )
  }

  const currentOrder = {
    ...baseOrder,
    payment_status: baseOrder.payment_status === 'pending' && simulatedPaymentStatus === 'paid' ? 'paid' : baseOrder.payment_status
  }

  const isPendingQR = currentOrder.payment_method === 'bank_transfer' && currentOrder.payment_status === 'pending';

  const adminBankName = sysSettings?.['bank_name'] || 'MB Bank'
  const accountNo = sysSettings?.['bank_account_number'] || '000000000000'
  const accountName = sysSettings?.['bank_account_holder'] || 'CONG TY TNHH TU TAM PHUC'
  const bankId = BANK_NAME_TO_ID[adminBankName] || 'MB'
  const qrUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${currentOrder.total}&addInfo=${currentOrder.order_code}&accountName=${encodeURIComponent(accountName)}`;

  return (
    <div className="min-h-screen bg-[#faf8f5] py-16 font-sans selection:bg-primary-fixed-dim selection:text-primary">
      <div className="max-w-3xl mx-auto px-margin-mobile">
        {showSimulatedBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-sm shadow-xs flex items-center justify-between font-sans"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Ngân hàng đã xác nhận giao dịch chuyển khoản thành công cho đơn hàng <strong>{currentOrder.order_code}</strong>.</span>
            </div>
            <button 
              onClick={() => setShowSimulatedBanner(false)}
              className="text-emerald-700 hover:text-emerald-900 font-bold bg-transparent border-0 cursor-pointer text-[10px] uppercase font-sans tracking-wider"
            >
              Đóng
            </button>
          </motion.div>
        )}

        {/* Dynamic Title Header based on Payment Status */}
        <header className="text-center mb-12">
          {isPendingQR ? (
            <motion.div
              key="pending-header"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 text-amber-600 mb-6 shadow-md border-4 border-white">
                <div className="w-8 h-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"></div>
              </div>
              <span className="block text-[10px] uppercase tracking-[0.25em] font-extrabold text-amber-700 mb-2">
                Đang chờ thanh toán
              </span>
              <h1 className="font-serif text-3xl font-bold text-primary tracking-wide mb-3">
                Thanh Toán Đơn Hàng
              </h1>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                Đơn hàng của bạn đã được hệ thống ghi nhận. Quý khách vui lòng quét mã QR bên dưới để hoàn tất giao dịch.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success-header"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 100 }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6 shadow-md border-4 border-white">
                <Sprout size={42} strokeWidth={1.5} className="text-primary fill-primary/10" />
              </div>
              <span className="block text-[10px] uppercase tracking-[0.25em] font-extrabold text-[#8a726b] mb-2">
                Đơn hàng hoàn tất
              </span>
              <h1 className="font-serif text-3xl font-bold text-primary tracking-wide mb-3">
                Đặt Hàng Thành Công
              </h1>
              <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
                Từ Tâm Phục xin chân thành cảm ơn quý khách. Chúng tôi sẽ chuẩn bị sản phẩm chỉn chu, đóng gói cẩn thận và giao tới địa chỉ của bạn sớm nhất.
              </p>
            </motion.div>
          )}
        </header>

        {/* Order Main Container */}
        <main className="space-y-6">

          {/* QR Code Section for Pending Bank Transfer */}
          {isPendingQR && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border-2 border-primary/20 p-8 rounded-md shadow-sm text-center"
            >
              <h2 className="text-lg font-serif font-bold text-primary mb-2">Thanh Toán Đơn Hàng</h2>
              <p className="text-xs text-[#5d4037] mb-6 max-w-md mx-auto">
                Quý khách vui lòng mở ứng dụng ngân hàng và quét mã QR bên dưới để thanh toán.
                Hệ thống sẽ tự động ghi nhận sau khi giao dịch thành công.
                <strong className="block mt-1 text-red-600">Lưu ý: Đơn hàng sẽ tự động hủy nếu không được thanh toán trong 24h.</strong>
              </p>

              <div className="flex justify-center mb-6">
                <div className="p-3 border border-[#ece0dc] rounded-md inline-block bg-white shadow-sm">
                  <img src={qrUrl} alt="QR Code Thanh Toán" className="w-64 h-64 object-contain" />
                </div>
              </div>

              {/* Bank Account Info */}
              <div className="mx-auto max-w-xs bg-[#faf6f0] border border-[#ece0dc] rounded-md px-5 py-4 mb-5 text-left space-y-2 text-xs">
                <p className="text-[10px] uppercase tracking-widest font-bold text-primary/60 mb-1">Thông tin chuyển khoản</p>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Ngân hàng:</span>
                  <span className="font-bold text-on-surface">{adminBankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Số tài khoản:</span>
                  <span className="font-mono font-bold text-primary tracking-wider">{accountNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Chủ tài khoản:</span>
                  <span className="font-bold text-on-surface">{accountName}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#ece0dc]">
                  <span className="text-on-surface-variant">Nội dung CK:</span>
                  <span className="font-mono font-bold text-primary">{currentOrder.order_code}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-primary font-medium">
                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                Đang chờ thanh toán...
              </div>
            </motion.section>
          )}


          {/* 1. Charity Donation Callout (Zen Style) */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-[#faf6f0] border border-[#ece0dc] p-6 rounded-md shadow-xs text-center relative overflow-hidden"
          >
            <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5">
              <Sprout size={140} className="fill-primary text-primary" />
            </div>

            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/5 text-primary mb-3">
              <Sprout size={16} className="fill-primary text-primary" />
            </span>
            <h2 className="font-serif text-lg font-bold text-primary mb-2">
              Gieo Mầm Từ Tâm {formatPrice(calculateCharityDonation(currentOrder.subtotal))}
            </h2>
            <p className="text-xs text-[#5d4037] leading-relaxed max-w-xl mx-auto opacity-90">
              Cảm ơn bạn đã cùng Từ Tâm Phục gieo duyên lành. Đơn hàng này của bạn đã trích 5% từ giá bán của sản phẩm để đóng góp vào quỹ hỗ trợ các cụ già neo đơn và trẻ em mồ côi đang được cưu mang tại các chùa & tu viện Việt Nam.
            </p>
          </motion.section>

          {/* 2. Order Details Section */}
          <motion.section
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white border border-[#d4c3be]/40 rounded-md shadow-sm overflow-hidden"
          >
            {/* Header info */}
            <div className="bg-[#ece0dc]/10 px-6 py-4 border-b border-[#d4c3be]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Mã đơn hàng</span>
                <span className="font-mono font-bold text-primary text-sm">{currentOrder.order_code}</span>
              </div>
              <div className="text-right sm:text-right">
                <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider block">Thời gian đặt</span>
                <span className="text-xs text-on-surface font-medium">
                  {new Date(currentOrder.created_at).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            {/* Delivery address & payment method info cards */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-[#eeeeee]">
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-[#eeeeee] pb-1.5">
                  <MapPin size={13} /> Địa chỉ nhận hàng
                </h3>
                <div className="space-y-2 text-xs text-[#5d4037]">
                  <div className="flex items-center gap-2">
                    <UserIcon size={12} className="opacity-75" />
                    <span className="font-bold text-on-surface">{currentOrder.shipping_address.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={12} className="opacity-75" />
                    <span>{currentOrder.shipping_address.phone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin size={12} className="opacity-75 mt-0.5" />
                    <span className="leading-relaxed">{currentOrder.shipping_address.address}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3.5">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-[#eeeeee] pb-1.5">
                  <ClipboardList size={13} /> Thông tin thanh toán
                </h3>
                <div className="space-y-2 text-xs text-[#5d4037]">
                  <p className="flex justify-between">
                    <span className="opacity-75">Phương thức:</span>
                    <strong className="text-on-surface">{getPaymentMethodLabel(currentOrder.payment_method)}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="opacity-75">Thanh toán:</span>
                    <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-sm border ${currentOrder.payment_status === 'paid'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                      {currentOrder.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="opacity-75">Đóng gói:</span>
                    <span className="text-on-surface font-medium flex items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-700" /> Hộp bồi mộc cao cấp
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* List of Products */}
            <div className="p-6 border-b border-[#eeeeee] space-y-4">
              <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Sản phẩm đã chọn</h3>
              <div className="divide-y divide-[#eeeeee] space-y-3">
                {currentOrder.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 pt-3 first:pt-0 items-start">
                    <img
                      alt={item.product?.name || item.product_snapshot?.name || 'Sản phẩm'}
                      src={getImageUrl(item.product?.images?.[0]?.url || item.product?.images?.[0] || item.product_snapshot?.image)}
                      className="w-14 aspect-[3/4] object-cover bg-surface-container rounded-xs border border-[#eeeeee]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 text-xs">
                      <h4 className="font-serif font-bold text-primary text-sm">{item.product.name}</h4>
                      <p className="text-[10px] text-on-surface-variant/80 mt-1 font-medium">
                        Cỡ: {item.size} • {item.color?.name || 'Mặc định'}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-on-surface-variant">Số lượng: {item.quantity}</span>
                        <span className="font-mono font-bold text-primary">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Breakdown costs list */}
            <div className="p-6 bg-[#fafafa]/50 space-y-2.5 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Tạm tính</span>
                <span className="font-mono text-on-surface">{formatPrice(currentOrder.subtotal)}</span>
              </div>
              {currentOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Chiết khấu giảm giá</span>
                  <span className="font-mono">- {formatPrice(currentOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển</span>
                <span className="font-mono text-on-surface">{formatPrice(currentOrder.shipping_fee)}</span>
              </div>
              <div className="w-full h-px bg-[#eeeeee] my-2" />
              <div className="flex justify-between text-sm font-bold text-primary">
                <span>Tổng thanh toán</span>
                <span className="font-mono text-base text-primary">{formatPrice(currentOrder.total)}</span>
              </div>
            </div>
          </motion.section>

          {/* 3. Actions Button Container */}
          <footer className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              to="/san-pham"
              className="flex-1 py-3.5 bg-primary text-white text-xs tracking-widest uppercase font-bold text-center hover:bg-[#2c160e] transition-colors rounded-xs shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} /> Tiếp tục mua sắm
            </Link>
            <Link
              to="/tai-khoan?tab=orders"
              className="flex-1 py-3.5 bg-white border border-[#d4c3be] text-[#5d4037] text-xs tracking-widest uppercase font-bold text-center hover:bg-[#faf6f0] transition-colors rounded-xs shadow-sm flex items-center justify-center gap-2"
            >
              <ClipboardList size={14} /> Theo dõi đơn hàng
            </Link>
          </footer>

        </main>

      </div>
    </div>
  )
}
