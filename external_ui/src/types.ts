/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  category: "Đồ lam nam" | "Đồ lam nữ" | "Bộ cư sĩ" | "Áo tràng";
  color: "Nâu nhạt" | "Nâu đất" | "Trắng ngà" | "Xanh rêu";
  colorHex: string;
  sizes: ("S" | "M" | "L" | "XL")[];
  image: string;
  tag?: string;
  description: string;
  fabric: string; // e.g. "Linen tự nhiên dệt tay", "Vải đũi xước tơ thô"
  meaning: string; // The Zen meaning of the shirt
  care: string; // Handling instructions
}

export interface CartItem {
  product: Product;
  selectedSize: "S" | "M" | "L" | "XL";
  selectedColor: string;
  quantity: number;
}

export interface BlogItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
}

export interface ChatMessage {
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
}
