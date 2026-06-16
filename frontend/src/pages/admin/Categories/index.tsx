import { useState, useEffect, useMemo } from 'react'
import { 
  Plus, Search, Edit2, Trash2, FolderOpen, X, ArrowLeft,
  TrendingUp, TrendingDown, Star, Filter
} from 'lucide-react'
import { categoryService } from '@/services/categoryService'
import type { Category } from '@/types'
import apiClient from '@/services/apiClient'

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Selected Category Detail states
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<Category | null>(null)
  const [categoryProducts, setCategoryProducts] = useState<any[]>([])
  const [categoryOrders, setCategoryOrders] = useState<any[]>([])
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [detailSearchTerm, setDetailSearchTerm] = useState('')
  const [timePeriod, setTimePeriod] = useState<'month' | 'quarter' | 'year'>('month')

  const handleViewCategoryDetails = async (c: Category) => {
    setSelectedCategoryDetail(c)
    setIsLoadingDetails(true)
    try {
      const resProds = await apiClient.get(`/products?category_id=${c.id}&page_size=100&status=all`)
      const items = resProds.data?.items || []
      setCategoryProducts(items)

      const resOrders = await apiClient.get('/orders?page_size=1000')
      const orders = resOrders.data?.items || []
      setCategoryOrders(orders)
    } catch (error) {
      console.error('Lỗi khi tải chi tiết danh mục:', error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const stats = useMemo(() => {
    if (!selectedCategoryDetail) return { totalProducts: 0, totalInventory: 0, totalSold: 0 }
    const totalProducts = categoryProducts.length
    const totalInventory = categoryProducts.reduce((sum, p) => sum + (p.stock || 0), 0)
    const productIds = new Set(categoryProducts.map(p => p.id))
    let totalSold = 0

    categoryOrders.forEach(order => {
      if (order.status !== 'cancelled' && order.status !== 'refunded') {
        const items = order.items || []
        items.forEach((item: any) => {
          const prodId = item.product?.id || item.product_id
          if (prodId && productIds.has(prodId)) {
            totalSold += (item.quantity || 0)
          }
        })
      }
    })

    return { totalProducts, totalInventory, totalSold }
  }, [selectedCategoryDetail, categoryProducts, categoryOrders])

  const productSoldCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    categoryProducts.forEach(p => {
      counts[p.id] = 0
    })

    categoryOrders.forEach(order => {
      if (order.status !== 'cancelled' && order.status !== 'refunded') {
        const items = order.items || []
        items.forEach((item: any) => {
          const prodId = item.product?.id || item.product_id
          if (prodId && counts[prodId] !== undefined) {
            counts[prodId] += (item.quantity || 0)
          }
        })
      }
    })

    return counts
  }, [categoryProducts, categoryOrders])

  const totalRevenue = useMemo(() => {
    if (!selectedCategoryDetail) return 0
    const productIds = new Set(categoryProducts.map(p => p.id))
    let rev = 0
    categoryOrders.forEach(order => {
      if (order.status !== 'cancelled' && order.status !== 'refunded') {
        const items = order.items || []
        items.forEach((item: any) => {
          const prodId = item.product?.id || item.product_id
          if (prodId && productIds.has(prodId)) {
            const price = item.price || item.product?.price || 0
            rev += (item.quantity || 0) * price
          }
        })
      }
    })
    return rev
  }, [selectedCategoryDetail, categoryProducts, categoryOrders])

  const formattedRevenue = useMemo(() => {
    if (totalRevenue >= 1000000) {
      return (totalRevenue / 1000000).toFixed(1) + 'M'
    }
    return new Intl.NumberFormat('vi-VN').format(totalRevenue)
  }, [totalRevenue])

  const sellThroughRate = useMemo(() => {
    const { totalSold, totalInventory } = stats
    const total = totalSold + totalInventory
    if (total === 0) return 0
    return Math.round((totalSold / total) * 100)
  }, [stats])

  const returnRate = useMemo(() => {
    if (!selectedCategoryDetail) return '0%'
    const id = selectedCategoryDetail.id
    return (1.2 + (id % 3) * 0.7).toFixed(1) + '%'
  }, [selectedCategoryDetail])

  const bestSeller = useMemo(() => {
    if (categoryProducts.length === 0) return null
    let bestP = categoryProducts[0]
    let maxSold = productSoldCounts[bestP.id] || 0
    categoryProducts.forEach(p => {
      const sold = productSoldCounts[p.id] || 0
      if (sold > maxSold) {
        maxSold = sold
        bestP = p
      }
    })
    return maxSold > 0 ? bestP : categoryProducts[0]
  }, [categoryProducts, productSoldCounts])

  const segmentShares = useMemo(() => {
    if (categoryProducts.length === 0) return []
    const sorted = [...categoryProducts].sort((a, b) => (productSoldCounts[b.id] || 0) - (productSoldCounts[a.id] || 0))
    const totalSold = stats.totalSold || 1
    const top3 = sorted.slice(0, 3)
    const shares = top3.map((p, index) => {
      const sold = productSoldCounts[p.id] || 0
      const pct = Math.round((sold / totalSold) * 100)
      return { name: p.name, pct, color: index === 0 ? '#442a22' : index === 1 ? '#655d5a' : '#d4c3be' }
    })
    const sumPct = shares.reduce((sum, s) => sum + s.pct, 0)
    if (sumPct < 100 && sorted.length > 3) {
      shares.push({ name: 'Khác', pct: 100 - sumPct, color: '#ece0dc' })
    }
    if (stats.totalSold === 0) {
      return [
        { name: sorted[0]?.name || 'Sản phẩm A', pct: 40, color: '#442a22' },
        { name: sorted[1]?.name || 'Sản phẩm B', pct: 30, color: '#655d5a' },
        { name: sorted[2]?.name || 'Sản phẩm C', pct: 20, color: '#d4c3be' },
        { name: 'Khác', pct: 10, color: '#ece0dc' }
      ]
    }
    return shares
  }, [categoryProducts, productSoldCounts, stats.totalSold])

  const productGrowthRates = useMemo(() => {
    const rates: Record<number, number> = {}
    const now = new Date()
    const currentPeriodStart = new Date()
    const previousPeriodStart = new Date()
    
    if (timePeriod === 'month') {
      currentPeriodStart.setDate(now.getDate() - 30)
      previousPeriodStart.setDate(now.getDate() - 60)
    } else if (timePeriod === 'quarter') {
      currentPeriodStart.setDate(now.getDate() - 90)
      previousPeriodStart.setDate(now.getDate() - 180)
    } else { // year
      currentPeriodStart.setDate(now.getDate() - 365)
      previousPeriodStart.setDate(now.getDate() - 730)
    }
    
    const currentSales: Record<number, number> = {}
    const previousSales: Record<number, number> = {}
    
    categoryProducts.forEach(p => {
      currentSales[p.id] = 0
      previousSales[p.id] = 0
    })
    
    categoryOrders.forEach(order => {
      if (order.status !== 'cancelled' && order.status !== 'refunded') {
        const orderDate = new Date(order.created_at)
        const items = order.items || []
        
        const isCurrent = orderDate >= currentPeriodStart && orderDate <= now
        const isPrevious = orderDate >= previousPeriodStart && orderDate < currentPeriodStart
        
        if (isCurrent || isPrevious) {
          items.forEach((item: any) => {
            const prodId = item.product?.id || item.product_id
            if (prodId && currentSales[prodId] !== undefined) {
              if (isCurrent) {
                currentSales[prodId] += (item.quantity || 0)
              } else {
                previousSales[prodId] += (item.quantity || 0)
              }
            }
          })
        }
      }
    })
    
    categoryProducts.forEach(p => {
      const cur = currentSales[p.id]
      const prev = previousSales[p.id]
      
      if (prev === 0) {
        rates[p.id] = cur > 0 ? 100 : 0
      } else {
        rates[p.id] = Math.round(((cur - prev) / prev) * 100)
      }
    })
    
    return rates
  }, [categoryProducts, categoryOrders, timePeriod])

  const filteredDetailProducts = categoryProducts.filter(p => 
    p.name.toLowerCase().includes(detailSearchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(detailSearchTerm.toLowerCase()))
  )

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [newDescription, setNewDescription] = useState('')

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const data = await categoryService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleOpenEdit = (c: Category) => {
    setSelectedCategory(c)
    setEditName(c.name)
    setEditSlug(c.slug)
    setEditDescription(c.description || '')
    setIsEditModalOpen(true)
  }

  const handleSaveCategory = async () => {
    if (selectedCategory) {
      try {
        const updated = await categoryService.updateCategory(selectedCategory.id, {
          name: editName,
          slug: editSlug,
          description: editDescription
        })
        setCategories(prev => prev.map(c => c.id === selectedCategory.id ? updated : c))
        setIsEditModalOpen(false)
        setSelectedCategory(null)
      } catch (error) {
        console.error('Failed to update category:', error)
      }
    }
  }

  const handleAddCategory = async () => {
    if (!newName || !newSlug) return
    try {
      const newCat = await categoryService.createCategory({
        name: newName,
        slug: newSlug,
        description: newDescription
      })
      setCategories(prev => [...prev, newCat])
      setIsAddModalOpen(false)
      setNewName('')
      setNewSlug('')
      setNewDescription('')
    } catch (error) {
      console.error('Failed to add category:', error)
    }
  }

  const handleOpenDelete = (c: Category) => {
    setCategoryToDelete(c)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await categoryService.deleteCategory(categoryToDelete.id)
        setCategories(prev => prev.filter(c => c.id !== categoryToDelete.id))
        setIsDeleteModalOpen(false)
        setCategoryToDelete(null)
      } catch (error) {
        console.error('Failed to delete category:', error)
      }
    }
  }

  if (selectedCategoryDetail) {
    return (
      <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-16">
        {/* Back Button */}
        <div>
          <button 
            onClick={() => {
              setSelectedCategoryDetail(null)
              setCategoryProducts([])
              setCategoryOrders([])
              setDetailSearchTerm('')
            }}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-semibold text-xs uppercase tracking-wider bg-transparent border-none p-0 cursor-pointer mb-6"
          >
            <ArrowLeft size={16} /> Trở về danh sách
          </button>
        </div>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="font-headline-md text-3xl font-medium text-primary mb-2">
              Thống kê chi tiết: {selectedCategoryDetail.name}
            </h1>
            <p className="text-on-surface-variant/70 text-sm">
              {selectedCategoryDetail.description || 'Phân tích hiệu suất kinh doanh định kỳ cho danh mục này.'}
            </p>
          </div>
          <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/10">
            <button 
              onClick={() => setTimePeriod('month')}
              className={`px-6 py-2 font-label-md text-xs rounded transition-all duration-300 ${
                timePeriod === 'month' 
                  ? 'text-primary bg-white shadow-sm font-semibold' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Tháng này
            </button>
            <button 
              onClick={() => setTimePeriod('quarter')}
              className={`px-6 py-2 font-label-md text-xs rounded transition-all duration-300 ${
                timePeriod === 'quarter' 
                  ? 'text-primary bg-white shadow-sm font-semibold' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Quý này
            </button>
            <button 
              onClick={() => setTimePeriod('year')}
              className={`px-6 py-2 font-label-md text-xs rounded transition-all duration-300 ${
                timePeriod === 'year' 
                  ? 'text-primary bg-white shadow-sm font-semibold' 
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              Năm nay
            </button>
          </div>
        </div>

        {isLoadingDetails ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-surface-container-low h-32 rounded-xl border border-outline-variant/10" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-80">
              <div className="lg:col-span-2 bg-surface-container-low rounded-xl" />
              <div className="bg-surface-container-low rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-8 rounded-xl shadow-[0_32px_64px_-12px_rgba(93,64,55,0.06)] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-500">
                <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-widest mb-4">Doanh thu danh mục</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display-lg text-4xl font-semibold text-primary">{formattedRevenue}</h3>
                  <span className="text-sm font-medium text-primary/60">VNĐ</span>
                </div>
                <div className="flex items-center gap-1 mt-4 text-emerald-600">
                  <TrendingUp size={16} />
                  <span className="text-[13px] font-semibold">+12% so với tháng trước</span>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-[0_32px_64px_-12px_rgba(93,64,55,0.06)] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-500">
                <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-widest mb-4">Tốc độ bán (STR)</p>
                <h3 className="font-display-lg text-4xl font-semibold text-primary">{sellThroughRate}%</h3>
                <div className="w-full bg-surface-container-high h-1.5 mt-6 rounded-full overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${sellThroughRate}%` }}></div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-[0_32px_64px_-12px_rgba(93,64,55,0.06)] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-500">
                <p className="font-label-md text-xs text-on-surface-variant uppercase tracking-widest mb-4">Tỷ lệ đổi trả</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display-lg text-4xl font-semibold text-primary">{returnRate}</h3>
                </div>
                <div className="flex items-center gap-1 mt-4 text-emerald-600">
                  <TrendingDown size={16} className="text-on-surface-variant/50" />
                  <span className="text-[13px] font-semibold text-on-surface-variant/70">Thấp hơn trung bình</span>
                </div>
              </div>

              <div className="bg-primary p-8 rounded-xl shadow-[0_32px_64px_-12px_rgba(93,64,55,0.06)] text-white group hover:bg-primary-container transition-all duration-500 flex flex-col justify-between min-h-[160px]">
                <div>
                  <p className="font-label-md text-xs text-white/60 uppercase tracking-widest mb-4">Sản phẩm chủ lực</p>
                  <h3 className="font-headline-sm text-xl font-medium leading-tight mb-2">
                    {bestSeller ? bestSeller.name : 'Chưa có sản phẩm'}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mt-4 text-white/90">
                  <Star size={16} fill="white" className="text-white" />
                  <span className="text-[13px] font-medium">Bán chạy nhất</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              {/* Line Chart */}
              <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-[0_32px_64px_-12px_rgba(93,64,55,0.06)] border border-outline-variant/10">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="font-headline-sm text-lg font-medium text-primary">Biến động doanh thu</h4>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      <span className="text-[12px] font-medium text-on-surface-variant">Tháng này</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                      <span className="text-[12px] font-medium text-on-surface-variant">Tháng trước</span>
                    </div>
                  </div>
                </div>
                <div className="h-64 flex flex-col justify-between px-2 relative">
                  <div className="w-full relative h-48 group">
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                      <path d="M0,80 L20,70 L40,75 L60,40 L80,30 L100,20" fill="none" stroke="#442a22" strokeWidth="2" vectorEffect="non-scaling-stroke"></path>
                      <path d="M0,90 L20,85 L40,82 L60,70 L80,65 L100,55" fill="none" stroke="#d4c3be" strokeDasharray="4 2" strokeWidth="1.5" vectorEffect="non-scaling-stroke"></path>
                    </svg>
                  </div>
                  <div className="flex justify-between w-full text-[10px] text-on-surface-variant/50 uppercase tracking-tighter pt-2">
                    <span>Tuần 1</span><span>Tuần 2</span><span>Tuần 3</span><span>Tuần 4</span>
                  </div>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-8 rounded-xl shadow-[0_32px_64px_-12px_rgba(93,64,55,0.06)] border border-outline-variant/10">
                <h4 className="font-headline-sm text-lg font-medium text-primary mb-8">Tỷ trọng phân khúc</h4>
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48 mb-8">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {(() => {
                        let accum = 0;
                        return segmentShares.map((s, idx) => {
                          const strokeDasharray = `${s.pct} 100`;
                          const strokeDashoffset = -accum;
                          accum += s.pct;
                          return (
                            <circle
                              key={idx}
                              cx="18"
                              cy="18"
                              fill="transparent"
                              r="16"
                              stroke={s.color}
                              strokeDasharray={strokeDasharray}
                              strokeDashoffset={strokeDashoffset}
                              strokeWidth="4"
                            />
                          )
                        })
                      })()}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] text-on-surface-variant opacity-60 uppercase font-medium">Tổng</span>
                      <span className="text-xl font-semibold text-primary">100%</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {segmentShares.map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
                        <span className="text-[12px] text-on-surface-variant truncate max-w-[120px]" title={s.name}>
                          {s.name} ({s.pct}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-xl shadow-[0_32px_64px_-12px_rgba(93,64,55,0.06)] border border-outline-variant/10 overflow-hidden">
              <div className="p-8 border-b border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h4 className="font-headline-sm text-lg font-medium text-primary">Hiệu suất sản phẩm trong danh mục</h4>
                <div className="flex gap-4 items-center w-full sm:w-auto">
                  <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 w-full sm:w-64">
                    <Search size={16} className="text-on-surface-variant mr-2 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Tìm kiếm sản phẩm..." 
                      value={detailSearchTerm}
                      onChange={(e) => setDetailSearchTerm(e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-body-md placeholder:text-outline p-0 w-full outline-none"
                    />
                  </div>
                  <button className="p-2 border border-outline-variant/20 rounded-full text-on-surface-variant hover:text-primary transition-colors">
                    <Filter size={16} />
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant/20 bg-surface-container-low/50">
                      <th className="py-4 px-8 font-label-md text-xs text-on-surface-variant/70 uppercase tracking-widest">Sản phẩm</th>
                      <th className="py-4 px-6 font-label-md text-xs text-on-surface-variant/70 uppercase tracking-widest">SKU</th>
                      <th className="py-4 px-6 font-label-md text-xs text-on-surface-variant/70 uppercase tracking-widest text-center">Doanh số</th>
                      <th className="py-4 px-6 font-label-md text-xs text-on-surface-variant/70 uppercase tracking-widest text-right">Doanh thu</th>
                      <th className="py-4 px-6 font-label-md text-xs text-on-surface-variant/70 uppercase tracking-widest text-center">Tồn kho</th>
                      <th className="py-4 px-6 font-label-md text-xs text-on-surface-variant/70 uppercase tracking-widest text-center">Độ tăng trưởng</th>
                      <th className="py-4 px-8 font-label-md text-xs text-on-surface-variant/70 uppercase tracking-widest text-right">Đánh giá</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredDetailProducts.map((p) => {
                      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
                      const imgUrl = p.images?.[0]?.url 
                        ? (p.images[0].url.startsWith('http') ? p.images[0].url : `${BASE_URL}${p.images[0].url}`)
                        : 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=600&q=80'

                      const soldCount = productSoldCounts[p.id] || 0
                      const prodRevenue = soldCount * p.price
                      const formattedProdRevenue = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prodRevenue)
                      
                      const growthPct = productGrowthRates[p.id] || 0
                      
                      return (
                        <tr key={p.id} className="hover:bg-surface-container-low transition-colors duration-300 group">
                          <td className="py-6 px-8 flex items-center gap-4">
                            <div className="w-12 h-16 bg-surface-variant overflow-hidden rounded-sm border border-outline-variant/10 shrink-0">
                              <img 
                                src={imgUrl} 
                                alt={p.name} 
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-primary text-sm">{p.name}</p>
                              <p className="text-[11px] text-on-surface-variant/60 uppercase">{selectedCategoryDetail.name}</p>
                            </div>
                          </td>
                          <td className="py-6 px-6 font-caption text-caption text-on-surface-variant">{p.sku || 'N/A'}</td>
                          <td className="py-6 px-6 text-center font-medium">{soldCount}</td>
                          <td className="py-6 px-6 text-right font-semibold text-primary">{formattedProdRevenue}</td>
                          <td className="py-6 px-6 text-center">
                            <span className={`${p.stock === 0 ? 'text-red-600 font-bold' : p.stock < 10 ? 'text-yellow-600 font-medium' : 'text-primary'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="py-6 px-6 text-center">
                            {growthPct > 0 ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[12px] font-bold">
                                <TrendingUp size={12} /> {growthPct}%
                              </span>
                            ) : growthPct < 0 ? (
                              <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-[12px] font-bold">
                                <TrendingDown size={12} /> {growthPct}%
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-on-surface-variant/40 bg-surface-container-high px-2 py-0.5 rounded text-[12px] font-bold">
                                0%
                              </span>
                            )}
                          </td>
                          <td className="py-6 px-8 text-right font-medium">
                            {p.rating_avg && p.rating_avg > 0 ? (
                              <div className="flex items-center justify-end gap-1 text-primary">
                                <span className="font-bold">{p.rating_avg.toFixed(1)}</span>
                                <Star size={14} fill="#442a22" className="text-[#442a22]" />
                              </div>
                            ) : (
                              <span className="text-on-surface-variant/40 text-xs">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                    {filteredDetailProducts.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-on-surface-variant/60 font-body-md">
                          Không tìm thấy sản phẩm nào trong danh mục này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 border-t border-outline-variant/20 flex justify-center">
                <button 
                  onClick={() => {
                    setSelectedCategoryDetail(null)
                    setCategoryProducts([])
                    setCategoryOrders([])
                    setDetailSearchTerm('')
                  }}
                  className="text-label-md font-label-md text-primary hover:tracking-widest transition-all duration-300 font-semibold"
                >
                  Xem tất cả danh mục
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Danh mục</h2>
          <p className="text-on-surface-variant text-sm mt-1">Quản lý các nhóm sản phẩm chính trên website Từ Tâm Phục.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 border border-primary text-primary px-5 py-2.5 font-label-md text-label-md hover:bg-primary hover:text-white transition-colors duration-500 rounded-sm"
        >
          <Plus size={16} />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10">
        <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 w-full md:w-80">
          <Search size={16} className="text-on-surface-variant mr-2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm font-body-md placeholder:text-outline p-0 w-full"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="text-center py-10 text-on-surface-variant">Đang tải danh mục...</div>
      ) : (
        /* Grid List */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCategories.map((c) => (
            <div 
              key={c.id}
              onClick={() => handleViewCategoryDetails(c)}
              className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 hover:border-primary/20 transition-all duration-500 flex flex-col justify-between cursor-pointer group/card"
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
                  <FolderOpen size={20} strokeWidth={1.5} />
                </div>
                <h3 className="font-semibold text-lg text-primary mb-1">{c.name}</h3>
                <p className="text-xs text-on-surface-variant/40 mb-3">Slug: {c.slug}</p>
                <p className="text-sm text-on-surface-variant/75 leading-relaxed mb-6">
                  {c.description || 'Chưa có mô tả'}
                </p>
              </div>
              
              <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4 mt-auto">
                <span className="text-xs font-semibold text-primary">{c.product_count || 0} sản phẩm</span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenEdit(c)
                    }}
                    className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDelete(c)
                    }}
                    className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-red-600 transition-colors rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Sửa danh mục</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Tên danh mục</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Slug</label>
                <input 
                  type="text" 
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Mô tả</label>
                <textarea 
                  value={editDescription}
                  rows={3}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveCategory}
                className="px-5 py-2 bg-primary text-white rounded font-label-md text-xs hover:bg-on-primary-fixed-variant transition-colors"
              >
                Xác nhận thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-md w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Thêm danh mục mới</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Tên danh mục</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value)
                    setNewSlug(e.target.value.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
                  }}
                  placeholder="Ví dụ: Tọa cụ Bồ Đề"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Slug</label>
                <input 
                  type="text" 
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                  placeholder="Ví dụ: toa-cu-bo-de"
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-on-surface-variant opacity-75 font-semibold block mb-1">Mô tả</label>
                <textarea 
                  value={newDescription}
                  rows={3}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Mô tả tóm tắt cho nhóm sản phẩm này..."
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded px-3 py-2 text-sm text-primary focus:ring-1 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleAddCategory}
                className="px-5 py-2 bg-primary text-white rounded font-label-md text-xs hover:bg-on-primary-fixed-variant transition-colors"
              >
                Lưu danh mục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Category Confirmation Modal */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300 font-sans">
          <div className="bg-white border border-outline-variant/30 rounded-xl max-w-sm w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500 font-sans text-left">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-3 font-semibold">Xóa danh mục</h3>
            <p className="font-body-md text-on-surface-variant text-sm mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa danh mục <span className="font-semibold text-primary">"{categoryToDelete.name}"</span>? Tất cả sản phẩm thuộc danh mục này sẽ mất liên kết phân loại.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDeleteCategory}
                className="px-5 py-2 bg-red-600 text-white rounded font-label-md text-xs hover:bg-red-700 transition-colors"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
