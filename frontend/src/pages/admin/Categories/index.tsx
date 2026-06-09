import { useState, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, FolderOpen, X } from 'lucide-react'
import { categoryService } from '@/services/categoryService'
import type { Category } from '@/types'

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
              className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 hover:border-primary/20 transition-all duration-500 flex flex-col justify-between"
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
                    onClick={() => handleOpenEdit(c)}
                    className="p-1.5 hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleOpenDelete(c)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl max-w-sm w-full shadow-2xl p-6 relative animate-in slide-in-from-bottom-8 duration-500">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors p-1"
            >
              <X size={20} />
            </button>
            <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Xóa danh mục</h3>
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
