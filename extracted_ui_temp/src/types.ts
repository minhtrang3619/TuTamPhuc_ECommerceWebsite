/**
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  images: string[];
  description: string;
  quote?: string;
  badge?: string;
  details?: {
    material: string;
    craftsmanship: string;
    details_desc?: string;
  };
}

export interface CartItem {
  id: string; // combination of productId + colorHex + size
  product: Product;
  color: { name: string; hex: string };
  size: string;
  quantity: number;
}

export interface ActiveFilters {
  search: string;
  categories: string[];
  colors: string[]; // hex values or names
  sizes: string[];
  sortBy: 'latest' | 'price-asc' | 'price-desc';
}

export type Screen = 'catalog' | 'detail' | 'about' | 'blog' | 'collections';

export interface OrderInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  paymentMethod: 'cod' | 'bank_transfer';
}
