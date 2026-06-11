import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  CreditCard, 
  Package, 
  CheckCircle, 
  Clock, 
  XCircle, 
  FileText,
  Leaf
} from 'lucide-react';
import { orderService } from '@/services';
import { formatPrice } from '@/components/ui/ProductCard';
import { getImageUrl } from '@/utils/productMapper';
import type { Order } from '@/types';
import Toast from '@/components/ui/Toast';

// Helper functions (same as Profile)
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Chờ xác nhận';
    case 'confirmed': return 'Đã xác nhận';
    case 'processing': return 'Chờ lấy hàng';
    case 'shipped': return 'Đang vận chuyển';
    case 'delivered': return 'Đã giao thành công';
    case 'cancelled': return 'Đã hủy';
    case 'refunded': return 'Đã hoàn tiền';
    default: return status;
  }
};

const getPaymentMethodText = (method: string) => {
  switch (method) {
    case 'cod': return 'COD (Nhận hàng thanh toán)';
    case 'bank_transfer': return 'Chuyển khoản ngân hàng';
    case 'vnpay': return 'VNPAY';
    case 'momo': return 'Ví MoMo';
    default: return method;
  }
};

const getPaymentStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Chưa thanh toán';
    case 'paid': return 'Đã thanh toán';
    case 'failed': return 'Thanh toán thất bại';
    case 'refunded': return 'Đã hoàn tiền';
    default: return status;
  }
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'info'
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const handleCancelClick = () => {
    setShowConfirmModal(true);
  };

  const executeCancelOrder = async () => {
    if (!order) return;
    setShowConfirmModal(false);
    
    try {
      setIsCancelling(true);
      const updatedOrder = await orderService.cancelOrder(order.id);
      setOrder(updatedOrder);
      showToast('Đã hủy đơn hàng thành công!');
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.detail || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.', 'info');
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await orderService.getById(Number(id));
        setOrder(data);
      } catch (err: any) {
        console.error("Failed to fetch order details", err);
        setError("Không thể tải thông tin đơn hàng hoặc đơn hàng không tồn tại.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] pt-32 pb-24 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3 text-on-surface-variant">
          <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-sm font-medium">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] pt-32 pb-24 flex flex-col items-center justify-center font-sans text-center px-4">
        <XCircle className="w-16 h-16 text-error mb-4" />
        <h2 className="font-serif text-2xl font-bold text-primary mb-2">Lỗi tải dữ liệu</h2>
        <p className="text-sm text-on-surface-variant mb-6">{error || 'Không tìm thấy đơn hàng.'}</p>
        <button
          onClick={() => navigate('/tai-khoan')}
          className="px-6 py-2.5 bg-primary text-white font-semibold text-xs tracking-wider uppercase rounded-xs hover:bg-[#2c160e] transition-colors border-none cursor-pointer"
        >
          Quay lại tài khoản
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfaf7] pt-32 pb-24 font-sans text-xs md:text-sm text-on-surface">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Back button & Title */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eeeeee] pb-4">
          <div>
            <button 
              onClick={() => navigate('/tai-khoan')}
              className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider mb-3 bg-transparent border-none cursor-pointer"
            >
              <ArrowLeft size={14} /> Quay lại danh sách
            </button>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-primary tracking-wide">
              Chi Tiết Đơn Hàng
            </h1>
          </div>
          <div className="text-left md:text-right">
            <span className="text-on-surface-variant text-xs mr-2 md:mr-0 md:block">Mã đơn hàng:</span>
            <span className="font-mono font-bold text-primary text-lg md:block">{order.order_code}</span>
            <span className="text-[11px] text-on-surface-variant/80 block mt-1">
              Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Status Banner */}
          <div className="bg-white border border-[#d4c3be]/40 rounded-sm p-5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3">
              {order.status === 'delivered' ? (
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <CheckCircle size={20} />
                </div>
              ) : order.status === 'cancelled' ? (
                <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center text-error">
                  <XCircle size={20} />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#ece0dc]/50 flex items-center justify-center text-[#8a726b]">
                  <Clock size={20} />
                </div>
              )}
              <div>
                <h3 className="font-serif text-base font-bold text-[#442a22] leading-tight">Trạng thái đơn hàng</h3>
                <p className={`font-bold mt-1 ${
                  order.status === 'delivered' ? 'text-emerald-600' :
                  order.status === 'cancelled' ? 'text-error' : 'text-primary'
                }`}>
                  {getStatusText(order.status)}
                </p>
              </div>
            </div>

            {/* Cancel Button Logic */}
            {order.status !== 'cancelled' && order.status !== 'refunded' && order.status !== 'delivered' && (
              <div>
                {order.status === 'pending' ? (
                  <button 
                    onClick={handleCancelClick}
                    disabled={isCancelling}
                    className="px-4 py-2 bg-error text-white text-[11px] font-bold uppercase tracking-wider rounded-xs hover:bg-red-700 transition-colors cursor-pointer border-none disabled:opacity-50 whitespace-nowrap"
                  >
                    {isCancelling ? 'Đang xử lý...' : 'Hủy đơn hàng'}
                  </button>
                ) : (
                  <button
                    onClick={() => showToast('Không thể hủy, khách hàng liên hệ để được hỗ trợ', 'info')}
                    className="px-4 py-2 bg-[#eeeeee] text-on-surface-variant text-[11px] font-bold uppercase tracking-wider rounded-xs cursor-pointer border-none whitespace-nowrap"
                  >
                    Hủy đơn hàng
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shipping Info */}
            <div className="bg-white border border-[#d4c3be]/40 rounded-sm p-5 shadow-xs">
              <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#eeeeee] pb-2">
                <MapPin size={16} /> Thông tin nhận hàng
              </h3>
              <div className="space-y-2 text-sm text-on-surface-variant">
                <p><span className="font-medium text-on-surface">Người nhận:</span> {order.shipping_address?.full_name}</p>
                <p><span className="font-medium text-on-surface">Điện thoại:</span> {order.shipping_address?.phone}</p>
                <p className="leading-relaxed">
                  <span className="font-medium text-on-surface block mb-0.5">Địa chỉ giao hàng:</span> 
                  {order.shipping_address?.address}
                </p>
                {order.notes && (
                  <p className="mt-2 text-[#8a726b] italic bg-amber-50/50 p-2 rounded-xs border border-amber-100/50">
                    <span className="font-bold">Ghi chú:</span> {order.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white border border-[#d4c3be]/40 rounded-sm p-5 shadow-xs">
              <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#eeeeee] pb-2">
                <CreditCard size={16} /> Thanh toán
              </h3>
              <div className="space-y-3 text-sm text-on-surface-variant">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-on-surface">Hình thức:</span>
                  <span className="font-bold text-[#5d4037]">{getPaymentMethodText(order.payment_method)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-on-surface">Trạng thái:</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${
                    order.payment_status === 'paid' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {getPaymentStatusText(order.payment_status)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white border border-[#d4c3be]/40 rounded-sm overflow-hidden shadow-xs">
            <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider p-5 border-b border-[#eeeeee] bg-[#fcfaf7] flex items-center gap-2">
              <Package size={16} /> Sản phẩm đã đặt
            </h3>
            <div className="p-5 space-y-4">
              {order.items?.map((item: any, idx: number) => {
                const pName = item.product?.name || item.product_snapshot?.name || 'Sản phẩm';
                const pImage = getImageUrl(item.product?.images?.[0]?.url || item.product_snapshot?.image || '');
                const pColor = item.product_snapshot?.color || 'Mặc định';
                const pSize = item.product_snapshot?.size || item.size || 'Mặc định';

                return (
                  <div key={idx} className="flex gap-4 items-center border-b border-[#eeeeee] pb-4 last:border-0 last:pb-0">
                    {pImage ? (
                      <img
                        alt={pName}
                        src={pImage}
                        className="w-16 h-20 object-cover rounded-xs border border-[#d4c3be]/30"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-gray-100 rounded-xs flex items-center justify-center border border-[#d4c3be]/30 text-gray-400">
                        <FileText size={20} />
                      </div>
                    )}
                    <div className="flex-1">
                      {item.product?.id ? (
                        <Link to={`/san-pham/${item.product.id}`} className="font-serif font-bold text-sm text-[#442a22] hover:text-primary transition-colors block mb-1">
                          {pName}
                        </Link>
                      ) : (
                        <span className="font-serif font-bold text-sm text-[#442a22] block mb-1">{pName}</span>
                      )}
                      <div className="text-xs text-on-surface-variant space-x-3">
                        <span>Phân loại: <span className="font-bold text-on-surface">{pColor}, {pSize}</span></span>
                        <span className="inline-block mt-1 sm:mt-0">Số lượng: <span className="font-bold text-on-surface">{item.quantity}</span></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">{formatPrice(item.price)}</div>
                      <div className="text-[10px] text-on-surface-variant mt-1">
                        Tổng: <span className="font-bold text-[#442a22]">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Total Summary */}
            <div className="bg-[#fcfaf7] p-5 border-t border-[#eeeeee]">
              <div className="space-y-2 text-sm text-on-surface-variant w-full md:w-1/2 ml-auto">
                <div className="flex justify-between">
                  <span>Tạm tính:</span>
                  <span className="font-semibold text-on-surface">{formatPrice(order.subtotal || order.total)}</span>
                </div>
                {order.shipping_fee !== undefined && order.shipping_fee !== null && (
                  <div className="flex justify-between">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold text-on-surface">{formatPrice(order.shipping_fee)}</span>
                  </div>
                )}
                {order.discount !== undefined && order.discount !== null && order.discount > 0 && (
                  <div className="flex justify-between text-error">
                    <span>Giảm giá:</span>
                    <span className="font-semibold">- {formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t border-[#d4c3be]/30 mt-3">
                  <span className="font-bold text-on-surface text-base">Tổng thanh toán:</span>
                  <span className="font-serif font-bold text-primary text-xl">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
            
            {/* Charity Info */}
            <div className="bg-[#faf6f0] p-5 border-t border-[#eeeeee]">
              <div className="flex items-start gap-3">
                <Leaf className="text-primary shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-on-surface-variant flex-1">
                  <h4 className="font-bold text-primary mb-1">Gieo Mầm Từ Tâm</h4>
                  <p className="mb-3 leading-relaxed">
                    Từ Tâm Phục xin thay mặt bạn trích <strong>5% giá trị đơn hàng</strong>, tương đương <span className="font-bold text-primary bg-[#ece0dc]/50 px-2 py-0.5 rounded-sm">{formatPrice((order.subtotal || order.total) * 0.05)}</span> để cúng dường quỹ từ thiện, hỗ trợ trẻ em mồ côi và người già neo đơn.
                  </p>
                  
                  {(order.shipping_address?.charity_message || order.shipping_address?.is_charity_anonymous !== undefined) && (
                    <div className="bg-white/80 border border-[#ece0dc] p-3.5 rounded-sm shadow-sm">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] uppercase font-bold text-[#8a726b] tracking-wider">Người gieo duyên:</span>
                        <span className="text-xs font-bold text-primary">
                          {order.shipping_address?.is_charity_anonymous ? 'Người gieo duyên ẩn danh' : order.shipping_address?.full_name}
                        </span>
                      </div>
                      {order.shipping_address?.charity_message && (
                        <p className="text-xs italic text-on-surface-variant leading-relaxed before:content-['\201C'] after:content-['\201D'] before:text-[#d4c3be] after:text-[#d4c3be] before:font-serif after:font-serif before:text-lg after:text-lg before:mr-1 after:ml-1">
                          {order.shipping_address?.charity_message}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
      
      {/* Custom Confirm Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-sm shadow-xl max-w-sm w-full p-6 border border-[#d4c3be]/40"
            >
              <h3 className="font-serif text-lg font-bold text-[#442a22] mb-2 flex items-center gap-2">
                <XCircle size={20} className="text-error" /> Xác nhận hủy đơn
              </h3>
              <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
                Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-5 py-2.5 border border-outline-variant hover:bg-[#ece0dc]/20 text-on-secondary-fixed-variant font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer bg-transparent rounded-xs"
                >
                  Không
                </button>
                <button
                  onClick={executeCancelOrder}
                  disabled={isCancelling}
                  className="px-5 py-2.5 bg-error text-white font-semibold text-xs tracking-wider uppercase hover:bg-red-700 transition-colors cursor-pointer border-none rounded-xs disabled:opacity-50"
                >
                  Có, hủy đơn
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Toast Component */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </main>
  );
}
