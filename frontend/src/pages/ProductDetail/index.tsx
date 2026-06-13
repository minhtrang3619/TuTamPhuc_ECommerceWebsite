import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ChevronRight, Leaf, Sparkles, Heart, MessageSquare, Star, CheckCircle, CornerDownRight } from 'lucide-react';

import { PRODUCTS } from '../../data';
import { useMockCartStore } from '@/store/mockCartStore';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice } from '../../components/ui/ProductCard';
import Toast from '../../components/ui/Toast';
import apiClient from '@/services/apiClient';
import { mapApiProductToMockProduct } from '@/utils/productMapper';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItem, openCart, openCheckout, setBuyNowItem } = useMockCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  const dummyProduct = {
    dbId: undefined as number | undefined,
    id: '',
    name: 'Sản phẩm',
    price: 0,
    colors: [],
    sizes: [],
    images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCoN-bFmYs_4Pou635qnLS4buY4mQKx8avkQwiBnjE0MwTqvdyiwKCu6jUyLwtVA_ZfrjDhH8OeUggZ53HFGmyQisSBYlPfS5NGXuRVO_pIn8t3RlN6Uohv0j9XqwHEQdLaDArg7CzxVTcwpCAV-iOUO236FuvB4u5dI7nU6RbBNWaym5M8ECoLYQL1lCAaKStoNOhRzzEkYgEpOKTSJVFf6RqrwsdARQn6Iq0LJcKA4UevZyqHJmymu2vADk4NZzFUzTw7Rt-lfTNp'],
    description: '',
    quote: '',
    details: {
      material: '',
      craftsmanship: '',
      details_desc: ''
    }
  };

  const fallbackProduct = PRODUCTS.find((p) => p.id === slug) || PRODUCTS[0] || dummyProduct;
  const [product, setProduct] = useState<any>(fallbackProduct);
  const [loading, setLoading] = useState(true);
  const [rawProduct, setRawProduct] = useState<any>(null);
  
  // Reviews states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    apiClient.get(`/products/${slug}`)
      .then(res => {
        if (res.data) {
          setRawProduct(res.data);
          const mapped = mapApiProductToMockProduct(res.data);
          setProduct(mapped);
          setActiveDetailColor(mapped.colors[0] || null);
        }
      })
      .catch(err => {
        console.error("Lỗi khi tải chi tiết sản phẩm từ API:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!product?.dbId) return;
    setReviewsLoading(true);
    apiClient.get(`/products/${product.dbId}/reviews?page=1&page_size=50`)
      .then(res => {
        setReviews(res.data?.items || []);
      })
      .catch(err => {
        console.error("Lỗi khi tải đánh giá sản phẩm:", err);
      })
      .finally(() => {
        setReviewsLoading(false);
      });
  }, [product?.dbId]);

  const [activeDetailColor, setActiveDetailColor] = useState<{ name: string; hex: string } | null>(null);
  const [activeDetailSize, setActiveDetailSize] = useState<string>('M');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const isFavorite = product?.dbId ? isInWishlist(product.dbId) : false;

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để lưu sản phẩm yêu thích!', 'info');
      setTimeout(() => {
        navigate('/login', { state: { from: location.pathname } });
      }, 1500);
      return;
    }

    if (!product || !product.dbId || !rawProduct) return;

    try {
      if (isFavorite) {
        await removeFromWishlist(product.dbId);
        showToast('Đã xóa sản phẩm khỏi danh mục yêu thích.', 'info');
      } else {
        await addToWishlist(rawProduct);
        showToast('Đã thêm sản phẩm vào danh mục yêu thích!', 'success');
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi yêu thích:", err);
      showToast('Có lỗi xảy ra, vui lòng thử lại sau.', 'info');
    }
  };

  const handleConsult = () => {
    if (!isAuthenticated) {
      showToast('Vui lòng đăng nhập để được tư vấn!', 'info');
      setTimeout(() => {
        navigate('/login', { state: { from: '/tin-nhan', productToConsult: product } });
      }, 1500);
      return;
    }
    navigate('/tin-nhan', { state: { productToConsult: product } });
  };

  // Toast alert state
  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type?: 'success' | 'info' }>({
    message: '',
    isVisible: false,
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, isVisible: true, type });
  };

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setActiveDetailColor(product.colors[0] || null);
      setActiveDetailSize(product.sizes[0] || 'M');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [product]);

  // Reviews calculations
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) 
    : '0.0';

  const distribution = [0, 0, 0, 0, 0]; // 5, 4, 3, 2, 1 stars
  reviews.forEach(r => {
    const starVal = Math.round(r.rating);
    if (starVal >= 1 && starVal <= 5) {
      distribution[5 - starVal] += 1;
    }
  });

  // Mask user name helper: Nguyen Van A -> Nguyen A.
  const maskName = (fullName: string) => {
    if (!fullName) return 'Khách hàng';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const givenName = parts[parts.length - 1];
    const familyName = parts[0];
    return `${familyName} ${givenName.charAt(0)}.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfaf7] py-24 text-center">
        <h2 className="font-serif text-xl font-bold text-primary animate-pulse">Đang tải chi tiết sản phẩm...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold">Không tìm thấy sản phẩm</h2>
        <Link to="/san-pham" className="text-primary hover:underline mt-4 inline-block">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (activeDetailColor) {
      addItem(product, activeDetailColor, activeDetailSize, 1);
      showToast(`Đã thêm 1 x ${product.name} vào giỏ hàng.`);
      openCart();
    }
  };

  const handleBuyNow = () => {
    if (activeDetailColor) {
      setBuyNowItem(product, activeDetailColor, activeDetailSize, 1);
      openCheckout();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-[#fcfaf7] min-h-screen pt-12 pb-24 font-sans"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 w-full">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center space-x-2.5 mb-8 text-[11px] font-semibold text-on-surface-variant/60 uppercase tracking-widest">
          <Link to="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <ChevronRight size={10} className="text-[#d4c3be]" />
          <Link to="/san-pham" className="hover:text-primary transition-colors">
            {product.category}
          </Link>
          <ChevronRight size={10} className="text-[#d4c3be]" />
          <span className="text-primary font-bold">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Columns - Images */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="aspect-[9/16] bg-surface-container overflow-hidden rounded-xs shadow-[0_8px_32px_rgba(68,42,34,0.03)] border border-[#d4c3be]/20 relative">
              <img
                alt={product.name}
                src={product.images[activeImageIndex] || product.images[0]}
                className="w-full h-full object-cover transition-transform duration-[2200ms] hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 z-10 px-3 py-1 font-sans text-[10px] font-bold text-primary bg-white/95 rounded-sm border border-[#d4c3be]/30 uppercase tracking-widest">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Sub-thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((imgUrl: string, idx: number) => {
                  const isActive = activeImageIndex === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`aspect-[9/16] bg-surface-container overflow-hidden rounded-xs border transition-all cursor-pointer p-0 bg-transparent flex items-center justify-center outline-none ${
                        isActive 
                          ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' 
                          : 'border-[#d4c3be]/40 hover:border-primary'
                      }`}
                    >
                      <img
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        src={imgUrl}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column - Purchase panel */}
          <div className="lg:col-span-5 flex flex-col lg:sticky lg:top-28">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5d4037] mb-1.5 font-sans">
              Pháp phục tự nhiên truyền thống • {product.category}
            </span>
            <h1 className="font-serif text-2xl md:text-3.5xl text-primary font-bold mb-2 tracking-wide leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-8 font-sans font-semibold">
              <span className="text-xl text-primary font-bold">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="text-sm text-on-surface-variant/40 line-through font-normal">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Poetic description */}
            <div className="space-y-4.5 mb-10 border-l border-[#d4c3be] pl-5">
              {product.quote && (
                <p className="font-serif italic text-[#5d4037]/95 text-sm md:text-base leading-relaxed opacity-90">
                  "{product.quote}"
                </p>
              )}
              <div 
                className="font-sans text-xs text-on-surface-variant/80 tracking-wide leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-0.5 [&_strong]:font-semibold [&_em]:italic whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>

            {/* Attributes Selection */}
            <div className="space-y-6 mb-10 font-sans">
              {/* Color swatch */}
              <div>
                <span className="block text-[11px] uppercase tracking-widest font-bold text-[#5d4037] mb-3">
                  Màu sắc: <span className="text-on-surface font-normal">{activeDetailColor?.name}</span>
                </span>
                <div className="flex space-x-3">
                  {product.colors.map((color: { name: string; hex: string }) => {
                    const isSelected = activeDetailColor?.hex === color.hex;
                    return (
                      <button
                        key={color.hex}
                        onClick={() => setActiveDetailColor(color)}
                        className={`w-8 h-8 rounded-full border p-0.5 transition-all ${
                          isSelected ? 'border-primary ring-2 ring-primary/20 scale-103' : 'border-transparent hover:border-outline-variant'
                        }`}
                        title={color.name}
                      >
                        <div className="w-full h-full rounded-full border border-black/5" style={{ backgroundColor: color.hex }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sizes choosing */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="block text-[11px] uppercase tracking-widest font-bold text-[#5d4037]">
                    Kích thước
                  </span>
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="font-sans text-[11px] text-xs text-on-surface-variant/70 underline decoration-[#d4c3be] underline-offset-4 font-semibold hover:text-black cursor-pointer bg-transparent border-0"
                  >
                    Bảng hướng dẫn chọn size
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((size: string) => {
                    const isSelected = activeDetailSize === size;
                    return (
                      <button
                        key={size}
                        onClick={() => setActiveDetailSize(size)}
                        className={`px-5 py-2 min-w-14 border text-xs tracking-wider transition-colors font-bold rounded-sm cursor-pointer ${
                          isSelected
                            ? 'border-primary bg-[#e2e2e2] text-primary shadow-xs'
                            : 'border-[#d4c3be] text-on-surface-variant hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="space-y-3 font-sans">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all flex justify-center items-center gap-2 rounded-xs shadow-xs cursor-pointer bg-transparent"
                >
                  Thêm vào giỏ hàng
                </button>

                <button
                  onClick={handleConsult}
                  className="px-6 py-4 border border-[#d4c3be] text-[#5d4037] font-bold text-xs uppercase tracking-widest hover:bg-[#5d4037]/5 transition-all flex justify-center items-center gap-2 rounded-xs shadow-xs cursor-pointer bg-transparent"
                >
                  <MessageSquare size={16} />
                  Tư vấn
                </button>

                <button
                  onClick={toggleFavorite}
                  className={`px-4 py-4 border rounded-xs transition-all cursor-pointer bg-transparent flex items-center justify-center ${
                    isFavorite 
                      ? 'border-red-200 text-red-500 bg-red-50/50' 
                      : 'border-[#d4c3be] text-[#5d4037] hover:border-red-400 hover:text-red-500'
                  }`}
                  title={isFavorite ? 'Đã thích' : 'Thêm vào yêu thích'}
                >
                  <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full py-4 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-[#2c160e] transition-all flex justify-center items-center gap-2 rounded-xs shadow-md cursor-pointer"
              >
                Mua ngay
              </button>
            </div>

            {/* Charity Campaign Badge */}
            <div className="mt-6 p-4 bg-[#faf6f0] border border-[#ece0dc] rounded-sm text-xs text-[#5d4037] font-sans flex items-start gap-3 shadow-xs">
              <Leaf className="text-primary shrink-0 mt-0.5" size={18} />
              <div>
                <span className="block font-bold text-primary mb-0.5">Gieo Mầm Từ Tâm</span>
                <span>Từ Tâm Phục trích <strong>5% giá bán của sản phẩm</strong> này quyên tặng công quỹ các chùa và tu viện để chăm sóc các em nhỏ mồ côi và cụ già neo đơn.</span>
              </div>
            </div>

            {/* Quality Seals */}
            <div className="grid grid-cols-2 gap-4 border-t border-[#d4c3be]/40 mt-8 pt-6 font-sans">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                  <Leaf size={14} className="stroke-[1.8]" />
                </div>
                <div className="leading-tight">
                  <span className="block text-xs font-bold text-[#442a22]">Tự nhiên sơ gai</span>
                  <span className="text-[10px] text-on-surface-variant/70 block mt-0.5">Sợi lụa, linen organic 100%</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                  <Sparkles size={14} className="stroke-[1.8]" />
                </div>
                <div className="leading-tight">
                  <span className="block text-xs font-bold text-[#442a22]">Khuy cài thủ công</span>
                  <span className="text-[10px] text-on-surface-variant/70 block mt-0.5">Nút tết khâu tà tỉ mỉ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Poetic design story banner section */}
        <section className="mt-24 pt-24 border-t border-[#eeeeee]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="pr-0 md:pr-10">
              <span className="font-sans text-[10px] text-primary uppercase font-bold tracking-[0.2em] mb-3 block">
                Phong cách thiết kế tối giản
              </span>
              <h2 className="font-serif text-2xl md:text-3.5xl text-primary font-bold mb-6 tracking-wide leading-snug">
                Thấu cảm qua từng sợi vải
              </h2>
              
              <div className="space-y-5 text-sans text-xs md:text-sm text-on-surface-variant leading-relaxed opacity-90 font-medium">
                <p>
                  Tại Từ Tâm Phục, việc mặc không chỉ đơn thuần là khoác lên mình một tấm vải thêu thùa. 
                  Đó là một hành trình quay trở về với nếp phẳng chân thật của chính tâm hồn mình, 
                  là sự tĩnh lặng trong tâm hồn được phản chiếu gián tiếp qua vẻ ngoài thanh tao, nhã nhặn.
                </p>
                <p>
                  Mẫu áo được xưởng dệt thiết kế với phom dáng tối giản tuyệt đỉnh, 
                  loại bỏ hoàn toàn những chi tiết rườm rà dư thừa để chừa không gian tôn vinh chất liệu tơ tằm quý giá của giang sơn Việt. 
                  Mỗi đường kim mũi dệt thủ công đều chứa đựng sự chăm chút của người thợ lành nghề, mang lại sự thoải mái và tự tin cho quý khách.
                </p>
              </div>
            </div>

            <div className="aspect-video md:aspect-square bg-surface-container relative rounded-xs overflow-hidden group shadow-lg">
              <img
                alt="Nghệ nhân Việt dệt tơ"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhNPrrMAUQVVxkU85SFffgtyVWc41hysLXWMw7ECQGYlPFDayrBGfSdkDKxnoCFa6YdwY5kR9kJDQ66fA9jynJZPUDwqRjURltonRmLCXdhv_NT-i76p4NVuLpzFBs48wUJC-cRMMZY5IWe8UemabXiz1WagKUYvpQ4R5j-GPjucPc33os4hysCQ-nCVWg8IfGwsMPzchMGoLdl-MELJJ3lcodAkwbfuhn5prynWfuJ4iiQizbeEBQpGVOWmSSo2LvXHCpFjmpGAx3"
                className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="mt-24 pt-24 border-t border-[#eeeeee]">
          <h2 className="font-serif text-2xl font-bold text-primary mb-10 tracking-wide">
            Đánh Giá Từ Khách Hàng
          </h2>

          {reviewsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant/60 gap-3">
              <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-xs font-medium">Đang tải đánh giá...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start font-sans">
              {/* Summary Statistics Panel */}
              <div className="lg:col-span-4 bg-[#ece0dc]/10 border border-[#d4c3be]/30 p-6 md:p-8 rounded-sm">
                <div className="text-center mb-6">
                  <span className="block font-serif text-5xl font-black text-primary leading-none mb-3">
                    {averageRating}
                  </span>
                  <div className="flex justify-center gap-1 text-amber-400 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const avg = parseFloat(averageRating);
                      const isFilled = star <= Math.round(avg);
                      return (
                        <Star
                          key={star}
                          size={18}
                          fill={isFilled ? "currentColor" : "none"}
                          className="stroke-amber-400"
                        />
                      );
                    })}
                  </div>
                  <span className="text-[11px] text-on-surface-variant/80 font-semibold uppercase tracking-wider block">
                    Dựa trên {totalReviews} đánh giá
                  </span>
                </div>

                {/* Rating Distribution Progress Bars */}
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = distribution[5 - star];
                    const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs text-on-surface-variant">
                        <span className="w-3 font-semibold text-right">{star}</span>
                        <Star size={12} fill="currentColor" className="text-amber-400 stroke-amber-400 shrink-0" />
                        <div className="flex-1 h-2 bg-[#ece0dc]/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[10px] font-mono text-on-surface-variant/70">
                          {count} ({Math.round(percent)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Individual Customer Reviews List */}
              <div className="lg:col-span-8 space-y-8">
                {reviews.length > 0 ? (
                  <div className="divide-y divide-[#eeeeee] space-y-6">
                    {reviews.map((review: any, idx: number) => {
                      const reviewerName = review.user?.full_name || 'Khách hàng ẩn danh';
                      return (
                        <div key={review.id || idx} className={`${idx > 0 ? 'pt-6' : ''} space-y-3`}>
                          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#442a22] font-serif">
                                {maskName(reviewerName)}
                              </span>
                              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide border border-emerald-100 flex items-center gap-1">
                                <CheckCircle size={9} /> Đã mua hàng
                              </span>
                            </div>
                            <span className="text-on-surface-variant/70 font-semibold font-mono text-[10px]">
                              {new Date(review.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>

                          {/* Review Stars & Title */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={13}
                                  fill={star <= review.rating ? "currentColor" : "none"}
                                  className="stroke-amber-400"
                                />
                              ))}
                            </div>
                            {review.title && (
                              <h4 className="font-serif font-bold text-xs text-[#442a22]">
                                {review.title}
                              </h4>
                            )}
                            { (review.product_color || review.product_size) && (
                              <span className="text-[10px] text-[#8a726b] bg-[#ece0dc]/40 px-2 py-0.5 rounded-sm font-semibold">
                                Phân loại: {[review.product_color, review.product_size].filter(Boolean).join(', ')}
                              </span>
                            ) }
                          </div>

                          {/* Review Comment text */}
                          {review.content && (
                            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed py-0.5">
                              {review.content}
                            </p>
                          )}

                          {/* CSKH Reply */}
                          {review.reply && (
                            <div className="mt-3 bg-[#ece0dc]/10 border border-[#d4c3be]/20 p-3.5 rounded-sm flex flex-col gap-1.5 ml-4">
                              <div className="flex items-center gap-1 text-[10px] text-primary font-bold uppercase tracking-wider">
                                <CornerDownRight size={12} />
                                <span>Phản hồi từ Từ Tâm Phục</span>
                              </div>
                              <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed">
                                {review.reply}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-16 text-center border border-dashed border-[#d4c3be]/40 bg-[#fcfaf7] rounded-sm text-on-surface-variant/60 flex flex-col items-center justify-center gap-2">
                    <Star size={32} className="opacity-30 text-primary" />
                    <p className="text-xs font-semibold">Chưa có đánh giá nào cho sản phẩm này.</p>
                    <p className="text-[11px] text-on-surface-variant/80">Hãy mua sản phẩm và chia sẻ cảm nhận của bạn nhé!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Recommended Products */}
        <section className="mt-24 pt-12">
          <h2 className="font-serif text-2xl font-bold text-primary mb-10 tracking-wide">
            Sản phẩm quý khách quan tâm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            {PRODUCTS.filter((p) => p.id !== product.id)
              .slice(0, 3)
              .map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    navigate(`/san-pham/${prod.id}`);
                  }}
                  className="group cursor-pointer"
                >
                  <div className="aspect-[9/16] overflow-hidden bg-surface-container mb-4 relative rounded-xs border border-[#eeeeee]/60 group-hover:shadow-md transition-shadow">
                    <img
                      alt={prod.name}
                      src={prod.images[0]}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 font-bold text-[10px] tracking-widest text-[#5d4037] border border-[#d4c3be]/40 uppercase">
                        Xem chi tiết
                      </span>
                    </div>
                  </div>
                  <h3 className="font-serif text-sm font-bold text-primary mb-0.5 group-hover:text-primary-container transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs font-semibold text-on-surface-variant/80 font-mono">
                    {formatPrice(prod.price)}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>

      {/* Size Guide Modal Dialog */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[#fcfaf7] border border-[#d4c3be]/40 p-6 max-w-md w-full rounded-sm shadow-xl relative font-sans text-xs">
            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-black cursor-pointer bg-transparent border-0 font-bold"
            >
              Đóng
            </button>
            <h4 className="font-serif text-base font-bold text-primary mb-4 border-b border-[#eeeeee] pb-2 uppercase tracking-wide">
              Bảng quy đổi kích thước nam nữ
            </h4>
            <div className="space-y-4">
              <p className="font-medium text-on-surface-variant">Để chọn được pháp phục vừa vặn, quý khách tham khảo bảng số đo chiều cao & cân nặng dưới đây:</p>
              <table className="w-full text-left border-collapse border border-[#d4c3be]/40 font-mono text-[11px]">
                <thead>
                  <tr className="bg-[#ece0dc]/30 text-primary">
                    <th className="p-2 border border-[#d4c3be]/40">Kích thước (Size)</th>
                    <th className="p-2 border border-[#d4c3be]/40">Chiều cao (cm)</th>
                    <th className="p-2 border border-[#d4c3be]/40">Cân nặng (kg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-[#d4c3be]/40 font-bold">Size S</td>
                    <td className="p-2 border border-[#d4c3be]/40">150 - 158 cm</td>
                    <td className="p-2 border border-[#d4c3be]/40">42 - 49 kg</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border border-[#d4c3be]/40 font-bold">Size M</td>
                    <td className="p-2 border border-[#d4c3be]/40">156 - 165 cm</td>
                    <td className="p-2 border border-[#d4c3be]/40">50 - 58 kg</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-[#d4c3be]/40 font-bold">Size L</td>
                    <td className="p-2 border border-[#d4c3be]/40">163 - 172 cm</td>
                    <td className="p-2 border border-[#d4c3be]/40">59 - 68 kg</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="p-2 border border-[#d4c3be]/40 font-bold">Size XL</td>
                    <td className="p-2 border border-[#d4c3be]/40">170 - 180 cm</td>
                    <td className="p-2 border border-[#d4c3be]/40">69 - 80 kg</td>
                  </tr>
                </tbody>
              </table>
              <p className="italic text-on-surface-variant/70 text-[10px] leading-relaxed">
                * Lưu ý: Nếu chiều cao hoặc cân nặng của quý khách nằm ở khoảng giữa hai size, hoặc cần tư vấn thêm, quý khách vui lòng nhắn tin cho bộ phận chăm sóc khách hàng để được tư vấn tốt nhất.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </motion.div>
  );
}
