import React from 'react';

import { Eye, ShoppingCart } from 'lucide-react';
import { Product } from '../../mockTypes';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onQuickView: (e: React.MouseEvent) => void;
  onAddToCart: (e: React.MouseEvent) => void;
  key?: React.Key;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
}

export default function ProductCard({
  product,
  onClick,
  onQuickView,
  onAddToCart,
}: ProductCardProps) {
  return (
    <div 
      onClick={onClick}
      className="group cursor-pointer flex flex-col gap-4 focus:outline-none"
    >
      {/* Product Image Stage */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-surface-container-low rounded-xs shadow-[0_4px_24px_rgba(68,42,34,0.02)]">
        
        {/* Main image */}
        <img
          alt={product.name}
          src={product.images[0]}
          className="w-full h-full object-cover object-center hover:scale-[1.03] transition-transform duration-700"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80";
          }}
        />

        {/* Badge "Mới" left-top overlay if exists */}
        {product.badge && (
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 text-[11px] font-sans font-bold text-primary bg-white/90 backdrop-blur-md rounded-sm border border-[#d4c3be]/30 uppercase tracking-widest shadow-xs">
              {product.badge}
            </span>
          </div>
        )}

        {/* Glass Quick View/Interact Overlay */}
        <div className="absolute inset-0 bg-white/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-xs">
          <button
            onClick={onQuickView}
            className="px-5 py-2.5 font-sans font-bold text-xs text-primary uppercase tracking-wider border border-primary bg-white/95 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm flex items-center gap-1 cursor-pointer"
          >
            <Eye size={14} className="stroke-[2.5]" />
            Xem Nhanh
          </button>
          
          <button
            onClick={onAddToCart}
            className="p-2.5 border border-primary bg-white/95 hover:bg-primary hover:text-white transition-all duration-300 shadow-sm rounded-sm text-primary cursor-pointer"
            title="Thêm nhanh vào giỏ hàng"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>

      {/* Info details below */}
      <div className="flex flex-col items-center text-center">
        <h3 className="font-serif text-[17px] font-medium text-primary tracking-wide group-hover:text-primary-container transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-center gap-2 mt-1.5 font-sans font-semibold text-xs text-on-surface-variant">
          {product.oldPrice ? (
            <>
              <span className="text-primary">{formatPrice(product.price)}</span>
              <span className="text-on-surface-variant/40">•</span>
              <span className="text-on-surface-variant/50 line-through font-normal">
                {formatPrice(product.oldPrice)}
              </span>
            </>
          ) : (
            <span className="text-primary">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
