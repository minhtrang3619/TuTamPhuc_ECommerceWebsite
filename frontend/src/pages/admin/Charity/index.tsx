import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Edit2,
  Filter,
  Download,
  FileText,
  X,
  Users,
  Award,
  Wallet,
  Calendar
} from 'lucide-react'
import { charityService, CharityCampaign, CharityTransaction, CharityOverview } from '../../../services/charityService'
import apiClient from '../../../services/apiClient'

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + ' ₫'
}

export default function AdminCharity() {
  const [overview, setOverview] = useState<CharityOverview | null>(null)
  const [campaigns, setCampaigns] = useState<CharityCampaign[]>([])
  const [transactions, setTransactions] = useState<CharityTransaction[]>([])
  
  // Pagination & Filtering
  const [txPage, setTxPage] = useState(1)
  const [txTotal, setTxTotal] = useState(0)
  const [txType, setTxType] = useState<'all' | 'donation' | 'expense'>('all')
  const [loading, setLoading] = useState(true)
  const [loadingTx, setLoadingTx] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modals state
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<CharityCampaign | null>(null)
  const [isTxModalOpen, setIsTxModalOpen] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Form states
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    slogan: '',
    description: '',
    target_amount: 0,
    image_url: '',
    status: 'active'
  })

  const [txForm, setTxForm] = useState({
    campaign_id: '',
    donor_recipient: '',
    amount: 0,
    transaction_type: 'expense', // default to expense for disburse
    description: ''
  })

  // Load initial data
  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [ovData, campData, txData] = await Promise.all([
        charityService.getOverview(),
        charityService.getCampaigns(),
        charityService.getTransactions(1, 10)
      ])
      setOverview(ovData)
      setCampaigns(campData)
      setTransactions(txData.items)
      setTxTotal(txData.total)
      setTxPage(1)
    } catch (err: any) {
      console.error(err)
      setError('Không thể kết nối máy chủ để tải dữ liệu. Vui lòng tải lại trang.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Load transactions when type changes
  const handleTypeChange = async (type: 'all' | 'donation' | 'expense') => {
    setTxType(type)
    setLoadingTx(true)
    try {
      const data = await charityService.getTransactions(1, 10, type === 'all' ? undefined : type)
      setTransactions(data.items)
      setTxTotal(data.total)
      setTxPage(1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingTx(false)
    }
  }

  // Load more transactions (Tải thêm)
  const handleLoadMore = async () => {
    const nextPage = txPage + 1
    setLoadingTx(true)
    try {
      const data = await charityService.getTransactions(nextPage, 10, txType === 'all' ? undefined : txType)
      setTransactions(prev => [...prev, ...data.items])
      setTxPage(nextPage)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingTx(false)
    }
  }

  // Handle image upload to server
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh hợp lệ.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'charity')

    setUploading(true)
    try {
      const response = await apiClient.post<{ url: string }>('/uploads/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      setCampaignForm(prev => ({ ...prev, image_url: response.data.url }))
    } catch (err) {
      console.error("Upload error:", err)
      alert('Tải ảnh lên thất bại. Vui lòng thử lại.')
    } finally {
      setUploading(false)
    }
  }

  // Handle campaign form submission (Create or Edit)
  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!campaignForm.name || campaignForm.target_amount <= 0) {
      alert('Vui lòng điền tên chiến dịch và số tiền mục tiêu hợp lệ.')
      return
    }

    try {
      if (editingCampaign) {
        await charityService.updateCampaign(editingCampaign.id, {
          name: campaignForm.name,
          slogan: campaignForm.slogan,
          description: campaignForm.description,
          target_amount: campaignForm.target_amount,
          image_url: campaignForm.image_url || undefined,
          status: campaignForm.status
        })
      } else {
        await charityService.createCampaign({
          name: campaignForm.name,
          slogan: campaignForm.slogan,
          description: campaignForm.description,
          target_amount: campaignForm.target_amount,
          image_url: campaignForm.image_url || undefined,
          status: campaignForm.status
        })
      }
      setIsCampaignModalOpen(false)
      setEditingCampaign(null)
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Đã xảy ra lỗi khi lưu chiến dịch.')
    }
  }

  // Handle transaction form submission (Disbursement / Manual Donation)
  const handleTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!txForm.donor_recipient || txForm.amount <= 0) {
      alert('Vui lòng điền đối tượng giao dịch và số tiền hợp lệ.')
      return
    }

    try {
      await charityService.createTransaction({
        campaign_id: txForm.campaign_id ? parseInt(txForm.campaign_id) : undefined,
        donor_recipient: txForm.donor_recipient,
        amount: txForm.amount,
        transaction_type: txForm.transaction_type,
        description: txForm.description || undefined
      })
      setIsTxModalOpen(false)
      setTxForm({
        campaign_id: '',
        donor_recipient: '',
        amount: 0,
        transaction_type: 'expense',
        description: ''
      })
      loadData()
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Đã xảy ra lỗi khi tạo giao dịch.')
    }
  }

  const openEditCampaign = (campaign: CharityCampaign) => {
    setEditingCampaign(campaign)
    setCampaignForm({
      name: campaign.name,
      slogan: campaign.slogan || '',
      description: campaign.description || '',
      target_amount: campaign.target_amount,
      image_url: campaign.image_url || '',
      status: campaign.status
    })
    setIsCampaignModalOpen(true)
  }

  const openDisburseModal = (campaignId?: number) => {
    setTxForm(prev => ({
      ...prev,
      campaign_id: campaignId ? campaignId.toString() : '',
      transaction_type: 'expense'
    }))
    setIsTxModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant/80 tracking-wide font-serif animate-pulse">
          Đang kết nối kho dữ liệu thiện nguyện...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center max-w-md mx-auto mt-12 bg-error/5 border border-error/20 rounded-xl space-y-4">
        <h3 className="font-serif text-lg font-bold text-error">Đã xảy ra lỗi</h3>
        <p className="text-xs text-on-surface-variant">{error}</p>
        <button onClick={loadData} className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 cursor-pointer">
          Thử Lại
        </button>
      </div>
    )
  }

  const totalFund = overview?.total_fund || 0
  const totalDonations = overview?.total_donations || 0
  const totalDonationAmount = campaigns[0]?.raised_amount || 0
  const totalExpenses = Math.max(0, totalDonationAmount - totalFund)

  return (
    <div className="page-transition space-y-12 pb-16 font-sans">
      
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-[#e5e1de]/60 pb-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-serif font-bold text-primary mb-2 flex items-center gap-2">
            Quản Lý Quỹ Thiện Nguyện
          </h1>
          <p className="text-xs text-on-surface-variant opacity-80 leading-relaxed font-serif">
            Chiến dịch thiện nguyện độc quyền và xuyên suốt của Từ Tâm Phục trích 5% giá bán sản phẩm từ các đơn hàng để gieo nhân duyên lành.
          </p>
        </div>
      </section>

      {/* Metrics Row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Fund Card */}
        <div className="bg-surface p-8 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between group hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="p-3 bg-secondary-container/50 rounded-full text-primary">
              <Wallet size={20} />
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Minh bạch 100%
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tổng quỹ hiện tại</h3>
            <p className="text-2xl font-serif font-black text-primary mt-2 flex items-baseline gap-1.5">
              {formatPrice(totalFund)}
            </p>
          </div>
        </div>

        {/* Donation count Card */}
        <div className="bg-surface p-8 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between group hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="p-3 bg-[#ece0dc] rounded-full text-primary">
              <Users size={20} />
            </span>
            <span className="text-[10px] font-bold text-primary-container bg-secondary-container px-2.5 py-0.5 rounded-full border border-outline-variant/40">
              {totalDonations} lượt trích quỹ
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tổng đóng góp trích quỹ</h3>
            <p className="text-2xl font-serif font-black text-on-surface mt-2">
              {formatPrice(totalDonationAmount)}
            </p>
          </div>
        </div>

        {/* Campaign Count Card */}
        <div className="bg-surface p-8 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between group hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="p-3 bg-[#ece0dc] rounded-full text-primary">
              <Award size={20} />
            </span>
            <button
              onClick={() => openDisburseModal(campaigns[0]?.id)}
              className="text-[10px] font-bold text-white bg-[#5d4037] hover:bg-[#442a22] px-3 py-1 rounded border-none cursor-pointer uppercase transition-colors"
            >
              Giải ngân quỹ
            </button>
          </div>
          <div className="mt-6">
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tổng đã giải ngân</h3>
            <p className="text-2xl font-serif font-black text-on-surface mt-2">
              {formatPrice(totalExpenses)}
            </p>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="space-y-6">
        <div className="flex items-end justify-between border-b border-[#e5e1de]/60 pb-3">
          <h2 className="text-lg font-serif font-bold text-primary">Chiến dịch thiện nguyện hiện tại</h2>
        </div>
        <div className="w-full">
          {campaigns.length > 0 && (() => {
            const project = campaigns[0]
            const percent = Math.min(100, Math.round((project.raised_amount / project.target_amount) * 100))
            const statusLabel = project.status === 'completed' 
              ? 'Đã hoàn thành' 
              : project.status === 'closing' 
                ? 'Sắp hoàn thành' 
                : 'Đang thực hiện'
            
            return (
              <div key={project.id} className="group bg-surface rounded-xl border border-outline-variant/30 overflow-hidden flex flex-col md:flex-row min-h-[300px] transition-transform duration-300 hover:scale-[1.002] shadow-xs">
                {/* Image panel */}
                <div className="md:w-2/5 h-64 md:h-auto overflow-hidden relative bg-[#ece0dc]/20 flex items-center justify-center">
                  {project.image_url ? (
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src={project.image_url} alt={project.name} />
                  ) : (
                    <div className="text-primary/30">
                      <Heart size={64} />
                    </div>
                  )}
                </div>
                {/* Content Panel */}
                <div className="p-8 md:w-3/5 flex flex-col justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        project.status === 'completed' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : project.status === 'closing' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-primary/10 text-primary'
                      }`}>
                        {statusLabel}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditCampaign(project)}
                          className="p-1 text-on-surface-variant hover:text-primary transition-colors cursor-pointer border-none bg-transparent"
                          title="Sửa cấu hình chiến dịch"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-serif font-bold text-2xl text-[#442a22] leading-snug">{project.name}</h3>
                    {project.slogan && (
                      <p className="text-xs text-primary font-serif font-semibold italic">
                        Slogan: {project.slogan}
                      </p>
                    )}
                    <p className="text-xs text-on-surface-variant/80 leading-relaxed">{project.description || 'Chưa có mô tả chi tiết cho dự án này.'}</p>
                  </div>
                  
                  {/* Progress Panel */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-[10px] font-semibold text-on-surface-variant/80">
                      <span>Tiến trình đạt được: {percent}%</span>
                      <span className="font-bold text-primary">{formatPrice(project.raised_amount)} / {formatPrice(project.target_amount)}</span>
                    </div>
                    {/* Bar */}
                    <div className="w-full h-2 bg-[#eeeeee] rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
                    </div>
                    {project.status !== 'completed' && (
                      <div className="pt-2 text-right">
                        <button
                          onClick={() => openDisburseModal(project.id)}
                          className="text-[10px] font-bold text-primary hover:text-primary-container bg-transparent border-none cursor-pointer uppercase tracking-wider"
                        >
                          Giải ngân cho chiến dịch
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      </section>

      {/* Transaction History Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e5e1de]/60 pb-3">
          <h2 className="text-lg font-serif font-bold text-primary">Lịch sử giao dịch quỹ</h2>
          <div className="flex items-center gap-3">
            <select
              value={txType}
              onChange={(e) => handleTypeChange(e.target.value as any)}
              className="bg-surface-container border border-outline-variant/30 rounded-lg text-xs font-semibold text-on-surface-variant px-3 py-1.5 focus:ring-1 focus:ring-primary/20"
            >
              <option value="all">Tất cả giao dịch</option>
              <option value="donation">Đóng góp (Thu)</option>
              <option value="expense">Chi phí (Chi)</option>
            </select>
            <button
              onClick={() => handleTypeChange(txType)}
              className="flex items-center gap-1.5 border border-primary text-primary px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/5 transition-colors cursor-pointer bg-transparent"
            >
              <Filter size={12} /> Lọc
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-surface rounded-xl border border-outline-variant/30 overflow-hidden shadow-xs relative">
          {loadingTx && (
            <div className="absolute inset-0 bg-surface/50 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="w-8 h-8 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
            </div>
          )}
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container/30 border-b border-outline-variant/20 font-bold uppercase tracking-wider text-[10px] text-on-surface-variant/80">
                  <th className="px-6 py-4 font-semibold">Ngày</th>
                  <th className="px-6 py-4 font-semibold">Đối tượng</th>
                  <th className="px-6 py-4 font-semibold">Chi tiết giao dịch</th>
                  <th className="px-6 py-4 font-semibold">Phân loại</th>
                  <th className="px-6 py-4 font-semibold text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeee]">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant/70 italic">
                      Chưa ghi nhận giao dịch nào trong khoảng thời gian này.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isDonation = tx.transaction_type === 'donation'
                    const dateFormatted = new Date(tx.created_at).toLocaleDateString('vi-VN')
                    
                    return (
                      <tr key={tx.id} className="hover:bg-[#fcfaf7]/50 transition-colors">
                        <td className="px-6 py-3.5 text-on-surface-variant font-medium flex items-center gap-1.5">
                          <Calendar size={12} className="opacity-60" /> {dateFormatted}
                        </td>
                        <td className="px-6 py-3.5 font-bold text-[#442a22]">{tx.donor_recipient}</td>
                        <td className="px-6 py-3.5 text-on-surface-variant">{tx.description || 'Không có mô tả'}</td>
                        <td className="px-6 py-3.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            isDonation 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-primary/5 text-primary border border-primary/20'
                          }`}>
                            {isDonation ? 'Đóng góp' : 'Chi phí'}
                          </span>
                        </td>
                        <td className={`px-6 py-3.5 text-right font-black text-sm ${isDonation ? 'text-emerald-700' : 'text-primary'}`}>
                          {isDonation ? '+ ' : '- '}{formatPrice(Math.abs(tx.amount))}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Load More Button */}
          {transactions.length < txTotal && (
            <div className="px-6 py-4 bg-surface-container/10 flex justify-center border-t border-[#eeeeee]">
              <button
                onClick={handleLoadMore}
                className="text-xs font-bold text-primary hover:underline underline-offset-4 bg-transparent border-none cursor-pointer uppercase tracking-wider"
              >
                Tải thêm lịch sử
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Reports Section */}
      <section className="bg-primary-container text-on-primary-container p-12 rounded-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-xs border border-primary/10">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-5 text-white pointer-events-none">
          <Heart size={200} fill="currentColor" />
        </div>
        <div className="flex-1 text-center md:text-left relative z-10 space-y-3">
          <h3 className="text-xl font-serif font-black text-white">Minh bạch & Trách nhiệm</h3>
          <p className="text-xs text-[#d4ada1] opacity-90 max-w-xl leading-relaxed">
            Chúng tôi cam kết công khai mọi giao dịch và sao kê định kỳ. Bạn có thể xuất sao kê chi tiết về tình hình thu/chi của quỹ thiện nguyện để duy trì niềm tin trọn vẹn từ khách hàng.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full md:w-auto">
          <button
            onClick={() => alert('Đang tạo báo cáo sao kê tháng hiện tại...')}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download size={14} /> Sao kê kỳ này
          </button>
          <button
            onClick={() => alert('Đang tạo báo cáo thường niên...')}
            className="bg-white text-primary hover:bg-[#ece0dc] px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border-none shadow-md"
          >
            <FileText size={14} /> Báo cáo năm
          </button>
        </div>
      </section>

      {/* CAMPAIGN MODAL (CREATE OR EDIT) */}
      <AnimatePresence>
        {isCampaignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCampaignModalOpen(false)}
              className="absolute inset-0 bg-[#2f3131]/60 backdrop-blur-xs"
            />
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-surface p-8 rounded-xl shadow-xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4 mb-6">
                <h3 className="font-serif text-lg font-bold text-primary">
                  {editingCampaign ? 'Cập Nhật Chiến Dịch' : 'Khởi Tạo Chiến Dịch'}
                </h3>
                <button
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="p-1 hover:bg-[#eeeeee] rounded-full text-on-surface-variant bg-transparent border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCampaignSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Tên chiến dịch *</label>
                  <input
                    type="text"
                    required
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g. Xây trường học Hà Giang"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Slogan chiến dịch *</label>
                  <input
                    type="text"
                    required
                    value={campaignForm.slogan}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, slogan: e.target.value }))}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20"
                    placeholder="e.g. Gieo hạt từ bi – Lan tỏa phúc lành."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Mô tả dự án</label>
                  <textarea
                    rows={3}
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20 resize-none"
                    placeholder="Mô tả mục tiêu và kế hoạch của chiến dịch thiện nguyện..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Mục tiêu (VNĐ) *</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={campaignForm.target_amount}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, target_amount: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Trạng thái</label>
                    <select
                      value={campaignForm.status}
                      onChange={(e) => setCampaignForm(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="active">Đang thực hiện</option>
                      <option value="closing">Sắp hoàn thành</option>
                      <option value="completed">Đã hoàn thành</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Hình ảnh đại diện *</label>
                  <div className="flex items-center gap-4">
                    {campaignForm.image_url && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#eeeeee] flex-shrink-0 bg-neutral-100 flex items-center justify-center">
                        <img src={campaignForm.image_url} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="block w-full text-xs text-on-surface-variant file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer file:cursor-pointer"
                      />
                      {uploading && <p className="text-[10px] text-primary mt-1 animate-pulse">Đang tải ảnh lên...</p>}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={campaignForm.image_url}
                    onChange={(e) => setCampaignForm(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20 mt-2"
                    placeholder="Hoặc nhập URL hình ảnh tại đây..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#eeeeee]">
                  <button
                    type="button"
                    onClick={() => setIsCampaignModalOpen(false)}
                    className="px-4 py-2 border border-[#d4c3be] text-on-surface-variant rounded-lg text-xs font-semibold bg-transparent cursor-pointer"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-white hover:bg-primary/95 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer border-none"
                  >
                    {editingCampaign ? 'Cập Nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISBURSE / ADD TRANSACTION MODAL */}
      <AnimatePresence>
        {isTxModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTxModalOpen(false)}
              className="absolute inset-0 bg-[#2f3131]/60 backdrop-blur-xs"
            />
            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-surface p-8 rounded-xl shadow-xl border border-outline-variant/30 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#eeeeee] pb-4 mb-6">
                <h3 className="font-serif text-lg font-bold text-primary">
                  Ghi nhận Giao dịch Quỹ
                </h3>
                <button
                  onClick={() => setIsTxModalOpen(false)}
                  className="p-1 hover:bg-[#eeeeee] rounded-full text-on-surface-variant bg-transparent border-none cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleTxSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Loại giao dịch</label>
                    <select
                      value={txForm.transaction_type}
                      onChange={(e) => setTxForm(prev => ({ ...prev, transaction_type: e.target.value }))}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="expense">Chi phí (Giải ngân)</option>
                      <option value="donation">Đóng góp (Thu)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Dự án liên kết</label>
                    <select
                      value={txForm.campaign_id}
                      onChange={(e) => setTxForm(prev => ({ ...prev, campaign_id: e.target.value }))}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20"
                    >
                      <option value="">Không liên kết dự án</option>
                      {campaigns.map(c => (
                        <option key={c.id} value={c.id.toString()}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    {txForm.transaction_type === 'expense' ? 'Nhà cung cấp / Đối tượng nhận *' : 'Nhà hảo tâm / Đối tượng thu *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={txForm.donor_recipient}
                    onChange={(e) => setTxForm(prev => ({ ...prev, donor_recipient: e.target.value }))}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20"
                    placeholder={txForm.transaction_type === 'expense' ? 'e.g. Cửa hàng vật liệu HG' : 'e.g. Khách hàng ẩn danh'}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Số tiền giao dịch (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={txForm.amount}
                    onChange={(e) => setTxForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block">Nội dung chi tiết</label>
                  <textarea
                    rows={3}
                    value={txForm.description}
                    onChange={(e) => setTxForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20 resize-none"
                    placeholder="Mô tả lý do thu/chi tiền quỹ..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#eeeeee]">
                  <button
                    type="button"
                    onClick={() => setIsTxModalOpen(false)}
                    className="px-4 py-2 border border-[#d4c3be] text-on-surface-variant rounded-lg text-xs font-semibold bg-transparent cursor-pointer"
                  >
                    Huỷ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-primary text-white hover:bg-primary/95 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer border-none"
                  >
                    Ghi nhận
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  )
}
