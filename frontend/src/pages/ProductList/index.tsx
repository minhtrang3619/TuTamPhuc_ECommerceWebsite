import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, ChevronDown } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { Product } from '../../mockTypes';
import { PRODUCTS } from '../../data';
import Sidebar from '../../components/ui/Sidebar';
import ProductCard from '../../components/ui/ProductCard';
import QuickViewModal from '../../components/ui/QuickViewModal';
import Toast from '../../components/ui/Toast';
import { useMockCartStore } from '../../store/mockCartStore';

export default function ProductListPage() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { addItem, openCheckout } = useMockCartStore();

  // Active filter state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'price-asc' | 'price-desc'>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const categoryParam = searchParams.get('category');
  const activeCategorySlug = slug || categoryParam;

  useEffect(() => {
    if (activeCategorySlug) {
      if (activeCategorySlug === 'do-lam') {
        setSelectedCategories(['Đồ lam nam', 'Đồ lam nữ']);
      } else if (activeCategorySlug === 'phap-phuc') {
        setSelectedCategories(['Pháp Phục']);
      } else if (activeCategorySlug === 'ao-trang') {
        setSelectedCategories(['Áo tràng']);
      } else if (activeCategorySlug === 'tui-vai') {
        setSelectedCategories(['Túi vải']);
      }
      setCurrentPage(1);
    } else {
      setSelectedCategories([]);
    }
  }, [activeCategorySlug]);

  // Toast alert state
  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type?: 'success' | 'info' }>({
    message: '',
    isVisible: false,
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, isVisible: true, type });
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

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSearchQuery('');
    setSortBy('latest');
    setCurrentPage(1);
    showToast('Bộ lọc đã được đặt lại.', 'info');
  };

  const handleAddToCart = (product: Product, color: { name: string; hex: string }, size: string, qty: number) => {
    addItem(product, color, size, qty);
    showToast(`Đã thêm ${qty} x ${product.name} vào giỏ hàng.`);
  };

  const handleBuyNow = (product: Product, color: { name: string; hex: string }, size: string, qty: number) => {
    addItem(product, color, size, qty);
    openCheckout();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="bg-[#fcfaf7] min-h-screen pt-12 pb-24 font-sans"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 w-full">
        {/* Display Hero Title Block */}
        <div className="text-center mb-16 md:mb-20">
          <span className="text-[10px] uppercase font-sans font-extrabold tracking-[0.25em] text-[#5d4037] mb-2.5 block">
            Cửa hàng di sản đũi tơ tằm
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-primary font-bold mb-4 tracking-wide leading-tight">
            Trang Phục & Đồ Lam
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
                  className="w-full bg-transparent border-b border-outline-variant focus:border-primary py-2 pl-0 pr-6 transition-colors text-xs placeholder:text-on-surface-variant/40 outline-none font-medium text-primary"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-0.5 text-on-surface-variant/40 hover:text-black cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-sans">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant/70 tracking-wider">Sắp xếp:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent border-0 py-1 pl-1 pr-6 font-semibold text-primary cursor-pointer outline-none focus:ring-0 text-xs text-right appearance-none"
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
                <h4 className="font-serif text-base font-semibold text-primary mb-2">Không tìm thấy sản phẩm</h4>
                <p className="text-xs text-on-surface-variant max-w-sm leading-relaxed">
                  Chúng tôi chưa tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại. Quý khách vui lòng điều chỉnh bộ lọc để xem thêm sản phẩm.
                </p>
                <button
                  onClick={handleClearAllFilters}
                  className="mt-6 px-6 py-2.5 bg-primary text-white text-xs tracking-wider uppercase font-semibold hover:bg-primary-container transition-colors cursor-pointer rounded-xs"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onClick={() => {
                      navigate(`/san-pham/${product.id}`);
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

            {/* Interactive Pagination footer */}
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
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        onViewDetails={(product) => {
          navigate(`/san-pham/${product.id}`);
        }}
      />

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
