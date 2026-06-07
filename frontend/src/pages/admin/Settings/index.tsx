import { useState } from 'react'
import { 
  Store, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  Check, 
  Info
} from 'lucide-react'

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState('shop')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const sections = [
    { id: 'shop', label: 'Thông tin cửa hàng', icon: Store },
    { id: 'payment', label: 'Cấu hình thanh toán', icon: CreditCard },
    { id: 'security', label: 'Bảo mật & Tài khoản', icon: ShieldCheck },
  ]

  return (
    <div className="page-transition space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary">Cài đặt</h1>
          <p className="text-on-surface-variant mt-1">Cấu hình các tham số và tùy chọn hệ thống cho Từ Tâm Phục.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {sections.map((sec) => {
            const Icon = sec.icon
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-label-md transition-all duration-300 ${
                  activeSection === sec.id
                    ? 'bg-primary text-on-primary font-bold shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                }`}
              >
                <Icon size={18} />
                <span>{sec.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content Form */}
        <div className="lg:col-span-3 bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10">
          <form onSubmit={handleSave} className="space-y-6">
            
            {activeSection === 'shop' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-serif font-bold text-primary border-b border-outline-variant/10 pb-3">Cấu hình Cửa Hàng</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Tên cửa hàng</label>
                    <input 
                      type="text" 
                      defaultValue="Từ Tâm Phục" 
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Khẩu hiệu (Slogan)</label>
                    <input 
                      type="text" 
                      defaultValue="Sống trọn vẹn từng khoảnh khắc" 
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant block">Mô tả ngắn</label>
                  <textarea 
                    rows={4}
                    defaultValue="Không gian tịnh thức, cung cấp pháp phục phật tử, áo choàng thiền, phụ kiện thêu đai và chất liệu cao cấp organic như linen, tơ tằm nguyên chất."
                    className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Số điện thoại liên hệ</label>
                    <input 
                      type="text" 
                      defaultValue="0123456789" 
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Email liên hệ</label>
                    <input 
                      type="email" 
                      defaultValue="contact@tutamphuc.vn" 
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'payment' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-serif font-bold text-primary border-b border-outline-variant/10 pb-3">Cấu hình Thanh Toán</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-primary/5 rounded border border-primary/10">
                    <Info size={18} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-primary/80 leading-relaxed">
                      Từ Tâm Phục hỗ trợ thanh toán qua chuyển khoản QR code tự động thông qua API thanh toán và thanh toán khi nhận hàng (COD).
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-on-surface">1. Chuyển khoản ngân hàng (QR Pay)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-primary/20">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-on-surface-variant block">Ngân hàng thụ hưởng</label>
                        <input 
                          type="text" 
                          defaultValue="Vietcombank" 
                          className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-on-surface-variant block">Số tài khoản</label>
                        <input 
                          type="text" 
                          defaultValue="1029384756" 
                          className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-on-surface-variant block">Tên chủ tài khoản</label>
                        <input 
                          type="text" 
                          defaultValue="CONG TY TNHH TU TAM PHUC" 
                          className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <h3 className="font-semibold text-sm text-on-surface">2. Thanh toán khi nhận hàng (COD)</h3>
                    <div className="flex items-center gap-3 pl-4 border-l-2 border-primary/20">
                      <input 
                        type="checkbox" 
                        defaultChecked
                        className="rounded border-outline text-primary focus:ring-primary/20"
                      />
                      <span className="text-sm text-on-surface-variant">Kích hoạt phương thức COD</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-serif font-bold text-primary border-b border-outline-variant/10 pb-3">Bảo Mật Tài Khoản</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                    />
                  </div>
                  <div></div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      placeholder="Tối thiểu 6 ký tự" 
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      placeholder="Nhập lại mật khẩu mới" 
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-outline-variant/10 pt-6">
              {saveSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold animate-in fade-in duration-300">
                  <Check size={14} />
                  <span>Đã lưu thay đổi thành công</span>
                </div>
              )}
              <button 
                type="submit"
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 hover:bg-primary/95 text-label-md font-label-md shadow-sm hover:scale-105 transition-all duration-300 rounded-sm"
              >
                <Save size={16} />
                <span>Lưu cài đặt</span>
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}
