import type { Product as ApiProduct } from '@/types'

export const getImageUrl = (url: string) => {
  if (!url) return 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoN-bFmYs_4Pou635qnLS4buY4mQKx8avkQwiBnjE0MwTqvdyiwKCu6jUyLwtVA_ZfrjDhH8OeUggZ53HFGmyQisSBYlPfS5NGXuRVO_pIn8t3RlN6Uohv0j9XqwHEQdLaDArg7CzxVTcwpCAV-iOUO236FuvB4u5dI7nU6RbBNWaym5M8ECoLYQL1lCAaKStoNOhRzzEkYgEpOKTSJVFf6RqrwsdARQn6Iq0LJcKA4UevZyqHJmymu2vADk4NZzFUzTw7Rt-lfTNp'
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
    return url
  }
  const BASE_URL = import.meta.env.VITE_API_URL || ''
  return `${BASE_URL.replace(/\/$/, '')}/${url.replace(/^\//, '')}`
}

export interface MockProduct {
  dbId?: number
  id: string
  name: string
  price: number
  oldPrice?: number
  category: string
  badge?: string
  colors: { name: string; hex: string }[]
  sizes: string[]
  images: string[]
  description: string
  videoUrl?: string
  quote?: string
  details?: {
    material?: string
    craftsmanship?: string
    details_desc?: string
  }
}

export function mapApiProductToMockProduct(p: ApiProduct): MockProduct {
  // Map color variants
  const colors = p.variants
    ?.filter((v: any) => v.name === "Màu")
    .map((v: any) => {
      const parts = v.value.split('|')
      if (parts.length === 2) {
        return { name: parts[0], hex: parts[1] }
      }
      const colorMap: Record<string, string> = {
        "Nâu nhạt": "#EADDD7",
        "Nâu đất": "#5D4037",
        "Trắng ngà": "#F5F5F5",
        "Xanh rêu": "#8D9B91"
      }
      return { name: v.value, hex: colorMap[v.value] || "#5D4037" }
    }) || []
    
  const uniqueColors = colors.filter(
    (c: any, index: number, self: any[]) =>
      self.findIndex((t) => t.name === c.name && t.hex === c.hex) === index
  )

  // Map size variants
  const sizes = p.variants
    ?.filter((v: any) => v.name === "Kích cỡ" || v.name === "Size")
    .map((v: any) => v.value) || []
    
  const uniqueSizes = Array.from(new Set(sizes))

  const images = p.images?.map((img: any) => getImageUrl(img.url)) || []

  return {
    dbId: p.id,
    id: p.slug,
    name: p.name,
    price: p.price,
    oldPrice: p.sale_price || undefined,
    category: p.category?.name || "Pháp Phục",
    colors: uniqueColors.length > 0 ? uniqueColors : [{ name: "Nâu đất", hex: "#5D4037" }],
    sizes: uniqueSizes.length > 0 ? uniqueSizes : ["S", "M", "L", "XL"],
    images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80"],
    description: p.description || "",
    videoUrl: p.video_url ? getImageUrl(p.video_url) : undefined,
    quote: p.short_description || "",
    details: {
      material: p.tags?.includes("linen") ? "Linen tự nhiên 100%" : p.tags?.includes("lua") ? "Lụa cao cấp" : "Đũi organic",
      craftsmanship: "Thủ công tinh xảo",
      details_desc: p.description || ""
    }
  }
}
