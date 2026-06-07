/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface FilterState {
  categories: string[];
  colors: string[];
  sizes: string[];
}

interface SidebarFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function SidebarFilters({ filters, setFilters }: SidebarFiltersProps) {
  const categoriesList = [
    { id: "Đồ lam nam", label: "Đồ lam nam" },
    { id: "Đồ lam nữ", label: "Đồ lam nữ" },
    { id: "Bộ cư sĩ", label: "Bộ cư sĩ" },
    { id: "Áo tràng", label: "Áo tràng" },
  ];

  const colorsList = [
    { name: "Nâu nhạt", hex: "#EADDD7", label: "Nâu nhạt" },
    { name: "Nâu đất", hex: "#5D4037", label: "Nâu đất" },
    { name: "Trắng ngà", hex: "#F5F5F5", label: "Trắng ngà" },
    { name: "Xanh rêu", hex: "#8D9B91", label: "Xanh rêu" },
  ];

  const sizesList = ["S", "M", "L", "XL"];

  const handleCategoryChange = (catId: string) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(catId);
      const updatedCats = exists
        ? prev.categories.filter((c) => c !== catId)
        : [...prev.categories, catId];
      return { ...prev, categories: updatedCats };
    });
  };

  const handleColorToggle = (colorName: string) => {
    setFilters((prev) => {
      const exists = prev.colors.includes(colorName);
      const updatedColors = exists
        ? prev.colors.filter((c) => c !== colorName)
        : [...prev.colors, colorName];
      return { ...prev, colors: updatedColors };
    });
  };

  const handleSizeToggle = (size: string) => {
    setFilters((prev) => {
      const exists = prev.sizes.includes(size);
      const updatedSizes = exists
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size];
      return { ...prev, sizes: updatedSizes };
    });
  };

  const handleResetFilters = () => {
    setFilters({
      categories: [],
      colors: [],
      sizes: [],
    });
  };

  const isFiltered = filters.categories.length > 0 || filters.colors.length > 0 || filters.sizes.length > 0;

  return (
    <aside className="w-full lg:w-1/4 flex flex-col gap-6 lg:pr-6" id="filter-sidebar">
      {/* Search status & Reset filters banner */}
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
          Bộ lọc tìm kiếm
        </h2>
        {isFiltered && (
          <button
            onClick={handleResetFilters}
            className="text-xs text-brand-primary hover:underline cursor-pointer transition-all"
            id="reset-filters"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Categories group */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-primary/80">
          Danh mục
        </h3>
        <ul className="flex flex-col gap-2.5 text-sm text-brand-secondary">
          {categoriesList.map((cat) => (
            <li key={cat.id} className="flex items-center">
              <label className="flex items-center gap-3 cursor-pointer select-none transition-colors hover:text-brand-primary">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat.id)}
                  onChange={() => handleCategoryChange(cat.id)}
                  className="w-4 h-4 text-brand-primary border-brand-stone focus:ring-brand-primary cursor-pointer rounded-sm"
                />
                <span className={filters.categories.includes(cat.id) ? "text-brand-primary font-medium" : ""}>
                  {cat.label}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full h-px bg-brand-sand/60"></div>

      {/* Colors group */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-primary/80">
          Màu sắc tâm cảnh
        </h3>
        <div className="flex flex-wrap gap-4">
          {colorsList.map((color) => {
            const isSelected = filters.colors.includes(color.name);
            return (
              <button
                key={color.name}
                onClick={() => handleColorToggle(color.name)}
                className={`w-7 h-7 rounded-full border-2 transition-all relative group flex items-center justify-center ${
                  isSelected 
                    ? "border-brand-primary ring-2 ring-brand-sand/50 scale-105" 
                    : "border-brand-stone/30 hover:border-brand-primary hover:scale-105"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
                id={`color-${color.name}`}
              >
                {/* Visual tooltip */}
                <span className="absolute bottom-full mb-1.5 hidden group-hover:block bg-brand-primary text-brand-bg text-[10px] px-2 py-0.5 rounded-sm shadow-sm whitespace-nowrap tracking-wider">
                  {color.label}
                </span>
                
                {/* Tick indicator */}
                {isSelected && (
                  <span className={`text-[10px] font-bold ${
                    color.name === "Trắng ngà" || color.name === "Nâu nhạt" ? "text-brand-primary" : "text-brand-bg"
                  }`}>
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-brand-sand/60"></div>

      {/* Sizes group */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-primary/80">
          Kích thước oai nghi
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {sizesList.map((size) => {
            const isSelected = filters.sizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`w-10 h-9 text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer border flex items-center justify-center rounded-sm ${
                  isSelected
                    ? "bg-brand-primary text-brand-bg border-brand-primary font-bold"
                    : "bg-transparent text-brand-secondary border-brand-stone hover:border-brand-primary hover:text-brand-primary"
                }`}
                id={`size-btn-${size}`}
              >
                {size}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-brand-secondary/70 italic mt-1 leading-relaxed">
          * Đồ lam hành lễ khuyên mặc rộng rãi để hít thở nhẹ lòng, gập chân ngồi thiền không bít khí.
        </p>
      </div>
    </aside>
  );
}
