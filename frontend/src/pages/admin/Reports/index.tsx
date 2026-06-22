import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Award,
  Download,
  Heart,
  ExternalLink,
  Target
} from 'lucide-react'
import { analyticsService, ReportData } from '../../../services/analyticsService'

// Helper format price
const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + ' ₫'
}

export default function AdminReports() {
  const [period, setPeriod] = useState<'7days' | '30days' | 'year'>('30days')
  const [hoveredBarIndex, setHoveredBarIndex] = useState<number | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await analyticsService.getReportData(period)
        if (active) {
          setReportData(data)
        }
      } catch (err: any) {
        console.error(err)
        if (active) {
          setError('Không thể tải báo cáo từ hệ thống. Vui lòng thử lại sau.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => {
      active = false
    }
  }, [period])

  if (!reportData) {
    if (error) {
      return (
        <div className="bg-error/5 border border-error/20 p-6 rounded-xl text-center space-y-4 max-w-md mx-auto mt-12">
          <h3 className="font-serif text-lg font-bold text-error">Đã xảy ra lỗi</h3>
          <p className="text-xs text-on-surface-variant">{error}</p>
          <button
            onClick={() => {
              // Trigger reload
              setReportData(null)
              setError(null)
              setLoading(true)
              analyticsService.getReportData(period)
                .then(data => {
                  setReportData(data)
                  setLoading(false)
                })
                .catch(err => {
                  console.error(err)
                  setError('Không thể tải báo cáo từ hệ thống. Vui lòng thử lại sau.')
                  setLoading(false)
                })
            }}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-primary/95 border-none"
          >
            Thử Lại
          </button>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <p className="text-xs font-semibold text-on-surface-variant/80 tracking-wide font-serif animate-pulse">
          Đang tính toán số liệu thời gian thực...
        </p>
      </div>
    )
  }

  const currentData = reportData
  const isRefreshing = loading

  // Calculate max chart value for scaling SVGs
  const maxChartValue = Math.max(...currentData.chartData.map(d => d.value), 1)

  const handleExport = async () => {
    try {
      await analyticsService.exportReportsCsv(period)
    } catch (err) {
      console.error('Lỗi khi xuất báo cáo:', err)
      alert('Lỗi khi tải xuống tệp báo cáo. Vui lòng thử lại sau.')
    }
  }

  return (
    <div className="page-transition space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-on-surface flex items-center gap-2">
            Báo Cáo Chuyên Sâu
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Phân tích số liệu kinh doanh và đóng góp thiện nguyện tích lũy của Từ Tâm Phục
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Selection Toggle */}
          <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant/30 text-xs">
            {[
              { key: '7days', label: '7 Ngày' },
              { key: '30days', label: '30 Ngày' },
              { key: 'year', label: 'Năm Nay' }
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setPeriod(btn.key as any)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
                  period === btn.key
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface bg-transparent border-none'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Export Report Action */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer bg-transparent"
          >
            <Download size={14} />
            Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 transition-opacity duration-200 ${isRefreshing ? 'opacity-50' : ''}`}>
        {/* Revenue Card */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant tracking-wide uppercase">Doanh thu thuần</span>
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-serif font-bold text-primary">{formatPrice(currentData.summary.revenue)}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp size={12} /> +{currentData.summary.revenueChange}%
              </span>
              <span className="text-on-surface-variant/70">so với kỳ trước</span>
            </div>
          </div>
        </div>

        {/* Gross Profit Card */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#504441] tracking-wide uppercase">Lợi nhuận gộp</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-serif font-bold text-primary">{formatPrice(currentData.summary.gross_profit || 0)}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className={`font-bold flex items-center gap-0.5 ${
                (currentData.summary.gross_profitChange || 0) >= 0 ? 'text-emerald-600' : 'text-error'
              }`}>
                <TrendingUp size={12} className={(currentData.summary.gross_profitChange || 0) >= 0 ? '' : 'rotate-180'} />
                {((currentData.summary.gross_profitChange || 0) >= 0 ? '+' : '')}{currentData.summary.gross_profitChange || 0}%
              </span>
              <span className="text-on-surface-variant/70">so với kỳ trước</span>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant tracking-wide uppercase">Đơn hàng hoàn tất</span>
            <div className="w-8 h-8 rounded-full bg-[#ece0dc] flex items-center justify-center text-primary">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-serif font-bold text-on-surface">{currentData.summary.orders.toLocaleString('vi-VN')}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp size={12} /> +{currentData.summary.ordersChange}%
              </span>
              <span className="text-on-surface-variant/70">so với kỳ trước</span>
            </div>
          </div>
        </div>

        {/* Average Order Value (AOV) Card */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant tracking-wide uppercase">Giá trị đơn trung bình</span>
            <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-serif font-bold text-on-surface">{formatPrice(currentData.summary.aov)}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp size={12} /> +{currentData.summary.aovChange}%
              </span>
              <span className="text-on-surface-variant/70">so với kỳ trước</span>
            </div>
          </div>
        </div>

        {/* Charity Tích lũy Card */}
        <div className="bg-gradient-to-br from-[#fdfbf7] to-[#f7f2eb] p-6 rounded-xl border border-primary/20 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-5 text-primary group-hover:scale-110 transition-transform duration-500">
            <Heart size={120} fill="currentColor" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-primary tracking-wide uppercase">Quỹ Từ Tâm tích lũy</span>
            <div className="w-8 h-8 rounded-full bg-error/10 flex items-center justify-center text-error">
              <Heart size={15} fill="currentColor" />
            </div>
          </div>
          <div className="mt-4 z-10">
            <h3 className="text-xl font-serif font-black text-[#5d4037]">{formatPrice(currentData.summary.charity)}</h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs">
              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                <TrendingUp size={12} strokeWidth={3} /> +{currentData.summary.charityChange}%
              </span>
              <span className="text-[#8c7a74]">trích từ 5% doanh số</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts & Charity Project Section */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isRefreshing ? 'opacity-50' : ''}`}>
        {/* Revenue SVG Line Chart */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-base font-bold text-on-surface">Xu Hướng Doanh Thu</h3>
                <p className="text-[11px] text-on-surface-variant">Thống kê theo từng khoảng giai đoạn thời gian chọn lọc</p>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span>Doanh thu thuần</span>
              </div>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="relative h-60 w-full mt-6 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                <defs>
                  {/* Linear Gradient for fill under the line chart */}
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--md-sys-color-primary, #442a22)" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="var(--md-sys-color-primary, #442a22)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid horizontal lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
                  <line
                    key={idx}
                    x1="0"
                    y1={140 * p + 10}
                    x2="500"
                    y2={140 * p + 10}
                    stroke="#eeeeee"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Chart Line Paths */}
                {(() => {
                  const points = currentData.chartData.map((d, index) => {
                    const x = (index / (currentData.chartData.length - 1)) * 480 + 10
                    const y = 150 - (d.value / maxChartValue) * 110
                    return { x, y }
                  })

                  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
                  const areaD = `${pathD} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`

                  return (
                    <>
                      {/* Smooth Area Gradient Under Line */}
                      <path d={areaD} fill="url(#chartGrad)" />

                      {/* Smooth Line */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="var(--md-sys-color-primary, #442a22)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Chart interaction circles on hover */}
                      {points.map((p, idx) => (
                        <g
                          key={idx}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredBarIndex(idx)}
                          onMouseLeave={() => setHoveredBarIndex(null)}
                        >
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={hoveredBarIndex === idx ? 6 : 4}
                            fill={hoveredBarIndex === idx ? '#442a22' : '#ffffff'}
                            stroke="#442a22"
                            strokeWidth="2"
                            className="transition-all duration-200"
                          />
                        </g>
                      ))}
                    </>
                  )
                })()}
              </svg>

              {/* Chart Tooltips floating above */}
              <AnimatePresence>
                {hoveredBarIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bg-on-surface text-surface p-2.5 rounded-md shadow-lg text-[10px] space-y-0.5 z-20"
                    style={{
                      left: `${(hoveredBarIndex / (currentData.chartData.length - 1)) * 90}%`,
                      bottom: '80px',
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <p className="font-semibold opacity-75">{currentData.chartData[hoveredBarIndex].label}</p>
                    <p className="font-serif font-black text-xs text-[#d4c3be]">
                      {formatPrice(currentData.chartData[hoveredBarIndex].value)}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* X Axis Labels */}
            <div className="flex justify-between px-1.5 mt-2 text-[10px] text-on-surface-variant/75 font-semibold uppercase tracking-wider">
              {currentData.chartData.map((d, index) => (
                <span key={index}>{d.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Charity Details & Active Campaigns */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-on-surface flex items-center gap-1.5">
              <Award size={18} className="text-primary" /> Chiến Dịch Thiện Nguyện
            </h3>
            <p className="text-[11px] text-on-surface-variant mt-1 mb-6">
              Các dự án cộng đồng đang được bảo trợ trích từ doanh thu của Từ Tâm Phục
            </p>

            <div className="space-y-6">
              {currentData.charityProjects.map((project, idx) => {
                const rawPercent = project.target > 0 ? (project.raised / project.target) * 100 : 0
                const percent = rawPercent > 0 && rawPercent < 1
                  ? parseFloat(rawPercent.toFixed(2))
                  : Math.min(100, Math.round(rawPercent))
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between items-start gap-2 text-xs">
                      <div>
                        <h4 className="font-serif font-bold text-[#442a22] leading-snug">{project.name}</h4>
                        <span className="text-[9px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1.5 inline-block">
                          {project.status}
                        </span>
                      </div>
                      <span className="font-bold text-primary text-right">{percent}%</span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-1.5 bg-[#eeeeee] w-full rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-700 rounded-full"
                        style={{ width: `${project.raised > 0 ? Math.max(Number(percent), 1.5) : 0}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-on-surface-variant/80">
                      <span>Đã trích: <b>{formatPrice(project.raised)}</b></span>
                      <span>Mục tiêu: {formatPrice(project.target)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t border-[#eeeeee] pt-4 mt-6 text-center">
            <span className="text-[10px] text-on-surface-variant font-medium flex items-center justify-center gap-1">
              <Target size={12} className="text-primary" /> Cam kết minh bạch tài chính thiện nguyện 100%
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Top Products & Conversion funnel */}
      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 transition-opacity duration-200 ${isRefreshing ? 'opacity-50' : ''}`}>
        {/* Top selling products table */}
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-outline-variant/30 shadow-xs">
          <h3 className="font-serif text-base font-bold text-on-surface mb-1">
            Top Sản Phẩm Bán Chạy Nhất
          </h3>
          <p className="text-[11px] text-on-surface-variant mb-6">
            Thống kê dựa trên số lượng đơn hàng bán ra thành công
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#eeeeee] text-[10px] uppercase tracking-wider text-on-surface-variant/80 font-bold">
                  <th className="pb-3 font-semibold">Tên sản phẩm</th>
                  <th className="pb-3 font-semibold">Phân loại</th>
                  <th className="pb-3 font-semibold text-center">Đã bán</th>
                  <th className="pb-3 font-semibold text-right">Doanh thu</th>
                  <th className="pb-3 font-semibold text-right">Tỷ trọng</th>
                </tr>
              </thead>
              <tbody>
                {currentData.topProducts.map((product, idx) => (
                  <tr key={idx} className="border-b border-[#eeeeee]/60 hover:bg-[#fcfaf7]/50 transition-colors">
                    <td className="py-3.5 font-serif font-bold text-[#442a22] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {product.name}
                    </td>
                    <td className="py-3.5 text-on-surface-variant">{product.category}</td>
                    <td className="py-3.5 text-center font-bold text-on-surface">{product.sales}</td>
                    <td className="py-3.5 text-right font-semibold text-primary">{formatPrice(product.revenue)}</td>
                    <td className="py-3.5 text-right font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-[10px] font-bold">{product.percentage}%</span>
                        <div className="w-12 h-1 bg-[#eeeeee] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${product.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Behavior Metrics (New vs Returning & Traffic Channels) */}
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/30 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-on-surface mb-1">
              Phân Tích Hành Vi Khách Hàng
            </h3>
            <p className="text-[11px] text-on-surface-variant mb-6">
              Hiệu quả chuyển đổi và tương tác của khách hàng tại cửa hàng
            </p>

            <div className="space-y-6">
              {/* Conversion rate display */}
              <div className="p-4 bg-[#fcfaf7] border border-[#d4c3be]/40 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Tỷ lệ chuyển đổi mua hàng</span>
                  <p className="text-2xl font-serif font-black text-primary mt-1">{currentData.summary.conversion}%</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    +{currentData.summary.conversionChange}%
                  </span>
                  <p className="text-[9px] text-on-surface-variant/70 mt-1">Vs tháng trước</p>
                </div>
              </div>

              {/* New vs Returning Customers progress breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-on-surface-variant">Khách hàng mới</span>
                  <span className="text-[#5d4037]">Khách quay lại</span>
                </div>
                <div className="h-3 bg-[#e5e3df] w-full rounded-full overflow-hidden flex">
                  {/* New customers percentage */}
                  <div className="h-full bg-primary" style={{ width: '64%' }} title="64% Khách hàng mới" />
                  {/* Returning customers percentage */}
                  <div className="h-full bg-[#8a726b]" style={{ width: '36%' }} title="36% Khách quay lại" />
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant/80">
                  <span>64% (Mới đăng ký)</span>
                  <span>36% (Quay lại mua tiếp)</span>
                </div>
              </div>

              {/* Conversion Channel List */}
              <div className="space-y-3 pt-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Kênh truy cập phổ biến</span>
                <div className="space-y-2">
                  {(currentData.trafficChannels || []).map((chan: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant font-medium">{chan.name}</span>
                      <span className="font-bold text-[#442a22]">{chan.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#eeeeee] pt-4 mt-6">
            <button className="w-full text-center text-primary hover:text-primary-container text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer bg-transparent border-none">
              Xem báo cáo kênh bán hàng <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
