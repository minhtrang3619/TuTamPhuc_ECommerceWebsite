import type { Product as ApiProduct } from '@/types'

export interface MockProduct {
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
      self.findIndex((t) => t.name === c.name) === index
  )

  // Map size variants
  const sizes = p.variants
    ?.filter((v: any) => v.name === "Kích cỡ" || v.name === "Size")
    .map((v: any) => v.value) || []
    
  const uniqueSizes = Array.from(new Set(sizes))

  const images = p.images?.map((img: any) => img.url) || []

  return {
    id: p.slug,
    name: p.name,
    price: p.price,
    oldPrice: p.sale_price || undefined,
    category: p.category?.name || "Pháp Phục",
    colors: uniqueColors.length > 0 ? uniqueColors : [{ name: "Nâu đất", hex: "#5D4037" }],
    sizes: uniqueSizes.length > 0 ? uniqueSizes : ["S", "M", "L", "XL"],
    images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80"],
    description: p.description || "",
    quote: p.short_description || "",
    details: {
      material: p.tags?.includes("linen") ? "Linen tự nhiên 100%" : p.tags?.includes("lua") ? "Lụa cao cấp" : "Đũi organic",
      craftsmanship: "Thủ công tinh xảo",
      details_desc: p.description || ""
    }
  }
}
