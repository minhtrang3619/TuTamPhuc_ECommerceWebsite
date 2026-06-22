import { useState, useEffect } from 'react'
import {
  Search,
  Check,
  Coins,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Plus,
  ClipboardCheck,
  Package,
  Trash2,
  ChevronDown,
  Printer,
  CheckCircle2,
  X
} from 'lucide-react'
import apiClient from '@/services/apiClient'
import { getImageUrl } from '@/utils/productMapper'
import Toast from '@/components/ui/Toast'

interface SelectedVariant {
  sku: string
  size: string
  color: string
  colorHex?: string
  quantity: number
}

interface ReceiptVoucherItem {
  id: string
  name: string
  image: string
  sku: string
  price: number
  cost_price: number
  note: string
  variants: SelectedVariant[]
}

export default function AdminInventory() {
  const [activeTab, setActiveTab] = useState<'overview' | 'update' | 'audit'>('overview')
  const [showCreateVoucher, setShowCreateVoucher] = useState(false)

  // Stock Vouchers Stats list states
  const [stockVouchers, setStockVouchers] = useState<any[]>([])
  const [vouchersLoading, setVouchersLoading] = useState(false)

  // Audit States
  const [showCreateAudit, setShowCreateAudit] = useState(false)
  const [auditVouchers, setAuditVouchers] = useState<any[]>([])
  const [auditsLoading, setAuditsLoading] = useState(false)

  const fetchStockVouchers = async () => {
    try {
      setVouchersLoading(true)
      const res = await apiClient.get('/products/stock-vouchers')
      setStockVouchers(res.data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách phiếu nhập kho:', err)
    } finally {
      setVouchersLoading(false)
    }
  }

  const fetchAuditVouchers = async () => {
    try {
      setAuditsLoading(true)
      const res = await apiClient.get('/products/audit-vouchers')
      setAuditVouchers(res.data)
    } catch (err) {
      console.error('Lỗi khi tải danh sách phiếu kiểm kê:', err)
    } finally {
      setAuditsLoading(false)
    }
  }

  // Dashboard States
  const [analyticsData, setAnalyticsData] = useState<any | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  // Voucher Detail Modal States
  const [selectedVoucherId, setSelectedVoucherId] = useState<number | null>(null)
  const [selectedVoucherDetail, setSelectedVoucherDetail] = useState<any | null>(null)
  const [detailModalLoading, setDetailModalLoading] = useState(false)

  // Toast Notification States
  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type?: 'success' | 'info' }>({
    message: '',
    isVisible: false,
    type: 'success'
  })
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, isVisible: true, type })
  }

  const handleOpenVoucherDetail = async (id: number) => {
    setSelectedVoucherId(id)
    setDetailModalLoading(true)
    try {
      const res = await apiClient.get(`/products/stock-vouchers/${id}`)
      setSelectedVoucherDetail(res.data)
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phiếu nhập kho:', err)
      alert('Không thể tải chi tiết phiếu nhập kho.')
    } finally {
      setDetailModalLoading(false)
    }
  }

  const handleUpdateVoucherStatus = async (voucherId: number, status: string) => {
    try {
      await apiClient.put(`/products/stock-vouchers/${voucherId}/status`, { status })
      showToast(`Đã cập nhật trạng thái lô hàng thành: ${status}`, 'success')
      
      setStockVouchers((prev: any[]) => prev.map(v => v.id === voucherId ? { ...v, delivery_status: status } : v))
      setSelectedVoucherDetail((prev: any) => prev && prev.id === voucherId ? { ...prev, delivery_status: status } : prev)
      
      if (status === 'Đã nhận') {
        fetchAnalytics()
      }
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái phiếu nhập kho:', err)
      showToast(err?.response?.data?.detail || 'Không thể cập nhật trạng thái phiếu nhập kho.', 'info')
    }
  }



  // Voucher Receipt States
  const [voucherCode, setVoucherCode] = useState('')

  const getLocalDateString = () => {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  const generateVoucherCode = (vouchersList: any[]) => {
    const today = getLocalDateString()
    const prefix = `PNK-${today}-`
    
    const todayVouchers = vouchersList.filter((v: any) => 
      v.voucher_code && v.voucher_code.trim().startsWith(prefix)
    )
    
    if (todayVouchers.length === 0) {
      return `${prefix}001`
    }
    
    const suffixes = todayVouchers.map((v: any) => {
      const parts = v.voucher_code.trim().split('-')
      const lastPart = parts[parts.length - 1]
      const num = parseInt(lastPart, 10)
      return isNaN(num) ? 0 : num
    })
    
    const maxSuffix = Math.max(...suffixes, 0)
    const nextSuffix = String(maxSuffix + 1).padStart(3, '0')
    return `${prefix}${nextSuffix}`
  }

  useEffect(() => {
    if (stockVouchers) {
      setVoucherCode(generateVoucherCode(stockVouchers))
    }
  }, [stockVouchers])

  const [voucherSupplier, setVoucherSupplier] = useState('4') // Default: Xưởng may Khai Thanh
  const [voucherItems, setVoucherItems] = useState<ReceiptVoucherItem[]>([])
  const [voucherNotes, setVoucherNotes] = useState('')
  const [searchSku, setSearchSku] = useState('')
  const [allProducts, setAllProducts] = useState<any[]>([])

  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [successVoucher, setSuccessVoucher] = useState<any>(null)

  // Audit form states
  const [auditCode, setAuditCode] = useState('')
  const [auditNotes, setAuditNotes] = useState('')
  const [auditItems, setAuditItems] = useState<any[]>([])
  const [searchAuditSku, setSearchAuditSku] = useState('')
  const [showAuditProductDropdown, setShowAuditProductDropdown] = useState(false)
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null)
  const [selectedAuditDetail, setSelectedAuditDetail] = useState<any | null>(null)
  const [auditDetailLoading, setAuditDetailLoading] = useState(false)

  const generateAuditCode = (vouchersList: any[]) => {
    const today = getLocalDateString()
    const prefix = `PKK-${today}-`
    
    const todayVouchers = vouchersList.filter((v: any) => 
      v.voucher_code && v.voucher_code.trim().startsWith(prefix)
    )
    
    if (todayVouchers.length === 0) {
      return `${prefix}001`
    }
    
    const suffixes = todayVouchers.map((v: any) => {
      const parts = v.voucher_code.trim().split('-')
      const lastPart = parts[parts.length - 1]
      const num = parseInt(lastPart, 10)
      return isNaN(num) ? 0 : num
    })
    
    const maxSuffix = Math.max(...suffixes, 0)
    const nextSuffix = String(maxSuffix + 1).padStart(3, '0')
    return `${prefix}${nextSuffix}`
  }

  useEffect(() => {
    if (auditVouchers) {
      setAuditCode(generateAuditCode(auditVouchers))
    }
  }, [auditVouchers])

  const handleSearchAndAddAudit = async (skuVal: string) => {
    const targetSku = skuVal || searchAuditSku
    if (!targetSku.trim()) return
    setLoading(true)
    setError(null)
    try {
      let foundProduct = allProducts.find((item: any) => item.sku?.toLowerCase() === targetSku.trim().toLowerCase())

      if (!foundProduct) {
        for (const item of allProducts) {
          const v = item.variants?.find((varItem: any) => {
            const variantSku = varItem.sku || `${item.sku}-${varItem.value}`
            return variantSku.toLowerCase() === targetSku.trim().toLowerCase()
          })
          if (v) {
            foundProduct = item
            break
          }
        }
      }

      if (!foundProduct) {
        const res = await apiClient.get('/products?page_size=1000&status=all')
        const items = res.data?.items || []

        foundProduct = items.find((item: any) => item.sku?.toLowerCase() === targetSku.trim().toLowerCase())
        if (!foundProduct) {
          for (const item of items) {
            const v = item.variants?.find((varItem: any) => {
              const variantSku = varItem.sku || `${item.sku}-${varItem.value}`
              return variantSku.toLowerCase() === targetSku.trim().toLowerCase()
            })
            if (v) {
              foundProduct = item
              break
            }
          }
        }
      }

      if (!foundProduct) {
        setError('Không tìm thấy sản phẩm hoặc biến thể nào có mã SKU này.')
        return
      }

      const imageUrl = getImageUrl(foundProduct.images?.[0]?.url)

      // Get system stocks for each size
      const rawVariants = foundProduct.variants || []
      const colorItems = rawVariants.filter((v: any) => v.name === 'Màu')
      const sizeItems = rawVariants.filter((v: any) => v.name === 'Kích cỡ' || v.name === 'Size' || v.name === 'size')

      const uniqueColorsMap = new Map<string, string>()
      colorItems.forEach((c: any) => {
        const parts = c.value.split('|')
        const name = parts[0].trim()
        const hex = parts.length === 2 ? parts[1].trim() : '#ece0dc'
        uniqueColorsMap.set(name, hex)
      })
      const colors = Array.from(uniqueColorsMap.entries()).map(([name, hex]) => ({ name, hex }))
      if (colors.length === 0) {
        colors.push({ name: 'Mặc định', hex: '#ece0dc' })
      }

      const uniqueSizesMap = new Map<string, { sku: string; stock: number }>()
      if (sizeItems.length > 0) {
        const standardSizes = ['S', 'M', 'L', 'XL']
        standardSizes.forEach(sz => {
          const matchingS = sizeItems.find((s: any) => s.value.trim().toUpperCase() === sz)
          uniqueSizesMap.set(sz, {
            sku: `${foundProduct.sku}-${sz}`,
            stock: matchingS ? matchingS.stock : 0
          })
        })
      }

      sizeItems.forEach((s: any) => {
        const name = s.value.trim()
        const sku = s.sku || `${foundProduct.sku}-${name}`
        uniqueSizesMap.set(name, { sku, stock: s.stock })
      })

      const sizes = Array.from(uniqueSizesMap.entries()).map(([name, val]) => ({ name, sku: val.sku, stock: val.stock }))
      if (sizes.length === 0) {
        sizes.push({ name: 'Standard', sku: foundProduct.sku || '', stock: foundProduct.stock || 0 })
      }

      // Generate grid combinations
      const productVariants: any[] = []
      colors.forEach((col: any) => {
        sizes.forEach((sz: any) => {
          let sysStock = sz.stock
          if (colors.length > 1 && col.name !== 'Mặc định') {
            const colorObj = colorItems.find((c: any) => c.value.split('|')[0].trim() === col.name)
            if (colorObj && sizeItems.length === 0) {
              sysStock = colorObj.stock
            }
          }

          productVariants.push({
            sku: sz.sku,
            size: sz.name,
            color: col.name,
            colorHex: col.hex,
            systemStock: sysStock,
            actualStock: sysStock,
            discrepancy: 0,
            reason: ''
          })
        })
      })

      setAuditItems(prev => {
        const clean = prev.filter(x => !x.id.startsWith('mock-'))
        const existingIdx = clean.findIndex(x => x.sku.toLowerCase() === foundProduct.sku.toLowerCase())
        if (existingIdx > -1) {
          return clean
        } else {
          return [...clean, {
            id: `prod-${foundProduct.id}`,
            name: foundProduct.name,
            image: imageUrl,
            sku: foundProduct.sku || '',
            price: foundProduct.price || 0,
            cost_price: foundProduct.cost_price || foundProduct.price || 0,
            variants: productVariants
          }]
        }
      })

      setSearchAuditSku('')
    } catch (err) {
      console.error(err)
      setError('Lỗi khi tải thông tin sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateAuditItemStock = (productIdx: number, variantIdx: number, val: number) => {
    setAuditItems(prev => {
      const updated = [...prev]
      const prod = { ...updated[productIdx] }
      const vars = [...prod.variants]
      const variant = { ...vars[variantIdx] }
      
      variant.actualStock = val
      variant.discrepancy = val - variant.systemStock
      vars[variantIdx] = variant
      prod.variants = vars
      updated[productIdx] = prod
      return updated
    })
  }

  const handleUpdateAuditItemReason = (productIdx: number, variantIdx: number, val: string) => {
    setAuditItems(prev => {
      const updated = [...prev]
      const prod = { ...updated[productIdx] }
      const vars = [...prod.variants]
      const variant = { ...vars[variantIdx] }
      
      variant.reason = val
      vars[variantIdx] = variant
      prod.variants = vars
      updated[productIdx] = prod
      return updated
    })
  }

  const handleRemoveAuditVariant = (productIdx: number, variantIdx: number) => {
    setAuditItems(prev => {
      const updated = [...prev]
      const prod = { ...updated[productIdx] }
      prod.variants = prod.variants.filter((_: any, idx: number) => idx !== variantIdx)
      if (prod.variants.length === 0) {
        return updated.filter((_: any, idx: number) => idx !== productIdx)
      }
      updated[productIdx] = prod
      return updated
    })
  }

  const handleImportFromStockVoucher = async (voucherId: number) => {
    if (!voucherId) return
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(`/products/stock-vouchers/${voucherId}`)
      const voucherDetail = res.data
      
      const newAuditItems: any[] = []
      
      for (const item of (voucherDetail.items || [])) {
        // Find product in allProducts
        let foundProduct = allProducts.find((p: any) => p.id === item.product_id || p.sku?.toLowerCase() === item.sku?.split('-')[0]?.toLowerCase())
        
        if (!foundProduct) {
          const pRes = await apiClient.get(`/products?page_size=10&search=${item.sku?.split('-')[0]}`)
          foundProduct = pRes.data?.items?.[0]
        }
        
        if (!foundProduct) continue
        
        // Image URL
        const imageUrl = getImageUrl(foundProduct.images?.[0]?.url)
        
        // Parse color and size
        let colorVal = 'Mặc định'
        let sizeVal = 'Standard'
        if (item.color) {
          if (item.color.includes(' - Size ')) {
            const parts = item.color.split(' - Size ')
            colorVal = parts[0].trim()
            sizeVal = parts[1].trim()
          } else if (item.color.startsWith('Size ')) {
            sizeVal = item.color.replace('Size ', '').trim()
          } else {
            colorVal = item.color.trim()
          }
        }
        
        // Get system stock for this variant
        const rawVariants = foundProduct.variants || []
        const colorItems = rawVariants.filter((v: any) => v.name === 'Màu')
        const sizeItems = rawVariants.filter((v: any) => v.name === 'Kích cỡ' || v.name === 'Size' || v.name === 'size')
        
        // Match color hex
        let colorHex = '#ece0dc'
        const matchedColorObj = colorItems.find((c: any) => c.value.split('|')[0].trim() === colorVal)
        if (matchedColorObj) {
          const parts = matchedColorObj.value.split('|')
          if (parts.length === 2) colorHex = parts[1].trim()
        }
        
        // Match system stock
        let sysStock = foundProduct.stock || 0
        const matchedSizeObj = sizeItems.find((s: any) => s.value.trim().toUpperCase() === sizeVal.toUpperCase())
        if (matchedSizeObj) {
          sysStock = matchedSizeObj.stock
        } else if (colorItems.length > 1 && colorVal !== 'Mặc định' && matchedColorObj && sizeItems.length === 0) {
          sysStock = matchedColorObj.stock
        }
        
        const variantObj = {
          sku: item.sku,
          size: sizeVal,
          color: colorVal,
          colorHex: colorHex,
          systemStock: sysStock,
          actualStock: sysStock,
          discrepancy: 0,
          reason: ''
        }
        
        // Add to grouped list
        const existingIdx = newAuditItems.findIndex(x => x.sku.toLowerCase() === foundProduct.sku.toLowerCase())
        if (existingIdx > -1) {
          const existingItem = newAuditItems[existingIdx]
          const varExists = existingItem.variants.some((v: any) => v.sku.toLowerCase() === item.sku.toLowerCase() && v.color === colorVal && v.size === sizeVal)
          if (!varExists) {
            existingItem.variants.push(variantObj)
          }
        } else {
          newAuditItems.push({
            id: `prod-${foundProduct.id}`,
            name: foundProduct.name,
            image: imageUrl,
            sku: foundProduct.sku || '',
            price: foundProduct.price || 0,
            cost_price: foundProduct.cost_price || foundProduct.price || 0,
            variants: [variantObj]
          })
        }
      }
      
      if (newAuditItems.length > 0) {
        setAuditItems((prev: any[]) => {
          const clean = prev.filter(x => !x.id.startsWith('mock-'))
          const updated = [...clean]
          newAuditItems.forEach(newItem => {
            const idx = updated.findIndex(x => x.sku.toLowerCase() === newItem.sku.toLowerCase())
            if (idx > -1) {
              const existingItem = updated[idx]
              newItem.variants.forEach((v: any) => {
                const varExists = existingItem.variants.some((x: any) => x.sku.toLowerCase() === v.sku.toLowerCase() && x.color === v.color && x.size === v.size)
                if (!varExists) {
                  existingItem.variants.push(v)
                }
              })
            } else {
              updated.push(newItem)
            }
          })
          return updated
        })
        showToast(`Đã tải thành công ${newAuditItems.length} sản phẩm từ phiếu nhập kho!`, 'success')
      } else {
        showToast('Không có sản phẩm nào hợp lệ trong phiếu nhập kho để tải.', 'info')
      }
    } catch (err: any) {
      console.error(err)
      showToast('Lỗi khi tải thông tin sản phẩm từ phiếu nhập kho.', 'info')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmAudit = async () => {
    const itemsToProcess: any[] = []
    auditItems.forEach(item => {
      item.variants.forEach((v: any) => {
        itemsToProcess.push({
          sku: item.sku.trim(),
          system_stock: v.systemStock,
          actual_stock: v.actualStock,
          discrepancy: v.discrepancy,
          reason: v.reason || null,
          color: v.color !== 'Mặc định' ? `${v.color} - Size ${v.size}` : `Size ${v.size}`
        })
      })
    })

    if (itemsToProcess.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm để kiểm kê.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const payload = {
        voucher_code: auditCode,
        auditor: "Minh Tâm",
        notes: auditNotes,
        items: itemsToProcess
      }

      await apiClient.post('/products/audit-stock', payload)

      alert('Đã chốt sổ phiếu kiểm kê và điều chỉnh số lượng tồn kho thành công!')
      
      setAuditItems([])
      setAuditNotes('')
      fetchAuditVouchers()
      fetchAnalytics()
      fetchAllProductsForDropdown()
      setShowCreateAudit(false)
    } catch (err: any) {
      console.error(err)
      alert(err?.response?.data?.detail || 'Lỗi khi xác nhận chốt sổ phiếu kiểm kê.')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAuditDetail = async (id: number) => {
    setSelectedAuditId(id)
    setAuditDetailLoading(true)
    try {
      const res = await apiClient.get(`/products/audit-vouchers/${id}`)
      setSelectedAuditDetail(res.data)
    } catch (err) {
      console.error('Lỗi khi tải chi tiết phiếu kiểm kê:', err)
    } finally {
      setAuditDetailLoading(false)
    }
  }

  // Loading and Error States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // @ts-ignore
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const res = await apiClient.get('/analytics/inventory')
      setAnalyticsData(res.data)
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu phân tích kho:', err)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchAllProductsForDropdown = async () => {
    try {
      const res = await apiClient.get('/products?page_size=200&status=all')
      setAllProducts(res.data?.items || [])
    } catch (err) {
      console.error('Lỗi khi tải danh sách sản phẩm:', err)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    fetchAllProductsForDropdown()
    fetchStockVouchers()
    fetchAuditVouchers()
  }, [])

  const handleSearchAndAdd = async (skuVal: string) => {
    const targetSku = skuVal || searchSku
    if (!targetSku.trim()) return
    setLoading(true)
    setError(null)
    try {
      // 1. Search in preloaded allProducts list first
      let foundProduct = allProducts.find((item: any) => item.sku?.toLowerCase() === targetSku.trim().toLowerCase())
      let foundVariant = null

      if (!foundProduct) {
        for (const item of allProducts) {
          const v = item.variants?.find((varItem: any) => {
            const variantSku = varItem.sku || `${item.sku}-${varItem.value}`
            return variantSku.toLowerCase() === targetSku.trim().toLowerCase()
          })
          if (v) {
            foundProduct = item
            foundVariant = v
            break
          }
        }
      }

      // 2. If not found, fallback to API query with a large page size
      if (!foundProduct) {
        const res = await apiClient.get('/products?page_size=1000&status=all')
        const items = res.data?.items || []

        foundProduct = items.find((item: any) => item.sku?.toLowerCase() === targetSku.trim().toLowerCase())
        if (!foundProduct) {
          for (const item of items) {
            const v = item.variants?.find((varItem: any) => {
              const variantSku = varItem.sku || `${item.sku}-${varItem.value}`
              return variantSku.toLowerCase() === targetSku.trim().toLowerCase()
            })
            if (v) {
              foundProduct = item
              foundVariant = v
              break
            }
          }
        }
      }

      if (!foundProduct) {
        setError('Không tìm thấy sản phẩm hoặc biến thể nào có mã SKU này.')
        return
      }

      const imageUrl = getImageUrl(foundProduct.images?.[0]?.url)

      // Clean up mock rows on first real item insert to keep data clean
      setVoucherItems(prev => {
        const clean = prev.filter(x => !x.id.startsWith('mock-'))

        // 1. Get unique colors and sizes for the product (prevent duplicate color/size definitions)
        const rawVariants = foundProduct.variants || []
        const colorItems = rawVariants.filter((v: any) => v.name === 'Màu')
        const sizeItems = rawVariants.filter((v: any) => v.name === 'Kích cỡ' || v.name === 'Size' || v.name === 'size')

        const uniqueColorsMap = new Map<string, string>()
        colorItems.forEach((c: any) => {
          const parts = c.value.split('|')
          const name = parts[0].trim()
          const hex = parts.length === 2 ? parts[1].trim() : '#ece0dc'
          uniqueColorsMap.set(name, hex)
        })
        const colors = Array.from(uniqueColorsMap.entries()).map(([name, hex]) => ({ name, hex }))
        if (colors.length === 0) {
          colors.push({ name: 'Mặc định', hex: '#ece0dc' })
        }

        const uniqueSizesMap = new Map<string, string>()

        if (sizeItems.length > 0) {
          const standardSizes = ['S', 'M', 'L', 'XL']
          standardSizes.forEach(sz => {
            uniqueSizesMap.set(sz, `${foundProduct.sku}-${sz}`)
          })
        }

        sizeItems.forEach((s: any) => {
          const name = s.value.trim()
          const sku = s.sku || `${foundProduct.sku}-${name}`
          uniqueSizesMap.set(name, sku)
        })
        const sizes = Array.from(uniqueSizesMap.entries()).map(([name, sku]) => ({ name, sku }))
        if (sizes.length === 0) {
          sizes.push({ name: 'Standard', sku: foundProduct.sku || '' })
        }

        // 2. Generate Cartesian product of colors x sizes
        const productVariants: SelectedVariant[] = []
        colors.forEach((col: { name: string; hex: string }) => {
          sizes.forEach((sz: { name: string; sku: string }) => {
            let initialQty = 10
            if (foundVariant) {
              // If a specific variant SKU was scanned, set its qty to 10 and others to 0
              const isSizeMatch = sz.name === foundVariant.value
              initialQty = isSizeMatch ? 10 : 0
            }

            productVariants.push({
              sku: sz.sku,
              size: sz.name,
              color: col.name,
              colorHex: col.hex,
              quantity: initialQty
            })
          })
        })

        const existingIdx = clean.findIndex(x => x.sku.toLowerCase() === foundProduct.sku.toLowerCase())
        if (existingIdx > -1) {
          // Product already exists in the voucher, update the specific variant's quantity
          const updated = [...clean]
          const existingItem = { ...updated[existingIdx] }

          if (foundVariant) {
            existingItem.variants = existingItem.variants.map(v => {
              if (v.size === foundVariant.value) {
                return { ...v, quantity: v.quantity === 0 ? 10 : v.quantity + 10 }
              }
              return v
            })
          } else {
            // Parent product was scanned/selected again: increment all variants by 10
            existingItem.variants = existingItem.variants.map(v => ({
              ...v,
              quantity: v.quantity + 10
            }))
          }

          updated[existingIdx] = existingItem
          return updated
        } else {
          // Add new product
          const newVoucherItem: ReceiptVoucherItem = {
            id: `prod-${foundProduct.id}`,
            name: foundProduct.name,
            image: imageUrl,
            sku: foundProduct.sku || '',
            price: foundProduct.price || 0,
            cost_price: Math.round(foundProduct.price * 0.55),
            note: '',
            variants: productVariants
          }
          return [...clean, newVoucherItem]
        }
      })

      setSearchSku('')
    } catch (err) {
      console.error(err)
      setError('Lỗi khi tải thông tin sản phẩm.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickUpdateTransition = (actionSku?: string) => {
    setActiveTab('update')
    setShowCreateVoucher(true)
    if (actionSku) {
      handleSearchAndAdd(actionSku)
    }
  }

  const handleConfirmVoucher = async () => {
    const itemsToProcess = voucherItems.flatMap(item =>
      item.variants
        .filter(v => v.quantity > 0)
        .map(v => ({
          sku: item.sku.trim(),
          quantity: v.quantity,
          cost_price: item.cost_price,
          color: v.color !== 'Mặc định' ? `${v.color} - Size ${v.size}` : `Size ${v.size}`
        }))
    )

    if (itemsToProcess.length === 0) {
      alert('Vui lòng thêm ít nhất một sản phẩm và nhập số lượng lớn hơn 0.')
      return
    }

    const invalidItem = itemsToProcess.find(
      item => !item.sku.trim() || item.quantity <= 0 || item.cost_price < 0
    )
    if (invalidItem) {
      alert('Vui lòng điền đầy đủ mã SKU, số lượng > 0 và giá vốn >= 0 cho tất cả các dòng sản phẩm.')
      return
    }

    const supplierMap: Record<string, string> = {
      '1': 'Xưởng May Liên Hoa',
      '2': 'Xưởng Lụa Bảo Lộc',
      '3': 'Vải Chàm Sapa',
      '4': 'Xưởng may Khai Thanh (Quận Tân Phú)'
    }
    const supplierName = supplierMap[voucherSupplier] || 'Xưởng may Khai Thanh (Quận Tân Phú)'

    // Auto-compile line notes into the main notes block
    let compiledNotes = voucherNotes || ""
    const lineNotes = voucherItems
      .filter(item => item.note?.trim())
      .map(item => `${item.name}: ${item.note}`)
      .join("; ")
    if (lineNotes) {
      compiledNotes = compiledNotes
        ? `${compiledNotes} | Chi tiết: ${lineNotes}`
        : `Chi tiết: ${lineNotes}`
    }

    setLoading(true)
    setError(null)
    try {
      const payload = {
        voucher_code: voucherCode,
        supplier: supplierName,
        recipient: "Minh Tâm",
        notes: compiledNotes,
        items: itemsToProcess,
        delivery_status: "Chờ lấy hàng",
        delivery_duration_days: 5
      }

      await apiClient.post('/products/receive-stock', payload)

      const completedVoucher = {
        voucherCode,
        supplierName,
        recipient: "Minh Tâm",
        totalQuantity,
        totalValue,
        items: itemsToProcess,
        date: new Date().toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      }
      setSuccessVoucher(completedVoucher)

      // Reset form
      setVoucherItems([])
      setVoucherNotes('')

      // Refresh dashboard analytics & dropdown list
      fetchAnalytics()
      fetchAllProductsForDropdown()
      fetchStockVouchers()
      setShowCreateVoucher(false)
    } catch (err: any) {
      console.error(err)
      alert(err?.response?.data?.detail || 'Lỗi khi xác nhận chốt sổ phiếu nhập kho.')
    } finally {
      setLoading(false)
    }
  }

  // Calculations for Summary
  const totalQuantity = voucherItems.reduce(
    (sum, item) => sum + item.variants.reduce((vSum, v) => vSum + v.quantity, 0),
    0
  )
  const totalValue = voucherItems.reduce(
    (sum, item) => sum + item.variants.reduce((vSum, v) => vSum + (v.quantity * item.cost_price), 0),
    0
  )

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-outline-variant/30 mb-6">
        <button
          className={`py-3 font-label-md text-sm transition-colors border-b-2 font-semibold ${activeTab === 'overview'
            ? 'border-primary text-primary font-bold'
            : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          onClick={() => setActiveTab('overview')}
        >
          Tổng quan kho
        </button>
        <button
          className={`py-3 font-label-md text-sm transition-colors border-b-2 font-semibold ${activeTab === 'update'
            ? 'border-primary text-primary font-bold'
            : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          onClick={() => {
            setActiveTab('update')
            setShowCreateVoucher(false)
          }}
        >
          Thống kê nhập sản phẩm
        </button>
        <button
          className={`py-3 font-label-md text-sm transition-colors border-b-2 font-semibold ${activeTab === 'audit'
            ? 'border-primary text-primary font-bold'
            : 'border-transparent text-on-surface-variant hover:text-primary'
            }`}
          onClick={() => {
            setActiveTab('audit')
            setShowCreateAudit(false)
          }}
        >
          Kiểm kê kho
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-12 animate-in fade-in duration-500">
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-left">
              <h1 className="font-headline-md text-3xl text-primary font-bold font-serif mb-2">Tổng quan kho hàng</h1>
              <p className="font-body-md text-sm text-on-surface-variant opacity-75">
                Chào buổi sáng, Quản lý kho. Dưới đây là tình trạng hàng hóa hôm nay.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setActiveTab('update')
                  setShowCreateVoucher(true)
                }}
                className="px-6 py-2.5 border border-primary text-primary font-semibold text-xs tracking-wider rounded-lg hover:bg-primary/5 transition-all duration-300 flex items-center gap-2 cursor-pointer bg-transparent"
              >
                <Plus size={16} />
                Tạo phiếu nhập kho mới
              </button>
              <button
                onClick={() => {
                  setActiveTab('audit')
                  setShowCreateAudit(true)
                  setAuditItems([])
                }}
                className="px-6 py-2.5 bg-primary text-white font-semibold text-xs tracking-wider rounded-lg hover:opacity-90 transition-all duration-300 flex items-center gap-2 cursor-pointer border-none font-bold"
              >
                <ClipboardCheck size={16} />
                Kiểm kê
              </button>
            </div>
          </div>

          {analyticsLoading && !analyticsData ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium">Đang tải phân tích kho hàng từ hệ thống...</p>
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Stock Value */}
                <div className="bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2.5 bg-secondary-container/40 text-primary rounded-full">
                      <Coins size={20} />
                    </span>
                    {analyticsData?.stats?.stock_value_change !== undefined && (
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded border uppercase ${
                        analyticsData.stats.stock_value_change >= 0
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                          : 'text-error bg-red-50 border-red-100'
                      }`}>
                        {analyticsData.stats.stock_value_change >= 0 ? '+' : ''}{analyticsData.stats.stock_value_change}%
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-label-md text-[10px] text-on-surface-variant/80 uppercase tracking-widest mb-1 font-semibold">Tổng giá trị tồn kho</p>
                    <p className="font-headline-sm text-lg text-primary font-bold font-serif">
                      {(analyticsData?.stats?.total_stock_value || 0).toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2.5 bg-red-50 text-error rounded-full border border-red-100">
                      <AlertTriangle size={20} />
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-[10px] text-on-surface-variant/80 uppercase tracking-widest mb-1 font-semibold">Cảnh báo tồn kho thấp</p>
                    <p className="font-headline-sm text-lg text-error font-bold font-serif">
                      {analyticsData?.stats?.low_stock_count || 0} Sản phẩm
                    </p>
                  </div>
                </div>

                {/* Pending Shipments */}
                <div className="bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2.5 bg-secondary-container/40 text-primary rounded-full">
                      <Clock size={20} />
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-[10px] text-on-surface-variant/80 uppercase tracking-widest mb-1 font-semibold">Đơn hàng chờ xuất</p>
                    <p className="font-headline-sm text-lg text-primary font-bold font-serif">
                      {analyticsData?.stats?.pending_shipments || 0} Kiện hàng
                    </p>
                  </div>
                </div>

                {/* Inventory Accuracy */}
                <div className="bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 flex flex-col justify-between text-left">
                  <div className="flex justify-between items-start mb-4">
                    <span className="p-2.5 bg-secondary-container/40 text-primary rounded-full">
                      <ShieldCheck size={20} />
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-[10px] text-on-surface-variant/80 uppercase tracking-widest mb-1 font-semibold">Độ chính xác tồn kho</p>
                    <p className="font-headline-sm text-lg text-primary font-bold font-serif">
                      {analyticsData?.stats?.accuracy ?? 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Bento Grid Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                {/* Recent Stock Movements */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 flex flex-col h-[500px]">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-headline-sm text-lg text-primary font-bold font-serif">Biến động kho gần đây</h3>
                    <button className="text-primary font-label-md text-xs font-semibold hover:underline bg-transparent border-none cursor-pointer">Xem tất cả</button>
                  </div>
                  <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-outline-variant scrollbar-track-transparent">
                    {(!analyticsData?.recent_movements || analyticsData.recent_movements.length === 0) ? (
                      <div className="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-60">
                        <Package className="mb-2 opacity-40" size={32} />
                        <p className="text-xs">Không có lịch sử biến động kho gần đây.</p>
                      </div>
                    ) : (
                      <table className="w-full text-left">
                        <thead className="sticky top-0 bg-white border-b border-outline-variant/20 z-10">
                          <tr>
                            <th className="py-3 font-label-md text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">Sản phẩm</th>
                            <th className="py-3 font-label-md text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">SKU</th>
                            <th className="py-3 font-label-md text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">Loại</th>
                            <th className="py-3 font-label-md text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">Số lượng</th>
                            <th className="py-3 font-label-md text-xs text-on-surface-variant/80 font-semibold uppercase tracking-wider">Thời gian</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {analyticsData.recent_movements.map((mov: any, index: number) => (
                            <tr key={index} className="hover:bg-surface-container-low transition-colors group">
                              <td className="py-4 font-semibold text-primary text-sm group-hover:text-primary transition-colors">{mov.product_name}</td>
                              <td className="py-4 text-on-surface-variant text-xs font-medium font-mono">{mov.sku}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 text-[10px] rounded border uppercase tracking-wider font-semibold ${mov.type === 'Nhập'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                  : 'bg-red-50 text-error border-red-100'
                                  }`}>
                                  {mov.type}
                                </span>
                              </td>
                              <td className={`py-4 font-bold text-sm ${mov.type === 'Nhập' ? 'text-emerald-700' : 'text-primary'}`}>{mov.quantity}</td>
                              <td className="py-4 text-on-surface-variant/70 text-xs">{mov.time}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Incoming Shipments */}
                <div className="bg-white p-6 rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 h-[500px] flex flex-col justify-between">
                  <div>
                    <h3 className="font-headline-sm text-lg text-primary font-bold font-serif mb-6">Lô hàng đang về</h3>
                    <div className="space-y-4 overflow-y-auto max-h-[340px] pr-1">
                      {analyticsData?.incoming_shipments?.map((inc: any) => (
                        <div
                          key={inc.id}
                          onClick={() => handleOpenVoucherDetail(inc.id)}
                          className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/10 flex gap-4 cursor-pointer hover:bg-secondary-container/20 hover:scale-[1.01] transition-all duration-300"
                        >
                          <div className="flex flex-col items-center justify-center bg-secondary-container/40 px-3 py-1 rounded text-primary min-w-[50px]">
                            <span className="text-[9px] uppercase font-bold tracking-wider">{inc.month}</span>
                            <span className="text-base font-bold">{inc.day}</span>
                          </div>
                          <div className="flex-grow text-left">
                            <p className="font-semibold text-primary text-xs leading-snug">{inc.name}</p>
                            <p className="text-[10px] text-on-surface-variant/70 mt-0.5">Nguồn: {inc.source}</p>
                            <div className="mt-2 flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${inc.status === 'Đang vận chuyển' ? 'bg-primary animate-pulse' :
                                inc.status === 'Chờ lấy hàng' ? 'bg-amber-500' : 'bg-[#8d9b91]'
                                }`}></span>
                              <span className="text-[9px] text-on-surface-variant italic font-semibold uppercase tracking-wider">{inc.status}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-outline-variant/10">
                    <button className="w-full py-2.5 bg-surface-container-low hover:bg-secondary-container/20 text-primary font-bold text-xs rounded transition-all cursor-pointer border-none uppercase tracking-wider font-sans">
                      Xem lịch trình chi tiết
                    </button>
                  </div>
                </div>
              </div>

              {/* Low Stock Items */}
              <div className="mt-12 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
                  <div>
                    <h3 className="font-headline-sm text-lg text-primary font-bold font-serif">Sản phẩm sắp hết hàng</h3>
                    <p className="font-body-md text-xs text-on-surface-variant opacity-75 mt-1">
                      Cần ưu tiên đặt hàng sớm để đảm bảo cung ứng đầy đủ.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('update')
                      setShowCreateVoucher(true)
                    }}
                    className="text-error hover:text-error/90 font-bold text-xs flex items-center gap-2 bg-transparent border-none cursor-pointer uppercase tracking-wider font-sans"
                  >
                    <ClipboardCheck size={16} />
                    Tạo phiếu nhập kho mới
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyticsData?.low_stock_items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      onClick={() => handleQuickUpdateTransition(item.sku)}
                      className="bg-white p-4 rounded-xl border border-outline-variant/30 flex gap-4 group hover:scale-[1.02] transition-all duration-500 hover:shadow-[0_24px_48px_-15px_rgba(68,42,34,0.06)] cursor-pointer"
                    >
                      <div className="w-20 h-20 rounded bg-surface-container-high overflow-hidden shrink-0">
                        <img
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          src={getImageUrl(item.image)}
                          alt={item.name}
                        />
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <p className="font-semibold text-primary text-sm line-clamp-1">{item.name}</p>
                          <p className="text-[10px] text-on-surface-variant font-mono">SKU: {item.sku}</p>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-on-surface-variant font-medium">Tồn kho: {item.stock} / {item.total_capacity}</span>
                            <span className="text-error font-bold">{item.percentage}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                            <div className="bg-error h-full rounded-full" style={{ width: `${item.percentage}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'update' && (
        showCreateVoucher ? (
        <div className="animate-in fade-in duration-500 flex flex-col lg:flex-row gap-6 w-full text-left font-sans">
          {/* Left Panel (25% width) */}
          <aside className="w-full lg:w-[25%] 2xl:w-[20%] flex flex-col gap-6">
            <div className="mb-2">
              <h1 className="font-headline-md text-headline-md text-primary mb-1">Phiếu Nhập Kho</h1>
              <p className="text-on-surface-variant font-caption text-caption uppercase tracking-widest"></p>
            </div>

            {/* General Info Card */}
            <section className="zen-card p-6 rounded-lg border border-outline-variant/30">
              <div className="flex justify-between items-center mb-6">
                <span className="text-on-surface-variant font-label-md text-label-md">Thông Tin Chung</span>
              </div>
              <div className="space-y-5">
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption text-on-surface-variant">Mã Phiếu</label>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant py-2 font-medium text-primary font-mono focus:border-primary focus:ring-0"
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã phiếu..."
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption text-on-surface-variant">Nhân Viên Tiếp Nhận</label>
                  <input
                    className="bg-surface-container-low border-0 border-b border-outline-variant/50 py-2 font-medium text-on-surface cursor-not-allowed focus:ring-0 w-full"
                    disabled
                    type="text"
                    value="Minh Tâm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-caption text-caption text-on-surface-variant">Nhà Cung Cấp</label>
                  <div className="relative">
                    <select
                      value={voucherSupplier}
                      onChange={(e) => setVoucherSupplier(e.target.value)}
                      className="w-full bg-transparent border-0 border-b border-outline-variant py-2 pr-8 font-medium text-on-surface appearance-none focus:ring-0 cursor-pointer"
                    >
                      <option value="4">Xưởng may Khai Thanh (Quận Tân Phú)</option>
                      <option value="1">Xưởng May Liên Hoa</option>
                      <option value="2">Xưởng Lụa Bảo Lộc</option>
                      <option value="3">Vải Chàm Sapa</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant w-4 h-4" />
                  </div>
                </div>

              </div>
            </section>

            {/* Scanner Control Card */}
            <section className="zen-card p-6 rounded-lg border border-outline-variant/30 relative">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant font-label-md text-label-md">Thêm Sản Phẩm</span>
                </div>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><Search size={16} /></span>
                  <input
                    className="w-full bg-surface-container-low border-0 border-b border-outline-variant py-3 pl-10 pr-10 transition-all duration-300 focus:border-primary text-sm focus:ring-0 font-medium placeholder:text-on-surface-variant/40"
                    placeholder="Tìm kiếm sản phẩm..."
                    type="text"
                    value={searchSku}
                    onChange={(e) => {
                      setSearchSku(e.target.value)
                      setShowProductDropdown(true)
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchAndAdd(searchSku)}
                    onFocus={() => setShowProductDropdown(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-1 flex items-center justify-center"
                  >
                    <ChevronDown size={18} />
                  </button>

                  {showProductDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setShowProductDropdown(false)}
                      />
                      <div className="absolute left-0 right-0 bottom-full mb-1 z-50 max-h-60 overflow-y-auto bg-white border border-outline-variant/30 rounded-lg shadow-xl divide-y divide-outline-variant/10 scrollbar-thin">
                        {(() => {
                          const filtered = allProducts.filter(prod =>
                            !searchSku ||
                            (prod.sku || '').toLowerCase().includes(searchSku.toLowerCase()) ||
                            (prod.name || '').toLowerCase().includes(searchSku.toLowerCase())
                          )

                          if (filtered.length === 0) {
                            return (
                              <div className="p-4 text-center text-xs text-on-surface-variant opacity-60">
                                Không tìm thấy sản phẩm nào
                              </div>
                            )
                          }

                          return filtered.map(item => {
                            const imageUrl = getImageUrl(item.images?.[0]?.url)
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  handleSearchAndAdd(item.sku)
                                  setShowProductDropdown(false)
                                }}
                                className="flex items-center gap-3 p-3 hover:bg-surface-container-low cursor-pointer transition-colors"
                              >
                                <div className="w-10 h-10 rounded bg-secondary-fixed overflow-hidden flex-shrink-0 border border-outline-variant/10">
                                  <img className="w-full h-full object-cover" src={imageUrl} alt={item.name} />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <p className="font-semibold text-primary text-xs truncate">{item.name}</p>
                                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-on-surface-variant">
                                    <span className="font-mono bg-surface-container px-1.5 py-0.5 rounded font-bold">{item.sku}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        })()}
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-[10px] rounded border border-red-200 leading-normal">
                    {error}
                  </div>
                )}
              </div>
            </section>
          </aside>

          {/* Right Panel (75% width) */}
          <div className="w-full lg:w-[75%] 2xl:w-[80%] flex flex-col gap-6">
            {/* Main Data Grid */}
            <section className="zen-card rounded-lg border border-outline-variant/30 overflow-hidden flex-grow flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30">
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant w-12 text-center uppercase tracking-wider">STT</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-[18%]">Sản Phẩm</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-[12%]">Giá Nhập</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-[30%]">Phân Loại &amp; Số Lượng</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider w-[25%]">Ghi Chú</th>
                      <th className="py-4 px-6 font-label-md text-label-md text-on-surface-variant text-right uppercase tracking-wider w-[10%]">Thành Tiền</th>
                      <th className="py-4 px-6 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {voucherItems.map((item, index) => {
                      // Group variants by color
                      const colorGroups: Record<string, { colorHex?: string, list: typeof item.variants }> = {}
                      item.variants.forEach(v => {
                        if (!colorGroups[v.color]) {
                          colorGroups[v.color] = { colorHex: v.colorHex, list: [] }
                        }
                        colorGroups[v.color].list.push(v)
                      })

                      const totalQty = item.variants.reduce((sum, v) => sum + v.quantity, 0)
                      const productTotalValue = totalQty * item.cost_price

                      return (
                        <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors group">
                          {/* STT */}
                          <td className="py-4 px-6 text-center text-on-surface-variant font-label-md align-middle">{String(index + 1).padStart(2, '0')}</td>

                          {/* Product Info */}
                          <td className="py-4 px-6 align-middle">
                            <div className="flex gap-3 items-center">
                              <div className="w-12 h-12 rounded bg-secondary-fixed overflow-hidden flex-shrink-0 border border-outline-variant/10">
                                <img className="w-full h-full object-cover" src={item.image} alt={item.name} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-primary text-xs line-clamp-2 leading-snug">{item.name}</p>
                                <div className="flex flex-col gap-0.5 mt-0.5">
                                  <span className="font-mono text-[9px] text-on-surface-variant/80 font-bold">Mã: {item.sku}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Cost Price Column */}
                          <td className="py-4 px-6 align-middle">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1">
                                <input
                                  className="w-20 bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary p-0.5 font-bold text-primary focus:ring-0 text-xs font-mono text-left"
                                  type="number"
                                  value={item.cost_price}
                                  min="0"
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0
                                    setVoucherItems(prev => prev.map(p => p.id === item.id ? { ...p, cost_price: val } : p))
                                  }}
                                />
                                <span className="text-xs text-primary font-bold">₫</span>
                              </div>
                              <span className="text-[9px] text-on-surface-variant/70 italic">(Gốc 55%: {Math.round(item.price * 0.55).toLocaleString('vi-VN')}₫)</span>
                            </div>
                          </td>

                          {/* Varieties & Quantities Grid */}
                          <td className="py-4 px-6 align-middle">
                            {(() => {
                              const uniqueSizes = Array.from(new Set(item.variants.map(v => v.size)))
                              const uniqueColors = Array.from(new Set(item.variants.map(v => v.color)))

                              // Case 1: Simple product (No colors and no sizes)
                              if (uniqueColors.length === 1 && uniqueColors[0] === 'Mặc định' && uniqueSizes.length === 1 && uniqueSizes[0] === 'Standard') {
                                return (
                                  <div className="flex items-center gap-1.5 justify-center py-1">
                                    <span className="text-xs text-on-surface-variant font-medium">Số lượng:</span>
                                    <input
                                      className="w-16 bg-transparent border-0 border-b border-outline-variant/30 py-0.5 px-1 font-bold text-center focus:ring-0 text-xs font-mono"
                                      type="number"
                                      value={item.variants[0].quantity}
                                      min="0"
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0
                                        setVoucherItems(prev => prev.map(pItem => {
                                          if (pItem.id !== item.id) return pItem
                                          const updatedVariants = [{ ...pItem.variants[0], quantity: val }]
                                          return { ...pItem, variants: updatedVariants }
                                        }))
                                      }}
                                    />
                                  </div>
                                )
                              }

                              // Case 2: Sizes only (No colors)
                              if (uniqueColors.length === 1 && uniqueColors[0] === 'Mặc định') {
                                return (
                                  <div className="flex flex-wrap gap-x-3 gap-y-2 py-1 justify-start">
                                    {item.variants.map((v, vIdx) => (
                                      <div key={v.sku} className="flex items-center gap-1 bg-surface-container-lowest px-1.5 py-0.5 rounded border border-outline-variant/10">
                                        <span className="text-[10px] text-on-surface-variant/80 font-bold min-w-[12px] text-center">{v.size}</span>
                                        <input
                                          className={`w-9 bg-transparent border-0 border-b py-0.5 px-0.5 font-bold text-center focus:ring-0 text-xs font-mono transition-all ${v.quantity > 0
                                            ? 'border-primary text-primary bg-primary/5 font-extrabold'
                                            : 'border-outline-variant/20 text-on-surface-variant/30'
                                            }`}
                                          type="number"
                                          value={v.quantity}
                                          min="0"
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0
                                            setVoucherItems(prev => prev.map(pItem => {
                                              if (pItem.id !== item.id) return pItem
                                              const updatedVariants = [...pItem.variants]
                                              updatedVariants[vIdx] = { ...updatedVariants[vIdx], quantity: val }
                                              return { ...pItem, variants: updatedVariants }
                                            }))
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                )
                              }

                              // Case 3: Color variants present (with or without sizes) - render structured grid
                              return (
                                <div className="overflow-x-auto min-w-[240px] max-w-[400px] border border-outline-variant/15 rounded-lg p-2.5 bg-surface-container-lowest/30 shadow-[inset_0_1px_4px_rgba(0,0,0,0.01)] scrollbar-thin">
                                  <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                      <tr className="border-b border-outline-variant/20">
                                        <th className="pb-1.5 px-1 font-semibold text-on-surface-variant/70 text-[9px] uppercase tracking-wider">Màu</th>
                                        {uniqueSizes.map(sz => (
                                          <th key={sz} className="pb-1.5 px-1 text-center font-bold text-on-surface-variant/70 text-[9px] uppercase tracking-wider min-w-[36px]">
                                            {sz !== 'Standard' ? sz : 'Std'}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {uniqueColors.map(colorName => {
                                        const colorHex = item.variants.find(v => v.color === colorName)?.colorHex
                                        return (
                                          <tr key={colorName} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container-low/10 transition-colors">
                                            <td className="py-1.5 px-1 font-semibold text-primary text-[10px] flex items-center gap-1.5 min-w-[70px]">
                                              {colorHex && (
                                                <span
                                                  className="w-2.5 h-2.5 rounded-full border border-outline-variant/30 flex-shrink-0"
                                                  style={{ backgroundColor: colorHex }}
                                                />
                                              )}
                                              <span className="truncate max-w-[60px]" title={colorName}>{colorName}</span>
                                            </td>
                                            {uniqueSizes.map(sz => {
                                              const vIdx = item.variants.findIndex(x => x.color === colorName && x.size === sz)
                                              if (vIdx === -1) return <td key={sz} className="py-1.5 px-1 text-center text-on-surface-variant/10">-</td>
                                              const v = item.variants[vIdx]
                                              return (
                                                <td key={sz} className="py-1.5 px-0.5 text-center">
                                                  <input
                                                    className={`w-9 bg-transparent border-0 border-b py-0.5 px-0.5 font-bold text-center focus:ring-0 text-xs font-mono transition-all ${v.quantity > 0
                                                      ? 'border-primary text-primary bg-primary/5 font-extrabold'
                                                      : 'border-outline-variant/20 text-on-surface-variant/30'
                                                      }`}
                                                    type="number"
                                                    value={v.quantity}
                                                    min="0"
                                                    onChange={(e) => {
                                                      const val = parseInt(e.target.value) || 0
                                                      setVoucherItems(prev => prev.map(pItem => {
                                                        if (pItem.id !== item.id) return pItem
                                                        const updatedVariants = [...pItem.variants]
                                                        updatedVariants[vIdx] = { ...updatedVariants[vIdx], quantity: val }
                                                        return { ...pItem, variants: updatedVariants }
                                                      }))
                                                    }}
                                                  />
                                                </td>
                                              )
                                            })}
                                          </tr>
                                        )
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )
                            })()}
                          </td>

                          {/* Note Input */}
                          <td className="py-4 px-6 align-middle">
                            <textarea
                              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded focus:border-primary p-2 font-normal text-on-surface focus:ring-1 focus:ring-primary/20 text-xs resize-y min-h-[60px]"
                              value={item.note || ''}
                              placeholder="Ghi chú dòng..."
                              rows={2}
                              onChange={(e) => {
                                const val = e.target.value
                                setVoucherItems(prev => prev.map(p => p.id === item.id ? { ...p, note: val } : p))
                              }}
                            />
                          </td>

                          {/* Product Total Value */}
                          <td className="py-4 px-6 text-right font-semibold text-primary align-middle font-mono text-sm">
                            {productTotalValue.toLocaleString('vi-VN')} ₫
                          </td>

                          {/* Delete Action */}
                          <td className="py-4 px-6 text-center align-middle">
                            <button
                              onClick={() => {
                                setVoucherItems(prev => prev.filter(x => x.id !== item.id))
                              }}
                              className="text-on-surface-variant/40 hover:text-error transition-colors p-1 bg-transparent border-none cursor-pointer"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      )
                    })}

                    {voucherItems.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-20 text-center text-on-surface-variant opacity-60">
                          <Package className="mx-auto mb-2 opacity-30" size={32} />
                          <p className="text-xs">Chưa có sản phẩm nào trong phiếu nhập. Hãy tìm kiếm sản phẩm bên trái để thêm.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Footer Summary Card */}
            <footer className="zen-card p-8 rounded-lg border border-outline-variant/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {/* Left: Notes */}
                <div className="flex flex-col gap-3">
                  <label className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Ghi chú nhập kho</label>
                  <textarea
                    value={voucherNotes}
                    onChange={(e) => setVoucherNotes(e.target.value)}
                    className="w-full h-32 bg-surface-container-low border border-outline-variant/30 rounded p-4 text-body-md focus:ring-1 focus:ring-primary-container resize-none leading-relaxed text-primary"
                    placeholder="Nhập ghi chú hoặc hướng dẫn bảo quản đặc biệt cho lô hàng này..."
                  />
                </div>

                {/* Right: Financials & Actions */}
                <div className="flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-on-surface-variant font-body-md">Tổng Số Lượng</span>
                      <span className="font-bold text-primary font-headline-sm text-[20px]">{totalQuantity} sản phẩm</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                      <span className="text-on-surface-variant font-body-lg">Tổng Giá Trị Nhập</span>
                      <span className="font-bold text-primary font-headline-md">{totalValue.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-8">
                    <button
                      onClick={() => {
                        setVoucherItems([])
                        setShowCreateVoucher(false)
                      }}
                      className="flex-1 px-6 py-3 border border-outline-variant text-on-surface hover:bg-surface-container-high transition-colors duration-300 font-label-md text-label-md uppercase tracking-wider rounded cursor-pointer bg-transparent"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      onClick={handleConfirmVoucher}
                      disabled={loading}
                      className="flex-[2] px-6 py-3 bg-primary-container text-on-primary-container hover:opacity-90 transition-opacity duration-300 font-label-md text-label-md uppercase tracking-widest rounded flex items-center justify-center gap-2 border-none cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-on-primary-container border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      {loading ? 'Đang xử lý...' : 'Xác Nhận Nhập Kho'}
                    </button>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500 text-left font-sans">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-headline-md text-2xl text-primary font-bold font-serif mb-1">Thống kê nhập sản phẩm</h2>
              <p className="font-body-md text-xs text-on-surface-variant opacity-75">
                Xem lịch sử và trạng thái nhận của các phiếu nhập kho đã tạo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCreateVoucher(true)}
                className="px-6 py-2.5 bg-primary text-white font-semibold text-xs tracking-wider rounded-lg hover:opacity-90 transition-all duration-300 flex items-center gap-2 cursor-pointer border-none font-bold shadow-md shadow-primary/10"
              >
                <Plus size={16} />
                Tạo phiếu nhập kho
              </button>
              <select
                onChange={(e) => handleImportFromStockVoucher(Number(e.target.value))}
                className="px-3 py-2 bg-white border border-outline-variant rounded"
                defaultValue=""
              >
                <option value="" disabled>Chọn phiếu nhập kho</option>
                {stockVouchers.map(v => (
                  <option key={v.id} value={v.id}>{v.voucher_code}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="bg-white rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 overflow-hidden">
            <div className="overflow-x-auto">
              {vouchersLoading && stockVouchers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                  <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                  <p className="text-sm font-medium">Đang tải lịch sử nhập kho...</p>
                </div>
              ) : stockVouchers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/60 italic font-serif">
                  <Package className="mb-2 opacity-40" size={32} />
                  <p className="text-xs">Chưa có phiếu nhập kho nào được ghi nhận.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#faf6f0]/50 border-b border-[#e5e1de]/40">
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
                      <th className="px-6 py-4">STT</th>
                      <th className="px-6 py-4">Mã Phiếu</th>
                      <th className="px-6 py-4">Ngày Nhập</th>
                      <th className="px-6 py-4">Nhà Cung Cấp</th>
                      <th className="px-6 py-4">Số Lượng</th>
                      <th className="px-6 py-4">Tổng Giá Trị</th>
                      <th className="px-6 py-4">Trạng Thái Nhận Hàng</th>
                      <th className="px-6 py-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {stockVouchers.map((v, index) => {
                      const dateFormatted = v.created_at
                        ? new Date(v.created_at).toLocaleDateString('vi-VN')
                        : 'N/A'
                      
                      const getStatusBadge = (st: string) => {
                        if (st === 'Đã nhận') return 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        if (st === 'Đang vận chuyển') return 'bg-blue-50 text-blue-700 border-blue-100'
                        if (st === 'Chờ lấy hàng') return 'bg-amber-50 text-amber-700 border-amber-100'
                        return 'bg-neutral-50 text-neutral-600 border-neutral-100'
                      }

                      return (
                        <tr key={v.id} className="hover:bg-[#fcfaf7]/50 transition-colors group">
                          <td className="px-6 py-4 font-semibold text-on-surface-variant">{index + 1}</td>
                          <td className="px-6 py-4 font-mono font-bold text-primary">{v.voucher_code}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{dateFormatted}</td>
                          <td className="px-6 py-4 font-semibold text-primary">{v.supplier}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{v.total_quantity} sp</td>
                          <td className="px-6 py-4 font-bold text-emerald-700 font-mono">{(v.total_value || 0).toLocaleString('vi-VN')} ₫</td>
                          <td className="px-6 py-4">
                            {v.delivery_status !== 'Đã nhận' ? (
                              <select
                                value={v.delivery_status}
                                onChange={(e) => handleUpdateVoucherStatus(v.id, e.target.value)}
                                className={`inline-block px-2 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wider cursor-pointer bg-transparent outline-none focus:ring-0 ${getStatusBadge(v.delivery_status)}`}
                              >
                                <option value="Chờ lấy hàng" className="text-amber-700 bg-white">Chờ lấy hàng</option>
                                <option value="Đang vận chuyển" className="text-blue-700 bg-white">Đang vận chuyển</option>
                                <option value="Đã nhận" className="text-emerald-700 bg-white">Đã nhận</option>
                              </select>
                            ) : (
                              <span className={`inline-block px-2.5 py-0.5 rounded border text-[9px] uppercase font-bold tracking-wider ${getStatusBadge(v.delivery_status)}`}>
                                {v.delivery_status}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleOpenVoucherDetail(v.id)}
                              className="px-3 py-1.5 border border-primary/30 text-primary hover:bg-primary/5 transition-all text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer bg-transparent"
                            >
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )
    )}

      {activeTab === 'audit' && (
        showCreateAudit ? (
          <div className="w-full bg-[#f9f9f9] rounded-xl border border-outline-variant/20 shadow-[0_32px_64px_-12px_rgba(68,42,34,0.06)] flex flex-col overflow-hidden text-left font-sans animate-in fade-in duration-500">
            {/* Header Section */}
            <header className="flex items-start justify-between p-8 border-b border-outline-variant/10 bg-white">
              <div className="space-y-4">
                <h1 className="font-serif font-bold text-2xl text-primary tracking-tight">Tạo Phiếu Kiểm Kê Kho Hàng</h1>
                <div className="flex flex-wrap gap-6 items-center text-xs">
                  <div className="flex flex-col">
                    <span className="font-caption text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Mã phiếu</span>
                    <input 
                      type="text" 
                      value={auditCode} 
                      onChange={(e) => setAuditCode(e.target.value)} 
                      className="font-mono text-xs text-primary font-bold bg-transparent border-0 border-b border-outline-variant/30 focus:border-primary p-0.5 focus:ring-0 w-44" 
                    />
                  </div>
                  <div className="w-px h-8 bg-outline-variant/30"></div>
                  <div className="flex flex-col">
                    <span className="font-caption text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Người kiểm kê</span>
                    <span className="font-bold text-on-surface">Minh Tâm</span>
                  </div>
                  <div className="w-px h-8 bg-outline-variant/30"></div>
                  <div className="flex items-center gap-2 bg-[#442a22]/5 px-3 py-1 rounded-full border border-[#442a22]/15">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[10px] font-bold text-primary tracking-widest uppercase">ĐANG KIỂM KÊ</span>
                  </div>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setAuditItems([])
                  setShowCreateAudit(false)
                }} 
                className="p-2 hover:bg-secondary-container/50 rounded-full transition-colors duration-300 border-none bg-transparent cursor-pointer flex items-center justify-center"
              >
                <X size={20} className="text-outline" />
              </button>
            </header>

            {/* Action Bar */}
            <section className="px-8 py-6 bg-surface-container-low/50 border-b border-outline-variant/10 relative">
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                  <Search size={20} />
                </span>
                <input 
                  className="w-full pl-12 pr-10 py-4 bg-white border-0 border-b border-outline-variant/30 font-body-md text-sm placeholder:text-outline-variant/60 focus:border-primary transition-all duration-500 focus:ring-1 focus:ring-primary/20 rounded" 
                  placeholder="Quét mã vạch hoặc tìm theo SKU/Tên sản phẩm..." 
                  type="text"
                  value={searchAuditSku}
                  onChange={(e) => {
                    setSearchAuditSku(e.target.value)
                    setShowAuditProductDropdown(true)
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchAndAddAudit(searchAuditSku)}
                  onFocus={() => setShowAuditProductDropdown(true)}
                />
                
                {showAuditProductDropdown && searchAuditSku.trim() && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-outline-variant/30 max-h-[250px] overflow-y-auto z-50 divide-y divide-outline-variant/10">
                    {allProducts
                      .filter((item: any) =>
                        item.name.toLowerCase().includes(searchAuditSku.toLowerCase()) ||
                        item.sku.toLowerCase().includes(searchAuditSku.toLowerCase())
                      )
                      .map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            handleSearchAndAddAudit(item.sku)
                            setShowAuditProductDropdown(false)
                          }}
                          className="p-3 hover:bg-surface-container-lowest transition-colors flex items-center gap-3 cursor-pointer text-xs"
                        >
                          <div className="w-8 h-8 rounded bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/10">
                            <img
                              className="w-full h-full object-cover"
                              src={getImageUrl(item.images?.[0]?.url)}
                              alt={item.name}
                            />
                          </div>
                          <div className="text-left flex-grow">
                            <p className="font-semibold text-primary line-clamp-1">{item.name}</p>
                            <span className="font-mono text-[10px] text-on-surface-variant">SKU: {item.sku}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </section>

            {/* Main Data Grid (Table) */}
            <section className="flex-grow overflow-y-auto min-h-[300px] px-8 py-4 bg-white">
              {(() => {
                const flatAuditVariants = auditItems.flatMap((item, productIdx) => {
                  return item.variants.map((v: any, variantIdx: number) => ({
                    ...v,
                    productId: item.id,
                    productName: item.name,
                    productImage: item.image,
                    productPrice: item.price || 0,
                    productIdx,
                    variantIdx,
                    sku: v.sku || `${item.sku}-${v.size}`
                  }))
                })

                return (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant/20 text-on-surface-variant/80 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-4 w-16">STT</th>
                        <th className="py-4 min-w-[240px]">Sản phẩm</th>
                        <th className="py-4">Mã SKU</th>
                        <th className="py-4 text-right pr-8">Tồn hệ thống</th>
                        <th className="py-4 text-center">Tồn thực tế</th>
                        <th className="py-4 text-right pr-8">Chênh lệch</th>
                        <th className="py-4">Lý do lệch</th>
                        <th className="py-4">Gợi ý</th>
                        <th className="py-4 text-center w-24">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {flatAuditVariants.map((flatItem, idx) => {
                        const diff = flatItem.actualStock - flatItem.systemStock

                        return (
                          <tr key={`${flatItem.productId}-${flatItem.variantIdx}`} className="group hover:bg-[#faf9f9] transition-colors text-xs">
                            {/* STT */}
                            <td className="py-5 font-medium text-on-surface-variant">
                              {String(idx + 1).padStart(2, '0')}
                            </td>
                            {/* Product */}
                            <td className="py-5">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-16 bg-surface-container rounded overflow-hidden flex-shrink-0 border border-outline-variant/10">
                                  <img 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    src={flatItem.productImage} 
                                    alt={flatItem.productName} 
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-serif font-bold text-sm text-primary line-clamp-1">
                                    {flatItem.productName}
                                  </span>
                                  <span className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                                    Phân loại: <strong className="text-primary">{flatItem.color !== 'Mặc định' ? `${flatItem.color} - Size ${flatItem.size}` : `Size ${flatItem.size}`}</strong>
                                  </span>
                                </div>
                              </div>
                            </td>
                            {/* SKU */}
                            <td className="py-5 font-mono text-on-surface-variant">
                              {flatItem.sku}
                            </td>
                            {/* System Stock */}
                            <td className="py-5 text-right pr-8 font-semibold text-primary font-mono text-sm">
                              {flatItem.systemStock}
                            </td>
                            {/* Actual Stock Input */}
                            <td className="py-5">
                              <div className="flex justify-center">
                                <input 
                                  type="number" 
                                  min={0}
                                  value={flatItem.actualStock}
                                  onChange={(e) => handleUpdateAuditItemStock(flatItem.productIdx, flatItem.variantIdx, Number(e.target.value))}
                                  className={`w-16 text-center py-1.5 border-0 border-b transition-colors font-bold font-mono text-sm rounded ${
                                    diff === 0 
                                      ? 'bg-transparent border-outline-variant/30 text-primary focus:border-primary focus:ring-0' 
                                      : diff < 0 
                                        ? 'bg-[#ffdad6]/20 border-error/50 text-error focus:border-error focus:ring-0'
                                        : 'bg-[#e2f5ec] border-emerald-500/50 text-emerald-700 focus:border-emerald-600 focus:ring-0'
                                  }`} 
                                />
                              </div>
                            </td>
                            {/* Discrepancy */}
                            <td className={`py-5 text-right pr-8 font-bold font-mono text-sm`}>
                              <span className={`inline-block px-2.5 py-0.5 rounded ${
                                diff === 0
                                  ? 'text-on-surface-variant'
                                  : diff < 0
                                    ? 'text-error bg-[#ffdad6]/45'
                                    : 'text-emerald-700 bg-[#e2f5ec]'
                              }`}>
                                {diff > 0 ? `+${diff}` : diff}
                              </span>
                            </td>
                            {/* Reason dropdown */}
                            <td className="py-5">
                              {diff !== 0 ? (
                                <select 
                                  value={flatItem.reason}
                                  onChange={(e) => handleUpdateAuditItemReason(flatItem.productIdx, flatItem.variantIdx, e.target.value)}
                                  className="bg-[#eeeeee] border-0 border-b border-outline-variant/30 font-medium text-[11px] text-on-surface-variant py-1.5 px-2 focus:ring-0 focus:border-primary rounded cursor-pointer max-w-[170px]"
                                >
                                  <option value="">Lý do chênh lệch...</option>
                                  <option value="Thất thoát/Mất mát">Thất thoát/Mất mát</option>
                                  <option value="Hỏng hóc/Lỗi hàng">Hỏng hóc/Lỗi hàng</option>
                                  <option value="Sai lệch kiểm đếm cũ">Sai lệch kiểm đếm cũ</option>
                                  <option value="Khác">Khác</option>
                                </select>
                              ) : (
                                <span className="text-outline-variant italic font-mono">--</span>
                              )}
                            </td>
                            {/* Suggestions */}
                            <td className="py-5">
                              {diff === 0 ? (
                                <span className="text-[10px] text-on-surface-variant font-medium">Số lượng khớp</span>
                              ) : diff < 0 ? (
                                <span className="text-[10px] text-error italic">Kiểm tra lại kệ hàng</span>
                              ) : (
                                <span className="text-[10px] text-emerald-700 font-medium">Kiểm tra hàng trả/dư</span>
                              )}
                            </td>
                            {/* Action delete */}
                            <td className="py-5 text-center">
                              <button 
                                type="button"
                                onClick={() => handleRemoveAuditVariant(flatItem.productIdx, flatItem.variantIdx)}
                                className="p-2 text-outline hover:text-error transition-colors bg-transparent border-none cursor-pointer flex items-center justify-center mx-auto"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        )
                      })}

                      {flatAuditVariants.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-20 text-center text-on-surface-variant opacity-60 bg-white">
                            <Package className="mx-auto mb-2 opacity-30" size={32} />
                            <p className="text-xs">Chưa có sản phẩm nào trong danh sách kiểm kê. Hãy tìm kiếm sản phẩm bên trên để bắt đầu.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )
              })()}
            </section>

            {/* Footer Section */}
            <footer className="p-8 bg-surface-container-low border-t border-outline-variant/10 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                {/* Notes Area */}
                <div className="space-y-2">
                  <label className="font-caption text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Ghi chú tổng quát</label>
                  <textarea 
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    className="w-full p-4 bg-white border border-outline-variant/30 focus:border-primary rounded-lg placeholder:italic placeholder:opacity-50 font-body-md text-sm text-primary leading-relaxed resize-none h-32" 
                    placeholder="Nhập ghi chú cho đợt kiểm kê này..."
                  />
                </div>
                {/* Metrics & Summary */}
                <div className="flex flex-col justify-between items-end text-right">
                  {(() => {
                    const flatVariants = auditItems.flatMap((item) => {
                      return item.variants.map((v: any) => ({
                        ...v,
                        productPrice: item.price || 0
                      }))
                    })
                    const totalMatching = flatVariants.filter(v => v.actualStock === v.systemStock).length
                    const totalDiscrepant = flatVariants.filter(v => v.actualStock !== v.systemStock).length
                    const totalValueDiff = flatVariants.reduce((sum, v) => sum + (v.actualStock - v.systemStock) * v.productPrice, 0)

                    return (
                      <div className="space-y-2.5 w-full">
                        <div className="flex items-center justify-end gap-3 text-sm">
                          <span className="text-on-surface-variant font-medium">Tổng sản phẩm khớp:</span>
                          <span className="font-serif font-bold text-primary text-base">{totalMatching} dòng</span>
                        </div>
                        <div className="flex items-center justify-end gap-3 text-sm">
                          <span className="text-on-surface-variant font-medium">Tổng sản phẩm lệch:</span>
                          <span className={`font-serif font-bold text-base ${totalDiscrepant > 0 ? 'text-error' : 'text-primary'}`}>{totalDiscrepant} dòng</span>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-outline-variant/20 text-sm">
                          <span className="text-on-surface-variant font-medium">Tổng giá trị chênh lệch (ước tính):</span>
                          <span className={`font-serif font-bold text-lg font-mono ${totalValueDiff < 0 ? 'text-error' : totalValueDiff > 0 ? 'text-emerald-600' : 'text-primary'}`}>
                            {totalValueDiff > 0 ? `+${totalValueDiff.toLocaleString('vi-VN')} ₫` : `${totalValueDiff.toLocaleString('vi-VN')} ₫`}
                          </span>
                        </div>
                      </div>
                    )
                  })()}

                  {/* CTA Buttons */}
                  <div className="flex items-center gap-4 mt-6">
                    <button 
                      type="button"
                      onClick={() => {
                        setAuditItems([])
                        setShowCreateAudit(false)
                      }}
                      className="px-8 py-3 border border-primary text-primary font-bold hover:bg-secondary-container/20 transition-all duration-300 rounded-lg cursor-pointer bg-transparent text-xs uppercase tracking-wider"
                    >
                      Hủy bỏ
                    </button>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={handleConfirmAudit}
                        disabled={loading}
                        className="px-8 py-3 bg-primary text-[#ffffff] font-bold hover:bg-primary/95 transition-all duration-300 shadow-lg shadow-primary/20 rounded-lg cursor-pointer border-none text-xs uppercase tracking-widest flex items-center gap-2"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        {loading ? 'Đang lưu...' : 'Lưu & Chốt sổ kiểm kê'}
                      </button>
                      <select
                        onChange={(e) => handleImportFromStockVoucher(Number(e.target.value))}
                        className="px-3 py-3 bg-white border border-outline-variant rounded-lg text-xs cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>Nhập từ phiếu kho</option>
                        {stockVouchers.map(v => (
                          <option key={v.id} value={v.id}>{v.voucher_code}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500 text-left font-sans">
            {/* Header Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-headline-md text-2xl text-primary font-bold font-serif mb-1">Nhật ký kiểm kê & điều chỉnh</h2>
                <p className="font-body-md text-xs text-on-surface-variant opacity-75">
                  Lịch sử kiểm kê kho hàng định kỳ và các đợt cân đối tồn kho.
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateAudit(true)
                  setAuditItems([])
                }}
                className="px-6 py-2.5 bg-primary text-white font-semibold text-xs tracking-wider rounded-lg hover:opacity-90 transition-all duration-300 flex items-center gap-2 cursor-pointer border-none font-bold shadow-md shadow-primary/10"
              >
                <Plus size={16} />
                Bắt đầu kiểm kê mới
              </button>
            </div>

            {/* Audits Table */}
            <div className="bg-white rounded-xl shadow-[0_32px_64px_-12px_rgba(68,42,34,0.04)] border border-outline-variant/10 overflow-hidden">
              <div className="overflow-x-auto">
                {auditsLoading && auditVouchers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-medium">Đang tải lịch sử kiểm kê...</p>
                  </div>
                ) : auditVouchers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant/60 italic font-serif">
                    <Package className="mb-2 opacity-40" size={32} />
                    <p className="text-xs">Chưa có phiên kiểm kê nào được lưu trữ.</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[#faf6f0]/50 border-b border-[#e5e1de]/40">
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
                        <th className="px-6 py-4">STT</th>
                        <th className="px-6 py-4">Mã Phiếu</th>
                        <th className="px-6 py-4">Ngày Kiểm</th>
                        <th className="px-6 py-4">Người Kiểm</th>
                        <th className="px-6 py-4">Tổng Sai Lệch</th>
                        <th className="px-6 py-4">Ghi Chú</th>
                        <th className="px-6 py-4 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeee]">
                      {auditVouchers.map((v, index) => {
                        const dateFormatted = v.created_at
                          ? new Date(v.created_at).toLocaleDateString('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                          : 'N/A'
                        
                        return (
                          <tr key={v.id} className="hover:bg-[#fcfaf7]/50 transition-colors group">
                            <td className="px-6 py-4 font-semibold text-on-surface-variant">{index + 1}</td>
                            <td className="px-6 py-4 font-mono font-bold text-primary">{v.voucher_code}</td>
                            <td className="px-6 py-4 text-on-surface-variant">{dateFormatted}</td>
                            <td className="px-6 py-4 font-semibold text-primary">{v.auditor}</td>
                            <td className="px-6 py-4 font-bold text-red-500 font-mono">{v.total_discrepancy} chiếc</td>
                            <td className="px-6 py-4 text-on-surface-variant/70 italic max-w-[200px] truncate">{v.notes || 'Không có ghi chú'}</td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleOpenAuditDetail(v.id)}
                                className="px-3 py-1.5 border border-primary/30 text-primary hover:bg-primary/5 transition-all text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer bg-transparent"
                              >
                                Chi tiết
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )
      )}

      {toastMsg && (
        <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 bg-primary text-white px-6 py-3 rounded shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 border border-white/10">
          <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
          <span className="text-xs font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Success Modal */}
      {successVoucher && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="bg-emerald-50 p-6 flex flex-col items-center justify-center border-b border-emerald-100 relative">
              <button
                onClick={() => setSuccessVoucher(null)}
                className="absolute top-4 right-4 p-2 text-emerald-700 hover:bg-emerald-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-emerald-800 text-center">Nhập Kho Thành Công!</h2>
              <p className="text-emerald-600 text-sm mt-1">Phiếu nhập kho đã được lưu vào hệ thống an toàn.</p>
            </div>

            {/* Body */}
            <div className="p-8">
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm">
                <div>
                  <p className="text-on-surface-variant mb-1 font-medium">Mã Phiếu</p>
                  <p className="font-bold text-primary font-mono">{successVoucher.voucherCode}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant mb-1 font-medium">Thời Gian</p>
                  <p className="font-bold text-primary">{successVoucher.date}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant mb-1 font-medium">Nhà Cung Cấp</p>
                  <p className="font-bold text-primary">{successVoucher.supplierName}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant mb-1 font-medium">Người Nhập</p>
                  <p className="font-bold text-primary">{successVoucher.recipient}</p>
                </div>
              </div>

              <div className="bg-surface-container-low rounded-xl p-6 flex items-center justify-between border border-outline-variant/30">
                <div className="flex flex-col items-center flex-1 border-r border-outline-variant/30">
                  <span className="text-on-surface-variant text-xs uppercase tracking-wider mb-2 font-semibold">Tổng Số Lượng</span>
                  <span className="text-2xl font-bold text-primary">{successVoucher.totalQuantity} <span className="text-sm font-normal text-on-surface-variant">sp</span></span>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <span className="text-on-surface-variant text-xs uppercase tracking-wider mb-2 font-semibold">Tổng Giá Trị</span>
                  <span className="text-2xl font-bold text-emerald-600 font-mono">{successVoucher.totalValue.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-surface-container-lowest p-6 border-t border-outline-variant/20 flex items-center gap-4 justify-end">
              <button
                onClick={() => {
                  window.print()
                }}
                className="px-6 py-2.5 border border-outline-variant text-on-surface hover:bg-surface-container-low rounded-lg font-semibold text-sm flex items-center gap-2 transition-colors cursor-pointer bg-white"
              >
                <Printer size={16} />
                In Phiếu
              </button>
              <button
                onClick={() => setSuccessVoucher(null)}
                className="px-8 py-2.5 bg-primary text-white hover:bg-primary/90 rounded-lg font-bold text-sm transition-colors cursor-pointer border-none shadow-md shadow-primary/20"
              >
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voucher Detail Modal */}
      {selectedVoucherId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setSelectedVoucherId(null)
                setSelectedVoucherDetail(null)
              }}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-lg"
            >
              ✕
            </button>

            {detailModalLoading && !selectedVoucherDetail ? (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium">Đang tải thông tin phiếu nhập kho...</p>
              </div>
            ) : selectedVoucherDetail ? (
              <div className="text-left space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-2xl text-primary mb-1">
                    Chi Tiết Phiếu Nhập Kho
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono font-semibold uppercase tracking-wider">
                    {selectedVoucherDetail.voucher_code}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 text-xs">
                  <div className="space-y-1">
                    <p className="text-on-surface-variant font-medium">Nhà Cung Cấp</p>
                    <p className="font-bold text-primary text-sm">{selectedVoucherDetail.supplier}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-on-surface-variant font-medium">Nhân Viên Tiếp Nhận</p>
                    <p className="font-bold text-primary text-sm">{selectedVoucherDetail.recipient || 'Minh Tâm'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-on-surface-variant font-medium">Trạng Thái Nhận Hàng</p>
                    <div>
                      {selectedVoucherDetail.delivery_status !== 'Đã nhận' ? (
                        <select
                          value={selectedVoucherDetail.delivery_status}
                          onChange={(e) => handleUpdateVoucherStatus(selectedVoucherDetail.id, e.target.value)}
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mt-1 cursor-pointer bg-transparent border outline-none focus:ring-0 ${
                            selectedVoucherDetail.delivery_status === 'Đang vận chuyển' ? 'bg-primary/5 text-primary border border-primary/20' :
                              selectedVoucherDetail.delivery_status === 'Chờ lấy hàng' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                'bg-surface-container-high text-on-surface-variant border border-outline-variant/30'
                          }`}
                        >
                          <option value="Chờ lấy hàng" className="text-amber-700 bg-white">Chờ lấy hàng</option>
                          <option value="Đang vận chuyển" className="text-blue-700 bg-white">Đang vận chuyển</option>
                          <option value="Đã nhận" className="text-emerald-700 bg-white">Đã nhận</option>
                        </select>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider mt-1 bg-emerald-50 text-emerald-700 border border-emerald-100">
                          Đã nhận
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-on-surface-variant font-medium">Ngày Tạo Phiếu</p>
                    <p className="font-semibold text-primary">{new Date(selectedVoucherDetail.created_at).toLocaleDateString('vi-VN')} {new Date(selectedVoucherDetail.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-on-surface-variant font-medium">Ngày Nhận</p>
                    <p className="font-semibold text-primary">{new Date(selectedVoucherDetail.expected_delivery_date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-on-surface-variant font-medium">Thời Gian Nhận Dự Kiến</p>
                    <p className="font-semibold text-primary">{selectedVoucherDetail.delivery_duration_days} ngày</p>
                  </div>
                  {selectedVoucherDetail.notes && (
                    <div className="col-span-full space-y-1 pt-2 border-t border-outline-variant/20">
                      <p className="text-on-surface-variant font-medium">Ghi Chú</p>
                      <p className="font-normal text-primary italic">{selectedVoucherDetail.notes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant/80 border-b border-outline-variant/20 pb-2">Danh sách sản phẩm nhập</h4>
                  <div className="max-h-[300px] overflow-y-auto pr-1 border border-outline-variant/25 rounded-xl divide-y divide-outline-variant/15 scrollbar-thin">
                    {selectedVoucherDetail.items?.map((item: any) => {
                      const itemTotalValue = item.quantity * item.cost_price
                      return (
                        <div key={item.id} className="p-4 hover:bg-surface-container-lowest transition-colors flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/10">
                              <img
                                className="w-full h-full object-cover"
                                src={getImageUrl(item.product_image)}
                                alt={item.product_name}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-primary line-clamp-1">{item.product_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-[9px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant font-bold">SKU: {item.sku}</span>
                                {item.color && (
                                  <span className="text-[10px] text-on-surface-variant font-medium">Phân loại: <strong className="text-primary">{item.color}</strong></span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0">
                            <div className="text-right">
                              <p className="text-[10px] text-on-surface-variant">Giá nhập</p>
                              <p className="font-bold text-primary font-mono">{item.cost_price.toLocaleString('vi-VN')} ₫</p>
                            </div>
                            <div className="text-center min-w-[50px]">
                              <p className="text-[10px] text-on-surface-variant">Số lượng</p>
                              <p className="font-bold text-primary">{item.quantity} sp</p>
                            </div>
                            <div className="text-right min-w-[100px]">
                              <p className="text-[10px] text-on-surface-variant">Thành tiền</p>
                              <p className="font-extrabold text-primary font-mono text-sm">{itemTotalValue.toLocaleString('vi-VN')} ₫</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-surface-container-low rounded-xl p-5 flex items-center justify-between border border-outline-variant/30">
                  <div className="flex flex-col items-center flex-1 border-r border-outline-variant/30">
                    <span className="text-on-surface-variant text-[10px] uppercase tracking-wider mb-1 font-semibold">Tổng Số Lượng</span>
                    <span className="text-xl font-extrabold text-primary">{selectedVoucherDetail.total_quantity} <span className="text-xs font-normal text-on-surface-variant">sp</span></span>
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-on-surface-variant text-[10px] uppercase tracking-wider mb-1 font-semibold">Tổng Giá Trị Nhập</span>
                    <span className="text-xl font-extrabold text-emerald-600 font-mono">{selectedVoucherDetail.total_value.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedVoucherId(null)
                      setSelectedVoucherDetail(null)
                    }}
                    className="px-6 py-2 bg-primary text-white hover:bg-primary/95 transition-all rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-on-surface-variant opacity-60">
                Không thể tải thông tin phiếu nhập kho.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Audit Detail Modal */}
      {selectedAuditId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setSelectedAuditId(null)
                setSelectedAuditDetail(null)
              }}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer border-none bg-transparent font-bold text-lg"
            >
              ✕
            </button>

            {auditDetailLoading && !selectedAuditDetail ? (
              <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium">Đang tải chi tiết phiếu kiểm kê...</p>
              </div>
            ) : selectedAuditDetail ? (
              <div className="text-left space-y-6">
                <div>
                  <h3 className="font-serif font-bold text-2xl text-primary mb-1">
                    Chi Tiết Phiếu Kiểm Kê Kho
                  </h3>
                  <p className="text-xs text-on-surface-variant font-mono font-semibold uppercase tracking-wider">
                    {selectedAuditDetail.voucher_code}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-surface-container-low p-5 rounded-xl border border-outline-variant/30 text-xs">
                  <div className="space-y-1">
                    <p className="text-on-surface-variant font-medium">Nhân Viên Kiểm Kê</p>
                    <p className="font-bold text-primary text-sm">{selectedAuditDetail.auditor || 'Minh Tâm'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-on-surface-variant font-medium">Ngày Kiểm Kê</p>
                    <p className="font-semibold text-primary">
                      {selectedAuditDetail.created_at
                        ? `${new Date(selectedAuditDetail.created_at).toLocaleDateString('vi-VN')} ${new Date(selectedAuditDetail.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-on-surface-variant font-medium">Tổng Chênh Lệch</p>
                    <p className={`font-bold text-sm ${selectedAuditDetail.total_discrepancy !== 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {selectedAuditDetail.total_discrepancy > 0 ? `+${selectedAuditDetail.total_discrepancy}` : selectedAuditDetail.total_discrepancy} chiếc
                    </p>
                  </div>
                  {selectedAuditDetail.notes && (
                    <div className="col-span-full space-y-1 pt-2 border-t border-outline-variant/20">
                      <p className="text-on-surface-variant font-medium">Ghi Chú</p>
                      <p className="font-normal text-primary italic">{selectedAuditDetail.notes}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-on-surface-variant/80 border-b border-outline-variant/20 pb-2">Danh sách sản phẩm kiểm kê</h4>
                  <div className="max-h-[300px] overflow-y-auto pr-1 border border-outline-variant/25 rounded-xl divide-y divide-outline-variant/15 scrollbar-thin">
                    {selectedAuditDetail.items?.map((item: any) => {
                      return (
                        <div key={item.id} className="p-4 hover:bg-surface-container-lowest transition-colors flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-surface-container-high overflow-hidden shrink-0 border border-outline-variant/10">
                              <img
                                className="w-full h-full object-cover"
                                src={getImageUrl(item.product_image)}
                                alt={item.product_name}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-primary line-clamp-1">{item.product_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-[9px] bg-surface-container px-1.5 py-0.5 rounded text-on-surface-variant font-bold">SKU: {item.sku}</span>
                                {item.color && (
                                  <span className="text-[10px] text-on-surface-variant font-medium">Phân loại: <strong className="text-primary">{item.color}</strong></span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0">
                            <div className="text-center min-w-[80px]">
                              <p className="text-[10px] text-on-surface-variant">Tồn hệ thống</p>
                              <p className="font-bold text-primary font-mono">{item.system_stock} sp</p>
                            </div>
                            <div className="text-center min-w-[80px]">
                              <p className="text-[10px] text-on-surface-variant">Thực tế</p>
                              <p className="font-bold text-primary font-mono">{item.actual_stock} sp</p>
                            </div>
                            <div className="text-center min-w-[80px]">
                              <p className="text-[10px] text-on-surface-variant">Chênh lệch</p>
                              <p className={`font-bold font-mono ${item.discrepancy > 0 ? 'text-emerald-600' : item.discrepancy < 0 ? 'text-red-500' : 'text-on-surface-variant/40'}`}>
                                {item.discrepancy > 0 ? `+${item.discrepancy}` : item.discrepancy} sp
                              </p>
                            </div>
                            {item.reason && (
                              <div className="text-right min-w-[120px] max-w-[180px]">
                                <p className="text-[10px] text-on-surface-variant">Lý do</p>
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-surface-container-high text-on-surface-variant font-medium truncate max-w-[170px]" title={item.reason}>
                                  {item.reason}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSelectedAuditId(null)
                      setSelectedAuditDetail(null)
                    }}
                    className="px-6 py-2 bg-primary text-white hover:bg-primary/95 transition-all rounded-lg font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-on-surface-variant opacity-60">
                Không thể tải thông tin phiếu kiểm kê.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast alert notifications */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
