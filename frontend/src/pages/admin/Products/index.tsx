import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  ChevronLeft,
  ChevronRight,
  Package,
  Trash2,
  X,
  Info,
  Sparkles,
  Image as ImageIcon,
  Layers,
  Eye,
  Bold,
  Italic,
  List,
  Upload,
  Tag,
  CreditCard,
  PenTool,
  ArrowLeft
} from 'lucide-react'

import AdminCategories from '../Categories'
import apiClient from '@/services/apiClient'

interface ProductItem {
  id: string
  name: string
  sku: string
  category: string
  price: number
  stock: number
  seller: string
  status: string
  image: string
}

export default function AdminProducts() {
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Tất cả bộ sưu tập')
  const [sellerFilter, setSellerFilter] = useState('Tất cả người bán')
  const [statusFilter, setStatusFilter] = useState('Mọi trạng thái')

  const [products, setProducts] = useState<ProductItem[]>([])
  const [dbCategories, setDbCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/products?page_size=100')
      const items = res.data?.items || []
      const mapped = items.map((p: any) => ({
        id: String(p.id),
        name: p.name,
        sku: p.sku || '',
        category: p.category?.name || 'Chưa phân loại',
        price: p.price,
        stock: p.stock,
        seller: 'Từ Tâm Chính',
        status: p.status === 'active' ? 'Đang bán' : 'Đã lưu trữ',
        image: p.images?.[0]?.url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoN-bFmYs_4Pou635qnLS4buY4mQKx8avkQwiBnjE0MwTqvdyiwKCu6jUyLwtVA_ZfrjDhH8OeUggZ53HFGmyQisSBYlPfS5NGXuRVO_pIn8t3RlN6Uohv0j9XqwHEQdLaDArg7CzxVTcwpCAV-iOUO236FuvB4u5dI7nU6RbBNWaym5M8ECoLYQL1lCAaKStoNOhRzzEkYgEpOKTSJVFf6RqrwsdARQn6Iq0LJcKA4UevZyqHJmymu2vADk4NZzFUzTw7Rt-lfTNp'
      }))
      setProducts(mapped)
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories')
      setDbCategories(res.data || [])
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err)
    }
  }

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  // Form Open State (Reuses isAddModalOpen but renders full page)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null)

  // Full product form fields state
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    sku: '',
    category: 'Đồ lam đi chùa',
    description: '',
    material: 'Linen tự nhiên',
    price: 0,
    unit: 'Bộ',
    discountProgram: 'Không có',
    discountValue: 0,
    discountType: '%',
    startDate: '',
    endDate: '',
    image: '',
    galleryImages: [] as string[],
    variants: [
      {
        colorName: 'Nâu Trầm (Earth Brown)',
        colorHex: '#5D4037',
        sizes: { S: 12, M: 25, L: 18, XL: 5 }
      },
      {
        colorName: 'Cát Trắng (Sand Ivory)',
        colorHex: '#D7CCC8',
        sizes: { S: 0, M: 15, L: 10, XL: 2 }
      }
    ]
  })

  // Modal states for Deleting product (Zen UI Modal instead of window.confirm)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ProductItem | null>(null)

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'Tất cả bộ sưu tập' || p.category === categoryFilter
    const matchesSeller = sellerFilter === 'Tất cả người bán' || p.seller === sellerFilter
    const matchesStatus = statusFilter === 'Mọi trạng thái' || 
                         (statusFilter === 'Đang bán' && p.status === 'Đang bán' && p.stock > 0) ||
                         (statusFilter === 'Hết hàng' && p.stock === 0) ||
                         (statusFilter === 'Bản nháp' && p.status === 'Đã lưu trữ')
    return matchesSearch && matchesCategory && matchesSeller && matchesStatus
  })

  const totalStock = filteredProducts.reduce((acc, curr) => acc + curr.stock, 0)

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const handleOpenAdd = () => {
    setSelectedProduct(null)
    setFormData({
      id: '',
      name: '',
      sku: '',
      category: 'Đồ lam đi chùa',
      description: '',
      material: 'Linen tự nhiên',
      price: 0,
      unit: 'Bộ',
      discountProgram: 'Không có',
      discountValue: 0,
      discountType: '%',
      startDate: '',
      endDate: '',
      image: '',
      galleryImages: [],
      variants: [
        {
          colorName: 'Nâu Trầm (Earth Brown)',
          colorHex: '#5D4037',
          sizes: { S: 12, M: 25, L: 18, XL: 5 }
        },
        {
          colorName: 'Cát Trắng (Sand Ivory)',
          colorHex: '#D7CCC8',
          sizes: { S: 0, M: 15, L: 10, XL: 2 }
        }
      ]
    })
    setIsAddModalOpen(true)
  }

  const handleOpenEdit = (p: ProductItem) => {
    setSelectedProduct(p)
    setFormData({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      description: 'Pháp phục mang lại cảm giác an yên từ sớ vải dệt tự nhiên.',
      material: p.category.includes('Lụa') ? 'Lụa tơ tằm Hà Đông' : 'Linen tự nhiên',
      price: p.price,
      unit: 'Bộ',
      discountProgram: 'Không có',
      discountValue: 0,
      discountType: '%',
      startDate: '',
      endDate: '',
      image: p.image,
      galleryImages: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCnG4BEALp5sWYNunjiFY4iSc-Fujq4E1lVF-3x6FYnnEsPx0zSK11SVLSsryTFiWho2mhe32L9cW7XgPPjg9RkmfH5fHhynGmPQx8gMEGR9BzldFMZ444XX15X9AgKky2Xc86SagH-z0LmBuQCdT1LEz6yUYap07_Xh_aXXBmQHTHbW2l-wy65vaJGXOsquNdAzEnxXxugcM__N960gIZWsMQz_6YDlwnZq0M8SXQTrhWiO_xihjkiRiRky9AOgHdxBiF5UkrxQHxX',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCrRKsq3BJlHE_JjY09_6CpeMmhpcJMF9AUwHVDy5peSAmZQ5rHNPSz1XvDQiXTDr6psTpJ3iUM28hiqIZA5Booc6VZHyF7bA5qQvGzK_XyCFhmhOuQ-mHqmhknkz75RpXbJe5sX6j1leWqKMJBYTM4oTZgyWR-aZgpDgoqC5xiamhQibo18_pb9BR_1ZPOG7KG79s5sQIeYiV1jvbUuB05WG0tJG0supZVil67yvH4I0JgUW8AJvjByZyXSU8GR4hLrQ5Jer77-VRX'
      ],
      variants: [
        {
          colorName: 'Nâu Trầm (Earth Brown)',
          colorHex: '#5D4037',
          sizes: { S: Math.floor(p.stock / 2), M: Math.ceil(p.stock / 2), L: 0, XL: 0 }
        }
      ]
    })
    setIsAddModalOpen(true)
  }

  // Variant operations
  const handleAddColorVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          colorName: 'Màu mới',
          colorHex: '#ece0dc',
          sizes: { S: 0, M: 0, L: 0, XL: 0 }
        }
      ]
    }))
  }

  const handleUpdateVariantName = (index: number, name: string) => {
    setFormData(prev => {
      const updated = [...prev.variants]
      updated[index] = { ...updated[index], colorName: name }
      return { ...prev, variants: updated }
    })
  }

  const handleUpdateVariantHex = (index: number, hex: string) => {
    setFormData(prev => {
      const updated = [...prev.variants]
      updated[index] = { ...updated[index], colorHex: hex }
      return { ...prev, variants: updated }
    })
  }

  const handleUpdateVariantSize = (index: number, size: 'S' | 'M' | 'L' | 'XL', quantity: number) => {
    setFormData(prev => {
      const updated = [...prev.variants]
      updated[index] = {
        ...updated[index],
        sizes: {
          ...updated[index].sizes,
          [size]: quantity
        }
      }
      return { ...prev, variants: updated }
    })
  }

  const handleRemoveVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, idx) => idx !== index)
    }))
  }

  // Image upload simulation
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, image: url }))
    }
  }

  const handleGalleryImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const urls: string[] = []
      for (let i = 0; i < files.length; i++) {
        urls.push(URL.createObjectURL(files[i]))
      }
      setFormData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...urls]
      }))
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, idx) => idx !== index)
    }))
  }

  // Save product logic
  const handleSaveProductSubmit = () => {
    if (!formData.name || !formData.sku || formData.price <= 0) {
      alert('Vui lòng điền đầy đủ tên, SKU và giá bán.')
      return
    }

    const totalStockFromVariants = formData.variants.reduce((acc, v) => {
      return acc + (v.sizes.S + v.sizes.M + v.sizes.L + v.sizes.XL)
    }, 0)

    // Find category ID matching formData.category name
    let catId = dbCategories.find(c => c.name.toLowerCase() === formData.category.toLowerCase())?.id
    if (!catId && dbCategories.length > 0) {
      catId = dbCategories[0].id
    }
    if (!catId) {
      catId = 1
    }

    const slug = formData.name.toLowerCase()
      .replace(/ /g, '-')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9-]/g, '')

    const apiVariants: any[] = []
    formData.variants.forEach(v => {
      // Add color variant
      apiVariants.push({
        name: "Màu",
        value: v.colorName,
        additional_price: 0.0,
        stock: v.sizes.S + v.sizes.M + v.sizes.L + v.sizes.XL
      })
      // Add size variants
      if (v.sizes.S > 0) apiVariants.push({ name: "Kích cỡ", value: "S", stock: v.sizes.S })
      if (v.sizes.M > 0) apiVariants.push({ name: "Kích cỡ", value: "M", stock: v.sizes.M })
      if (v.sizes.L > 0) apiVariants.push({ name: "Kích cỡ", value: "L", stock: v.sizes.L })
      if (v.sizes.XL > 0) apiVariants.push({ name: "Kích cỡ", value: "XL", stock: v.sizes.XL })
    })

    const payload = {
      name: formData.name,
      slug: slug,
      description: formData.description,
      short_description: formData.material,
      price: formData.price,
      sku: formData.sku,
      stock: totalStockFromVariants,
      status: 'active',
      category_id: catId,
      tags: [formData.material],
      weight: 350,
      is_featured: false,
      variants: apiVariants
    }

    const saveRequest = formData.id
      ? apiClient.put(`/products/${formData.id}`, payload)
      : apiClient.post('/products', payload)

    saveRequest
      .then(() => {
        setIsAddModalOpen(false)
        setSelectedProduct(null)
        fetchProducts()
      })
      .catch(err => {
        console.error('Lỗi khi lưu sản phẩm:', err)
        alert('Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại.')
      })
  }

  const handleOpenDelete = (p: ProductItem) => {
    setProductToDelete(p)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      apiClient.delete(`/products/${productToDelete.id}`)
        .then(() => {
          setIsDeleteModalOpen(false)
          setProductToDelete(null)
          fetchProducts()
        })
        .catch(err => {
          console.error('Lỗi khi xóa sản phẩm:', err)
          alert('Có lỗi xảy ra khi xóa sản phẩm.')
        })
    }
  }

  // CONDITIONAL RENDER: Form view (Add or Edit Product) styled exactly like code.html
  if (isAddModalOpen) {
    return (
      <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans pb-16">
        {/* Breadcrumb Header */}
        <header className="mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-on-surface-variant/60 mb-2">
              <button onClick={() => setIsAddModalOpen(false)} className="hover:text-primary transition-colors">Quản lý sản phẩm</button>
              <span>/</span>
              <span className="text-primary font-medium">{selectedProduct ? 'Chỉnh sửa' : 'Thêm mới'}</span>
            </div>
            <h2 className="font-headline-md text-3xl text-primary font-semibold mb-2">
              {selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </h2>
            <p className="font-body-md text-on-surface-variant max-w-2xl text-sm leading-relaxed">
              Kiến tạo một sản phẩm mới trong hệ sinh thái Từ Tâm Phục. Hãy chú trọng vào từng chi tiết mô tả và chất liệu để truyền tải tinh thần Thiền.
            </p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(false)}
            className="flex items-center gap-1.5 px-4 py-2 border border-outline-variant rounded-sm hover:bg-surface-container-low transition-colors font-label-md text-xs text-on-surface-variant"
          >
            <ArrowLeft size={14} /> Back to List
          </button>
        </header>

        <form className="grid grid-cols-1 lg:grid-cols-12 gap-6" onSubmit={(e) => e.preventDefault()}>
          {/* Left Column: Form Details */}
          <div className="lg:col-span-8 space-y-6">
            {/* Basic Info Section */}
            <section className="bg-white p-8 rounded-lg shadow-[0_32px_64px_-20px_rgba(68,42,34,0.06)] space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Info className="text-primary/60" size={20} />
                <h3 className="font-headline-sm text-lg text-primary font-semibold">Thông tin cơ bản</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Tên sản phẩm</label>
                  <input 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border-0 border-b border-outline-variant bg-transparent focus:ring-0 focus:border-primary py-2 font-body-md text-sm transition-all" 
                    placeholder="Ví dụ: Áo Tràng Linen Cổ Đứng" 
                    type="text"
                  />
                </div>
                <div>
                  <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Mã SKU</label>
                  <input 
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full border-0 border-b border-outline-variant bg-transparent focus:ring-0 focus:border-primary py-2 font-body-md text-sm transition-all" 
                    placeholder="TTP-001" 
                    type="text"
                  />
                </div>
                <div>
                  <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Danh mục</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full border-0 border-b border-outline-variant bg-transparent focus:ring-0 focus:border-primary py-2 font-body-md text-sm appearance-none cursor-pointer"
                  >
                    {dbCategories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Description & Material */}
            <section className="bg-white p-8 rounded-lg shadow-[0_32px_64px_-20px_rgba(68,42,34,0.06)] space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <PenTool className="text-primary/60" size={20} />
                <h3 className="font-headline-sm text-lg text-primary font-semibold">Mô tả &amp; Chất liệu</h3>
              </div>
              <div>
                <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Mô tả chi tiết</label>
                <div className="border border-outline-variant rounded-lg overflow-hidden">
                  <div className="bg-surface-container-low p-2 border-b border-outline-variant flex gap-2">
                    <button className="p-1 hover:bg-outline-variant/20 rounded transition-colors" type="button"><Bold size={16} /></button>
                    <button className="p-1 hover:bg-outline-variant/20 rounded transition-colors" type="button"><Italic size={16} /></button>
                    <button className="p-1 hover:bg-outline-variant/20 rounded transition-colors" type="button"><List size={16} /></button>
                  </div>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full border-none focus:ring-0 p-4 font-body-md text-sm bg-transparent" 
                    placeholder="Chia sẻ câu chuyện và cảm hứng đằng sau sản phẩm..." 
                    rows={6}
                  />
                </div>
              </div>
              <div>
                <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Chất liệu</label>
                <input 
                  value={formData.material}
                  onChange={(e) => setFormData({...formData, material: e.target.value})}
                  className="w-full border-0 border-b border-outline-variant bg-transparent focus:ring-0 focus:border-primary py-2 font-body-md text-sm transition-all" 
                  placeholder="Linen tự nhiên, Silk tơ tằm, Bamboo..." 
                  type="text"
                />
              </div>
            </section>

            {/* Pricing & Unit */}
            <section className="bg-white p-8 rounded-lg shadow-[0_32px_64px_-20px_rgba(68,42,34,0.06)] space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="text-primary/60" size={20} />
                <h3 className="font-headline-sm text-lg text-primary font-semibold">Giá bán &amp; Đơn vị</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Giá bán lẻ (VNĐ)</label>
                  <input 
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full border-0 border-b border-outline-variant bg-transparent focus:ring-0 focus:border-primary py-2 font-body-md text-sm transition-all" 
                    placeholder="1.250.000" 
                    type="number"
                  />
                </div>
                <div>
                  <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Đơn vị tính</label>
                  <input 
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full border-0 border-b border-outline-variant bg-transparent focus:ring-0 focus:border-primary py-2 font-body-md text-sm transition-all" 
                    placeholder="Bộ / Chiếc" 
                    type="text"
                  />
                </div>
              </div>
            </section>

            {/* Promotion Section */}
            <section className="bg-white p-8 rounded-lg shadow-[0_32px_64px_-20px_rgba(68,42,34,0.06)] space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="text-primary/60" size={20} />
                <h3 className="font-headline-sm text-lg text-primary font-semibold">Khuyến mãi</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <div className="col-span-2">
                  <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Chương trình giảm giá</label>
                  <select 
                    value={formData.discountProgram}
                    onChange={(e) => setFormData({...formData, discountProgram: e.target.value})}
                    className="w-full border-0 border-b border-outline-variant bg-transparent focus:ring-0 focus:border-primary py-2 font-body-md text-sm appearance-none cursor-pointer"
                  >
                    <option value="Không có">Không có</option>
                    <option value="Giảm giá theo mùa">Giảm giá theo mùa</option>
                    <option value="Khuyến mãi khai trương">Khuyến mãi khai trương</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Giá trị giảm</label>
                  <div className="flex items-center gap-2 border-b border-outline-variant">
                    <input 
                      value={formData.discountValue || ''}
                      onChange={(e) => setFormData({...formData, discountValue: Number(e.target.value)})}
                      className="flex-1 border-0 bg-transparent focus:ring-0 py-2 font-body-md text-sm transition-all" 
                      placeholder="0" 
                      type="number"
                    />
                    <select 
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className="border-0 bg-transparent focus:ring-0 py-2 font-label-md text-sm text-primary appearance-none cursor-pointer"
                    >
                      <option>%</option>
                      <option>VNĐ</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-1">
                  <div>
                    <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Ngày bắt đầu</label>
                    <input 
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                      className="w-full border-0 border-b border-outline-variant bg-transparent focus:ring-0 focus:border-primary py-2 font-body-md text-sm transition-all" 
                      type="date"
                    />
                  </div>
                  <div>
                    <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-2 font-medium">Ngày kết thúc</label>
                    <input 
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                      className="w-full border-0 border-b border-outline-variant bg-transparent focus:ring-0 focus:border-primary py-2 font-body-md text-sm transition-all" 
                      type="date"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Variants Section */}
            <section className="bg-white p-8 rounded-lg shadow-[0_32px_64px_-20px_rgba(68,42,34,0.06)] space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Layers className="text-primary/60" size={20} />
                  <h3 className="font-headline-sm text-lg text-primary font-semibold">Phân loại &amp; Biến thể</h3>
                </div>
                <button 
                  onClick={handleAddColorVariant}
                  className="text-primary font-label-md text-sm flex items-center gap-1 hover:opacity-80" 
                  type="button"
                >
                  <Plus size={16} /> Thêm màu sắc
                </button>
              </div>
              <div className="space-y-4">
                {formData.variants.map((v, vIdx) => (
                  <div key={vIdx} className="bg-surface-container-low/40 p-6 rounded-lg border border-outline-variant/30">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border border-outline-variant/50" style={{ backgroundColor: v.colorHex }}></div>
                        <input 
                          value={v.colorName}
                          onChange={(e) => handleUpdateVariantName(vIdx, e.target.value)}
                          className="bg-transparent border-0 border-b border-transparent focus:border-primary focus:ring-0 py-0.5 font-semibold text-sm w-48 text-primary"
                          placeholder="Tên màu sắc"
                        />
                        <input 
                          type="color"
                          value={v.colorHex}
                          onChange={(e) => handleUpdateVariantHex(vIdx, e.target.value)}
                          className="w-6 h-6 rounded-full cursor-pointer border-none bg-transparent"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveVariant(vIdx)}
                        className="text-outline-variant hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {(['S', 'M', 'L', 'XL'] as const).map((size) => (
                        <div key={size} className="text-center">
                          <label className="font-caption text-[10px] text-outline block mb-1">Size {size}</label>
                          <input 
                            className="w-full text-center border border-outline-variant/50 rounded-lg py-1 focus:ring-primary focus:border-primary bg-white text-sm text-primary" 
                            type="number" 
                            value={v.sizes[size]}
                            onChange={(e) => handleUpdateVariantSize(vIdx, size, Number(e.target.value))}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Images & Actions */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Action Panel */}
            <section className="bg-white p-8 rounded-lg shadow-[0_32px_64px_-20px_rgba(68,42,34,0.06)] space-y-4 sticky top-24">
              <button 
                onClick={() => alert('Chế độ xem trước đang được chuẩn bị. Tâm trí bình tĩnh, vạn sự sẽ thành.')}
                className="w-full py-4 px-6 border border-primary text-primary font-label-md text-xs uppercase tracking-wider rounded hover:bg-primary/5 transition-all flex items-center justify-center gap-2" 
                type="button"
              >
                <Eye size={16} /> Xem trước
              </button>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-4 px-4 border border-outline-variant text-on-surface-variant font-label-md text-xs uppercase tracking-wider rounded hover:bg-surface-variant transition-all" 
                  type="button"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={handleSaveProductSubmit}
                  className="py-4 px-4 bg-primary text-on-primary font-label-md text-xs uppercase tracking-wider rounded hover:bg-primary/90 transition-all shadow-md" 
                  type="button"
                >
                  Đăng sản phẩm
                </button>
              </div>
              <div className="pt-6 border-t border-outline-variant/20">
                <h4 className="font-caption text-caption text-primary font-bold mb-4 flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" /> Zen Style Photography
                </h4>
                <ul className="space-y-3 font-caption text-xs text-on-surface-variant">
                  <li className="flex items-start gap-2">
                    <Plus size={12} className="text-primary mt-0.5 shrink-0" />
                    Sử dụng ánh sáng tự nhiên, mềm mại.
                  </li>
                  <li className="flex items-start gap-2">
                    <Plus size={12} className="text-primary mt-0.5 shrink-0" />
                    Phông nền trung tính (Gỗ, Vôi, Vải thô).
                  </li>
                  <li className="flex items-start gap-2">
                    <Plus size={12} className="text-primary mt-0.5 shrink-0" />
                    Chụp cận cảnh chi tiết đường may và sớ vải.
                  </li>
                </ul>
              </div>
            </section>

            {/* Media Upload */}
            <section className="bg-white p-8 rounded-lg shadow-[0_32px_64px_-20px_rgba(68,42,34,0.06)] space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="text-primary/60" size={20} />
                <h3 className="font-headline-sm text-lg text-primary font-semibold">Hình ảnh sản phẩm</h3>
              </div>
              {/* Main Image */}
              <div>
                <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-4 font-medium">Ảnh đại diện</label>
                <div className="relative aspect-[4/5] bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all overflow-hidden group">
                  {formData.image ? (
                    <>
                      <img src={formData.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity">
                        <Upload size={24} className="mb-2" />
                        <span className="text-xs">Thay đổi ảnh chính</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload size={32} className="text-outline-variant mb-2" />
                      <p className="font-caption text-xs text-on-surface-variant font-medium">Tải lên ảnh chính</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              {/* Gallery Images */}
              <div>
                <label className="font-caption text-xs text-outline uppercase tracking-wider block mb-4 font-medium">Ảnh bổ sung</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="aspect-square bg-surface-container-low border-2 border-dashed border-outline-variant/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all relative">
                    <Plus size={20} className="text-outline-variant" />
                    <input 
                      type="file" 
                      accept="image/*"
                      multiple
                      onChange={handleGalleryImagesUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {formData.galleryImages.map((img, imgIdx) => (
                    <div key={imgIdx} className="aspect-square relative rounded-lg overflow-hidden group border border-outline-variant/20">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => handleRemoveGalleryImage(imgIdx)}
                        className="absolute top-2 right-2 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 hover:text-white transition-all text-on-surface"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </aside>
        </form>
      </div>
    )
  }

  // DEFAULT RENDER: List of products table view
  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Tab Navigation */}
      <div className="flex items-center gap-6 border-b border-outline-variant/30 mb-2">
        <button 
          className={`py-3 font-label-md text-sm transition-colors border-b-2 ${activeTab === 'products' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
          onClick={() => setActiveTab('products')}
        >
          Sản phẩm & Kho
        </button>
        <button 
          className={`py-3 font-label-md text-sm transition-colors border-b-2 ${activeTab === 'categories' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-primary'}`}
          onClick={() => setActiveTab('categories')}
        >
          Danh mục
        </button>
      </div>

      {activeTab === 'categories' ? (
        <AdminCategories />
      ) : (
        <div className="space-y-8">
          {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary mb-2">Quản lý sản phẩm</h2>
          <p className="text-body-md text-on-surface-variant max-w-xl text-sm">
            Chăm sóc thánh địa kỹ thuật số của bạn. Quản lý các bộ sưu tập lụa và đay với sự tận tâm và tỉ mỉ.
          </p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="px-8 py-3 border border-primary text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 group rounded-sm shrink-0"
        >
          <Plus size={16} className="transition-transform group-hover:rotate-90" />
          <span className="font-label-md uppercase tracking-wider text-xs">Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center gap-4 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/30 w-full md:w-96 transition-all focus-within:ring-1 focus-within:ring-primary/20">
        <Search size={18} className="text-on-surface-variant opacity-60" />
        <input 
          type="text" 
          placeholder="Tìm kiếm sản phẩm..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none focus:ring-0 w-full font-label-md text-label-md placeholder:text-on-surface-variant/50 p-0"
        />
      </div>

      {/* Bento Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-surface-container-low p-4 rounded-lg flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-tighter text-on-surface-variant opacity-60">Lọc theo danh mục</label>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-primary cursor-pointer w-full"
          >
            <option>Tất cả bộ sưu tập</option>
            {dbCategories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-surface-container-low p-4 rounded-lg flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-tighter text-on-surface-variant opacity-60">Lọc theo người bán</label>
          <select 
            value={sellerFilter}
            onChange={(e) => setSellerFilter(e.target.value)}
            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-primary cursor-pointer w-full"
          >
            <option>Tất cả người bán</option>
            <option>Từ Tâm Chính</option>
            <option>Hiệp hội Lụa Hà Nội</option>
            <option>Nghệ nhân vải đay</option>
          </select>
        </div>

        <div className="bg-surface-container-low p-4 rounded-lg flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-tighter text-on-surface-variant opacity-60">Trạng thái</label>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-primary cursor-pointer w-full"
          >
            <option>Mọi trạng thái</option>
            <option>Đang bán</option>
            <option>Bản nháp</option>
            <option>Hết hàng</option>
          </select>
        </div>

        <div className="bg-primary/5 p-4 rounded-lg flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-tighter text-primary opacity-60">Tổng tồn kho</p>
            <p className="text-xl font-bold text-primary">{totalStock} Đơn vị</p>
          </div>
          <Package className="text-primary/30" size={32} />
        </div>
      </div>

      {/* Zen Data Table */}
      <div className="bg-surface shadow-sm overflow-hidden border border-outline-variant/10 rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Tên sản phẩm</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Danh mục</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Giá</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Kho</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Người bán</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30">Trạng thái</th>
                <th className="px-6 py-4 font-label-md text-on-surface-variant opacity-80 uppercase tracking-widest text-[11px] border-b border-outline-variant/30 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredProducts.map((product) => {
                let stockStatus = 'Trong kho'
                let stockColor = 'text-on-surface-variant opacity-60'
                if (product.stock === 0) {
                  stockStatus = 'Hết hàng'
                  stockColor = 'text-red-500 font-semibold'
                } else if (product.stock < 10) {
                  stockStatus = 'Sắp hết hàng'
                  stockColor = 'text-red-500/80 font-medium'
                }

                return (
                  <tr key={product.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-surface-variant overflow-hidden rounded-sm border border-outline-variant/10 shrink-0">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        </div>
                        <div>
                          <p className="font-headline-sm text-base text-primary group-hover:text-primary transition-colors">{product.name}</p>
                          <p className="text-[11px] text-on-surface-variant">SKU: {product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-body-md text-on-surface-variant text-sm">{product.category}</td>
                    <td className="px-6 py-6 font-body-md font-medium text-primary text-sm">{formatPrice(product.price)}</td>
                    <td className="px-6 py-6 font-body-md">
                      <span className={`text-primary ${product.stock === 0 ? 'text-red-500 font-bold' : ''}`}>{product.stock}</span>
                      <p className={`text-[10px] uppercase ${stockColor}`}>{stockStatus}</p>
                    </td>
                    <td className="px-6 py-6 font-body-md text-on-surface-variant text-sm">{product.seller}</td>
                    <td className="px-6 py-6">
                      <span className={`px-3 py-1 text-[11px] rounded-full font-label-md ${
                        product.status === 'Đang bán' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-1">

                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="p-2 hover:bg-white rounded-full transition-all text-on-surface-variant hover:text-primary"
                          title="Chỉnh sửa chi tiết"
                        >
                          <Plus size={16} className="rotate-45 text-on-surface-variant hover:text-primary transition-transform duration-300" />
                        </button>
                        <button 
                          onClick={() => handleOpenDelete(product)}
                          className="p-2 hover:bg-white rounded-full transition-all text-on-surface-variant hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant/60 font-body-md animate-pulse">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-on-surface-variant/60 font-body-md">
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-8 flex justify-between items-center px-4">
        <p className="text-caption text-on-surface-variant text-xs">Hiển thị {filteredProducts.length} trong {products.length} sản phẩm</p>
        <div className="flex gap-2">
          <button className="w-10 h-10 flex items-center justify-center border border-outline-variant hover:bg-surface-variant transition-all rounded">
            <ChevronLeft size={16} />
          </button>
          <button className="w-10 h-10 flex items-center justify-center border border-primary bg-primary text-white font-label-md rounded text-xs">1</button>
          <button className="w-10 h-10 flex items-center justify-center border border-outline-variant hover:bg-surface-variant transition-all rounded">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal (Zen UI Card Modal) */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-sm w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Xóa sản phẩm</h3>
            <p className="font-body-md text-on-surface-variant text-sm mb-5 leading-relaxed">
              Bạn có chắc chắn muốn xóa sản phẩm <span className="font-semibold text-primary">"{productToDelete.name}"</span>? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={confirmDeleteProduct}
                className="px-5 py-2 bg-red-600 text-white rounded font-label-md text-xs hover:bg-red-700 transition-colors"
              >
                Đồng ý xóa
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  )
}
