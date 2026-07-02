import { Sparkles, Trash2, Check } from 'lucide-react';
import { COLOR_FAMILIES } from '@/utils/colorUtils';

interface SidebarProps {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  selectedColors: string[];
  setSelectedColors: (colors: string[]) => void;
  selectedSizes: string[];
  setSelectedSizes: (sizes: string[]) => void;
  categories?: { name: string; slug: string }[];
  onClearAll: () => void;
}

export default function Sidebar({
  selectedCategories,
  setSelectedCategories,
  selectedColors,
  setSelectedColors,
  selectedSizes,
  setSelectedSizes,
  categories = [],
  onClearAll,
}: SidebarProps) {

  const handleCategoryChange = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleColorToggle = (familyId: string) => {
    if (selectedColors.includes(familyId)) {
      setSelectedColors(selectedColors.filter((c) => c !== familyId));
    } else {
      setSelectedColors([...selectedColors, familyId]);
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
          {categories.map((category) => {
            const isChecked = selectedCategories.includes(category.slug);
            return (
              <li key={category.slug}>
                <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary transition-colors group">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryChange(category.slug)}
                    className="form-checkbox text-primary focus:ring-primary border-[#d4c3be] rounded-sm bg-transparent cursor-pointer h-4 w-4 transition-colors"
                  />
                  <span className={`${isChecked ? 'text-primary font-bold' : ''} group-hover:translate-x-0.5 transition-transform duration-200`}>
                    {category.name}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="w-full h-px bg-[#eeeeee] my-2" />

      {/* Color Family Filter */}
      <div>
        <h4 className="text-[11px] uppercase tracking-widest font-semibold text-primary mb-3">Màu sắc</h4>
        <div className="flex flex-wrap gap-3.5">
          {COLOR_FAMILIES.map((family) => {
            const isSelected = selectedColors.includes(family.id);
            return (
              <button
                key={family.id}
                onClick={() => handleColorToggle(family.id)}
                className={`group relative w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? 'border-primary bg-primary/5 scale-110 shadow-sm' 
                    : 'border-[#e0d6d3] hover:border-primary hover:scale-105'
                } cursor-pointer`}
                title={family.name}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center border border-[rgba(0,0,0,0.05)] shadow-inner transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: family.hex }}
                >
                  {isSelected && (
                    <Check 
                      size={12} 
                      strokeWidth={3} 
                      className={['trang', 'vang'].includes(family.id) ? 'text-primary' : 'text-white'} 
                    />
                  )}
                </span>
                {/* Tooltip */}
                <span className="absolute bottom-10 left-1/2 -translate-y-1/2 bg-[#5d4037] text-[#fcfaf7] text-[10px] py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-md font-semibold z-10">
                  {family.name}
                </span>
              </button>
            );
          })}
        </div>
        {selectedColors.length > 0 && (
          <p className="mt-2 text-[10px] text-on-surface-variant/60 font-medium">
            Đang lọc: {selectedColors.map(id => COLOR_FAMILIES.find(f => f.id === id)?.name).filter(Boolean).join(', ')}
          </p>
        )}
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
