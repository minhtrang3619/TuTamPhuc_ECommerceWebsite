// Chuyển hex sang [h(0-360), s(0-100), l(0-100)]
export function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace('#', '').slice(0, 6);
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [h * 360, s * 100, l * 100];
}

export interface ColorFamily {
  id: string;
  name: string;
  hex: string; // màu đại diện hiển thị trong swatch
}

// Các nhóm màu hiển thị trong bộ lọc
export const COLOR_FAMILIES: ColorFamily[] = [
  { id: 'trang',    name: 'Trắng ngà / Kem',  hex: '#FAF9F6' },
  { id: 'xam',      name: 'Xám đá / Slate',    hex: '#A8A29E' },
  { id: 'den',      name: 'Đen charcoal',      hex: '#292524' },
  { id: 'nau',      name: 'Nâu đất / Đất nung', hex: '#5D4037' },
  { id: 'vang',     name: 'Vàng cát / Be',     hex: '#D2B48C' },
  { id: 'hong',     name: 'Hồng sen / Mộc',    hex: '#B88A88' },
  { id: 'xanh-la', name: 'Xanh rêu / Sage',   hex: '#8D9B91' },
  { id: 'xanh',    name: 'Xanh lam / Indigo',  hex: '#4E5E66' },
  { id: 'tim',      name: 'Tím tía / Plum',    hex: '#735F74' },
];

// Phân loại một giá trị hex vào nhóm màu
export function getColorFamilyId(hex: string): string {
  if (!hex || hex.length < 4) return 'xam';
  const [h, s, l] = hexToHsl(hex);

  // 1. Trắng / Kem (Very light colors)
  if (l > 90 && s < 12) return 'trang';
  if (l > 82 && s < 25 && (h > 20 && h < 55)) return 'vang'; // light beige / sand
  if (l > 82 && s < 25 && (h <= 20 || h >= 340)) return 'trang'; // very light pink/cream

  // 2. Đen / Tối (Very dark colors)
  if (l < 18) return 'den';

  // 3. Xám (Very desaturated colors)
  if (s < 8) return 'xam';

  // 4. Phân loại theo Hue
  if (h >= 345 || h < 15) {
    if (l < 45) return 'nau';
    return 'hong'; // Đỏ/Hồng
  }
  if (h >= 15 && h < 35) {
    if (l < 60) return 'nau'; // Nâu
    return 'vang'; // Vàng / Be
  }
  if (h >= 35 && h < 65) {
    return 'vang'; // Vàng / Be
  }
  if (h >= 65 && h < 165) {
    return 'xanh-la'; // Xanh lá / Rêu
  }
  if (h >= 165 && h < 255) {
    return 'xanh'; // Xanh dương / Lam
  }
  if (h >= 255 && h < 345) {
    return 'tim'; // Tím
  }
  return 'nau'; // fallback
}

// Kiểm tra xem một sản phẩm có thuộc nhóm màu được chọn không
export function productMatchesColorFamilies(
  productColors: { hex: string }[],
  selectedFamilyIds: string[]
): boolean {
  if (selectedFamilyIds.length === 0) return true;
  return productColors.some(c => selectedFamilyIds.includes(getColorFamilyId(c.hex)));
}
