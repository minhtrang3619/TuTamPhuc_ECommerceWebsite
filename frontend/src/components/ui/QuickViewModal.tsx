import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../../mockTypes';
import { formatPrice } from './ProductCard';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, color: { name: string; hex: string }, size: string, quantity: number) => void;
  onBuyNow: (product: Product, color: { name: string; hex: string }, size: string, quantity: number) => void;
  onViewDetails: (product: Product) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onViewDetails,
}: QuickViewModalProps) {
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  // Initialize values when product changes
  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0] || null);
      setSelectedSize(product.sizes[0] || 'S');
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedColor) return;
    onAddToCart(product, selectedColor, selectedSize, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    if (!selectedColor) return;
    onBuyNow(product, selectedColor, selectedSize, quantity);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Underlay Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window stage */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25 }}
          className="relative bg-[#f9f9f9] w-full max-w-3xl rounded-xs shadow-2xl overflow-hidden font-sans border border-[#d4c3be]/40 z-10"
        >
          {/* Close trigger button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/80 hover:bg-white text-on-surface hover:text-black shadow-sm transition-all z-25 cursor-pointer"
            title="Đóng"
          >
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Image Screen */}
            <div className="relative aspect-[4/5] md:aspect-auto md:h-[480px] bg-surface-container overflow-hidden">
              <img
                alt={product.name}
                src={product.images[0]}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              {product.badge && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-[10px] font-bold text-primary bg-white/90 backdrop-blur-md rounded-sm uppercase tracking-widest border border-[#d4c3be]/30">
                    {product.badge}
                  </span>
                </div>
              )}
            </div>

            {/* Right details panel */}
            <div className="p-6 md:p-8 flex flex-col justify-between max-h-[480px] overflow-y-auto">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#5d4037] font-semibold mb-1">
                  Từ Tâm Phục • {product.category}
                </p>
                <h3 className="font-serif text-2xl font-semibold text-primary mb-2">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-3 mb-4 font-semibold text-sm">
                  <span className="text-primary text-base font-bold">{formatPrice(product.price)}</span>
                  {product.oldPrice && (
                    <span className="text-on-surface-variant/40 line-through font-normal">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                </div>

                <div className="w-full h-px bg-[#eeeeee] my-3" />

                {/* Short quote and description */}
                {product.quote && (
                  <p className="text-xs italic text-[#5d4037]/90 bg-[#ece0dc]/30 p-2.5 rounded-xs border-l-2 border-[#5d4037]/40 mb-3">
                    {product.quote}
                  </p>
                )}
                <p className="text-xs text-on-surface-variant/90 leading-relaxed mb-5 line-clamp-3">
                  {product.description}
                </p>

                {/* Color selects */}
                <div className="mb-4">
                  <span className="block text-[11px] uppercase tracking-widest font-semibold text-primary mb-2">
                    Màu sắc: <span className="text-on-surface font-normal">{selectedColor?.name}</span>
                  </span>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color.hex}
                        onClick={() => setSelectedColor(color)}
                        className={`w-7 h-7 rounded-full border p-0.5 transition-all ${
                          selectedColor?.hex === color.hex ? 'border-primary ring-1 ring-primary/30' : 'border-[#d4c3be]'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Size Swatches */}
                <div className="mb-5">
                  <span className="block text-[11px] uppercase tracking-widest font-semibold text-primary mb-2">
                    Kích cỡ:
                  </span>
                  <div className="flex gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-9 h-8 border text-xs font-semibold rounded-sm transition-all flex items-center justify-center cursor-pointer ${
                          selectedSize === size
                            ? 'border-primary bg-primary text-white font-bold'
                            : 'border-[#d4c3be] text-on-surface-variant hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantities */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-primary">Số lượng:</span>
                  <div className="flex items-center border border-[#d4c3be] rounded-sm bg-white overflow-hidden h-8">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1 px-2.5 hover:bg-[#f3f3f3] text-on-surface transition-colors h-full"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3.5 text-xs font-mono font-bold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1 px-2.5 hover:bg-[#f3f3f3] text-on-surface transition-colors h-full"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Action grid bottom */}
              <div className="flex flex-col gap-2">
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3 border border-primary text-primary hover:bg-primary/5 font-semibold text-xs tracking-widest uppercase transition-all duration-300 flex justify-center items-center gap-2 rounded-xs cursor-pointer"
                  >
                    <ShoppingBag size={14} /> Thêm Vào Giỏ
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3 bg-primary text-white font-semibold text-xs tracking-widest uppercase hover:bg-[#2c160e] transition-all duration-300 flex justify-center items-center gap-2 rounded-xs cursor-pointer shadow-sm"
                  >
                    Mua Ngay
                  </button>
                </div>
                <button
                  onClick={() => {
                    onViewDetails(product);
                    onClose();
                  }}
                  className="w-full py-2.5 border border-[#d4c3be]/60 text-on-surface-variant hover:text-primary hover:border-primary font-semibold text-[11px] tracking-widest uppercase transition-all duration-300 flex justify-center items-center gap-1.5 rounded-xs cursor-pointer bg-transparent"
                  title="Tìm hiểu chi tiết"
                >
                  <Eye size={13} /> Xem chi tiết sản phẩm
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
