import { useState, useEffect } from 'react'
import { 
  DollarSign, 
  ShoppingBag, 
  UserPlus, 
  CheckCircle2, 
  TrendingUp, 
  Leaf, 
  ArrowRight,
  ChevronDown,
  Layers,
  AlertTriangle,
  Clock,
  Truck,
  Lightbulb,
  Sparkles,
  Package,
  Plus
} from 'lucide-react'
import { useAuthStore } from '@/store'

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [animate, setAnimate] = useState(false)
  const [timeRange, setTimeRange] = useState('6 tháng qua')

  useEffect(() => {
    // Meditative entry transition
    const timer = setTimeout(() => setAnimate(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const displayName = user?.full_name || 'Nhân viên'
  const role = user?.role?.toLowerCase() || 'admin'

  // Render Shop Staff Dashboard
  if (role === 'shop_staff') {
    const stats = [
      {
        title: 'Tổng số lượng SKU',
        value: '1.284',
        change: 'Thêm tuần này',
        isPositive: true,
        icon: Layers,
      },
      {
        title: 'Độ chính xác kho',
        value: '98.4%',
        change: 'Kiểm kê 2 ngày trước',
        isPositive: true,
        icon: CheckCircle2,
      },
      {
        title: 'Cảnh báo tồn kho thấp',
        value: '14',
        change: 'Cần xử lý gấp',
        isPositive: false,
        icon: AlertTriangle,
      },
      {
        title: 'Vòng quay tồn kho',
        value: '3.2x',
        change: 'Chu kỳ tháng',
        isPositive: true,
        icon: TrendingUp,
      }
    ]

    const lowStockAlerts = [
      {
        name: 'Linen Meditation Tunic - Ivory',
        sku: 'TTM-LIN-001',
        size: 'M',
        stock: 2,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-0r9w0UXlez8WoOsvxgO85fLYaDHvfNSPMne1BSNk1YJjmvSex7UFvsIGasvaF66872EN4JnCLxAsluu27PkaDstS6Nm1-CsVt8yF1rSM5sI1vxRm8mzQib2a474jl9fhhEqOkzOONmMlb0Uz1LfkBRNU3RkGP2DWqz8qfHAAZ4fQ71MaVMSyeh5fKfKcpNab6gI5RPO3wo6jNwnsWtHA52-7GCx1wiEaSWzuRGW-g-mggYC_-lgL2bqYsLo81oIauFKcAIJ1BEs8'
      },
      {
        name: 'Raw Silk Prayer Pants - Charcoal',
        sku: 'TTM-SIL-042',
        size: 'L',
        stock: 4,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB_SiN5mdcyA0gQltHWIcxyzAckUaKtaedV3mjMd4y6PcUzu-t97JOtyMEN3nOSUw4W_M1amGgHkI2bZzlstCFKkz-tP_SkGN5ssCfk8S4nbyYC8yYkOT9C-lmJGM9wqDh6hEpgBrGLuQ_1aLwk1CH4O6imuCRBii3KiDxqpaw5zbIfTEtD5GDfbnbnyaGGm18jchalHb43uBrjvdqsycXjvKdNxwCdlRkc-_vXTtcJNXjSSYdkjAOMICJB5HWof8oB_JGnrVlk8hGA'
      },
      {
        name: 'Cotton Tie Belt - Earth Brown',
        sku: 'TTM-ACC-091',
        size: 'Oversize',
        stock: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDIT8y8bpfyh1TFkW3U3m0a-I3P_Bhu3AkFvYNGc5nLNI3q1-hnEq3e-Fd9Rms1G1_nwehu1dj4kWKTLHhnhKndUEPciHVGT9OpbSbeZ3J3Q2grZxaBmVN5rp1Hkq55gx3_ifDI38zG-xEZdRHr9H8-mb0VGi_jztFMbU8utHi81sVJ9_I-QBGUZtAinlLTA_KoXtNV3I7KEquRpx7wmEsxPSKFXCBS4s-DirYO-2QmUT3cLpWGSVuY1shqxQ-c6Ek7hWCj2Zt5hFWc'
      }
    ]

    const slowInventory = [
      {
        name: 'Indigo Hand-dyed Wrap',
        stock: 18,
        days: 64,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjWTS0NqOSP6jMnSsad0asgfTc845DLIL-s6OYTNYuZJIvcf4pzj66-Jj--ubssck9h6AzCRPWVLEbw-aoxelvxkzKaGzaFyOZ3AnxSpbF1A_VUNYVhhLY9PshIyFUlP1MCctuFbsnyJwgF6dHbKCBrl1vdFqm_dCX7qlWbDXkmATbTWzBsDtmC9Isc-ge63P3q05unkkfv5e_sKWV5viXKlatutzcnkmvMMjGaA18IEujzaSr7Jl7D543xH1iSbOLpAgl3B8sC7sA'
      },
      {
        name: 'Bamboo Fiber Inner-vest',
        stock: 12,
        days: 78,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5LJWwgoZ3rxHDSXf0Ihs6wAMvt3xT6u1zE_le_NWKjPVgFLGCYbHBJ2BCVy_9rRyTVd-OJH65pAolh_DoW9ROF-QWDXE2MtXFsQ0RQATzWEXaEfUR2A_QAUjUhWdGI03vPOFPg0l8ol9IqascD8_agyMVsqF8Wg4A-29n2_EC8OilkPvUCz5_XAP6rhXL69xTCG0vC4sggkbdQNgwK1kQyeUHG2eKnuW1_NZmgFAWSPIt_OlzcEukOP5mjDdhDNteGkvc2HTkUvw2'
      },
      {
        name: 'Embroidered Sleeve Tunic',
        stock: 5,
        days: 92,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAR0x3r-eqYlXKFGOp2grEA_GVSfhhb1e2jyCIH-Q0Jm87u_cZpqFoHHDJzbn07-OKJt6otmbpmR8-P-d4eeqsF-HRWQoFl0XFQY7t6qilRaWoDtG7crDKVzzzyxzY718pFgUlERk4nHsHmULiNU9eopxDUwHcYTqsjcavk2uAWyXqqHi5pLJFImjQOA165yhey3Lw0jDXwm_oBh84Q_reQzZIBQlhy3Q0I7ansAi7n7fRrERiLTcxAKUeyz-po9FTcoKsKcPka3sUW'
      }
    ]

    return (
      <div className="page-transition space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary mb-2">
              Chào buổi sáng, {displayName}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Cổng thống kê hàng hóa & kiểm kê kho hàng Từ Tâm Phục.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div 
                key={idx} 
                className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">{stat.title}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    stat.isPositive ? 'bg-primary/5 text-primary' : 'bg-red-50 text-red-600'
                  }`}>
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display-lg text-[28px] text-primary">{stat.value}</span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${
                    stat.isPositive ? 'text-on-surface-variant/60' : 'text-red-500'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Center Grid: Alert & Best Sellers */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Low Stock Alerts */}
          <div className="lg:col-span-7 bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-primary">Cảnh báo tồn kho thấp</h3>
                  <p className="font-body-md text-on-surface-variant text-sm mt-1">Sản phẩm hiện tại còn dưới 5 đơn vị.</p>
                </div>
                <AlertTriangle className="text-red-500 opacity-60" size={24} />
              </div>
              
              <div className="space-y-4">
                {lowStockAlerts.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-4 p-4 rounded-lg bg-surface-container-low/30 border-l-4 border-red-500/40 transition-all hover:bg-surface-container-low/60 group"
                  >
                    <div className="w-12 h-12 rounded object-cover overflow-hidden bg-surface-container-low shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-body-md font-semibold text-on-surface truncate">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant/70">SKU: {item.sku} | Size: {item.size}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-headline-sm text-red-600 text-[20px] leading-none">{item.stock}</p>
                      <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/60 mt-1">ĐƠN VỊ</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <button className="mt-8 w-full border border-primary text-primary py-3 hover:bg-primary hover:text-white transition-colors duration-500 font-label-md rounded-sm">
              NHẬP HÀNG TẤT CẢ CẢNH BÁO
            </button>
          </div>

          {/* Top Sellers Chart */}
          <div className="lg:col-span-5 bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 flex flex-col justify-between">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-1">Bán chạy nhất</h3>
              <p className="font-body-md text-on-surface-variant text-sm">Sản phẩm phổ biến theo lượng bán tháng.</p>
            </div>
            
            <div className="flex-grow flex items-end gap-3 h-40 mt-8 mb-6">
              {[
                { label: 'Áo Linen', height: '90%', count: '142 đv' },
                { label: 'Khăn Lụa', height: '65%', count: '98 đv' },
                { label: 'Quần Kaki', height: '45%', count: '45 đv' },
                { label: 'Tọa Cụ', height: '30%', count: '30 đv' }
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div 
                    className="w-full bg-primary rounded-t-sm transition-all duration-[1200ms] ease-out relative cursor-pointer"
                    style={{ 
                      height: animate ? bar.height : '0%',
                      opacity: 1 - idx * 0.2
                    }}
                  >
                    <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[9px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {bar.count}
                    </span>
                  </div>
                  <span className="text-[9px] mt-2 text-center uppercase tracking-tighter text-on-surface-variant font-label-md truncate w-full">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-outline-variant/10 pt-4 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">1. Áo Linen Tọa Thiền</span>
                <span className="font-bold text-primary">142 đơn vị</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface-variant">2. Khăn Lụa Nghi Lễ</span>
                <span className="font-bold text-primary">98 đơn vị</span>
              </div>
            </div>
          </div>
        </div>

        {/* Slow-moving Inventory */}
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary">Hàng tồn kho lâu ngày</h3>
              <p className="font-body-md text-on-surface-variant text-sm mt-1">
                Sản phẩm không biến động trong 60 ngày. Cân nhắc khuyến mãi.
              </p>
            </div>
            <button className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline transition-all">
              Xem tất cả hàng tồn lâu <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {slowInventory.map((item, idx) => (
              <div key={idx} className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 transition-all duration-500 group flex flex-col justify-between">
                <div className="aspect-video relative overflow-hidden bg-surface-container-low shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-outline-variant/20 shadow-sm">
                    <span className="text-[9px] font-bold text-primary tracking-widest uppercase">{item.days} NGÀY TỒN KHO</span>
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-headline-sm text-base text-primary mb-1">{item.name}</h4>
                    <p className="text-xs text-on-surface-variant/80 mb-4">Tồn kho hiện tại: {item.stock} đơn vị</p>
                  </div>
                  <div>
                    <div className="h-1 bg-surface-container-low rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-full opacity-20"></div>
                    </div>
                    <div className="mt-4 flex justify-between items-center text-[10px]">
                      <span className="text-on-surface-variant/60 uppercase tracking-wider">Biến động: 0%</span>
                      <button className="font-semibold text-primary underline underline-offset-4 hover:text-primary-container transition-colors">
                        PHÂN TÍCH XU HƯỚNG
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render Admin (Financial) Dashboard (Default)
  const displayNameAdmin = displayName
  const statsAdmin = [
    {
      title: 'Tổng doanh thu',
      value: '42.850.000₫',
      change: '+12%',
      isPositive: true,
      icon: DollarSign,
    },
    {
      title: 'Tổng đơn hàng',
      value: '1.204',
      change: '+5.2%',
      isPositive: true,
      icon: ShoppingBag,
    },
    {
      title: 'Người dùng mới',
      value: '84',
      change: 'Mới',
      isPositive: true,
      icon: UserPlus,
    },
    {
      title: 'Sản phẩm đang bán',
      value: '312',
      change: 'Đang chạy',
      isPositive: true,
      icon: CheckCircle2,
    }
  ]

  const recentOrdersAdmin = [
    { 
      id: '#TTP-9021', 
      product: 'Áo choàng thiền Linen - Ngà', 
      customer: 'Minh Nguyễn', 
      date: '24 thg 10, 2024', 
      status: 'Đang xử lý', 
      amount: '185.000₫' 
    },
    { 
      id: '#TTP-9020', 
      product: 'Khăn lụa tơ tằm - Indigo', 
      customer: 'Emma Thompson', 
      date: '24 thg 10, 2024', 
      status: 'Đã giao đi', 
      amount: '92.000₫' 
    },
    { 
      id: '#TTP-9019', 
      product: 'Đai thêu trang nghiêm', 
      customer: 'Lê Tú Anh', 
      date: '23 thg 10, 2024', 
      status: 'Đã nhận hàng', 
      amount: '54.000₫' 
    },
    { 
      id: '#TTP-9018', 
      product: 'Áo Tunic Cotton Linen - Đất', 
      customer: 'Kenji Sato', 
      date: '23 thg 10, 2024', 
      status: 'Chờ duyệt', 
      amount: '120.000₫' 
    },
  ]

  const chartBars = [
    { label: 'Th1', height: '45%' },
    { label: 'Th2', height: '60%' },
    { label: 'Th3', height: '40%' },
    { label: 'Th4', height: '85%' },
    { label: 'Th5', height: '55%' },
    { label: 'Th6', height: '75%' },
  ]

  return (
    <div className="page-transition space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Header */}
      <div>
        <h2 className="font-headline-md text-headline-md text-primary mb-2">
          {getGreeting()}, {displayNameAdmin}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Đây là nhịp đập tĩnh lặng của Từ Tâm Phục hôm nay.
        </p>
      </div>

      {/* Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsAdmin.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div 
              key={idx} 
              className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 group hover:border-primary/20 transition-all duration-500"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-on-surface-variant font-label-md text-label-md">{stat.title}</span>
                <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display-lg text-[28px] text-primary">{stat.value}</span>
                <span className={`text-caption font-caption ${
                  stat.change === 'Mới' || stat.change === 'Đang chạy' 
                    ? 'text-secondary' 
                    : 'text-emerald-600'
                } flex items-center`}>
                  {stat.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Middle Section: Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart Area */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-primary">Xu hướng bán hàng</h3>
              <p className="font-caption text-caption text-on-surface-variant">Tóm tắt hiệu suất hàng tháng</p>
            </div>
            <div className="relative">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="appearance-none bg-surface-container-low border-none rounded-lg text-label-md font-label-md pr-10 pl-4 py-2 focus:ring-primary/20 cursor-pointer text-on-surface-variant"
              >
                <option>6 tháng qua</option>
                <option>Năm qua</option>
              </select>
              <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-on-surface-variant pointer-events-none" />
            </div>
          </div>
          <div className="relative h-64 w-full flex items-end gap-4 overflow-hidden">
            {/* Simulated CSS Chart with Meditative Animation */}
            <div className="flex-grow flex items-end justify-between h-full px-2">
              {chartBars.map((bar, idx) => (
                <div 
                  key={idx}
                  className="w-12 bg-primary/10 hover:bg-primary/20 transition-all duration-[1500ms] ease-out rounded-t-sm relative group cursor-pointer"
                  style={{ height: animate ? bar.height : '0%' }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary text-on-primary text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {bar.height}
                  </div>
                </div>
              ))}
            </div>
            {/* Chart Labels */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-outline font-label-md px-2 pt-2 border-t border-outline-variant/20">
              {chartBars.map((bar, idx) => (
                <span key={idx}>{bar.label}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Accent Component */}
        <div className="bg-primary/5 p-8 rounded-xl border border-primary/10 flex flex-col justify-center items-center text-center relative overflow-hidden group min-h-[300px]">
          <div className="absolute inset-0 opacity-10 group-hover:scale-110 transition-transform duration-[2000ms] ease-out">
            <img 
              className="w-full h-full object-cover grayscale" 
              alt="A macro shot of fine linen fabric texture, showcasing the intricate weave and natural fibers." 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvnKFWQ4aIswigYB94XDBhlk10FQkQKrxf-GS0Vk7tNq5HNDHBZovqLCbzsUQYfSguw5NudXQEaKNpF5bnbCf0S2viSoluJPf3yruRs9R4pZ-MVoC_-JMSJYnvfeaJlvisLXUwg2NuTW2E2iyBQn2c6aK2KXtbo6br4ri-xqZjp_W-VF3Us3TVU2tc1DDDHsDSQyYYbjCzWInmhSjQzmtonv5bDbi9CPqbfbaouyC5b0t_oePrbfMPdUfqO2YMoqEAXWRrOQjQaXZ5"
            />
          </div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Leaf size={24} strokeWidth={1.5} />
            </div>
            <h4 className="font-headline-sm text-headline-sm text-primary mb-2">Nghệ thuật mặc</h4>
            <p className="font-body-md text-body-md text-primary/70 mb-6 max-w-[200px]">
              Khám phá tài liệu về tay nghề thủ công của bộ sưu tập mới.
            </p>
            <button className="px-6 py-2 border border-primary text-primary font-label-md text-label-md hover:bg-primary hover:text-white transition-colors duration-500">
              Xem hướng dẫn
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 overflow-hidden">
        <div className="p-8 border-b border-outline-variant/20 flex justify-between items-center">
          <h3 className="font-headline-sm text-headline-sm text-primary">Đơn hàng gần đây</h3>
          <button className="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline transition-all group">
            Xem tất cả 
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Mã đơn hàng</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Sản phẩm</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Khách hàng</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Ngày</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Trạng thái</th>
                <th className="px-8 py-4 font-label-md text-label-md text-on-surface-variant">Số tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {recentOrdersAdmin.map((order, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-8 py-5 font-label-md text-label-md text-on-surface">{order.id}</td>
                  <td className="px-8 py-5 text-on-surface">{order.product}</td>
                  <td className="px-8 py-5 text-on-surface">{order.customer}</td>
                  <td className="px-8 py-5 text-on-surface-variant font-caption text-caption">{order.date}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-label-md uppercase tracking-wider ${
                      order.status === 'Đang xử lý' 
                        ? 'bg-primary/10 text-primary'
                        : order.status === 'Đã giao đi' || order.status === 'Đã nhận hàng'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-surface-variant text-on-surface-variant'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 font-label-md text-label-md text-primary">{order.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chào buổi sáng'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}
