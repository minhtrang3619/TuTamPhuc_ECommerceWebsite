/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Product } from "../types";
import { X, Sparkles, ShoppingBag, Leaf, HelpCircle, Heart, Star } from "lucide-react";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: "S" | "M" | "L" | "XL", quantity: number) => void;
  onAskAIAboutProduct: (product: Product) => void;
}

export default function QuickViewModal({
  product,
  onClose,
  onAddToCart,
  onAskAIAboutProduct,
}: QuickViewModalProps) {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = React.useState<"S" | "M" | "L" | "XL">(
    product.sizes[0] || "M"
  );
  const [quantity, setQuantity] = React.useState<number>(1);
  const [addedAnimation, setAddedAnimation] = React.useState<boolean>(false);
  const [isSaved, setIsSaved] = React.useState<boolean>(false);

  React.useEffect(() => {
    setSelectedSize(product.sizes[0] || "M");
    setQuantity(1);
    setAddedAnimation(false);
  }, [product]);

  const handleAddToCartClick = () => {
    setAddedAnimation(true);
    onAddToCart(product, selectedSize, quantity);
    setTimeout(() => {
      setAddedAnimation(false);
    }, 1500);
  };

  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + " ₫";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="quick-view-overlay">
      {/* Dark backdrop blur */}
      <div 
        className="fixed inset-0 bg-brand-dark/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="flex min-h-screen items-center justify-center p-4 md:p-6 lg:p-8">
        {/* Modal card content */}
        <div 
          className="relative w-full max-w-4xl bg-brand-bg rounded-lg shadow-ambient overflow-hidden border border-brand-sand/55 flex flex-col md:flex-row"
          id="quick-view-modal"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-brand-secondary hover:text-brand-primary transition-colors cursor-pointer p-1 bg-brand-bg/85 rounded-full border border-brand-sand/30 shadow-sm"
          >
            <X size={20} />
          </button>

          {/* Left column: Visual Showcase */}
          <div className="w-full md:w-1/2 relative bg-brand-ivory aspect-[3/4] md:aspect-auto">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
              id="modal-product-image"
            />
            {product.tag && (
              <span className="absolute top-4 left-4 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand-primary bg-brand-sand shadow-sm rounded-sm">
                {product.tag}
              </span>
            )}
            
            {/* Elegant Brand Concept Overlay */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-brand-dark/50 to-transparent p-6 text-brand-bg md:hidden lg:block">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-sand mb-1">
                <Leaf size={14} />
                Chế tác Chay 100%
              </div>
              <p className="text-sm font-serif-elegant italic text-brand-ivory/90 leading-relaxed">
                "{product.meaning}"
              </p>
            </div>
          </div>

          {/* Right column: Interactive options */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh] md:max-h-[640px]">
            <div>
              {/* Product Metadata */}
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-stone bg-brand-sand/40 px-2 py-0.5 rounded-sm">
                  {product.category}
                </span>
                
                {/* Save item Button */}
                <button 
                  onClick={() => setIsSaved(!isSaved)}
                  className="text-brand-stone hover:text-red-700 transition-colors cursor-pointer"
                  title="Lưu vào ưa thích"
                >
                  <Heart size={18} fill={isSaved ? "#B33924" : "none"} className={isSaved ? "text-red-800" : ""} />
                </button>
              </div>

              <h2 className="font-serif-elegant text-2xl text-brand-primary font-semibold tracking-wide mb-2" id="modal-product-name">
                {product.name}
              </h2>

              <p className="text-lg font-bold text-brand-brown tracking-wide mb-4">
                {formatPrice(product.price)}
              </p>

              {/* Fabric focus badges */}
              <div className="flex flex-wrap gap-2.5 mb-5 text-[11px] font-semibold text-brand-secondary/90">
                <span className="flex items-center gap-1 bg-brand-sand/35 px-2.5 py-1 rounded-sm border border-brand-sand/50">
                  <Leaf size={12} className="text-emerald-700" />
                  Sợi dệt: {product.fabric}
                </span>
                <span className="flex items-center gap-1 bg-brand-sand/35 px-2.5 py-1 rounded-sm border border-brand-sand/50">
                  Màu: {product.color}
                </span>
              </div>

              {/* Product Description */}
              <p className="text-xs text-brand-secondary/95 leading-relaxed mb-5" id="modal-product-desc">
                {product.description}
              </p>

              {/* Spiritual significance & Care Tips */}
              <div className="bg-brand-sand/30 p-4 border border-brand-sand/40 rounded-sm mb-5 text-[11px] leading-relaxed flex flex-col gap-2.5">
                <div>
                  <span className="font-bold text-brand-primary uppercase tracking-wider block mb-0.5">Ý nghĩa phục trang:</span>
                  <span className="text-brand-secondary/90 italic">"{product.meaning}"</span>
                </div>
                <div>
                  <span className="font-bold text-brand-primary uppercase tracking-wider block mb-0.5">Bảo dưỡng tịnh chay:</span>
                  <span className="text-brand-secondary/90">{product.care}</span>
                </div>
              </div>

              {/* Size Selectors */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary/80">Kích cỡ đại lượng:</span>
                  <button 
                    onClick={() => onAskAIAboutProduct(product)}
                    className="flex items-center gap-1 text-[11px] text-brand-primary font-bold hover:underline"
                  >
                    <Sparkles size={11} className="text-amber-700" /> Hướng dẫn chọn size từ AI
                  </button>
                </div>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-10 h-10 text-xs font-semibold tracking-widest transition-all cursor-pointer border flex items-center justify-center rounded-sm ${
                        selectedSize === size
                          ? "bg-brand-primary text-brand-bg border-brand-primary font-bold shadow-sm"
                          : "bg-transparent text-brand-secondary border-brand-stone/30 hover:border-brand-primary hover:text-brand-primary text-brand-secondary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {/* Direct text helper showing selected body advice context */}
                <p className="text-[10px] text-brand-stone mt-2 italic leading-relaxed">
                  {selectedSize === "S" && "* Size S: Phù hợp dưới 48kg (Chiều cao ~ 1m50 - 1m58)."}
                  {selectedSize === "M" && "* Size M: Phù hợp đạo hữu 48kg - 55kg (Chiều cao ~ 1m56 - 1m64)."}
                  {selectedSize === "L" && "* Size L: Phù hợp cư sĩ 56kg - 63kg (Chiều cao ~ 1m62 - 1m70)."}
                  {selectedSize === "XL" && "* Size XL: Phù hợp cư sĩ trên 64kg tới 78kg."}
                </p>
              </div>

              {/* Quantity counter */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary/80">Số lượng tịnh mua:</span>
                <div className="flex items-center border border-brand-stone/40 rounded-sm overflow-hidden bg-brand-bg shadow-sm">
                  <button
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="w-10 h-9 font-semibold text-brand-secondary hover:text-brand-primary hover:bg-brand-sand/20 active:scale-95 transition-all outline-none"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-brand-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-9 font-semibold text-brand-secondary hover:text-brand-primary hover:bg-brand-sand/20 active:scale-95 transition-all outline-none"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Direct Actions block */}
            <div className="flex flex-col gap-2.5 mt-4">
              <button
                onClick={handleAddToCartClick}
                className={`w-full py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-md rounded-sm flex items-center justify-center gap-2 ${
                  addedAnimation
                    ? "bg-emerald-800 text-brand-bg scale-98 shadow-sm"
                    : "bg-brand-primary text-brand-bg hover:bg-brand-brown active:scale-98"
                }`}
                id="add-to-cart-action-btn"
              >
                <ShoppingBag size={14} />
                {addedAnimation ? "ĐÃ THÊM GIAO DUYÊN ✔" : "Thêm vào giỏ giao duyên"}
              </button>

              <button
                onClick={() => onAskAIAboutProduct(product)}
                className="w-full py-3 text-xs font-semibold uppercase tracking-widest text-brand-primary border border-brand-primary bg-transparent hover:bg-brand-sand/25 transition-all rounded-sm flex items-center justify-center gap-2"
                id="modal-ai-ask-btn"
              >
                <Sparkles size={14} className="text-amber-800" />
                Hỏi Ý Kiến Trợ Lý AI
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
