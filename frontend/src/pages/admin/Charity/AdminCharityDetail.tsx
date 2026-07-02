import React, { useState, useEffect } from 'react'
import { ArrowLeft, Info, Image as ImageIcon, Download, TrendingUp, ShoppingBag, Lock, Unlock, Plus, X } from 'lucide-react'
import { charityService, CharityCampaign, CharityTransaction } from '../../../services/charityService'
import apiClient from '../../../services/apiClient'
import Toast from '../../../components/ui/Toast'
import { getImageUrl } from '../../../utils/productMapper'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

interface AdminCharityDetailProps {
  campaign: CharityCampaign
  onBack: () => void
}

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + ' ₫'
}

export default function AdminCharityDetail({ campaign, onBack }: AdminCharityDetailProps) {
  const [formData, setFormData] = useState({
    name: campaign.name,
    slogan: campaign.slogan || '',
    description: campaign.description || '',
    content: campaign.content || '',
    quote: campaign.quote || '',
    address: campaign.address || '',
    target_amount: campaign.target_amount,
    image_url: campaign.image_url || '',
    gallery_images: campaign.gallery_images || '',
    status: campaign.status
  })

  const [transactions, setTransactions] = useState<CharityTransaction[]>([])
  const [txTotal, setTxTotal] = useState(0)
  const [txPage, setTxPage] = useState(1)
  const [loadingTx, setLoadingTx] = useState(false)
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

  // Load campaign transactions
  const loadTransactions = async (page: number, replace = false) => {
    setLoadingTx(true)
    try {
      const data = await charityService.getTransactions(page, 10, undefined, campaign.id)
      if (replace) {
        setTransactions(data.items)
      } else {
        setTransactions(prev => [...prev, ...data.items])
      }
      setTxTotal(data.total)
      setTxPage(page)
    } catch (err) {
      console.error('Failed to load transactions:', err)
    } finally {
      setLoadingTx(false)
    }
  }

  useEffect(() => {
    loadTransactions(1, true)
  }, [campaign])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'target_amount' ? parseFloat(value) || 0 : value
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

  // Delete Gallery Image
  const handleDeleteGalleryImg = (index: number) => {
    const currentList = formData.gallery_images ? formData.gallery_images.split(',').map(s => s.trim()).filter(Boolean) : []
    currentList.splice(index, 1)
    setFormData(prev => ({ ...prev, gallery_images: currentList.join(',') }))
  }

  // Save changes
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || formData.target_amount <= 0) {
      showToast('Vui lòng điền đầy đủ tên chiến dịch và số tiền mục tiêu.', 'info')
      return
    }

    setSaving(true)
    try {
      await charityService.updateCampaign(campaign.id, formData)
      showToast('Cập nhật thông tin dự án thiện nguyện thành công!', 'success')
      setTimeout(() => {
        onBack()
      }, 2000)
    } catch (err: any) {
      console.error(err)
      showToast(err.response?.data?.detail || 'Đã xảy ra lỗi khi lưu thông tin dự án.', 'info')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = async () => {
    showToast('Đang kết xuất bảng đối soát giao dịch của dự án thành định dạng CSV/Excel...', 'info')
    try {
      await charityService.exportTransactionsCsv(campaign.id, campaign.name)
      showToast('Xuất báo cáo đối soát thành công!', 'success')
    } catch (err: any) {
      console.error(err)
      showToast('Đã xảy ra lỗi khi xuất báo cáo đối soát.', 'info')
    }
  }

  const handleDisburse = () => {
    showToast(`Bắt đầu quy trình giải ngân kết thúc dự án. Tổng số tiền sẽ giải ngân: ${formatPrice(campaign.raised_amount)}.`, 'info')
  }

  // Calculate percentages
  const rawPercent = campaign.target_amount > 0 ? (campaign.raised_amount / campaign.target_amount) * 100 : 0
  const percent = rawPercent > 0 && rawPercent < 1
    ? parseFloat(rawPercent.toFixed(2))
    : Math.min(100, Math.round(rawPercent))

  const galleryList = formData.gallery_images
    ? formData.gallery_images.split(',').map(s => s.trim()).filter(Boolean)
    : []

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
          <h2 className="font-serif text-2xl font-bold text-primary mt-1">Cập nhật Dự án Thiện nguyện</h2>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Form (40%) */}
        <form onSubmit={handleSubmit} className="w-full lg:w-[42%] space-y-6 text-left">
          {/* Card 1: Basic Info */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-[#e5e1de]/60 pb-3">
              <Info size={18} className="text-primary" />
              <h3 className="font-serif font-bold text-base text-primary">Thông tin cơ bản</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Tên chiến dịch *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-1.5 font-medium text-sm text-on-surface"
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
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-1.5 font-medium text-sm text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Tỷ lệ trích quỹ *</label>
                  <div className="flex items-center border-b border-outline-variant">
                    <input
                      type="text"
                      disabled
                      value="5"
                      className="w-full bg-transparent border-none focus:ring-0 px-0 py-1.5 font-medium text-sm text-on-surface cursor-not-allowed"
                    />
                    <span className="text-xs text-on-surface-variant font-bold pr-1">%</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Số tiền mục tiêu *</label>
                  <div className="flex items-center border-b border-outline-variant">
                    <input
                      type="number"
                      name="target_amount"
                      required
                      min={1000}
                      value={formData.target_amount}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none focus:ring-0 px-0 py-1.5 font-medium text-sm text-on-surface"
                    />
                    <span className="text-xs text-on-surface-variant font-bold pr-1">đ</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Địa chỉ mái ấm</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="e.g. Huyện Nhà Bè, TP.HCM"
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-1.5 font-medium text-sm text-on-surface"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-1.5 font-medium text-sm text-on-surface cursor-pointer"
                  >
                    <option value="active">Đang thực hiện</option>
                    <option value="closing">Sắp hoàn thành</option>
                    <option value="completed">Đã hoàn thành</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Trích dẫn truyền cảm hứng</label>
                <input
                  type="text"
                  name="quote"
                  value={formData.quote}
                  onChange={handleInputChange}
                  placeholder="e.g. Hạnh phúc là khi biết sẻ chia..."
                  className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-1.5 font-medium text-sm text-on-surface"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Ảnh đại diện chiến dịch *</label>
                <div className="flex items-center gap-4 mt-2">
                  {formData.image_url && (
                    <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#eeeeee] flex-shrink-0 bg-neutral-100">
                      <img src={getImageUrl(formData.image_url)} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={uploading}
                      className="block w-full text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer file:cursor-pointer"
                    />
                    {uploading && <p className="text-[10px] text-primary mt-1 animate-pulse">Đang tải ảnh lên...</p>}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Card 2: Media & Content Detail */}
          <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-[#e5e1de]/60 pb-3">
              <ImageIcon size={18} className="text-primary" />
              <h3 className="font-serif font-bold text-base text-primary">Nội dung &amp; Album ảnh</h3>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Ảnh thực tế dự án (Album)</label>
                <div className="grid grid-cols-3 gap-3">
                  {galleryList.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-[#eeeeee]">
                      <img src={getImageUrl(url)} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeleteGalleryImg(idx)}
                        className="absolute top-1 right-1 bg-white/90 hover:bg-red-50 text-red-600 rounded-full p-1 border-none cursor-pointer shadow-xs transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  <label className="aspect-square rounded-lg bg-surface hover:bg-surface-container-low flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/60 cursor-pointer hover:border-primary transition-all duration-300">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleGalleryUpload}
                      disabled={uploadingGallery}
                      className="hidden"
                    />
                    {uploadingGallery ? (
                      <div className="w-5 h-5 border-2 border-primary/20 border-t-primary animate-spin" />
                    ) : (
                      <>
                        <Plus size={18} className="text-on-surface-variant" />
                        <span className="text-[9px] font-bold text-on-surface-variant uppercase mt-1">Tải lên</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Mô tả ngắn</label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20 resize-none text-on-surface"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Mô tả câu chuyện chi tiết</label>
                <div className="bg-white rounded-lg overflow-hidden border border-outline-variant/30">
                  <ReactQuill 
                    theme="snow" 
                    value={formData.content} 
                    onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                    modules={{
                      toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                        [{'list': 'ordered'}, {'list': 'bullet'}],
                        ['link', 'image'],
                        ['clean']
                      ],
                    }}
                    className="h-64 mb-12"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 border border-primary text-primary font-label-md text-xs font-semibold rounded-xl hover:bg-primary-fixed transition-colors cursor-pointer bg-transparent uppercase tracking-wider"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-primary text-white font-label-md text-xs font-semibold rounded-xl hover:opacity-90 shadow-md transition-all cursor-pointer border-none uppercase tracking-wider disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu chỉnh sửa'}
            </button>
          </div>
        </form>

        {/* Right Column: Stats & Reconciliation (60%) */}
        <div className="w-full lg:w-[58%] space-y-6 text-left">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between text-center space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Tổng tiền quỹ hiện tại</p>
              <h4 className="text-xl font-serif font-black text-primary">{formatPrice(campaign.raised_amount)}</h4>
              <div className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center justify-center gap-1 self-center">
                <TrendingUp size={10} />
                <span>+12% vs tuần trước</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between text-center space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Số lượt đóng góp</p>
              <h4 className="text-xl font-serif font-black text-primary">{txTotal}</h4>
              <div className="text-[10px] text-primary bg-[#faf6f0] px-2 py-0.5 rounded border border-[#e5e1de] flex items-center justify-center gap-1 self-center">
                <ShoppingBag size={10} />
                <span>Đơn hàng đóng góp</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-xs flex flex-col justify-between text-center space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant mb-1">Tỷ lệ hoàn thành</p>
              <h4 className="text-xl font-serif font-black text-primary">{percent}%</h4>
              <div className="w-full bg-[#eeeeee] h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-primary h-full rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
              </div>
              <p className="text-[9px] text-on-surface-variant/75 italic text-right">Mục tiêu: {formatPrice(campaign.target_amount)}</p>
            </div>
          </div>

          {/* Reconciliation Table Card */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#e5e1de]/60 flex justify-between items-center bg-surface-container/10">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-primary" />
                <h3 className="font-serif font-bold text-base text-primary">Bảng đối soát đơn hàng trích quỹ</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></span> Đồng bộ tự động
              </span>
            </div>

            <div className="overflow-x-auto relative min-h-[200px]">
              {loadingTx && transactions.length === 0 ? (
                <div className="p-10 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full border-3 border-primary/20 border-t-primary animate-spin mx-auto" />
                  <p className="text-xs text-on-surface-variant font-serif">Đang đối soát lịch sử giao dịch...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="p-10 text-center text-xs text-on-surface-variant/60 italic font-serif">
                  Không có giao dịch nào được ghi nhận cho chiến dịch này.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#faf6f0]/50 border-b border-[#e5e1de]/40">
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/80">
                      <th className="px-5 py-3">Đối tượng / Mã</th>
                      <th className="px-5 py-3">Ngày hoàn tất</th>
                      <th className="px-5 py-3">Giá trị đơn hàng</th>
                      <th className="px-5 py-3 text-right">Trích quỹ (5%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eeeeee]">
                    {transactions.map((tx) => {
                      const isDonation = tx.transaction_type === 'donation'
                      const dateFormatted = new Date(tx.created_at).toLocaleDateString('vi-VN')
                      const estimatedOrderValue = isDonation ? Math.round(tx.amount / 0.05) : 0

                      return (
                        <tr key={tx.id} className="hover:bg-[#fcfaf7]/50 transition-colors">
                          <td className="px-5 py-3 font-semibold text-[#442a22] max-w-[150px] truncate">
                            {tx.donor_recipient}
                          </td>
                          <td className="px-5 py-3 text-on-surface-variant">{dateFormatted}</td>
                          <td className="px-5 py-3 text-on-surface-variant">
                            {isDonation ? formatPrice(estimatedOrderValue) : 'N/A'}
                          </td>
                          <td className={`px-5 py-3 text-right font-bold ${isDonation ? 'text-emerald-700' : 'text-primary'}`}>
                            {isDonation ? '+ ' : '- '}{formatPrice(Math.abs(tx.amount))}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination Load more */}
            {!loadingTx && transactions.length < txTotal && (
              <div className="p-4 border-t border-[#eeeeee] flex justify-center bg-surface-container/10">
                <button
                  onClick={() => loadTransactions(txPage + 1)}
                  className="text-xs font-bold text-primary hover:underline underline-offset-4 bg-transparent border-none cursor-pointer uppercase tracking-wider"
                >
                  Xem thêm {txTotal - transactions.length} giao dịch
                </button>
              </div>
            )}
          </section>

          {/* Action buttons row */}
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button
              onClick={handleExport}
              className="px-5 py-3 border border-outline text-secondary hover:bg-[#eeeeee]/60 transition-colors text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 cursor-pointer bg-transparent"
            >
              <Download size={14} /> Xuất báo cáo Excel / PDF
            </button>

            <button
              onClick={handleDisburse}
              disabled={percent < 100}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 border transition-all ${percent >= 100
                  ? 'bg-primary text-white hover:bg-primary-container border-none cursor-pointer shadow-md'
                  : 'bg-primary/20 text-on-primary-container grayscale border-outline-variant/30 cursor-not-allowed'
                }`}
            >
              {percent >= 100 ? <Unlock size={14} /> : <Lock size={14} />}
              <span>Kết thúc &amp; Giải ngân quỹ</span>
              {percent < 100 && <span className="text-[10px] text-on-primary-container bg-white/20 px-1.5 py-0.5 rounded font-bold">Lock</span>}
            </button>
          </div>
        </div>
      </div>
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  )
}
