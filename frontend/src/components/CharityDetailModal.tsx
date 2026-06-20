import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Wallet, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react'
import { charityService, CharityCampaign, CharityTransaction } from '../services/charityService'

const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + ' ₫'
}

const getDisplayDescription = (tx: CharityTransaction) => {
  if (tx.transaction_type !== 'donation') {
    return tx.description || 'Chi phí hoạt động';
  }
  const desc = tx.description || '';
  if (!desc.trim() || desc.startsWith('Trích 5%') || desc.includes('đơn hàng')) {
    return 'Gửi vạn điều an lành';
  }
  return desc;
}

interface CharityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: CharityCampaign | null;
}

export default function CharityDetailModal({ isOpen, onClose, campaign }: CharityDetailModalProps) {
  const [transactions, setTransactions] = useState<CharityTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [txType, setTxType] = useState<'all' | 'donation' | 'expense'>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (isOpen && campaign) {
      setTransactions([])
      setPage(1)
      setTxType('all')
      loadTransactions(1, 'all', true)
    }
  }, [isOpen, campaign])

  const loadTransactions = async (pageNum: number, type: 'all' | 'donation' | 'expense', replace = false) => {
    if (!campaign) return
    setLoading(true)
    try {
      const apiType = type === 'all' ? undefined : type
      const data = await charityService.getTransactions(pageNum, 10, apiType, campaign.id)
      if (replace) {
        setTransactions(data.items)
      } else {
        setTransactions(prev => [...prev, ...data.items])
      }
      setTotal(data.total)
      setPage(pageNum)
    } catch (err) {
      console.error("Failed to load transactions for campaign details modal:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (type: 'all' | 'donation' | 'expense') => {
    setTxType(type)
    loadTransactions(1, type, true)
  }

  const handleLoadMore = () => {
    loadTransactions(page + 1, txType, false)
  }

  if (!campaign) return null

  const rawPercent = campaign.target_amount > 0 ? (campaign.raised_amount / campaign.target_amount) * 100 : 0
  const percent = rawPercent > 0 && rawPercent < 1 
    ? parseFloat(rawPercent.toFixed(2)) 
    : Math.min(100, Math.round(rawPercent))

  const statusLabel = campaign.status === 'completed' 
    ? 'Đã hoàn thành' 
    : campaign.status === 'closing' 
      ? 'Sắp hoàn thành' 
      : 'Đang thực hiện'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2f3131]/60 backdrop-blur-xs"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden max-h-[90vh] flex flex-col z-10 font-sans"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#e5e1de]/60 flex items-center justify-between bg-surface-container/20">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-[#ece0dc] rounded-full text-primary">
                  <Award size={18} />
                </span>
                <span className="font-serif font-bold text-lg text-primary">Chi Tiết & Sao Kê Minh Bạch</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-[#eeeeee] rounded-full text-on-surface-variant bg-transparent border-none cursor-pointer transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body (Scrollable) */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              {/* Campaign Basic Info */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {campaign.image_url && (
                  <div className="w-full md:w-1/3 aspect-[4/3] md:aspect-square rounded-xl overflow-hidden bg-[#faf6f0] border border-[#eeeeee] flex-shrink-0">
                    <img src={campaign.image_url} alt={campaign.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      campaign.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : campaign.status === 'closing' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-primary/10 text-primary'
                    }`}>
                      {statusLabel}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#442a22] leading-snug">{campaign.name}</h3>
                  {campaign.slogan && (
                    <p className="text-xs text-primary font-serif font-semibold italic mt-1">
                      {campaign.slogan}
                    </p>
                  )}
                  <p className="text-xs text-[#5d4037] leading-relaxed opacity-90 font-sans">
                    {campaign.description || 'Chưa có mô tả chi tiết.'}
                  </p>
                </div>
              </div>

              {/* Progress Summary Card */}
              <div className="bg-[#faf6f0] border border-[#e5e1de] rounded-xl p-6 space-y-3">
                <div className="flex justify-between items-end text-xs font-semibold text-on-surface-variant/80">
                  <span className="font-serif">Tiến độ quyên góp đạt: <strong className="text-primary text-sm font-sans">{percent}%</strong></span>
                  <span className="font-bold text-primary font-sans">
                    {formatPrice(campaign.raised_amount)} / {formatPrice(campaign.target_amount)}
                  </span>
                </div>
                {/* Bar */}
                <div className="w-full h-2.5 bg-[#eeeeee] rounded-full overflow-hidden border border-[#e5e1de]/50">
                  <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${campaign.raised_amount > 0 ? Math.max(percent, 1.5) : 0}%` }} />
                </div>
              </div>

              {/* Transaction Statement Section (MINH BẠCH GIAO DỊCH) */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#e5e1de]/60 pb-3">
                  <h4 className="text-sm font-serif font-bold text-primary flex items-center gap-1.5">
                    <Wallet size={16} /> Nhật Ký Thu / Chi Của Dự Án
                  </h4>
                  
                  {/* Tabs */}
                  <div className="flex bg-surface-container-low border border-outline-variant/30 rounded-lg p-0.5 text-[11px] font-semibold text-on-surface-variant">
                    <button
                      onClick={() => handleTypeChange('all')}
                      className={`px-2.5 py-1 rounded-md border-none cursor-pointer transition-colors ${
                        txType === 'all' ? 'bg-primary text-white font-bold' : 'bg-transparent hover:bg-surface-container-high'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => handleTypeChange('donation')}
                      className={`px-2.5 py-1 rounded-md border-none cursor-pointer transition-colors ${
                        txType === 'donation' ? 'bg-primary text-white font-bold' : 'bg-transparent hover:bg-surface-container-high'
                      }`}
                    >
                      Đóng góp (Thu)
                    </button>
                    <button
                      onClick={() => handleTypeChange('expense')}
                      className={`px-2.5 py-1 rounded-md border-none cursor-pointer transition-colors ${
                        txType === 'expense' ? 'bg-primary text-white font-bold' : 'bg-transparent hover:bg-surface-container-high'
                      }`}
                    >
                      Chi phí (Chi)
                    </button>
                  </div>
                </div>

                {/* Table/List of transactions */}
                <div className="border border-[#e5e1de] rounded-xl overflow-hidden bg-white shadow-xs relative min-h-[150px]">
                  {loading && transactions.length === 0 ? (
                    <div className="p-8 text-center space-y-2">
                      <div className="w-6 h-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto" />
                      <span className="text-[10px] text-on-surface-variant/80 font-serif">Đang đối soát lịch sử quỹ...</span>
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="p-8 text-center text-xs text-on-surface-variant/70 italic font-serif">
                      Chưa ghi nhận giao dịch nào thuộc phân loại này cho chiến dịch.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-surface-container/30 border-b border-[#e5e1de]/40 font-bold uppercase tracking-wider text-[9px] text-on-surface-variant/80">
                            <th className="px-4 py-3">Ngày</th>
                            <th className="px-4 py-3">Đối tượng</th>
                            <th className="px-4 py-3">Nội dung</th>
                            <th className="px-4 py-3 text-right">Số tiền</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eeeeee]">
                          {transactions.map((tx) => {
                            const isDonation = tx.transaction_type === 'donation'
                            const dateFormatted = new Date(tx.created_at).toLocaleDateString('vi-VN')
                            return (
                              <tr key={tx.id} className="hover:bg-[#fcfaf7]/50 transition-colors">
                                <td className="px-4 py-2.5 text-on-surface-variant font-medium whitespace-nowrap">
                                  <span className="flex items-center gap-1">
                                    <Calendar size={10} className="opacity-50" /> {dateFormatted}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5 font-bold text-[#442a22] whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                                  {tx.donor_recipient}
                                </td>
                                <td className="px-4 py-2.5 text-on-surface-variant">
                                  {getDisplayDescription(tx)}
                                </td>
                                <td className="px-4 py-2.5 text-right whitespace-nowrap">
                                  <span className={`inline-flex items-center gap-0.5 font-bold text-xs ${isDonation ? 'text-emerald-700' : 'text-primary'}`}>
                                    {isDonation ? (
                                      <><ArrowUpRight size={10} /> +</>
                                    ) : (
                                      <><ArrowDownRight size={10} /> -</>
                                    )}
                                    {formatPrice(Math.abs(tx.amount))}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Load more */}
                  {!loading && transactions.length < total && (
                    <div className="px-4 py-2.5 bg-surface-container/10 flex justify-center border-t border-[#eeeeee]">
                      <button
                        onClick={handleLoadMore}
                        className="text-[10px] font-bold text-primary hover:underline underline-offset-4 bg-transparent border-none cursor-pointer uppercase tracking-wider"
                      >
                        Tải thêm lịch sử
                      </button>
                    </div>
                  )}
                  {loading && transactions.length > 0 && (
                    <div className="px-4 py-2 flex justify-center border-t border-[#eeeeee]">
                      <div className="w-4 h-4 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-[#e5e1de]/60 bg-surface-container/20 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#5d4037] hover:bg-[#442a22] text-white text-xs font-bold uppercase tracking-wider rounded-lg border-none cursor-pointer transition-colors shadow-sm"
              >
                Đồng Ý
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
