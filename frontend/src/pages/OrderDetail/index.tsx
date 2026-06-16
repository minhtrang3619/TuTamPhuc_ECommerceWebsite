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
  Leaf,
  X,
  Camera,
  Image,
  Landmark,
  Truck,
  Store,
  ChevronDown,
  Star
} from 'lucide-react';
import { orderService, reviewService, apiClient } from '@/services';
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

const getReturnRequestStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'Đang chờ duyệt';
    case 'approved': return 'Đã chấp nhận';
    case 'rejected': return 'Đã từ chối';
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
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'info'
  });

  // Product Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [reviewProductName, setReviewProductName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewIsAnonymous, setReviewIsAnonymous] = useState(false);
  const [reviewOrderItemId, setReviewOrderItemId] = useState<number | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewHoverRating, setReviewHoverRating] = useState<number | null>(null);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewVideos, setReviewVideos] = useState<string[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const handleOpenReviewModal = (productId: number, productName: string, orderItemId: number) => {
    setReviewProductId(productId);
    setReviewProductName(productName);
    setReviewRating(5);
    setReviewTitle('');
    setReviewContent('');
    setReviewIsAnonymous(false);
    setReviewOrderItemId(orderItemId);
    setReviewImages([]);
    setReviewVideos([]);
    setMediaError(null);
    setShowReviewModal(true);
  };

  const handleReviewMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    setIsUploadingMedia(true);
    setMediaError(null);

    try {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          if (file.size > 10 * 1024 * 1024) {
            setMediaError(`Ảnh ${file.name} quá lớn. Tối đa 10MB.`);
            continue;
          }
        } else if (file.type.startsWith('video/')) {
          if (file.size > 50 * 1024 * 1024) {
            setMediaError(`Video ${file.name} quá lớn. Tối đa 50MB.`);
            continue;
          }
        } else {
          setMediaError(`File ${file.name} không được hỗ trợ. Chỉ nhận ảnh và video.`);
          continue;
        }

        const res = await reviewService.uploadReviewMedia(file);
        if (res.type === 'image') {
          setReviewImages(prev => [...prev, res.url]);
        } else {
          setReviewVideos(prev => [...prev, res.url]);
        }
      }
    } catch (err) {
      console.error(err);
      setMediaError('Tải tệp lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setReviewImages(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleRemoveVideo = (urlToRemove: string) => {
    setReviewVideos(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProductId) return;

    setIsSubmittingReview(true);
    try {
      await apiClient.post(`/products/${reviewProductId}/reviews`, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        content: reviewContent.trim() || undefined,
        is_anonymous: reviewIsAnonymous,
        order_item_id: reviewOrderItemId || undefined,
        images: reviewImages.length > 0 ? reviewImages : undefined,
        videos: reviewVideos.length > 0 ? reviewVideos : undefined,
      });
      showToast('Đã gửi đánh giá sản phẩm thành công!');
      setShowReviewModal(false);
      if (order && reviewOrderItemId) {
        setOrder({
          ...order,
          items: order.items.map((item: any) => {
            if (item.id === reviewOrderItemId) {
              return { ...item, is_reviewed: true };
            }
            return item;
          })
        });
      }
    } catch (err: any) {
      console.error("Lỗi khi gửi đánh giá:", err);
      const errMsg = err.response?.data?.detail || 'Không thể gửi đánh giá. Vui lòng thử lại sau.';
      showToast(errMsg, 'info');
    } finally {
      setIsSubmittingReview(false);
    }
  };


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

            {/* Return / Refund Button Logic */}
            {order.status === 'delivered' && !order.return_request && (
              <div>
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="px-4 py-2 bg-primary text-white text-[11px] font-bold uppercase tracking-wider rounded-xs hover:bg-[#2c160e] transition-colors cursor-pointer border-none whitespace-nowrap"
                >
                  Trả hàng / Hoàn tiền
                </button>
              </div>
            )}

          </div>

          {/* Return Request Details (if exists) */}
          {order.return_request && (
            <div className="bg-white border border-[#d4c3be]/40 rounded-sm p-5 shadow-xs">
              <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#eeeeee] pb-2">
                <FileText size={16} /> Thông tin yêu cầu Trả hàng / Hoàn tiền
              </h3>
              <div className="space-y-3 text-sm text-on-surface-variant">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-on-surface">Trạng thái yêu cầu:</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider border ${
                    order.return_request.status === 'pending'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : order.return_request.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {getReturnRequestStatusText(order.return_request.status)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#eeeeee]/60">
                  <div>
                    <p><span className="font-semibold text-on-surface">Lý do:</span> {order.return_request.reason}</p>
                    {order.return_request.description && (
                      <p className="mt-1"><span className="font-semibold text-on-surface">Chi tiết thêm:</span> {order.return_request.description}</p>
                    )}
                    <p className="mt-1">
                      <span className="font-semibold text-on-surface">Hình thức trả hàng:</span>{' '}
                      {order.return_request.shipping_method === 'pickup' ? 'Shipper lấy tận nơi' : 'Tự mang ra bưu cục'}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface mb-1">Thông tin hoàn tiền:</p>
                    <div className="bg-[#fcfaf7] p-2.5 rounded-xs border border-[#d4c3be]/30 text-xs">
                      <p><span className="font-medium">Ngân hàng:</span> {order.return_request.bank_name}</p>
                      <p><span className="font-medium">Số tài khoản:</span> {order.return_request.account_number}</p>
                      <p><span className="font-medium">Chủ tài khoản:</span> {order.return_request.account_holder}</p>
                    </div>
                  </div>
                </div>
                <div className="pt-2">
                  <p className="font-semibold text-on-surface mb-2">Ảnh minh chứng:</p>
                  <div className="flex flex-wrap gap-2">
                    {order.return_request.images?.map((url: string, index: number) => (
                      <a href={getImageUrl(url)} key={index} target="_blank" rel="noopener noreferrer" className="block relative group">
                        <img
                          src={getImageUrl(url)}
                          alt={`Minh chứng ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-xs border border-[#d4c3be]/40 hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


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
                        <Link to={`/san-pham/${item.product.slug}`} className="font-serif font-bold text-sm text-[#442a22] hover:text-primary transition-colors block mb-1">
                          {pName}
                        </Link>
                      ) : (
                        <span className="font-serif font-bold text-sm text-[#442a22] block mb-1">{pName}</span>
                      )}
                      <div className="text-xs text-on-surface-variant space-x-3">
                        <span>Phân loại: <span className="font-bold text-on-surface">{pColor}, {pSize}</span></span>
                        <span className="inline-block mt-1 sm:mt-0">Số lượng: <span className="font-bold text-on-surface">{item.quantity}</span></span>
                      </div>
                      {order.status === 'delivered' && (item.product?.id || item.product_id) && (
                        item.is_reviewed ? (
                          <button
                            type="button"
                            disabled
                            className="mt-2 px-3 py-1 border border-[#d4c3be] text-on-surface-variant/40 font-semibold text-[10px] uppercase tracking-wider bg-transparent rounded-xs flex items-center gap-1 w-fit cursor-not-allowed opacity-60"
                          >
                            <CheckCircle size={11} className="text-emerald-600/60" />
                            Đã đánh giá
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenReviewModal(item.product?.id || item.product_id, pName, item.id)}
                            className="mt-2 px-3 py-1 border border-primary text-primary hover:bg-[#ece0dc]/30 font-semibold text-[10px] uppercase tracking-wider transition-colors cursor-pointer bg-transparent rounded-xs flex items-center gap-1 w-fit"
                          >
                            <Star size={11} fill="currentColor" />
                            Đánh giá sản phẩm
                          </button>
                        )
                      )}
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
      
      {/* Return/Refund Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <ReturnRefundModal
            order={order}
            onClose={() => setShowReturnModal(false)}
            onSuccess={(updatedOrder) => setOrder(updatedOrder)}
            showToast={showToast}
          />
        )}
      </AnimatePresence>
      
      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-[#fcfaf7] border border-[#d4c3be]/40 rounded-sm shadow-xl max-w-lg w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto font-sans"
            >
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
              >
                <span className="text-xl font-bold">&times;</span>
              </button>

              <h2 className="font-serif text-xl md:text-2xl font-bold text-primary mb-2">
                Đánh Giá Sản Phẩm
              </h2>
              <p className="text-xs md:text-sm text-on-surface-variant mb-6 pb-4 border-b border-[#eeeeee]">
                Đánh giá cho sản phẩm: <span className="font-bold text-[#442a22]">{reviewProductName}</span>
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-6 text-xs md:text-sm">
                {/* Rating selection (Stars) */}
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                    Đánh giá của bạn <span className="text-error">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = reviewHoverRating !== null ? star <= reviewHoverRating : star <= reviewRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(null)}
                          className="text-amber-400 hover:scale-110 transition-transform bg-transparent border-none cursor-pointer p-1"
                        >
                          <Star
                            size={28}
                            fill={isFilled ? "currentColor" : "none"}
                            className="stroke-amber-400"
                          />
                        </button>
                      );
                    })}
                    <span className="ml-3 font-serif font-bold text-[#5d4037] text-sm">
                      {reviewRating} / 5
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                    Tiêu đề đánh giá
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Ví dụ: Rất hài lòng, Chất lượng tốt..."
                    className="w-full bg-[#f3f3f3]/60 border-0 border-b border-[#d4c3be] py-2 px-3 focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all duration-300 rounded-xs font-medium"
                  />
                </div>

                {/* Review Content */}
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                    Nội dung đánh giá
                  </label>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (vải, form dáng, đường may...)"
                    className="w-full bg-[#f3f3f3]/60 border-0 border-b border-[#d4c3be] p-3 focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all duration-300 rounded-xs"
                    rows={4}
                  />
                </div>

                {/* Media Upload Section */}
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                    Hình ảnh & Video thực tế
                  </label>
                  
                  {/* Upload Controls */}
                  <div className="flex items-center gap-4 py-1.5">
                    <label className="flex items-center gap-1.5 px-4 py-2 border border-[#d4c3be] hover:bg-[#ece0dc]/20 text-[#5d4037] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer select-none">
                      <Camera size={13} />
                      <span>Thêm ảnh / video</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleReviewMediaChange}
                        className="hidden"
                      />
                    </label>
                    
                    {isUploadingMedia && (
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <span>Đang tải lên...</span>
                      </div>
                    )}
                  </div>
                  
                  {mediaError && (
                    <p className="text-xs text-red-600 font-semibold mt-1">{mediaError}</p>
                  )}

                  {/* Previews Grid */}
                  {(reviewImages.length > 0 || reviewVideos.length > 0) && (
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      {/* Images */}
                      {reviewImages.map((url, idx) => (
                        <div key={`img-${idx}`} className="relative aspect-square rounded-xs overflow-hidden border border-[#d4c3be]/30 group">
                          <img
                            src={getImageUrl(url)}
                            alt={`Preview img ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(url)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>
                      ))}

                      {/* Videos */}
                      {reviewVideos.map((url, idx) => (
                        <div key={`vid-${idx}`} className="relative aspect-square rounded-xs overflow-hidden border border-[#d4c3be]/30 group bg-black">
                          <video
                            src={getImageUrl(url)}
                            className="w-full h-full object-cover opacity-80"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">▶</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(url)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Anonymous Review Checkbox */}
                <div className="flex items-center gap-2 py-1 font-sans">
                  <input
                    type="checkbox"
                    id="is-anonymous"
                    checked={reviewIsAnonymous}
                    onChange={(e) => setReviewIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-primary border-[#d4c3be] rounded-xs focus:ring-primary cursor-pointer accent-primary"
                  />
                  <label htmlFor="is-anonymous" className="text-xs text-on-surface-variant font-semibold select-none cursor-pointer">
                    Đánh giá ẩn danh (không hiển thị tên của bạn trên trang chi tiết sản phẩm)
                  </label>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t border-[#eeeeee]">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-6 py-2.5 border border-outline-variant hover:bg-[#ece0dc]/20 text-on-secondary-fixed-variant font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer bg-transparent rounded-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 bg-primary text-white font-semibold text-xs tracking-wider uppercase hover:bg-[#2c160e] transition-colors cursor-pointer border-none rounded-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi đánh giá'
                    )}
                  </button>
                </div>
              </form>
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

// ────────────────────────────────────────────────────────────
// Return & Refund Modal Component
// ────────────────────────────────────────────────────────────
interface ReturnRefundModalProps {
  order: Order;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;
}

function ReturnRefundModal({ order, onClose, onSuccess, showToast }: ReturnRefundModalProps) {
  const [reason, setReason] = useState('Sản phẩm bị lỗi kỹ thuật (đường chỉ, vải...)');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [shippingMethod, setShippingMethod] = useState('pickup');
  const [bankName, setBankName] = useState('');
  const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    setUploading(true);
    setValidationError(null);
    try {
      const urls: string[] = [];
      for (const file of files) {
        const res = await orderService.uploadReturnEvidence(file);
        urls.push(res.url);
      }
      setImages(prev => [...prev, ...urls]);
    } catch (err) {
      console.error(err);
      showToast('Không thể tải ảnh lên. Vui lòng thử lại.', 'info');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation
    if (!reason) {
      setValidationError('Vui lòng chọn lý do trả hàng.');
      return;
    }
    if (images.length < 2) {
      setValidationError('Vui lòng cung cấp ít nhất 2 ảnh minh chứng rõ nét về tình trạng sản phẩm.');
      return;
    }
    if (!bankName || bankName === 'Chọn ngân hàng') {
      setValidationError('Vui lòng chọn ngân hàng nhận hoàn tiền.');
      return;
    }
    if (!accountNumber.trim() || !accountHolder.trim()) {
      setValidationError('Vui lòng điền đầy đủ số tài khoản và tên chủ tài khoản ngân hàng.');
      return;
    }

    setSubmitting(true);
    try {
      const returnData = {
        reason,
        description: description.trim() || undefined,
        images,
        shipping_method: shippingMethod,
        bank_name: bankName.trim(),
        account_number: accountNumber.trim(),
        account_holder: accountHolder.trim().toUpperCase(),
      };
      
      const newReturnRequest = await orderService.submitReturnRequest(order.id, returnData);
      
      // Update order state in parent
      const updatedOrder = {
        ...order,
        return_request: newReturnRequest
      };
      onSuccess(updatedOrder);
      showToast('Gửi yêu cầu trả hàng / hoàn tiền thành công!');
      onClose();
    } catch (err: any) {
      console.error(err);
      setValidationError(err?.response?.data?.detail || 'Không thể gửi yêu cầu trả hàng. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.3 }}
        className="bg-[#fcfaf7] border border-[#d4c3be]/40 rounded-sm shadow-xl max-w-2xl w-full p-6 md:p-8 my-8 relative max-h-[90vh] overflow-y-auto font-sans"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="font-serif text-xl md:text-2xl font-bold text-primary mb-2">
          Yêu Cầu Trả Hàng / Hoàn Tiền
        </h2>
        <p className="text-xs md:text-sm text-on-surface-variant mb-6 pb-4 border-b border-[#eeeeee]">
          Chúng tôi rất tiếc vì trải nghiệm này. Hãy để Từ Tâm Phục hỗ trợ bạn điều chỉnh lại sự hài lòng.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 text-xs md:text-sm">
          {/* Return Reason */}
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
              Lý do trả hàng <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-[#d4c3be] py-2.5 pr-8 text-on-surface focus:border-primary focus:ring-0 outline-none transition-colors appearance-none font-medium cursor-pointer"
              >
                <option value="Sản phẩm bị lỗi kỹ thuật (đường chỉ, vải...)">Sản phẩm bị lỗi kỹ thuật (đường chỉ, vải...)</option>
                <option value="Không đúng kích cỡ (quá rộng/chật)">Không đúng kích cỡ (quá rộng/chật)</option>
                <option value="Giao sai mẫu mã hoặc màu sắc">Giao sai mẫu mã hoặc màu sắc</option>
                <option value="Sản phẩm khác với mô tả trên website">Sản phẩm khác với mô tả trên website</option>
                <option value="Khác...">Khác...</option>
              </select>
              <ChevronDown className="absolute right-0 bottom-2.5 pointer-events-none opacity-40" size={18} />
            </div>
          </div>

          {/* Additional Details */}
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
              Chi tiết thêm (không bắt buộc)
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#f3f3f3]/60 border-0 border-b border-[#d4c3be] p-3 focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all duration-300 rounded-xs"
              placeholder="Chia sẻ thêm với chúng tôi về vấn đề của bạn..."
              rows={3}
            />
          </div>

          {/* Evidence Photos */}
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block">
              Hình ảnh minh chứng <span className="text-error">*</span>
            </label>
            <p className="text-[11px] text-on-surface-variant/70 mb-3">
              Vui lòng cung cấp ít nhất 2 ảnh rõ nét về tình trạng sản phẩm.
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <label 
                htmlFor="evidence-upload" 
                className={`aspect-square border border-dashed border-[#d4c3be] rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-[#ece0dc]/10 transition-colors group ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  id="evidence-upload"
                  disabled={uploading || submitting}
                  onChange={handleFileChange}
                />
                <Camera className="text-primary group-hover:scale-115 transition-transform mb-1.5" size={24} />
                <span className="text-[10px] font-bold uppercase opacity-60 text-center px-1">
                  {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
                </span>
              </label>

              {images.map((url, index) => (
                <div key={index} className="aspect-square bg-[#f3f3f3] rounded-sm relative group overflow-hidden border border-[#d4c3be]/40">
                  <img src={getImageUrl(url)} className="w-full h-full object-cover" alt={`Minh chứng ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/85 transition-colors border-none cursor-pointer text-xs"
                  >
                    &times;
                  </button>
                </div>
              ))}

              {Array.from({ length: Math.max(0, 3 - images.length) }).map((_, idx) => (
                <div key={idx} className="aspect-square bg-[#f3f3f3]/40 rounded-sm flex items-center justify-center border border-[#d4c3be]/20">
                  <Image className="opacity-20 text-on-surface-variant" size={24} />
                </div>
              ))}
            </div>
            
            {images.length > 0 && (
              <p className="text-[10px] text-on-surface-variant/80 mt-1.5">
                Đã chọn: <span className="font-bold">{images.length}</span> ảnh (Cần tối thiểu 2 ảnh).
              </p>
            )}
          </div>

          {/* Shipping Method */}
          <div>
            <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-3 block">
              Hình thức trả hàng <span className="text-error">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pickup */}
              <div 
                onClick={() => setShippingMethod('pickup')}
                className={`p-4 border rounded-sm cursor-pointer transition-all flex flex-col justify-between ${
                  shippingMethod === 'pickup' 
                    ? 'border-primary bg-[#fdfcfb] shadow-xs' 
                    : 'border-[#d4c3be]/60 hover:bg-[#f3f3f3]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Truck size={18} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider">Shipper lấy tận nơi</span>
                  </div>
                  {shippingMethod === 'pickup' && <CheckCircle size={16} className="text-primary" />}
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Đơn vị vận chuyển sẽ đến địa chỉ của bạn trong 24-48h tới.
                </p>
              </div>

              {/* Dropoff */}
              <div 
                onClick={() => setShippingMethod('dropoff')}
                className={`p-4 border rounded-sm cursor-pointer transition-all flex flex-col justify-between ${
                  shippingMethod === 'dropoff' 
                    ? 'border-primary bg-[#fdfcfb] shadow-xs' 
                    : 'border-[#d4c3be]/60 hover:bg-[#f3f3f3]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Store size={18} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-wider">Tự mang ra bưu cục</span>
                  </div>
                  {shippingMethod === 'dropoff' && <CheckCircle size={16} className="text-primary" />}
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">
                  Gửi hàng tại bưu cục gần nhất thuộc mạng lưới VNPost/GHTK/GHN (Giao Hàng Nhanh).
                </p>
              </div>
            </div>
          </div>

          {/* Refund Bank Info */}
          <div className="bg-[#fcfaf7] border border-[#d4c3be]/40 p-5 rounded-sm">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 pb-2 border-b border-[#eeeeee] flex items-center gap-2">
              <Landmark size={16} /> Phương thức hoàn tiền
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                    Tên ngân hàng <span className="text-error">*</span>
                  </label>
                  
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsBankDropdownOpen(prev => !prev)}
                      className="w-full bg-transparent border-0 border-b border-[#d4c3be] py-2 text-left outline-none transition-colors flex items-center justify-between cursor-pointer text-xs"
                    >
                      <span className={bankName ? 'text-on-surface font-medium' : 'text-on-surface-variant/50'}>
                        {bankName || 'Chọn ngân hàng'}
                      </span>
                      <ChevronDown className="opacity-40 text-on-surface" size={18} />
                    </button>
                    
                    <AnimatePresence>
                      {isBankDropdownOpen && (
                        <>
                          {/* Invisible backdrop to close dropdown on click outside */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setIsBankDropdownOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 right-0 mt-1 bg-white border border-[#d4c3be]/40 rounded-xs shadow-lg z-20 max-h-[320px] overflow-y-auto"
                          >
                            {[
                              'Vietcombank', 'Techcombank', 'BIDV', 'VietinBank', 'MB Bank', 'Agribank', 'VPBank', 'Sacombank', 'ACB', 'TPBank',
                              'HDBank', 'VIB', 'SHB', 'LPBank', 'MSB', 'OCB', 'SeABank', 'Eximbank', 'SCB', 'BAC A BANK',
                              'BaoViet Bank', 'DongA Bank', 'Kienlongbank', 'Nam A Bank', 'NCB', 'PG Bank', 'PVcomBank', 'Saigonbank',
                              'VietABank', 'Vietbank', 'BVBank', 'GPBank', 'OceanBank', 'CBBank', 'Shinhan Bank', 'HSBC',
                              'Woori Bank', 'UOB', 'Standard Chartered', 'Public Bank'
                            ].map(bank => (
                              <button
                                key={bank}
                                type="button"
                                onClick={() => {
                                  setBankName(bank);
                                  setIsBankDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 hover:bg-[#ece0dc]/20 transition-colors text-xs border-none cursor-pointer ${
                                  bankName === bank ? 'bg-[#ece0dc]/10 font-bold text-primary' : 'text-on-surface'
                                }`}
                              >
                                {bank}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                    Số tài khoản <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="Nhập số tài khoản"
                    className="w-full bg-transparent border-0 border-b border-[#d4c3be] py-2 text-xs focus:border-primary focus:ring-0 outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">
                  Tên chủ tài khoản <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={e => setAccountHolder(e.target.value.toUpperCase())}
                  placeholder="VIET NAM TU TAM PHUC"
                  className="w-full bg-transparent border-0 border-b border-[#d4c3be] py-2 text-xs uppercase tracking-widest focus:border-primary focus:ring-0 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Validation & Error Display */}
          {validationError && (
            <p className="text-xs font-bold text-error bg-red-50 border border-red-200 p-3 rounded-xs leading-relaxed">
              {validationError}
            </p>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#eeeeee]">
            <p className="text-[10px] text-on-surface-variant/80 max-w-sm text-center sm:text-left leading-relaxed">
              Bằng cách gửi yêu cầu, bạn đồng ý với các Chính sách đổi trả và hoàn tiền của Từ Tâm Phục.
            </p>
            <div className="flex w-full sm:w-auto gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="w-1/2 sm:w-auto px-6 py-3 border border-outline-variant hover:bg-[#ece0dc]/20 text-on-secondary-fixed-variant font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer bg-transparent rounded-xs"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-1/2 sm:w-auto px-6 py-3 bg-primary text-white font-semibold text-xs tracking-wider uppercase hover:bg-[#2c160e] transition-colors cursor-pointer border-none rounded-xs disabled:opacity-50"
              >
                {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

