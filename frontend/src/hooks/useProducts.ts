import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services'
import type { ProductFilters } from '@/types'

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getAll(filters),
  })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getBySlug(slug),
    enabled: !!slug,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: productService.getFeatured,
  })
}

export function useRelatedProducts(productId: number) {
  return useQuery({
    queryKey: ['products', 'related', productId],
    queryFn: () => productService.getRelated(productId),
    enabled: !!productId,
  })
}
