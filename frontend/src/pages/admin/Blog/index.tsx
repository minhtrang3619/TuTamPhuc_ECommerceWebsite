import { useState, useEffect, useMemo, useRef } from 'react'
import {
  PenLine, Search, Pencil, Trash, Layers, X, CheckCircle2,
  Newspaper, TrendingUp, FileSignature, Loader2, Sparkles, ImagePlus, Save, Globe, Archive,
  Bold, Italic, Underline, Heading1, Heading2, List, ListOrdered, Link, Image as ImageIcon
} from 'lucide-react'
import { blogService } from '@/services'
import type { BlogPost, BlogStatus } from '@/types'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

const generateSlug = (str: string) => {
  str = str.toLowerCase()
  // Remove Vietnamese accents
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  str = str.replace(/[đĐ]/g, "d")
  // Remove special characters
  str = str.replace(/([^0-9a-z-\s])/g, "")
  // Replace spaces with -
  str = str.replace(/(\s+)/g, "-")
  // Remove duplicate -
  str = str.replace(/-+/g, "-")
  // Remove leading/trailing -
  str = str.trim().replace(/^-+|-+$/g, "")
  return str
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form State
  const [formId, setFormId] = useState<number | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formExcerpt, setFormExcerpt] = useState('')
  const [formContent, setFormContent] = useState('')
  const [formThumbnail, setFormThumbnail] = useState('')
  const [formStatus, setFormStatus] = useState<BlogStatus>('draft')
  const [formTags, setFormTags] = useState('')
  const [formIsFeatured, setFormIsFeatured] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // SEO Form State
  const [formMetaTitle, setFormMetaTitle] = useState('')
  const [formMetaDescription, setFormMetaDescription] = useState('')
  const [formCategory, setFormCategory] = useState('Tin tức nội bộ')
  const [formScheduled, setFormScheduled] = useState(false)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  // Markdown Formatting Helper
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (!contentRef.current) return
    
    const start = contentRef.current.selectionStart
    const end = contentRef.current.selectionEnd
    const text = formContent
    const selectedText = text.substring(start, end)
    
    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end)
    setFormContent(newText)
    
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus()
        const newCursorPos = start + prefix.length + selectedText.length
        contentRef.current.setSelectionRange(
          suffix ? start + prefix.length : newCursorPos,
          suffix ? newCursorPos : newCursorPos
        )
      }
    }, 0)
  }

  // Load Blog Posts
  const fetchPosts = async () => {
    setIsLoading(true)
    try {
      const res = await blogService.getAllManage(page, pageSize, statusFilter, searchQuery)
      setPosts(res.items || [])
      setTotal(res.total || 0)
      setTotalPages(res.total_pages || 1)
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách bài viết:', err)
      setError('Không thể kết nối đến máy chủ để lấy danh sách bài viết.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [page, statusFilter, searchQuery])

  // Stats Counters
  const stats = useMemo(() => {
    const totalCount = total
    const publishedCount = posts.filter(p => p.status === 'published').length
    const draftCount = posts.filter(p => p.status === 'draft').length
    const totalViews = posts.reduce((sum, p) => sum + (p.view_count || 0), 0)
    return { totalCount, publishedCount, draftCount, totalViews }
  }, [posts, total])

  // Handle auto slug when typing title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setFormTitle(val)
    if (modalMode === 'create') {
      setFormSlug(generateSlug(val))
    }
  }

  // Handle Thumbnail File Upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)
    try {
      const res = await blogService.uploadThumbnail(file)
      setFormThumbnail(res.url)
      showSuccessAlert('Tải ảnh lên thành công!')
    } catch (err: any) {
      console.error('Lỗi khi tải ảnh lên:', err)
      setError('Tải ảnh đại diện thất bại. Định dạng không hợp lệ hoặc kích thước quá 50MB.')
    } finally {
      setIsUploading(false)
    }
  }

  const showSuccessAlert = (message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  // Handle Open Create Modal
  const handleOpenCreate = () => {
    setModalMode('create')
    setFormId(null)
    setFormTitle('')
    setFormSlug('')
    setFormExcerpt('')
    setFormContent('')
    setFormThumbnail('')
    setFormStatus('draft')
    setFormTags('')
    setFormIsFeatured(false)
    setFormMetaTitle('')
    setFormMetaDescription('')
    setFormCategory('Tin tức nội bộ')
    setFormScheduled(false)
    setError(null)
    setIsModalOpen(true)
  }

  // Handle Open Edit Modal
  const handleOpenEdit = (post: BlogPost) => {
    setModalMode('edit')
    setFormId(post.id)
    setFormTitle(post.title)
    setFormSlug(post.slug)
    setFormExcerpt(post.excerpt || '')
    setFormContent(post.content)
    setFormThumbnail(post.thumbnail || '')
    setFormStatus(post.status)
    setFormTags(post.tags ? post.tags.join(', ') : '')
    setFormIsFeatured(post.is_featured || false)
    setFormMetaTitle(post.title)
    setFormMetaDescription(post.excerpt || '')
    setFormCategory('Tin tức nội bộ')
    setFormScheduled(false)
    setError(null)
    setIsModalOpen(true)
  }

  // Handle Save (Create/Edit)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      setError('Vui lòng nhập tiêu đề bài viết.')
      return
    }
    if (!formContent.trim()) {
      setError('Vui lòng soạn thảo nội dung bài viết.')
      return
    }

    const postData = {
      title: formTitle,
      slug: formSlug || generateSlug(formTitle),
      excerpt: formExcerpt || undefined,
      content: formContent,
      thumbnail: formThumbnail || undefined,
      status: formStatus,
      tags: formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : [],
      is_featured: formIsFeatured,
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (modalMode === 'create') {
        await blogService.create(postData)
        showSuccessAlert('Tạo bài viết mới thành công!')
      } else if (modalMode === 'edit' && formId !== null) {
        await blogService.update(formId, postData)
        showSuccessAlert('Cập nhật bài viết thành công!')
      }
      setIsModalOpen(false)
      fetchPosts()
    } catch (err: any) {
      console.error('Lỗi khi lưu bài viết:', err)
      const detail = err.response?.data?.detail || 'Lỗi hệ thống khi lưu bài viết. Vui lòng thử lại.'
      setError(detail)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Quick Toggle Status
  const handleToggleStatus = async (post: BlogPost) => {
    const newStatus: BlogStatus = post.status === 'published' ? 'draft' : 'published'
    try {
      await blogService.update(post.id, { status: newStatus })
      showSuccessAlert(`Đã chuyển bài viết sang trạng thái ${newStatus === 'published' ? 'Xuất bản' : 'Bản nháp'}`)
      fetchPosts()
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái bài viết:', err)
    }
  }

  // Handle Quick Toggle Featured
  const handleToggleFeatured = async (post: BlogPost) => {
    try {
      await blogService.update(post.id, { is_featured: !post.is_featured })
      showSuccessAlert(post.is_featured ? 'Đã hủy đánh dấu nổi bật' : 'Đã đánh dấu bài viết nổi bật')
      fetchPosts()
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái nổi bật:', err)
    }
  }

  // Handle Delete Post
  const handleDeletePost = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác.')) {
      return
    }

    try {
      await blogService.delete(id)
      showSuccessAlert('Xóa bài viết thành công!')
      fetchPosts()
    } catch (err) {
      console.error('Lỗi khi xóa bài viết:', err)
      alert('Không thể xóa bài viết. Vui lòng thử lại sau.')
    }
  }

  return (
    <div className="page-transition space-y-6 max-w-7xl mx-auto p-4 md:p-6 font-sans">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#e5e1de] pb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#442a22] tracking-wide flex items-center gap-2">
            <Newspaper className="text-primary" size={28} /> Quản Lý Blog
          </h1>
          <p className="text-xs text-[#827470] mt-1 font-medium">
            Quản trị nội dung Phật học, tin tức thiện nguyện và truyền tải thông điệp nhân văn của Từ Tâm Phúc.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-[#341d16] text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer shadow-md transition-colors"
        >
          <PenLine size={16} /> Viết Bài Mới
        </button>
      </div>

      {/* Success Notification Alert */}
      {success && (
        <div className="bg-[#f0f9eb] border border-[#e1f3d8] text-[#67c23a] p-4 rounded-xs text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={16} className="bg-[#67c23a] text-white rounded-full p-0.5" />
          {success}
        </div>
      )}

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Posts */}
        <div className="bg-white border border-[#e5e1de]/50 p-5 rounded-sm shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#f4f2f0] rounded-xs text-[#5d4037]">
            <Layers size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#827470]">Tổng bài viết</p>
            <h4 className="text-xl font-bold font-serif text-[#442a22] mt-1">{stats.totalCount}</h4>
          </div>
        </div>

        {/* Published Posts */}
        <div className="bg-white border border-[#e5e1de]/50 p-5 rounded-sm shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#f4f2f0] rounded-xs text-[#5d4037]">
            <Globe size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#827470]">Đã xuất bản</p>
            <h4 className="text-xl font-bold font-serif text-[#442a22] mt-1">{stats.publishedCount}</h4>
          </div>
        </div>

        {/* Draft Posts */}
        <div className="bg-white border border-[#e5e1de]/50 p-5 rounded-sm shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#f4f2f0] rounded-xs text-[#5d4037]">
            <FileSignature size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#827470]">Bản nháp</p>
            <h4 className="text-xl font-bold font-serif text-[#442a22] mt-1">{stats.draftCount}</h4>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-white border border-[#e5e1de]/50 p-5 rounded-sm shadow-xs flex items-center gap-4">
          <div className="p-3 bg-[#f4f2f0] rounded-xs text-[#5d4037]">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#827470]">Lượt xem bài viết</p>
            <h4 className="text-xl font-bold font-serif text-[#442a22] mt-1">{stats.totalViews}</h4>
          </div>
        </div>
      </div>

      {/* Filter and Search Section */}
      <div className="bg-white border border-[#e5e1de]/50 p-4 rounded-sm shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm bài viết theo tiêu đề..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 pl-10 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
          />
          <Search className="absolute left-3 top-2.5 text-[#827470]" size={16} />
        </div>

        <div className="flex gap-3 w-full md:w-auto shrink-0 justify-end">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs outline-none cursor-pointer focus:ring-1 focus:ring-primary"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
          </select>
        </div>
      </div>

      {/* Blog List Table */}
      <div className="bg-white border border-[#e5e1de]/50 rounded-sm shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#827470] gap-2">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="text-xs font-semibold">Đang tải danh sách bài viết...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#827470] gap-2">
            <Archive size={48} className="text-neutral-300" />
            <span className="text-xs font-semibold">Không tìm thấy bài viết nào phù hợp.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f4f2f0]/60 border-b border-[#e5e1de]/60 text-[10px] uppercase font-bold text-[#827470] tracking-wider">
                  <th className="px-6 py-4">Bài viết (Thumbnail & Tiêu đề)</th>
                  <th className="px-6 py-4">Tác giả</th>
                  <th className="px-6 py-4">Ngày tạo</th>
                  <th className="px-6 py-4 text-center">Lượt xem</th>
                  <th className="px-6 py-4 text-center">Nổi bật</th>
                  <th className="px-6 py-4 text-center">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e1de]/30 text-xs">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-[#fafaf9]/60 transition-colors">
                    <td className="px-6 py-4 max-w-sm">
                      <div className="flex gap-4 items-center">
                        <img
                          src={post.thumbnail || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=150&q=80'}
                          alt={post.title}
                          className="w-12 h-12 object-cover rounded-xs border border-neutral-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="font-serif font-bold text-primary truncate" title={post.title}>{post.title}</h4>
                          <p className="text-[10px] text-[#827470] font-mono truncate mt-0.5" title={post.slug}>/{post.slug}</p>
                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {post.tags.slice(0, 3).map((tag, idx) => (
                                <span key={idx} className="px-1.5 py-0.5 bg-[#f4f2f0] text-[#827470] rounded-xs text-[9px] font-semibold">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant font-medium">
                      {post.author?.full_name || 'Quản trị viên'}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant/80 font-mono">
                      {format(new Date(post.created_at), 'dd/MM/yyyy', { locale: vi })}
                    </td>
                    <td className="px-6 py-4 text-center font-mono font-semibold text-primary">
                      {post.view_count || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(post)}
                        className={`p-1.5 rounded-full border transition-colors cursor-pointer inline-flex items-center justify-center ${post.is_featured
                          ? 'bg-[#ffe5d9]/60 border-amber-300 text-amber-600'
                          : 'bg-transparent border-neutral-200 text-neutral-400 hover:text-[#442a22] hover:bg-neutral-100'
                          }`}
                        title={post.is_featured ? 'Bỏ đánh dấu nổi bật' : 'Đánh dấu tin nổi bật'}
                      >
                        <Sparkles size={14} className={post.is_featured ? 'fill-amber-500 stroke-amber-600' : ''} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border inline-block ${post.status === 'published'
                          ? 'bg-[#e1f3d8]/60 text-[#67c23a] border-emerald-300 hover:bg-[#e1f3d8]'
                          : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                          }`}
                        title="Click để thay đổi nhanh trạng thái"
                      >
                        {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleOpenEdit(post)}
                          className="p-2 border border-[#d4c3be]/60 text-primary hover:bg-[#f4f2f0] rounded-xs cursor-pointer transition-colors"
                          title="Chỉnh sửa bài viết"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 border border-red-200 text-red-700 hover:bg-red-50 rounded-xs cursor-pointer transition-colors"
                          title="Xóa bài viết"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-[#e5e1de]/60 bg-white">
            <span className="text-[10px] text-[#827470] font-bold">
              Hiển thị {posts.length} trên {total} bài viết
            </span>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 border border-[#d4c3be] text-xs font-bold rounded-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#eeeeee]/50 transition-colors"
              >
                Trước
              </button>
              <div className="flex gap-0.5 items-center px-2">
                <span className="text-xs font-bold font-mono text-primary">{page}</span>
                <span className="text-xs text-[#827470] font-medium mx-1">/</span>
                <span className="text-xs text-[#827470] font-mono">{totalPages}</span>
              </div>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 border border-[#d4c3be] text-xs font-bold rounded-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#eeeeee]/50 transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Write / Edit Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <div
            onClick={() => {
              if (!isSubmitting) setIsModalOpen(false)
            }}
            className="fixed inset-0 bg-black/45 backdrop-blur-xs cursor-pointer"
          />

          {/* Modal Container */}
          <div className="relative bg-white w-full max-w-4xl rounded-xs shadow-2xl overflow-hidden border border-[#d4c3be]/40 z-10 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-[#e5e1de]/60 shrink-0">
              <h3 className="font-serif text-lg font-bold text-primary tracking-wide uppercase flex items-center gap-2">
                <PenLine size={20} className="text-primary" />
                {modalMode === 'create' ? 'Viết bài mới' : 'Biên tập bài viết'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-1 px-1.5 rounded-full hover:bg-neutral-100 cursor-pointer transition-colors text-neutral-500 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Scroll Area */}
            <form onSubmit={handleSavePost} className="overflow-y-auto flex-1 p-6 md:p-8 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xs text-xs font-bold text-center">
                  {error}
                </div>
              )}

              {/* Title & Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">
                    Tiêu đề bài viết <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={handleTitleChange}
                    placeholder="Ví dụ: Đại lễ Vu Lan báo hiếu và những câu chuyện cảm động"
                    className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">
                    Đường dẫn tĩnh <span className="text-red-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formSlug}
                    onChange={(e) => setFormSlug(generateSlug(e.target.value))}
                    placeholder="dai-le-vu-lan-bao-hieu"
                    className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                  />
                </div>
              </div>

              {/* Thumbnail & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                {/* Thumbnail input */}
                <div className="md:col-span-8 space-y-2">
                  <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-0.5">
                    Ảnh đại diện bài viết (Đường dẫn hoặc Tải lên)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formThumbnail}
                      onChange={(e) => setFormThumbnail(e.target.value)}
                      placeholder="https://images.unsplash.com/... hoặc chọn tải lên từ máy tính"
                      className="flex-1 bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                    />
                    <label className="px-4 py-2 bg-[#f4f2f0] hover:bg-[#e5e1de]/60 text-[#442a22] border border-[#d4c3be] text-xs font-bold uppercase rounded-xs cursor-pointer flex items-center gap-1.5 select-none shrink-0 transition-colors">
                      <ImagePlus size={14} /> Tải ảnh lên
                      <input
                        type="file"
                        accept=".jpg, .jpeg, .png, image/jpeg, image/png"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Uploading loading bar */}
                  {isUploading && (
                    <div className="text-[10px] text-primary font-bold flex items-center gap-1.5 pt-1">
                      <Loader2 className="animate-spin text-primary" size={12} />
                      Đang xử lý tải ảnh lên máy chủ...
                    </div>
                  )}

                  {/* Preview image */}
                  {formThumbnail && (
                    <div className="relative w-36 aspect-[16/10] border border-[#e5e1de] rounded-xs overflow-hidden mt-2 group shadow-xs">
                      <img src={formThumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormThumbnail('')}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity border-0"
                      >
                        <X size={16} /> Gỡ bỏ
                      </button>
                    </div>
                  )}
                </div>

                {/* Category & Tags input */}
                <div className="md:col-span-4 grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">
                      Chuyên mục
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs outline-none cursor-pointer focus:ring-1 focus:ring-primary focus:border-primary"
                    >
                      <option value="Tin tức nội bộ">Tin tức nội bộ</option>
                      <option value="Câu chuyện khách hàng">Câu chuyện khách hàng</option>
                      <option value="Kiến thức chuyên ngành">Kiến thức chuyên ngành</option>
                      <option value="Hoạt động cộng đồng">Hoạt động cộng đồng</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">
                      Thẻ từ khóa (Phân cách bằng dấu phẩy)
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="phat-giao, tu-thien, vu-lan"
                      className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">
                  Trích dẫn ngắn bài viết (Dùng để hiển thị trên danh sách bài viết)
                </label>
                <textarea
                  value={formExcerpt}
                  onChange={(e) => setFormExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Viết một đoạn tóm tắt ngắn khoảng 1-2 câu tóm tắt nội dung bài viết..."
                  className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none font-sans"
                />
              </div>

              {/* Content Body */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">
                  Nội dung chi tiết bài viết <span className="text-red-700">*</span>
                </label>
                <div className="flex items-center gap-1 mb-0 bg-[#f9f9f9] border border-[#d4c3be] border-b-0 rounded-t-xs px-2 py-1.5 overflow-x-auto">
                  <button type="button" onClick={() => insertFormatting('**', '**')} className="p-1.5 hover:bg-[#e5e1de] rounded text-[#5d4037] cursor-pointer transition-colors" title="In đậm"><Bold size={14}/></button>
                  <button type="button" onClick={() => insertFormatting('*', '*')} className="p-1.5 hover:bg-[#e5e1de] rounded text-[#5d4037] cursor-pointer transition-colors" title="In nghiêng"><Italic size={14}/></button>
                  <button type="button" onClick={() => insertFormatting('<u>', '</u>')} className="p-1.5 hover:bg-[#e5e1de] rounded text-[#5d4037] cursor-pointer transition-colors" title="Gạch chân"><Underline size={14}/></button>
                  <div className="w-px h-4 bg-[#d4c3be] mx-1"></div>
                  <button type="button" onClick={() => insertFormatting('# ', '')} className="p-1.5 hover:bg-[#e5e1de] rounded text-[#5d4037] cursor-pointer transition-colors" title="Tiêu đề 1"><Heading1 size={14}/></button>
                  <button type="button" onClick={() => insertFormatting('## ', '')} className="p-1.5 hover:bg-[#e5e1de] rounded text-[#5d4037] cursor-pointer transition-colors" title="Tiêu đề 2"><Heading2 size={14}/></button>
                  <div className="w-px h-4 bg-[#d4c3be] mx-1"></div>
                  <button type="button" onClick={() => insertFormatting('- ', '')} className="p-1.5 hover:bg-[#e5e1de] rounded text-[#5d4037] cursor-pointer transition-colors" title="Danh sách chấm"><List size={14}/></button>
                  <button type="button" onClick={() => insertFormatting('1. ', '')} className="p-1.5 hover:bg-[#e5e1de] rounded text-[#5d4037] cursor-pointer transition-colors" title="Danh sách số"><ListOrdered size={14}/></button>
                  <div className="w-px h-4 bg-[#d4c3be] mx-1"></div>
                  <button type="button" onClick={() => insertFormatting('[', '](url)')} className="p-1.5 hover:bg-[#e5e1de] rounded text-[#5d4037] cursor-pointer transition-colors" title="Chèn liên kết"><Link size={14}/></button>
                  <button type="button" onClick={() => insertFormatting('![alt text](', ')')} className="p-1.5 hover:bg-[#e5e1de] rounded text-[#5d4037] cursor-pointer transition-colors" title="Chèn ảnh"><ImageIcon size={14}/></button>
                </div>
                <textarea
                  ref={contentRef}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={14}
                  placeholder="Hãy viết toàn bộ nội dung bài viết vào đây..."
                  className="w-full bg-white border border-[#d4c3be] rounded-b-xs py-3 px-4 text-xs focus:ring-1 focus:ring-primary outline-none font-sans leading-relaxed"
                />
              </div>

              {/* SEO Configuration */}
              <div className="bg-surface-container-low/20 p-5 rounded-xs border border-outline-variant/30 space-y-4">
                <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
                  <span className="text-[#596244] font-extrabold text-[10px] uppercase tracking-wider">Cấu hình SEO nâng cao</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">Tiêu đề trang</label>
                    <input
                      type="text"
                      value={formMetaTitle}
                      onChange={(e) => setFormMetaTitle(e.target.value)}
                      placeholder="Nếu để trống, sẽ sử dụng tiêu đề bài viết"
                      className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold mb-1.5">Mô tả trang</label>
                    <textarea
                      value={formMetaDescription}
                      onChange={(e) => setFormMetaDescription(e.target.value)}
                      rows={2}
                      placeholder="Mô tả ngắn gọn nội dung bài viết để hiển thị trên kết quả tìm kiếm..."
                      className="w-full bg-white border border-[#d4c3be] rounded-xs py-2 px-3 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Settings Toggle switches */}
              <div className="flex flex-wrap gap-6 pt-3 border-t border-[#e5e1de]/60 items-center">
                {/* Status selector */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] uppercase tracking-wider text-[#5d4037] font-extrabold">Trạng thái:</span>
                  <div className="flex gap-1.5 p-0.5 bg-[#eeeeee]/60 rounded-xs">
                    <button
                      type="button"
                      onClick={() => setFormStatus('draft')}
                      className={`px-3 py-1 rounded-xs text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${formStatus === 'draft' ? 'bg-amber-600 text-white shadow-xs' : 'text-[#827470] hover:text-primary bg-transparent border-0'}`}
                    >
                      Bản nháp
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus('published')}
                      className={`px-3 py-1 rounded-xs text-[10px] uppercase tracking-wider font-extrabold transition-all cursor-pointer ${formStatus === 'published' ? 'bg-[#67c23a] text-white shadow-xs' : 'text-[#827470] hover:text-[#67c23a] bg-transparent border-0'}`}
                    >
                      Xuất bản
                    </button>
                  </div>
                </div>

                {/* Scheduled Publish toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#5d4037] font-bold">
                  <input
                    type="checkbox"
                    checked={formScheduled}
                    onChange={(e) => setFormScheduled(e.target.checked)}
                    className="form-checkbox text-primary focus:ring-primary rounded-xs h-4 w-4 border-[#d4c3be]"
                  />
                  <span>Lên lịch đăng</span>
                </label>

                {/* Comment switch (disabled) */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#5d4037]/65 font-bold opacity-50">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="form-checkbox text-primary focus:ring-primary rounded-xs h-4 w-4 border-[#d4c3be] cursor-not-allowed"
                  />
                  <span>Cho phép bình luận</span>
                </label>

                {/* Featured Checkbox toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#5d4037] font-bold">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                    className="form-checkbox text-primary focus:ring-primary rounded-xs h-4 w-4 border-[#d4c3be]"
                  />
                  <span>Bài viết nổi bật</span>
                </label>
              </div>

              {/* Action buttons footer inside form */}
              <div className="flex justify-end gap-3 pt-6 border-t border-[#e5e1de]/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 border border-[#d4c3be] text-[#5d4037] text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#eeeeee]/50 cursor-pointer disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-primary hover:bg-[#341d16] text-white text-xs font-bold uppercase tracking-wider rounded-xs flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Lưu bài viết
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
