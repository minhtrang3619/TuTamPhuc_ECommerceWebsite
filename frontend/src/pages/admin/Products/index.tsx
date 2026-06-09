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
  ArrowLeft,
  Leaf,
  Heart,
  MessageSquare
} from 'lucide-react'

import AdminCategories from '../Categories'
import apiClient from '@/services/apiClient'
import { getImageUrl } from '@/utils/productMapper'

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
  raw: any
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
        image: getImageUrl(p.images?.[0]?.url),
        raw: p
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
  const [mainImageFile, setMainImageFile] = useState<File | null>(null)
  const [galleryImageFiles, setGalleryImageFiles] = useState<{ blobUrl: string; file: File }[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState(false)

  // Preview Modal states
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewActiveColor, setPreviewActiveColor] = useState<{ name: string; hex: string } | null>(null)
  const [previewActiveSize, setPreviewActiveSize] = useState<string>('M')


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

  const formatNumberWithDots = (num: number | string) => {
    if (!num && num !== 0) return ''
    const str = String(num).replace(/\D/g, '')
    if (!str) return ''
    return Number(str).toLocaleString('vi-VN')
  }

  const parseDotsToNumber = (str: string) => {
    const cleanStr = str.replace(/\./g, '').replace(/,/g, '')
    const num = Number(cleanStr)
    return isNaN(num) ? 0 : num
  }

  const handleFormatText = (format: 'bold' | 'italic' | 'list') => {
    const textarea = document.getElementById('product-description-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = textarea.value
    const selectedText = text.substring(start, end)

    let prefix = ''
    let suffix = ''
    let replacement = selectedText

    if (format === 'bold') {
      prefix = '<strong>'
      suffix = '</strong>'
    } else if (format === 'italic') {
      prefix = '<em>'
      suffix = '</em>'
    } else if (format === 'list') {
      if (selectedText) {
        const lines = selectedText.split('\n')
        prefix = '<ul>\n'
        replacement = lines.map(line => `  <li>${line}</li>`).join('\n')
        suffix = '\n</ul>'
      } else {
        prefix = '<ul>\n  <li>'
        replacement = ''
        suffix = '</li>\n</ul>'
      }
    }

    const fullReplacement = prefix + replacement + suffix
    const newValue = text.substring(0, start) + fullReplacement + text.substring(end)
    
    setFormData(prev => ({ ...prev, description: newValue }))

    setTimeout(() => {
      textarea.focus()
      if (selectedText) {
        textarea.setSelectionRange(start, start + fullReplacement.length)
      } else {
        const cursorPosition = start + prefix.length
        textarea.setSelectionRange(cursorPosition, cursorPosition)
      }
    }, 50)
  }


  const handleOpenPreview = () => {
    if (formData.variants && formData.variants.length > 0) {
      setPreviewActiveColor({
        name: formData.variants[0].colorName,
        hex: formData.variants[0].colorHex
      })
    } else {
      setPreviewActiveColor({ name: 'Nâu đất', hex: '#5D4037' })
    }
    setPreviewActiveSize('M')
    setIsPreviewOpen(true)
  }

  const handleOpenAdd = () => {
    setSelectedProduct(null)
    setMainImageFile(null)
    setGalleryImageFiles([])
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
    setMainImageFile(null)
    setGalleryImageFiles([])

    // Parse raw variants from API response
    const rawVariants = p.raw?.variants || []
    const colorItems = rawVariants.filter((v: any) => v.name === 'Màu')
    const sizeItems = rawVariants.filter((v: any) => v.name === 'Kích cỡ' || v.name === 'Size')

    const sizesStock = { S: 0, M: 0, L: 0, XL: 0 }
    sizeItems.forEach((s: any) => {
      if (s.value === 'S') sizesStock.S = s.stock
      if (s.value === 'M') sizesStock.M = s.stock
      if (s.value === 'L') sizesStock.L = s.stock
      if (s.value === 'XL') sizesStock.XL = s.stock
    })

    const colorMap: Record<string, string> = {
      'Nâu nhạt': '#EADDD7',
      'Nâu đất': '#5D4037',
      'Nâu Trầm (Earth Brown)': '#5D4037',
      'Cát Trắng (Sand Ivory)': '#D7CCC8',
      'Trắng ngà': '#F5F5F5',
      'Xanh rêu': '#8D9B91'
    }

    const formVariants = colorItems.map((c: any) => {
      const parts = c.value.split('|')
      const colorName = parts[0]
      const colorHex = parts.length === 2 ? parts[1] : (colorMap[c.value] || '#ece0dc')
      return {
        colorName,
        colorHex,
        sizes: { ...sizesStock }
      }
    })

    const finalVariants = formVariants.length > 0 ? formVariants : [
      {
        colorName: 'Nâu Trầm (Earth Brown)',
        colorHex: '#5D4037',
        sizes: sizesStock
      }
    ]

    // Parse gallery images
    const apiGalleryImages = p.raw?.images?.map((img: any) => getImageUrl(img.url)) || []

    setFormData({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      description: p.raw?.description || '',
      material: p.raw?.short_description || p.raw?.tags?.[0] || 'Linen tự nhiên',
      price: p.price,
      unit: 'Bộ',
      discountProgram: 'Không có',
      discountValue: 0,
      discountType: '%',
      startDate: '',
      endDate: '',
      image: p.image,
      galleryImages: apiGalleryImages.length > 0 ? apiGalleryImages : [p.image],
      variants: finalVariants
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

  // Image upload
  const handleMainImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImageFile(file)
      const url = URL.createObjectURL(file)
      setFormData(prev => ({ ...prev, image: url }))
    }
  }

  const handleGalleryImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newItems: { blobUrl: string; file: File }[] = []
      const urls: string[] = []
      for (let i = 0; i < files.length; i++) {
        const url = URL.createObjectURL(files[i])
        newItems.push({ blobUrl: url, file: files[i] })
        urls.push(url)
      }
      setGalleryImageFiles(prev => [...prev, ...newItems])
      setFormData(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, ...urls]
      }))
    }
  }

  const handleRemoveGalleryImage = (index: number) => {
    const urlToRemove = formData.galleryImages[index]
    setGalleryImageFiles(prev => prev.filter(item => item.blobUrl !== urlToRemove))
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, idx) => idx !== index)
    }))
  }

  // Save product logic
  const handleSaveProductSubmit = async () => {
    if (!formData.name || !formData.sku || formData.price <= 0) {
      alert('Vui lòng điền đầy đủ tên, SKU và giá bán.')
      return
    }

    try {
      setIsSaving(true)

      // 1. Upload main image if it's a new local file (blob)
      let finalMainImageUrl = formData.image
      if (mainImageFile) {
        const uploadData = new FormData()
        uploadData.append('file', mainImageFile)
        const uploadRes = await apiClient.post('/uploads/image', uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        finalMainImageUrl = uploadRes.data.url
      } else if (finalMainImageUrl.startsWith('blob:')) {
        alert('Lỗi: Ảnh đại diện hiện tại là đường dẫn tạm thời. Vui lòng chọn tải lên lại ảnh đại diện chính.')
        setIsSaving(false)
        return
      }

      // 2. Upload gallery images if they are new local files (blobs)
      const finalGalleryUrls: string[] = []
      for (const imgUrl of formData.galleryImages) {
        const localFileItem = galleryImageFiles.find(item => item.blobUrl === imgUrl)
        if (localFileItem) {
          const uploadData = new FormData()
          uploadData.append('file', localFileItem.file)
          const uploadRes = await apiClient.post('/uploads/image', uploadData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          finalGalleryUrls.push(uploadRes.data.url)
        } else {
          // If it is a blob url but not found in file mapping, skip it to avoid database pollution
          if (imgUrl.startsWith('blob:')) {
            console.warn('Bỏ qua ảnh phụ chưa tải lên:', imgUrl)
            continue
          }
          // Keep existing or external image URL, converting back to relative path if it points to local API
          const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
          const relativeUrl = imgUrl.replace(BASE_URL, '')
          finalGalleryUrls.push(relativeUrl)
        }
      }

      // Format finalMainImageUrl as relative path if it contains BASE_URL
      const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const relativeMainImageUrl = finalMainImageUrl.replace(BASE_URL, '')

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
        .replace(/đ/g, 'd')
        .replace(/ /g, '-')
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')

      const apiVariants: any[] = []
      formData.variants.forEach(v => {
        // Add color variant with serialized hex code
        apiVariants.push({
          name: "Màu",
          value: `${v.colorName}|${v.colorHex}`,
          additional_price: 0.0,
          stock: v.sizes.S + v.sizes.M + v.sizes.L + v.sizes.XL
        })
        // Add size variants
        if (v.sizes.S > 0) apiVariants.push({ name: "Kích cỡ", value: "S", stock: v.sizes.S })
        if (v.sizes.M > 0) apiVariants.push({ name: "Kích cỡ", value: "M", stock: v.sizes.M })
        if (v.sizes.L > 0) apiVariants.push({ name: "Kích cỡ", value: "L", stock: v.sizes.L })
        if (v.sizes.XL > 0) apiVariants.push({ name: "Kích cỡ", value: "XL", stock: v.sizes.XL })
      })

      const apiImages: any[] = []
      if (relativeMainImageUrl) {
        apiImages.push({
          url: relativeMainImageUrl,
          alt: formData.name,
          is_primary: true,
          sort_order: 0
        })
      }
      finalGalleryUrls.forEach((imgUrl, index) => {
        if (imgUrl && imgUrl !== relativeMainImageUrl) {
          apiImages.push({
            url: imgUrl,
            alt: formData.name,
            is_primary: false,
            sort_order: index + 1
          })
        }
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
        variants: apiVariants,
        images: apiImages
      }

      if (formData.id) {
        await apiClient.put(`/products/${formData.id}`, payload)
      } else {
        await apiClient.post('/products', payload)
      }

      setIsAddModalOpen(false)
      setSelectedProduct(null)
      fetchProducts()
    } catch (err: any) {
      console.error('Lỗi khi lưu sản phẩm:', err)
      let errorMsg = 'Có lỗi xảy ra khi lưu sản phẩm. Vui lòng thử lại.'
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail
        } else if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map((d: any) => `${d.loc?.join('.') || 'loc'}: ${d.msg}`).join('\n')
        } else {
          errorMsg = JSON.stringify(err.response.data.detail)
        }
      }
      alert(`Lỗi:\n${errorMsg}`)
    } finally {
      setIsSaving(false)
    }
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
                    <button 
                      onClick={() => handleFormatText('bold')} 
                      className="p-1 hover:bg-outline-variant/20 rounded transition-colors" 
                      type="button" 
                      title="Chữ đậm"
                    >
                      <Bold size={16} />
                    </button>
                    <button 
                      onClick={() => handleFormatText('italic')} 
                      className="p-1 hover:bg-outline-variant/20 rounded transition-colors" 
                      type="button" 
                      title="Chữ nghiêng"
                    >
                      <Italic size={16} />
                    </button>
                    <button 
                      onClick={() => handleFormatText('list')} 
                      className="p-1 hover:bg-outline-variant/20 rounded transition-colors" 
                      type="button" 
                      title="Danh sách gạch đầu dòng"
                    >
                      <List size={16} />
                    </button>
                  </div>
                  <textarea 
                    id="product-description-textarea"
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
                    value={formatNumberWithDots(formData.price)}
                    onChange={(e) => setFormData({...formData, price: parseDotsToNumber(e.target.value)})}
                    className="w-full border-0 border-b border-outline-variant bg-transparent focus:ring-0 focus:border-primary py-2 font-body-md text-sm transition-all" 
                    placeholder="1.250.000" 
                    type="text"
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
                onClick={handleOpenPreview}
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
                  onClick={() => {
                    if (!formData.name || !formData.sku || formData.price <= 0) {
                      alert('Vui lòng điền đầy đủ tên, SKU và giá bán.')
                      return
                    }
                    setIsSaveConfirmModalOpen(true)
                  }}
                  disabled={isSaving}
                  className="py-4 px-4 bg-primary text-on-primary font-label-md text-xs uppercase tracking-wider rounded hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5" 
                  type="button"
                >
                  {isSaving ? 'Đang lưu...' : 'Đăng sản phẩm'}
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

        {/* Zen Product Preview Modal */}
        {isPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-[#fcfaf7] border border-outline-variant/30 rounded-xl max-w-5xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-500 font-sans">
              {/* Modal Header */}
              <div className="bg-white px-8 py-4 border-b border-outline-variant/20 flex items-center justify-between shrink-0">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary/60 font-sans">Chế độ xem trước</span>
                  <h3 className="font-serif text-lg font-bold text-primary">Xem trước hiển thị sản phẩm</h3>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setIsPreviewOpen(false);
                      if (!formData.name || !formData.sku || formData.price <= 0) {
                        alert('Vui lòng điền đầy đủ tên, SKU và giá bán.');
                        return;
                      }
                      setIsSaveConfirmModalOpen(true);
                    }}
                    className="px-5 py-2 bg-primary text-on-primary rounded font-label-md text-xs hover:bg-primary/95 transition-colors uppercase tracking-wider font-semibold"
                  >
                    Đăng sản phẩm
                  </button>
                  <button 
                    onClick={() => setIsPreviewOpen(false)}
                    className="p-2 hover:bg-surface-container-low rounded-full transition-all text-on-surface-variant hover:text-primary"
                    title="Đóng xem trước"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Modal Scrollable Content (Mimics ProductDetail Page) */}
              <div className="flex-1 overflow-y-auto p-8 md:p-12">
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                    
                    {/* Left Column - Images */}
                    <div className="lg:col-span-7 flex flex-col gap-6">
                      <div className="aspect-[3/4] bg-surface-container overflow-hidden rounded-xs shadow-[0_8px_32px_rgba(68,42,34,0.03)] border border-[#d4c3be]/20 relative">
                        {formData.image ? (
                          <img
                            alt={formData.name || 'Ảnh sản phẩm'}
                            src={formData.image}
                            className="w-full h-full object-cover transition-transform duration-[2200ms] hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-surface-container-low flex flex-col items-center justify-center text-outline-variant">
                            <ImageIcon size={48} className="mb-2 opacity-40" />
                            <span className="text-xs">Chưa có ảnh đại diện</span>
                          </div>
                        )}
                      </div>

                      {/* Sub-thumbnails / Gallery */}
                      {formData.galleryImages && formData.galleryImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-6">
                          {formData.galleryImages.slice(0, 2).map((img, idx) => (
                            <div key={idx} className="aspect-square bg-surface-container overflow-hidden rounded-xs border border-[#d4c3be]/20 relative group">
                              <img
                                alt={`Fabric Detail ${idx + 1}`}
                                src={img}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column - Info Panel */}
                    <div className="lg:col-span-5 flex flex-col text-left">
                      <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5d4037] mb-1.5 flex items-center gap-1.5 font-sans">
                        <Leaf size={12} className="text-primary/60" />
                        Pháp phục tự nhiên truyền thống • {formData.category}
                      </span>
                      <h1 className="font-serif text-2xl md:text-3.5xl text-primary font-bold mb-2 tracking-wide leading-tight">
                        {formData.name || 'Tên sản phẩm'}
                      </h1>

                      <div className="flex items-baseline gap-3 mb-8 font-sans font-semibold">
                        <span className="text-xl text-primary font-bold">
                          {formatPrice(formData.price)}
                        </span>
                      </div>

                      {/* Description details */}
                      <div className="space-y-4.5 mb-10 border-l border-[#d4c3be] pl-5 text-left">
                        <p className="font-serif italic text-[#5d4037]/95 text-sm md:text-base leading-relaxed opacity-90">
                          Chất liệu: {formData.material || 'Linen tự nhiên'} • Đơn vị: {formData.unit || 'Bộ'}
                        </p>
                        {formData.description ? (
                          <div 
                            className="font-sans text-xs text-on-surface-variant/80 tracking-wide leading-relaxed prose prose-stone max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:my-0.5 [&_strong]:font-semibold [&_em]:italic"
                            dangerouslySetInnerHTML={{ __html: formData.description }}
                          />
                        ) : (
                          <p className="text-xs text-on-surface-variant/40 italic">Chưa có mô tả chi tiết sản phẩm...</p>
                        )}
                      </div>

                      {/* Interactive swatch mockups */}
                      <div className="space-y-6 mb-10 text-left">
                        {formData.variants && formData.variants.length > 0 && (
                          <div>
                            <span className="block text-[11px] uppercase tracking-widest font-bold text-[#5d4037] mb-3 font-sans">
                              Màu sắc: <span className="text-on-surface font-normal">{previewActiveColor?.name}</span>
                            </span>
                            <div className="flex space-x-3">
                              {formData.variants.map((v, idx) => {
                                const isSelected = previewActiveColor?.hex === v.colorHex;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setPreviewActiveColor({ name: v.colorName, hex: v.colorHex })}
                                    className={`w-8 h-8 rounded-full border p-0.5 transition-all ${
                                      isSelected ? 'border-primary ring-2 ring-primary/20 scale-103' : 'border-transparent hover:border-outline-variant'
                                    }`}
                                    title={v.colorName}
                                  >
                                    <div className="w-full h-full rounded-full border border-black/5" style={{ backgroundColor: v.colorHex }} />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Sizes chooser mockup */}
                        <div>
                          <span className="block text-[11px] uppercase tracking-widest font-bold text-[#5d4037] mb-3 font-sans">
                            Kích thước
                          </span>
                          <div className="flex flex-wrap gap-2.5 font-sans">
                            {['S', 'M', 'L', 'XL'].map((size) => {
                              const isSelected = previewActiveSize === size;
                              return (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => setPreviewActiveSize(size)}
                                  className={`px-5 py-2 min-w-14 border text-xs tracking-wider transition-all font-bold rounded-sm ${
                                    isSelected
                                      ? 'border-primary bg-[#e2e2e2] text-primary shadow-xs'
                                      : 'border-[#d4c3be] text-on-surface-variant hover:border-primary'
                                  }`}
                                >
                                  {size}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Simulated purchase actions */}
                      <div className="space-y-3 font-sans text-left">
                        <div className="flex gap-3">
                          <button
                            type="button"
                            className="flex-1 py-4 border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all flex justify-center items-center gap-2 rounded-xs opacity-50 cursor-not-allowed bg-transparent"
                            disabled
                          >
                            Thêm vào giỏ hàng
                          </button>
                          <button
                            type="button"
                            className="px-6 py-4 border border-[#d4c3be] text-[#5d4037] font-bold text-xs uppercase tracking-widest hover:bg-[#5d4037]/5 transition-all flex justify-center items-center gap-2 rounded-xs opacity-50 cursor-not-allowed bg-transparent"
                            disabled
                          >
                            <MessageSquare size={16} />
                            Tư vấn
                          </button>
                          <button
                            type="button"
                            className="px-4 py-4 border border-[#d4c3be] rounded-xs text-[#5d4037] opacity-50 cursor-not-allowed bg-transparent flex items-center justify-center"
                            disabled
                          >
                            <Heart size={16} />
                          </button>
                        </div>
                        <p className="text-[10px] text-center text-on-surface-variant/40 mt-1 italic font-sans">
                          Các nút chức năng mua hàng bị vô hiệu hóa trong chế độ xem trước
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Confirmation Modal (Zen UI Card Modal) */}
        {isSaveConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300 font-sans">
            <div className="bg-white border border-outline-variant/30 rounded-xl max-w-sm w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500 font-sans text-left">
              <button 
                onClick={() => setIsSaveConfirmModalOpen(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
              >
                <X size={20} />
              </button>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-3">
                {formData.id ? 'Xác nhận thay đổi' : 'Xác nhận đăng sản phẩm'}
              </h3>
              <p className="font-body-md text-on-surface-variant text-sm mb-5 leading-relaxed">
                {formData.id 
                  ? 'Bạn có chắc chắn muốn lưu các thay đổi cho sản phẩm này không?' 
                  : 'Bạn có chắc chắn muốn đăng sản phẩm mới này lên hệ thống không?'}
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => setIsSaveConfirmModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant/50 rounded font-label-md text-xs text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  onClick={() => {
                    setIsSaveConfirmModalOpen(false)
                    handleSaveProductSubmit()
                  }}
                  className="px-5 py-2 bg-primary text-on-primary rounded font-label-md text-xs hover:bg-primary/95 transition-colors"
                >
                  Đồng ý
                </button>
              </div>
            </div>
          </div>
        )}
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
