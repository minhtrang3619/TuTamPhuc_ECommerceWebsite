/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Leaf, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ChevronDown, 
  MapPin, 
  Sparkle, 
  Clock, 
  Compass, 
  CheckCircle,
  HelpCircle,
  Instagram,
  Facebook,
  Award
} from 'lucide-react';

import { Product, CartItem, ActiveFilters, Screen } from './types';
import { PRODUCTS, STORIES, CATEGORIES, COLORS } from './data';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ProductCard, { formatPrice } from './components/ProductCard';
import QuickViewModal from './components/QuickViewModal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import Toast from './components/Toast';

export default function App() {
  // Screens navigation state
  const [activeScreen, setActiveScreen] = useState<Screen>('catalog');
  const [selectedProduct, setSelectedProduct] = useState<Product>(
    PRODUCTS.find(p => p.id === 'ao-dai-cach-tan-silk-trang') || PRODUCTS[0]
  );

  // Active filter state - matches Screen 1 screenshot defaults
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Đồ lam nữ']);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>(['M']);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'price-asc' | 'price-desc'>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Cart and checkout drawer state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Promo Vouchers state on checkout
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [discountValue, setDiscountValue] = useState<number>(0);

  // Informative dialogue screens
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');

  // Toast alert states
  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type?: 'success' | 'info' }>({
    message: '',
    isVisible: false,
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, isVisible: true, type });
  };

  // Scroll back to top on transitions
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeScreen, selectedProduct, currentPage]);

  // Handle setting category filter from Header nav clicks
  const handleCategoryFilter = (category: string | null) => {
    if (category === 'Đồ lam') {
      setSelectedCategories(['Đồ lam nữ', 'Đồ lam nam', 'Bộ cư sĩ']);
    } else if (category) {
      setSelectedCategories([category]);
    } else {
      setSelectedCategories([]); // Clear filters -> all items
    }
    setCurrentPage(1);
  };

  // Filter and sort products list
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      // 1. Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesCat = product.category.toLowerCase().includes(query);
        if (!matchesName && !matchesCat) return false;
      }

      // 2. Categories filter
      if (selectedCategories.length > 0) {
        if (!selectedCategories.includes(product.category)) return false;
      }

      // 3. Colors filter
      if (selectedColors.length > 0) {
        const productColorsHex = product.colors.map(col => col.hex);
        const hasOverlayColor = productColorsHex.some(hex => selectedColors.includes(hex));
        if (!hasOverlayColor) return false;
      }

      // 4. Sizes filter
      if (selectedSizes.length > 0) {
        const hasOverlaySize = product.sizes.some(size => selectedSizes.includes(size));
        if (!hasOverlaySize) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0; // 'latest' matches raw order
    });
  }, [searchQuery, selectedCategories, selectedColors, selectedSizes, sortBy]);

  // Paginated items
  const productsPerPage = 6;
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage]);

  // Helper adding to cart
  const handleAddToCart = (product: Product, color: { name: string; hex: string }, size: string, qty: number) => {
    const id = `${product.id}-${color.hex}-${size}`;
    setCart((prev) => {
      const exists = prev.find((item) => item.id === id);
      if (exists) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { id, product, color, size, quantity: qty }];
    });
    showToast(`Đã thêm ${qty} x ${product.name} (${color.name}, cỡ ${size}) vào giỏ.`);
  };

  const handleUpdateCartQuantity = (id: string, qty: number) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveCartItem = (id: string) => {
    const item = cart.find(i => i.id === id);
    if (item) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      showToast(`Đã hạ giải ${item.product.name} ra khỏi giỏ.`);
    }
  };

  const handleOrderCheckoutSuccess = () => {
    // Clear cart and checkout promo
    setCart([]);
    setAppliedPromo('');
    setDiscountValue(0);
    showToast('Tâm duyên viên mãn! Điểm tịnh thiền hữu đã được ghi nhận.', 'success');
  };

  const handleNewsletterSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    showToast('Kính quy ghi nhận! Biên tập san thiền quán sẽ được gửi đều đặn hằng tuần.', 'success');
    setNewsletterEmail('');
  };

  // Swaps selected detail color labels
  const [activeDetailColor, setActiveDetailColor] = useState<{ name: string; hex: string } | null>(null);
  const [activeDetailSize, setActiveDetailSize] = useState<string>('M');

  useEffect(() => {
    if (selectedProduct) {
      setActiveDetailColor(selectedProduct.colors[0] || null);
      setActiveDetailSize(selectedProduct.sizes[0] || 'M');
    }
  }, [selectedProduct]);

  // Clean filters helper
  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSearchQuery('');
    setSortBy('latest');
    setCurrentPage(1);
    showToast('Bộ lọc đã được đưa về rỗng vô ngã.', 'info');
  };

  const subTotalForCart = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const finalTotalForCart = Math.max(0, subTotalForCart - discountValue);

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased pt-20 selection:bg-primary-container/20 selection:text-primary flex flex-col justify-between">
      
      {/* Dynamic Header */}
      <Header
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        cart={cart}
        setIsCartOpen={setIsCartOpen}
        setCategoryFilter={handleCategoryFilter}
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          if (activeScreen !== 'catalog') setActiveScreen('catalog');
          setCurrentPage(1);
        }}
        selectedCategories={selectedCategories}
      />

      <AnimatePresence mode="wait">
        {/* CATALOG SCREEN (Home) */}
        {activeScreen === 'catalog' && (
          <motion.main
            key="catalog"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex-1 max-w-7xl mx-auto px-6 md:px-16 pt-12 pb-24 w-full"
          >
            {/* Display Hero Title Block */}
            <div className="text-center mb-16 md:mb-20">
              <motion.span 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-[10px] uppercase font-sans font-extrabold tracking-[0.25em] text-[#5d4037] mb-2.5 block"
              >
                Cửa hàng di sản đũi tơ tằm
              </motion.span>
              <h1 className="font-serif text-3xl md:text-5xl text-primary font-bold mb-4 tracking-wide leading-tight">
                Pháp Phục & Đồ Lam
              </h1>
              <p className="font-sans text-xs md:text-sm text-on-surface-variant max-w-xl mx-auto leading-relaxed opacity-90 pl-3 border-l-2 border-[#d4c3be]/30 md:border-l-0">
                Sự tĩnh tại trong từng đường kim mũi chỉ, mang đến cảm giác an nhiên và trang nhã tuyệt đối cho người mặc.
              </p>
            </div>

            {/* Content grid columns */}
            <div className="flex flex-col md:flex-row gap-10 items-start">
              
              {/* Sidebar filter component column */}
              <Sidebar
                selectedCategories={selectedCategories}
                setSelectedCategories={(c) => {
                  setSelectedCategories(c);
                  setCurrentPage(1);
                }}
                selectedColors={selectedColors}
                setSelectedColors={(col) => {
                  setSelectedColors(col);
                  setCurrentPage(1);
                }}
                selectedSizes={selectedSizes}
                setSelectedSizes={(sizes) => {
                  setSelectedSizes(sizes);
                  setCurrentPage(1);
                }}
                onClearAll={handleClearAllFilters}
              />

              {/* Products Area column */}
              <div className="flex-1 w-full flex flex-col gap-8">
                
                {/* Horizontal Toolbar header */}
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 pb-4 border-b border-[#eeeeee]">
                  <div className="relative flex-1 max-w-xs font-sans">
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-transparent border-b border-outline-variant focus:border-primary py-2 pl-0 pr-8 transition-colors text-xs placeholder:text-on-surface-variant/40 outline-hidden font-medium text-primary"
                    />
                    {searchQuery && (
                      <button 
                        onClick={() => setSearchQuery('')}
                        className="absolute right-6 top-1/2 -translate-y-1/2 p-0.5 text-on-surface-variant/40 hover:text-black cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    )}
                    <span className="material-symbols-outlined absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px]">search</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-sans">
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">Sắp xếp:</span>
                    <div className="relative group">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-transparent border-0 py-1 pl-1 pr-6 font-semibold text-primary cursor-pointer outline-hidden focus:ring-0 text-xs text-right appearance-none"
                      >
                        <option value="latest">Mới nhất</option>
                        <option value="price-asc">Giá tăng dần</option>
                        <option value="price-desc">Giá giảm dần</option>
                      </select>
                      <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Grid items block */}
                {paginatedProducts.length === 0 ? (
                  <div className="py-24 text-center border border-dashed border-[#d4c3be]/40 bg-white rounded-xs p-10 flex flex-col items-center justify-center">
                    <span className="material-symbols-outlined text-[40px] text-[#827470]/30 mb-3">volunteer_activism</span>
                    <h4 className="font-serif text-base font-semibold text-primary mb-2">Vạn sự tùy duyên</h4>
                    <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
                      "Xưởng chưa tìm thấy sản phẩm thiền y nào trùng khớp với bộ lọc hiện thời. Quý huynh đệ xin hoan hỷ nới lỏng bộ lọc để thấy được nhiều pháp phục hơn."
                    </p>
                    <button
                      onClick={handleClearAllFilters}
                      className="mt-6 px-6 py-2.5 bg-primary text-white text-xs tracking-wider uppercase font-semibold hover:bg-primary-container transition-colors cursor-pointer rounded-xs"
                    >
                      Xoá bộ lọc rỗng
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                    {paginatedProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => {
                          setSelectedProduct(product);
                          setActiveScreen('detail');
                        }}
                        onQuickView={(e) => {
                          e.stopPropagation();
                          setQuickViewProduct(product);
                        }}
                        onAddToCart={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, product.colors[0], "M", 1);
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Interactive Pagination footer widgets */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center items-center gap-6 font-sans">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="text-xs font-semibold text-on-surface-variant disabled:opacity-30 disabled:pointer-events-none hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft size={14} /> Trở lại
                    </button>
                    
                    <div className="flex items-center gap-4 text-xs font-semibold text-on-surface-variant">
                      {Array.from({ length: totalPages }, (_, index) => {
                        const page = index + 1;
                        const isCurrent = currentPage === page;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-2 py-1 transition-all cursor-pointer ${
                              isCurrent 
                                ? 'text-primary border-b-2 border-primary font-bold pb-0.5' 
                                : 'hover:text-primary'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="text-xs font-semibold text-on-surface-variant disabled:opacity-30 disabled:pointer-events-none hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Tiếp theo <ChevronRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.main>
        )}

        {/* DETAIL SCREEN */}
        {activeScreen === 'detail' && (
          <motion.main
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex-1 py-12 w-full"
          >
            <div className="max-w-7xl mx-auto px-6 md:px-16">
              
              {/* Navigation Breadcrumb paths layout */}
              <nav className="flex items-center space-x-2.5 mb-8 font-sans text-[11px] font-semibold text-on-surface-variant/60 uppercase tracking-widest">
                <button 
                  onClick={() => setActiveScreen('catalog')}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Trang chủ
                </button>
                <ChevronRight size={10} className="text-[#d4c3be]" />
                <button 
                  onClick={() => {
                    handleCategoryFilter(selectedProduct.category);
                    setActiveScreen('catalog');
                  }}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  {selectedProduct.category}
                </button>
                <ChevronRight size={10} className="text-[#d4c3be]" />
                <span className="text-primary font-bold">{selectedProduct.name}</span>
              </nav>

              {/* Main Detail block Grid layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Left Columns - Imagery thumbnails stack */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Primary view image */}
                  <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-xs shadow-[0_8px_32px_rgba(68,42,34,0.03)] border border-[#d4c3be]/20 relative">
                    <img
                      alt={selectedProduct.name}
                      src={selectedProduct.images[0]}
                      className="w-full h-full object-cover transition-transform duration-[2200ms] hover:scale-103"
                      referrerPolicy="no-referrer"
                    />

                    {/* Special certification watermarks */}
                    {selectedProduct.badge && (
                      <span className="absolute top-4 left-4 z-10 px-3 py-1 font-sans text-[10px] font-bold text-primary bg-white/95 rounded-sm border border-[#d4c3be]/30 uppercase tracking-widest">
                        {selectedProduct.badge}
                      </span>
                    )}
                  </div>

                  {/* Smaller grid thumbnails for extra fabric macro detail view */}
                  <div className="grid grid-cols-2 gap-6 font-sans">
                    <div className="aspect-square bg-surface-container overflow-hidden rounded-xs border border-[#d4c3be]/20 relative group">
                      <img
                        alt="Đường dệt lụa"
                        src={selectedProduct.images[1] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUJFljnpOa2B9C7kBA4YrLTsNzLB2qxuf7m76WGV4gVLvw7raoS0UTeqQE_nRXa0z1mF9kGBhP1QksXgySgKASoAgn4E-enhpEbVqMsb-ULLQ85aVMRXuhdiMQ3_7dOc2RlL5dDQTYRmVokwzxCIQ7SdG_H2_UqMDIauB40P8z3Jn04eYTepIm39klCIlVR7noGxnFKwMfsWuMAW-tPP3-WzY7PcITdxL1K0_jtWmTY1qKyloRL6FysxIU-zhbZwZsdBHDTs6BKtO6'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/5 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-semibold uppercase tracking-wider">Cận cảnh sợi thô</span>
                      </div>
                    </div>
                    
                    <div className="aspect-square bg-surface-container overflow-hidden rounded-xs border border-[#d4c3be]/20 relative group">
                      <img
                        alt="Đường may dệt tà"
                        src={selectedProduct.images[2] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCipQ_RDwv6eS7ad9qkllzjPcGtp-eT9utLCRPDhRYx9Kv_-wOBr8nMwvamhIMGtM4pmHO2F4xZzxv1OaFiGt2TAubOUrynCsM0B7MAzhcY7zEFL4-zI9R08SlxsmP4ZLJkyE4OUOtQ3ID2YYvT19Q2Ljw_GVoBDRZpDdTBPMxSz2SlYZ5J3p26K1h6TZWl--_slm26IxzeRWCcI4Ct7dwAU0nof3ycRK8uu_WqoPQa9IYTSq59TswpxPr4NKMOv9p4u8SQAIKDXfUg'}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/5 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] text-white font-semibold uppercase tracking-wider">Cúc cúc thắt chi tiết</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Purchasing selections widget board */}
                <div className="lg:col-span-5 flex flex-col md:sticky md:top-28">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5d4037] mb-1.5 font-sans">
                    Pháp phục tự nhiên cổ truyền • {selectedProduct.category}
                  </span>
                  
                  <h1 className="font-serif text-2xl md:text-3.5xl text-primary font-bold mb-2 tracking-wide leading-tight">
                    {selectedProduct.name}
                  </h1>

                  <div className="flex items-baseline gap-3 mb-8 font-sans font-semibold">
                    <span className="text-xl text-primary font-bold">{formatPrice(selectedProduct.price)}</span>
                    {selectedProduct.oldPrice && (
                      <span className="text-sm text-on-surface-variant/40 line-through font-normal">
                        {formatPrice(selectedProduct.oldPrice)}
                      </span>
                    )}
                  </div>

                  {/* Poetic description panel */}
                  <div className="space-y-4.5 mb-10 border-l border-[#d4c3be] pl-5">
                    {selectedProduct.quote && (
                      <p className="font-serif italic text-[#5d4037]/95 text-sm md:text-base leading-relaxed opacity-90">
                        {selectedProduct.quote}
                      </p>
                    )}
                    <p className="font-sans text-xs text-on-surface-variant/80 tracking-wide leading-relaxed">
                      {selectedProduct.description}
                    </p>
                  </div>

                  {/* Selection selectors attributes */}
                  <div className="space-y-6 mb-10 font-sans">
                    
                    {/* Color swatches choice */}
                    <div>
                      <span className="block text-[11px] uppercase tracking-widest font-bold text-[#5d4037] mb-3">
                        Màu sắc: <span className="text-on-surface font-normal">{activeDetailColor?.name}</span>
                      </span>
                      <div className="flex space-x-3">
                        {selectedProduct.colors.map((color) => {
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

                    {/* Sizing choosing table */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="block text-[11px] uppercase tracking-widest font-bold text-[#5d4037]">
                          Kích thước
                        </span>
                        
                        <button
                          onClick={() => setIsSizeGuideOpen(true)}
                          className="font-sans text-[11px] text-xs text-on-surface-variant/70 underline decoration-[#d4c3be] underline-offset-4 font-semibold hover:text-black cursor-pointer"
                        >
                          Bảng size tư đồ
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {selectedProduct.sizes.map((size) => {
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

                  {/* Core buttons actions */}
                  <div className="space-y-3 font-sans">
                    <button
                      onClick={() => {
                        if (activeDetailColor) {
                          handleAddToCart(selectedProduct, activeDetailColor, activeDetailSize, 1);
                          setIsCartOpen(true);
                        }
                      }}
                      className="w-full py-4.5 border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all flex justify-center items-center gap-2 rounded-xs shadow-xs cursor-pointer"
                    >
                      Thêm vào giỏ hàng
                      <span className="material-symbols-outlined text-[16px]">arrow_right_alt</span>
                    </button>

                    <button
                      onClick={() => {
                        if (activeDetailColor) {
                          // Add to cart silently or ensure to start checkout
                          const id = `${selectedProduct.id}-${activeDetailColor.hex}-${activeDetailSize}`;
                          const alreadyIn = cart.find(i => i.id === id);
                          if (!alreadyIn) {
                            handleAddToCart(selectedProduct, activeDetailColor, activeDetailSize, 1);
                          }
                          setIsCheckoutOpen(true);
                        }
                      }}
                      className="w-full py-4.5 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-[#2c160e] transition-all flex justify-center items-center gap-2 rounded-xs shadow-md cursor-pointer"
                    >
                      Mua ngay
                      <span className="material-symbols-outlined text-[16px] animate-pulse">bolt</span>
                    </button>
                  </div>

                  {/* Double Guarantee Badges */}
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
                      Nghệ thuật mặc áo thiền
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
                        Mỗi đường kim mũi dệt thủ công đều chứa đựng sự chăm chút của người thợ lành nghề, mang theo tâm nguyện đong đầy bình an và thong dong cho đạo hữu.
                      </p>
                    </div>
                  </div>

                  <div className="aspect-video md:aspect-square bg-surface-container relative rounded-xs overflow-hidden group shadow-lg">
                    <img
                      alt="Nghệ nhân Việt dệt tơ"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhNPrrMAUQVVxkU85SFffgtyVWc41hysLXWMw7ECQGYlPFDayrBGfSdkDKxnoCFa6YdwY5kR9kJDQ66fA9jynJZPUDwqRjURltonRmLCXdhv_NT-i76p4NVuLpzFBs48wUJC-cRMMZY5IWe8UemabXiz1WagKUYvpQ4R5j-GPjucPc33os4hysCQ-nCVWg8IfGwsMPzchMGoLdl-MELJJ3lcodAkwbfuhn5prynWfuJ4iiQizbeEBQpGVOWmSSo2LvXHCpFjmpGAx3"
                      className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-106"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-primary/5 cursor-crosshair" />
                  </div>

                </div>
              </section>

              {/* Related products recommendation cards */}
              <section className="mt-24 pt-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-3">
                  <div>
                    <span className="font-sans text-[10px] text-primary uppercase font-bold tracking-[0.2em] mb-1 block">
                      Khám phá thêm
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-primary tracking-wide">
                      Ưa chuộng quanh xưởng
                    </h2>
                  </div>
                  <div className="w-full sm:w-auto h-px bg-[#eeeeee] flex-1 sm:hidden" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
                  {PRODUCTS.filter(p => p.id !== selectedProduct.id).slice(0, 3).map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => {
                        setSelectedProduct(prod);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-[3/4] overflow-hidden bg-surface-container mb-4 relative rounded-xs border border-[#eeeeee]/60 group-hover:shadow-md transition-shadow">
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
          </motion.main>
        )}

        {/* DETAILS ABOUT SCREEN */}
        {activeScreen === 'about' && (
          <motion.main
            key="about"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 max-w-4xl mx-auto px-6 md:px-16 pt-16 pb-24 w-full"
          >
            <div className="text-center mb-16">
              <span className="text-[10px] tracking-[0.25em] font-sans font-extrabold text-[#5d4037] block mb-2 uppercase">Về chúng tôi</span>
              <h1 className="font-serif text-3xl md:text-4.5xl text-primary font-bold mb-4">Câu chuyện Từ Tâm Phục</h1>
              <div className="w-16 h-0.5 bg-primary/40 mx-auto" />
            </div>

            <div className="space-y-8 font-sans text-xs md:text-sm text-on-surface-variant leading-relaxed">
              <p className="font-serif italic text-base md:text-lg text-[#5d4037] text-center max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
                "Khởi đầu từ những nốt trầm trong xưởng thêu gỗ mộc Trạch Xá, Từ Tâm Phục nuôi dưỡng niềm ước mong kiến tạo những vật phẩm y phục mộc mạc làm lắng dịu nốt nhạc đời thường vội vã."
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#442a22] mb-3">Tâm Ý Của Tấm Áo</h3>
                  <p>
                    Mỗi tà áo chéo, mỗi dải khuy cài tại xưởng tơ của Từ Tâm Phục đều mang trọn thông điệp tích cực về bảo vệ và giữ gìn di sản cổ truyền quý gia. 
                    Chúng tôi ưu tiên tìm kiếm và sử dụng nguồn chất liệu gai tre, đũi, linen tơ organically tự nhiên được trồng tỉa và dệt tay hoàn toàn tự nông dã địa phương Việt Nam.
                  </p>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#442a22] mb-3">Thủ Công Bản Địa</h3>
                  <p>
                    Khắc phục việc sản xuất dây chuyền công nghiệp thô cứng, trang phục của Từ Tâm Phục do trực tiếp các nghệ nhân cao tuổi và thợ thủ công lành nghề cắt may trong làng văn hóa thêu thâm niên. 
                    Nút thắt áo bọc dệt tay tinh xảo giúp từng nếp khuy giữ chuẩn form, lưu lại nét thon thả, tự nhiên nho nhã cho áo lam.
                  </p>
                </div>
              </div>

              <div className="bg-[#ece0dc]/40 border border-[#d4c3be]/40 rounded-sm p-6 mt-10">
                <h4 className="font-serif text-base font-bold text-primary mb-2 flex items-center gap-1.5">
                  <Award size={18} /> Cam Kết An Lành Từ Xưởng Gỗ
                </h4>
                <ul className="list-disc pl-5 space-y-2 mt-3 leading-relaxed text-xs">
                  <li><strong>Chất liệu mộc:</strong> 100% không chứa sợi nylon tổng hợp gây bức bí hoặc dị ứng da dẻ.</li>
                  <li><strong>Hương thơm rũ tịnh:</strong> Áo được tẩy uế giặt sạch và hun quế thơm, gấp phẳng trong hộp mộc tự hoai thân thiện môi trường.</li>
                  <li><strong>Thành tựu công đức:</strong> Một phần duyên tạ của quý hữu khơi thỉnh được Từ Tâm Phục trích quỹ cúng dường đạo tràng bảo trợ trẻ em cơ nhỡ địa phương.</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <button
                onClick={() => setActiveScreen('catalog')}
                className="px-8 py-3 bg-primary hover:bg-[#2c160e] text-white text-xs tracking-widest uppercase font-semibold transition-colors cursor-pointer rounded-xs"
              >
                Ghé Quán Thưởng Áo
              </button>
            </div>
          </motion.main>
        )}

        {/* BLOG SCREEN */}
        {activeScreen === 'blog' && (
          <motion.main
            key="blog"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="flex-1 max-w-5xl mx-auto px-6 md:px-16 pt-16 pb-24 w-full font-sans"
          >
            <div className="text-center mb-16">
              <span className="text-[10px] tracking-[0.25em] font-sans font-extrabold text-[#5d4037] block mb-2 uppercase">Lưu Thư Thiền Trà</span>
              <h1 className="font-serif text-3xl md:text-4.5xl text-primary font-bold mb-4">Mộc Bản Đồng Hành</h1>
              <p className="text-xs text-on-surface-variant max-w-lg mx-auto font-medium">
                Những tản văn nhè nhẹ ghi lại phong cách sống thiền tịnh, tà áo thướt tha mộc bản và phương tựa an nhiên giữa muôn nẻo phồn hoa đời thường.
              </p>
              <div className="w-16 h-0.5 bg-primary/40 mx-auto mt-6" />
            </div>

            {/* Stories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Blog item 1 */}
              <div className="bg-white border border-[#eeeeee] hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden group flex flex-col justify-between">
                <div>
                  <div className="aspect-[16/10] overflow-hidden bg-surface-container relative">
                    <img 
                      src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" 
                      alt="Sự tối giản trong triết lý mặc" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                      Triết Lý Thiền
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider mb-2">
                      <span>Theo Ban biên tập Từ Tâm</span>
                      <span>•</span>
                      <span>May 30, 2026</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary group-hover:text-primary-container transition-colors mb-3">
                      Sự tối giản trong triết lý mặc y áo thiền môn
                    </h3>
                    <p className="text-xs text-on-surface-variant/80 leading-relaxed font-semibold">
                      Tại Từ Tâm Phục, trang phục không phán xét, không ồn ào. Đó chính là sự nương tựa dịu nhẹ vào nguyên bản thô mộc của từng thớ vải tơ gai mộc mạc, giúp tâm thức của con người tìm về nốt lặng viên mãn mười phân sạch trong...
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button 
                    onClick={() => {
                      showToast('Tản văn đầy đủ đang được biên soạn dệt chữ...', 'info');
                    }}
                    className="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1 cursor-pointer"
                  >
                    Xem trọn bài thiền <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                  </button>
                </div>
              </div>

              {/* Blog item 2 */}
              <div className="bg-white border border-[#eeeeee] hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden group flex flex-col justify-between">
                <div>
                  <div className="aspect-[16/10] overflow-hidden bg-surface-container relative">
                    <img 
                      src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80" 
                      alt="Hành trình từ thớ gai tự nhiên đến tà áo" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                      Thủ Công Mỹ Nghệ
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center space-x-2 text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider mb-2">
                      <span>Nghệ nhân Mộc Trạch</span>
                      <span>•</span>
                      <span>May 28, 2026</span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-primary group-hover:text-primary-container transition-colors mb-3">
                      Hành trình nhuộm vỏ củ nâu và tết cúc rơm thủ công
                    </h3>
                    <p className="text-xs text-on-surface-variant/80 leading-relaxed font-semibold">
                      Tìm hiểu thấu đáo quy trình thu hái củ nâu rừng dã địa phương, chưng cất dệt tơ chéo thô sần và may ráp tà tỉ mỉ. Để mỗi tà áo lam bay lên lưu lại nét đong đầy nét quý từ làng nghề Trạch Xá thâm niên...
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button 
                    onClick={() => {
                      showToast('Tản văn đầy đủ đang được biên soạn dệt chữ...', 'info');
                    }}
                    className="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1 cursor-pointer"
                  >
                    Xem trọn bài thiền <span className="material-symbols-outlined text-[14px]">arrow_right_alt</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Newsletter widget */}
            <div className="mt-16 bg-[#ece0dc]/30 border border-[#d4c3be]/40 rounded-sm p-8 text-center max-w-xl mx-auto">
              <span className="material-symbols-outlined text-[36px] text-primary mb-3 block">local_cafe</span>
              <h4 className="font-serif font-bold text-lg text-primary mb-2">Gửi duyên thảo thư hằng tuần</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6 font-semibold">
                Đạo hữu ưa chuộng văn biên san Từ Tâm? Xin gửi lại địa chỉ thư để nhận tản văn thiền học và ưu đãi dệt tơ sơm lành hằng tuần nhé.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <input 
                  type="email" 
                  placeholder="Thư điện tử của đạo hữu..." 
                  className="bg-white border border-[#d4c3be]/50 rounded-sm px-4 py-2 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none text-primary font-semibold sm:w-64"
                />
                <button 
                  onClick={() => showToast('Hoan hỷ vô lượng! Từ Tâm Phục xin tịnh ghi nhận.', 'success')}
                  className="bg-primary text-white text-xs uppercase tracking-widest font-bold px-6 py-2.5 rounded-sm hover:bg-[#2c160e] transition-colors"
                >
                  Kết duyên thư
                </button>
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* FOOTER AREA */}
      <footer className="w-full pt-16 pb-8 bg-secondary-container text-on-surface-variant font-sans border-t border-[#d4c3be]/30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 px-6 md:px-16 max-w-7xl mx-auto">
          
          {/* Logo Column */}
          <div className="flex flex-col gap-4">
            <span className="font-serif text-xl md:text-2xl font-bold text-primary uppercase tracking-widest">Từ Tâm Phục</span>
            <p className="text-xs text-on-[#5d4037]/80 leading-relaxed font-semibold">
              Khởi tâm từ, diện trang nghiêm. Không gian tịnh lòng nâng đỡ sự an yên qua từng nếp y phục tối giản mộc mạc.
            </p>
            <div className="flex space-x-3.5 mt-2 text-primary">
              <a href="#" className="hover:opacity-75 transition-opacity" title="Instagram"><Instagram size={18} /></a>
              <a href="#" className="hover:opacity-75 transition-opacity" title="Facebook"><Facebook size={18} /></a>
            </div>
          </div>

          {/* Nav Column 1 */}
          <div>
            <h4 className="font-serif text-xs uppercase tracking-widest text-[#442a22] font-bold mb-5">Khám Phá Di Sản</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <button 
                  onClick={() => setActiveScreen('about')} 
                  className="hover:text-primary transition-colors cursor-pointer text-left font-medium"
                >
                  Triết lý mặc đũi tơ tằm
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors text-left font-medium">
                  Bảo quản tự nhiên (Fabric Care)
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors text-left font-medium">
                  Nghi lễ thiền cung (Etiquette)
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Column 2 */}
          <div>
            <h4 className="font-serif text-xs uppercase tracking-widest text-[#442a22] font-bold mb-5">Hỗ Trợ Bạn Hữu</h4>
            <ul className="space-y-3 text-xs">
              <li>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="hover:text-primary transition-colors text-left cursor-pointer font-medium"
                >
                  Bảng chi số kích thước
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors text-left font-medium">Chính sách vận hành phát tà</a>
              </li>
              <li>
                <span className="block hover:text-primary transition-colors text-left font-medium cursor-help" onClick={() => showToast('Mọi ý kiến đóng góp xin liên hệ hotline: 098.245.0000', 'info')}>
                  Liên hệ Từ Tâm Quán
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div>
            <h4 className="font-serif text-xs uppercase tracking-widest text-[#442a22] font-bold mb-4">Đăng ký tịnh tin</h4>
            <p className="text-xs text-[#5d4037]/80 leading-relaxed mb-4">
              Nhận tịnh thư chia sẻ văn chương, tinh phẩm cùng mã quà duyên đầu tuần.
            </p>
            <form onSubmit={handleNewsletterSignupSubmit} className="relative border-b border-[#5d4037]/30 pb-1.5 flex items-center">
              <input
                type="email"
                placeholder="Email của bạn..."
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-transparent border-0 py-1.5 pl-0 w-full text-xs text-primary focus:ring-0 placeholder:text-[#5d4037]/40 outline-hidden font-medium"
              />
              <button 
                type="submit" 
                className="text-primary hover:opacity-75 transition-opacity cursor-pointer p-0.5 flex items-center justify-center"
                title="Đăng ký"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer Base bar signature */}
        <div className="max-w-7xl mx-auto px-6 md:px-16 mt-16 pt-8 border-t border-on-surface-variant/10 text-center font-sans">
          <p className="text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-widest">
            © 2026 Từ Tâm Phục. Chân thật trong từng sợi vải. Thiết kế di sản thuần túy Việt Nam.
          </p>
        </div>
      </footer>

      {/* QUICK VIEW VIEWPORT MODAL */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onViewDetails={(prod) => {
          setSelectedProduct(prod);
          setActiveScreen('detail');
        }}
      />

      {/* SLIDING REGISTERED BASKET CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onTriggerCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedPromo={appliedPromo}
        setAppliedPromo={setAppliedPromo}
        discountValue={discountValue}
        setDiscountValue={setDiscountValue}
      />

      {/* DETAILED CHECKOUT SYSTEM MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cart={cart}
        finalTotal={Math.max(0, subTotalForCart - discountValue)}
        discountValue={discountValue}
        appliedPromo={appliedPromo}
        onOrderSuccess={handleOrderCheckoutSuccess}
      />

      {/* SIZE GUIDE POPUP DIAG */}
      <AnimatePresence>
        {isSizeGuideOpen && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSizeGuideOpen(false)}
              className="fixed inset-0 bg-black/35 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-md w-full rounded-sm p-6 relative shadow-2xl border border-outline-variant font-sans z-10"
            >
              <button 
                onClick={() => setIsSizeGuideOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-on-surface"
              >
                <X size={16} />
              </button>
              
              <h4 className="font-serif text-lg font-bold text-primary uppercase tracking-wider mb-4 border-b pb-2">
                Thông số chọn size tịnh phục
              </h4>
              
              <div className="space-y-4 text-xs font-medium text-on-surface-variant">
                <p className="leading-relaxed">
                  Để tà áo vừa vặn phẳng phiu thanh thoát, mời đạo hữu tham khảo thông số chiều cao cân nặng tương đối dưới đây:
                </p>

                <div className="border border-[#eeeeee] overflow-hidden rounded-sm font-mono text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low font-bold border-b text-primary">
                        <th className="p-2 border-r">Cỡ</th>
                        <th className="p-2 border-r">Chiều cao</th>
                        <th className="p-2">Cân nặng</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-on-surface">
                      <tr>
                        <td className="p-2 border-r font-bold">S</td>
                        <td className="p-2 border-r">1m48 - 1m55</td>
                        <td className="p-2">42kg - 48kg</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r font-bold">M</td>
                        <td className="p-2 border-r">1m56 - 1m62</td>
                        <td className="p-2">49kg - 55kg</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r font-bold">L</td>
                        <td className="p-2 border-r">1m63 - 1m68</td>
                        <td className="p-2">56kg - 62kg</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r font-bold">XL</td>
                        <td className="p-2 border-r">1m69 - 1m75</td>
                        <td className="p-2">63kg - 72kg</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <p className="text-[10px] text-[#5d4037] bg-[#ece0dc]/30 p-3 rounded-xs leading-relaxed italic">
                  * Lời khuyên: Sản phẩm pháp phục của Từ Tâm Phục thiết kế phom dáng suông rộng rãi thoải mái. Nếu chiều cao cân nặng nằm giữa hai tầm cũ, đạo hữu nên tin tưởng chọn cỡ lớn hơn để có tà buông bay thiền rũ mát nhất nhé.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MICRO-ALERTS FEEDBACK TOAST notifications */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />

    </div>
  );
}
