import React, { useState } from 'react'
import { ArrowLeft, Info, Image as ImageIcon, Plus, X } from 'lucide-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { charityService, CharityCampaign } from '../../../services/charityService'
import apiClient from '../../../services/apiClient'
import Toast from '../../../components/ui/Toast'
import { getImageUrl } from '../../../utils/productMapper'

interface AdminCharityEditorProps {
  campaign: CharityCampaign | null
  onBack: () => void
}

export default function AdminCharityEditor({ campaign, onBack }: AdminCharityEditorProps) {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    slogan: campaign?.slogan || '',
    description: campaign?.description || '',
    content: campaign?.content || '',
    quote: campaign?.quote || '',
    address: campaign?.address || '',
    target_amount: campaign?.target_amount || 0,
    image_url: campaign?.image_url || '',
    gallery_images: campaign?.gallery_images || '',
    status: campaign?.status || 'active'
  })

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type?: 'success' | 'info' }>({
    message: '',
    isVisible: false,
    type: 'success',
  })

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, isVisible: true, type })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'target_amount' ? parseFloat(value) || 0 : value
    }))
  }

  const handleContentChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      content: value
    }))
  }

  // Cover Image Upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileData = new FormData()
    fileData.append('file', file)
    fileData.append('folder', 'charity')

    setUploading(true)
    try {
      const res = await apiClient.post<{ url: string }>('/uploads/image', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFormData(prev => ({ ...prev, image_url: res.data.url }))
    } catch (err) {
      console.error('Upload cover image error:', err)
      showToast('Tải ảnh đại diện lên thất bại.', 'info')
    } finally {
      setUploading(false)
    }
  }

  // Gallery Image Upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const fileData = new FormData()
    fileData.append('file', file)
    fileData.append('folder', 'charity')

    setUploadingGallery(true)
    try {
      const res = await apiClient.post<{ url: string }>('/uploads/image', fileData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      const currentList = formData.gallery_images ? formData.gallery_images.split(',').map(s => s.trim()).filter(Boolean) : []
      currentList.push(res.data.url)

      setFormData(prev => ({ ...prev, gallery_images: currentList.join(',') }))
    } catch (err) {
      console.error('Upload gallery image error:', err)
      showToast('Tải ảnh thực tế lên thất bại.', 'info')
    } finally {
      setUploadingGallery(false)
    }
  }

  const handleDeleteGalleryImg = (index: number) => {
    const currentList = formData.gallery_images ? formData.gallery_images.split(',').map(s => s.trim()).filter(Boolean) : []
    currentList.splice(index, 1)
    setFormData(prev => ({ ...prev, gallery_images: currentList.join(',') }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || formData.target_amount <= 0) {
      showToast('Vui lòng điền đầy đủ tên chiến dịch và số tiền mục tiêu hợp lệ.', 'info')
      return
    }

    setSaving(true)
    try {
      if (campaign) {
        await charityService.updateCampaign(campaign.id, formData)
        showToast('Cập nhật thông tin dự án thiện nguyện thành công!', 'success')
      } else {
        await charityService.createCampaign(formData as any)
        showToast('Khởi tạo dự án thiện nguyện mới thành công!', 'success')
      }
      setTimeout(() => {
        onBack()
      }, 1500)
    } catch (err: any) {
      console.error(err)
      showToast(err.response?.data?.detail || 'Đã xảy ra lỗi khi lưu thông tin dự án.', 'info')
    } finally {
      setSaving(false)
    }
  }

  const galleryList = formData.gallery_images
    ? formData.gallery_images.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'image'],
      ['clean']
    ],
  }

  return (
    <div className="space-y-8 animate-fade-in font-sans pb-16">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e5e1de]/60 pb-4 text-left">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary hover:text-[#5d4037] transition-colors border-none bg-transparent cursor-pointer"
          >
            <ArrowLeft size={14} /> Quay lại danh sách
          </button>
          <h2 className="font-serif text-2xl font-bold text-primary mt-1">
            {campaign ? 'Cập nhật Dự án Thiện nguyện' : 'Khởi tạo Chiến dịch Thiện nguyện'}
          </h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-5xl space-y-8 text-left">
        {/* Card 1: Basic Info */}
        <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/20 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-[#e5e1de]/60 pb-4">
            <Info size={20} className="text-primary" />
            <h3 className="font-serif font-bold text-lg text-primary">Thông tin cơ bản</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Tên chiến dịch *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-medium text-sm text-on-surface"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Slogan truyền thông</label>
                <input
                  type="text"
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleInputChange}
                  placeholder="Lan tỏa yêu thương, nảy mầm hạt lành..."
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-medium text-sm text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Mục tiêu (VNĐ) *</label>
                  <div className="flex items-center border-b border-outline-variant">
                    <input
                      type="number"
                      name="target_amount"
                      required
                      min={1000}
                      value={formData.target_amount}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none focus:ring-0 px-0 py-2 font-medium text-sm text-on-surface"
                    />
                    <span className="text-xs text-on-surface-variant font-bold pr-1">đ</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-medium text-sm text-on-surface cursor-pointer"
                  >
                    <option value="active">Đang thực hiện</option>
                    <option value="closing">Sắp hoàn thành</option>
                    <option value="completed">Đã hoàn thành</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Địa chỉ mái ấm / Địa điểm thiện nguyện</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="e.g. Huyện Nhà Bè, TP.HCM"
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-medium text-sm text-on-surface"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Trích dẫn truyền cảm hứng</label>
                <input
                  type="text"
                  name="quote"
                  value={formData.quote}
                  onChange={handleInputChange}
                  placeholder="e.g. Hạnh phúc là khi biết sẻ chia..."
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-2 font-medium text-sm text-on-surface"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Ảnh đại diện chiến dịch *</label>
                <div className="flex flex-col gap-4 mt-2">
                  {formData.image_url ? (
                    <div className="w-full aspect-[16/9] rounded-xl overflow-hidden border border-[#eeeeee] flex-shrink-0 bg-neutral-100">
                      <img src={getImageUrl(formData.image_url)} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full aspect-[16/9] rounded-xl border-2 border-dashed border-outline-variant flex items-center justify-center bg-surface text-on-surface-variant">
                      <span>Chưa có ảnh đại diện</span>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploading}
                      className="block w-full text-xs text-on-surface-variant file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer file:cursor-pointer"
                    />
                    {uploading && <p className="text-[10px] text-primary mt-1 animate-pulse">Đang tải ảnh lên...</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Card 2: Media & Content Detail */}
        <section className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/20 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-[#e5e1de]/60 pb-4">
            <ImageIcon size={20} className="text-primary" />
            <h3 className="font-serif font-bold text-lg text-primary">Nội dung &amp; Album ảnh</h3>
          </div>

          <div className="space-y-8">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Mô tả ngắn</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-primary/20 resize-none text-on-surface"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Mô tả câu chuyện chi tiết (Có thể dùng công cụ để căn chỉnh)</label>
              <div className="bg-white rounded-lg overflow-hidden border border-outline-variant/30">
                <ReactQuill 
                  theme="snow" 
                  value={formData.content} 
                  onChange={handleContentChange}
                  modules={quillModules}
                  className="h-64 mb-12"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Ảnh thực tế dự án (Album)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {galleryList.map((url, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-[#eeeeee]">
                    <img src={getImageUrl(url)} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImg(idx)}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-full p-1.5 border-none cursor-pointer shadow-xs transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <label className="aspect-square rounded-xl bg-surface hover:bg-surface-container-low flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/60 cursor-pointer hover:border-primary transition-all duration-300">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                    className="hidden"
                  />
                  {uploadingGallery ? (
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary animate-spin" />
                  ) : (
                    <>
                      <Plus size={24} className="text-on-surface-variant mb-1" />
                      <span className="text-[10px] font-bold text-on-surface-variant uppercase mt-1">Tải ảnh lên</span>
                    </>
                  )}
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 py-4 border border-primary text-primary font-label-md text-sm font-bold rounded-xl hover:bg-primary-fixed transition-colors cursor-pointer bg-transparent uppercase tracking-wider"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-4 bg-primary text-white font-label-md text-sm font-bold rounded-xl hover:opacity-90 shadow-md transition-all cursor-pointer border-none uppercase tracking-wider disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : (campaign ? 'Lưu chỉnh sửa' : 'Tạo dự án mới')}
          </button>
        </div>
      </form>
      
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
