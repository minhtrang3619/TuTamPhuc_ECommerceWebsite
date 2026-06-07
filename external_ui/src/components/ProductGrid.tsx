/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Product } from "../types";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

export default function ProductGrid({
  products,
  onProductClick,
  currentPage,
  setCurrentPage,
}: ProductGridProps) {
  const itemsPerPage = 6;
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;

  // Sync page if out of bounds
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [products, totalPages, currentPage, setCurrentPage]);

  // Slicing products for pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const formatPrice = (num: number) => {
    return num.toLocaleString("vi-VN") + " ₫";
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex-1 flex flex-col gap-12" id="products-content-area">
      {/* Empty catalog alert */}
      {currentProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
          <p className="text-sm text-brand-secondary font-serif-elegant italic text-lg">
            "Vạn vật tựa hư không, chưa tìm thấy tâm phục nào khớp với bộ lọc."
          </p>
          <p className="text-xs text-brand-secondary/80">
            Kính mong đạo hữu thử đổi bộ lọc hoặc từ khóa tìm kiếm khác của Từ Tâm Phục.
          </p>
        </div>
      ) : (
        <>
          {/* Main Grid display mapping filtered results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-16" id="product-grid">
            {currentProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => onProductClick(product)}
                className="group cursor-pointer flex flex-col gap-4 focus:outline-none"
                id={`product-card-${product.id}`}
              >
                {/* Photo Container */}
                <div className="relative w-full aspect-[3/4] overflow-hidden bg-brand-ivory rounded-sm shadow-sm">
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center hover-scale-slow"
                  />
                  
                  {/* Floating Tags */}
                  {product.tag && (
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-brand-primary bg-brand-sand shadow-sm rounded-sm">
                        {product.tag}
                      </span>
                    </div>
                  )}

                  {/* "Xem Nhanh" Overlay Trigger */}
                  <div className="absolute inset-0 bg-brand-dark/25 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <button className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-primary border border-brand-primary bg-brand-bg/95 hover:bg-brand-bg transition-all active:scale-95 shadow-md rounded-sm">
                      <Eye size={13} />
                      Xem Nhanh
                    </button>
                  </div>
                </div>

                {/* Details under image */}
                <div className="flex flex-col items-center text-center">
                  <h3 className="font-serif-elegant text-base text-brand-primary font-medium tracking-wide group-hover:text-brand-brown transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs font-semibold tracking-widest text-brand-secondary/90 mt-1">
                    {formatPrice(product.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Meditative Pagination controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-6 border-t border-brand-sand/50 pt-8" id="pagination">
              {/* Prev button */}
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={`text-xs font-semibold uppercase tracking-widest transition-all flex items-center gap-1.5 focus:outline-none select-none ${
                  currentPage === 1
                    ? "text-brand-secondary/30 cursor-not-allowed"
                    : "text-brand-secondary hover:text-brand-primary cursor-pointer active:scale-95"
                }`}
                id="pagination-prev"
              >
                <ChevronLeft size={14} /> 
                Trở lại
              </button>

              {/* Page direct selectors */}
              <div className="flex items-center gap-5 text-xs font-semibold uppercase tracking-wider">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pb-1 px-1.5 select-none focus:outline-none ${
                      currentPage === page
                        ? "text-brand-primary border-b-2 border-brand-primary font-bold"
                        : "text-brand-secondary/65 hover:text-brand-primary cursor-pointer"
                    }`}
                    id={`page-btn-${page}`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next button */}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`text-xs font-semibold uppercase tracking-widest transition-all flex items-center gap-1.5 focus:outline-none select-none ${
                  currentPage === totalPages
                    ? "text-brand-secondary/30 cursor-not-allowed"
                    : "text-brand-secondary hover:text-brand-primary cursor-pointer active:scale-95"
                }`}
                id="pagination-next"
              >
                Tiếp theo 
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
