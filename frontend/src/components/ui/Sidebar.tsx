import { Sparkles, Trash2 } from 'lucide-react';
import { CATEGORIES, COLORS } from '../../data';

interface SidebarProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  selectedSizes: string[];
  setSelectedSizes: (sizes: string[]) => void;
  onClearAll: () => void;
}

export default function Sidebar({
  selectedCategories,
  setSelectedCategories,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
  onClearAll,
}: SidebarProps) {
  
  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleColorToggle = (colorHex: string) => {
    if (selectedColors.includes(colorHex)) {
      setSelectedColors(selectedColors.filter((c) => c !== colorHex));
    } else {
      setSelectedColors([...selectedColors, colorHex]);
    }
  };

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      setSelectedSizes(selectedSizes.filter((s) => s !== size));
    } else {
      setSelectedSizes([...selectedSizes, size]);
    }
  };

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0;

  return (
    <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6 font-sans">
      
      {/* Title with Clear Badge */}
      <div className="flex justify-between items-center">
        <h3 className="text-xs uppercase tracking-widest font-bold text-primary flex items-center gap-1.5">
          <Sparkles size={14} /> Danh mục bộ lọc
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-[11px] text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1 font-medium cursor-pointer"
          >
            <Trash2 size={12} /> Xoá lọc
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-[11px] uppercase tracking-widest font-semibold text-primary mb-3">Danh mục</h4>
        <ul className="flex flex-col gap-3 font-medium text-xs text-on-surface-variant">
          {CATEGORIES.map((category) => {
            const isChecked = selectedCategories.includes(category);
            return (
              <li key={category}>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary transition-colors group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryChange(category)}
                    className="form-checkbox text-primary focus:ring-primary border-[#d4c3be] rounded-sm bg-transparent cursor-pointer h-4 w-4 transition-colors"
                  />
                  <span className={`${isChecked ? 'text-primary font-bold' : ''} group-hover:translate-x-0.5 transition-transform duration-200`}>
                    {category}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="w-full h-px bg-[#eeeeee] my-2" />

      {/* Color Swatch Filter */}
      <div>
        <h4 className="text-[11px] uppercase tracking-widest font-semibold text-primary mb-3">Màu sắc</h4>
        <div className="flex flex-wrap gap-3">
          {COLORS.map((color) => {
            const isSelected = selectedColors.includes(color.hex);
            return (
              <button
                key={color.hex}
                onClick={() => handleColorToggle(color.hex)}
                className={`group relative w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                  isSelected ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-[#d4c3be]'
                } hover:border-primary cursor-pointer`}
                title={color.name}
              >
                <span
                  className="w-5.5 h-5.5 rounded-full block border border-[rgba(0,0,0,0.03)]"
                  style={{ backgroundColor: color.hex }}
                />
                
                {/* Popover on hover */}
                <span className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] py-0.5 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-sm font-semibold">
                  {color.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-full h-px bg-[#eeeeee] my-2" />

      {/* Size Swatch Filter */}
      <div>
        <h4 className="text-[11px] uppercase tracking-widest font-semibold text-primary mb-3">Kích thước</h4>
        <div className="flex flex-wrap gap-2">
          {['S', 'M', 'L', 'XL'].map((size) => {
            const isSelected = selectedSizes.includes(size);
            return (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`min-w-10 h-8 font-semibold text-[11px] tracking-wider border rounded-sm transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-[#e2e2e2] text-primary font-bold scale-105 shadow-xs'
                    : 'border-[#d4c3be] text-on-surface-variant hover:border-primary hover:text-primary'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Banner */}
      <div className="mt-8 p-5 bg-[#ece0dc]/30 border border-[#d4c3be]/40 rounded-sm relative overflow-hidden text-xs text-[#5d4037] leading-relaxed">
        <h5 className="font-serif font-bold text-sm text-[#442a22] mb-1">Phong Cách Tối Giản</h5>
        <p className="opacity-80">"Chất liệu sợi tự nhiên thô mộc mang lại cảm giác thoải mái và tự nhiên nhất."</p>
      </div>
    </aside>
  );
}
