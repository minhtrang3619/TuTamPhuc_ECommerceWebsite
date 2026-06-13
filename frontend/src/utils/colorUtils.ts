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
  { id: 'trang',    name: 'Trắng / Kem',  hex: '#F5F0E8' },
  { id: 'xam',      name: 'Xám',           hex: '#9E9E9E' },
  { id: 'den',      name: 'Đen / Tối',     hex: '#2C2C2C' },
  { id: 'nau',      name: 'Nâu',           hex: '#795548' },
  { id: 'vang',     name: 'Vàng / Be',     hex: '#C8A84B' },
  { id: 'hong',     name: 'Hồng / Đỏ',    hex: '#C05878' },
  { id: 'xanh-la', name: 'Xanh lá',       hex: '#4CAF50' },
  { id: 'xanh',    name: 'Xanh dương',    hex: '#1976D2' },
  { id: 'tim',      name: 'Tím',           hex: '#7B1FA2' },
];

// Phân loại một giá trị hex vào nhóm màu
export function getColorFamilyId(hex: string): string {
  if (!hex || hex.length < 4) return 'xam';
  const [h, s, l] = hexToHsl(hex);

  // Trắng/Kem: độ sáng rất cao
  if (l > 80) return 'trang';
  // Đen/Tối: độ sáng rất thấp
  if (l < 18) return 'den';
  // Xám: bão hòa thấp
  if (s < 12) return 'xam';

  // Phân loại theo hue
  if (h >= 0   && h < 20)   return 'hong';   // Đỏ/Hồng
  if (h >= 20  && h < 45)   return 'nau';    // Nâu / Cam đất
  if (h >= 45  && h < 80)   return 'vang';   // Vàng / Be
  if (h >= 80  && h < 165)  return 'xanh-la'; // Xanh lá
  if (h >= 165 && h < 265)  return 'xanh';   // Xanh dương / Xanh ngọc
  if (h >= 265 && h < 320)  return 'tim';    // Tím
  if (h >= 320 && h < 345)  return 'hong';   // Hồng
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
