import { useState, useEffect } from 'react'
import apiClient from '@/services/apiClient'
import { 
  Store, 
  CreditCard, 
  ShieldCheck, 
  Save, 
  Check, 
  Info,
  Eye,
  X
} from 'lucide-react'

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState('shop')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [settings, setSettings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get('/settings')
      setSettings(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const getSetting = (key: string, defaultValue: string = '') => {
    const s = settings.find((x: any) => x.key === key)
    return s ? s.value : defaultValue
  }

  const updateLocalSetting = (key: string, value: string) => {
    setSettings(prev => {
      const idx = prev.findIndex((x: any) => x.key === key)
      if (idx >= 0) {
        const newArr = [...prev]
        newArr[idx] = { ...newArr[idx], value }
        return newArr
      }
      return [...prev, { key, value }]
    })
  }

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault()
    setShowPreview(true)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      await apiClient.post('/settings', { settings })
      setSaveSuccess(true)
      setShowPreview(false)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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
          <form onSubmit={handlePreview} className="space-y-6">
            
            {activeSection === 'shop' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h2 className="text-lg font-serif font-bold text-primary border-b border-outline-variant/10 pb-3">Cấu hình Cửa Hàng</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Tên cửa hàng</label>
                    <input 
                      type="text" 
                      value={getSetting('store_name', 'Từ Tâm Phục')} 
                      onChange={(e) => updateLocalSetting('store_name', e.target.value)}
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Slogan</label>
                    <input 
                      type="text" 
                      value={getSetting('slogan', 'Sống trọn vẹn từng khoảnh khắc')} 
                      onChange={(e) => updateLocalSetting('slogan', e.target.value)}
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant block">Mô tả ngắn</label>
                  <textarea 
                    rows={4}
                    value={getSetting('short_description', 'Không gian tịnh thức, cung cấp pháp phục phật tử, áo choàng thiền, phụ kiện thêu đai và chất liệu cao cấp organic như linen, tơ tằm nguyên chất.')}
                    onChange={(e) => updateLocalSetting('short_description', e.target.value)}
                    className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-on-surface-variant block">Địa chỉ cửa hàng</label>
                  <input 
                    type="text" 
                    value={getSetting('store_address', 'Số 88 Đồng Khởi, Quận 1, TP. Hồ Chí Minh')} 
                    onChange={(e) => updateLocalSetting('store_address', e.target.value)}
                    className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Số điện thoại liên hệ</label>
                    <input 
                      type="text" 
                      value={getSetting('phone', '0123456789')} 
                      onChange={(e) => updateLocalSetting('phone', e.target.value)}
                      className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant block">Email liên hệ</label>
                    <input 
                      type="email" 
                      value={getSetting('email', 'contact@tutamphuc.vn')} 
                      onChange={(e) => updateLocalSetting('email', e.target.value)}
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
                    <h3 className="font-semibold text-sm text-on-surface">1. Chuyển khoản ngân hàng</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-primary/20">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-on-surface-variant block">Ngân hàng thụ hưởng</label>
                        <input 
                          type="text" 
                          value={getSetting('bank_name', 'Vietcombank')} 
                          onChange={(e) => updateLocalSetting('bank_name', e.target.value)}
                          className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-on-surface-variant block">Số tài khoản</label>
                        <input 
                          type="text" 
                          value={getSetting('bank_account_number', '1029384756')} 
                          onChange={(e) => updateLocalSetting('bank_account_number', e.target.value)}
                          className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-semibold text-on-surface-variant block">Tên chủ tài khoản</label>
                        <input 
                          type="text" 
                          value={getSetting('bank_account_holder', 'CONG TY TNHH TU TAM PHUC')} 
                          onChange={(e) => updateLocalSetting('bank_account_holder', e.target.value)}
                          className="w-full bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded px-4 py-2 text-sm text-on-surface"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4">
                    <h3 className="font-semibold text-sm text-on-surface">2. Thanh toán khi nhận hàng</h3>
                    <div className="flex items-center gap-3 pl-4 border-l-2 border-primary/20">
                      <input 
                        type="checkbox" 
                        checked={getSetting('cod_enabled', 'true') === 'true'}
                        onChange={(e) => updateLocalSetting('cod_enabled', e.target.checked ? 'true' : 'false')}
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
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-2 bg-primary/10 text-primary px-6 py-2.5 hover:bg-primary/20 text-label-md font-label-md shadow-sm transition-all duration-300 rounded-sm"
              >
                <Eye size={16} />
                <span>Xem trước</span>
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 hover:bg-primary/95 text-label-md font-label-md shadow-sm hover:scale-105 transition-all duration-300 rounded-sm disabled:opacity-50"
              >
                <Save size={16} />
                <span>{loading ? 'Đang lưu...' : 'Lưu cài đặt'}</span>
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-primary text-on-primary px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye size={20} />
                <h2 className="font-serif font-bold text-lg">Xem trước thông tin hệ thống</h2>
              </div>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-on-primary/80 hover:text-on-primary hover:bg-on-primary/10 p-1.5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/20">
                <h3 className="font-semibold text-primary mb-4 border-b border-outline-variant/20 pb-2">Thông tin hiển thị</h3>
                <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-sm">
                  <div className="text-on-surface-variant col-span-1">Tên cửa hàng:</div>
                  <div className="font-medium text-on-surface col-span-2">{getSetting('store_name', 'Từ Tâm Phục')}</div>
                  
                  <div className="text-on-surface-variant col-span-1">Slogan:</div>
                  <div className="font-medium text-on-surface col-span-2">{getSetting('slogan', 'Sống trọn vẹn từng khoảnh khắc')}</div>

                  <div className="text-on-surface-variant col-span-1">Mô tả:</div>
                  <div className="font-medium text-on-surface col-span-2">{getSetting('short_description', 'Không gian tịnh thức...')}</div>

                  <div className="text-on-surface-variant col-span-1">Hotline:</div>
                  <div className="font-medium text-on-surface col-span-2">{getSetting('phone', '0123456789')}</div>

                  <div className="text-on-surface-variant col-span-1">Email:</div>
                  <div className="font-medium text-on-surface col-span-2">{getSetting('email', 'contact@tutamphuc.vn')}</div>

                  <div className="text-on-surface-variant col-span-1">Địa chỉ:</div>
                  <div className="font-medium text-on-surface col-span-2">{getSetting('store_address', 'Số 88 Đồng Khởi, Quận 1, TP. Hồ Chí Minh')}</div>
                </div>
              </div>

              <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/20">
                <h3 className="font-semibold text-primary mb-4 border-b border-outline-variant/20 pb-2">Cấu hình Thanh toán</h3>
                <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-sm">
                  <div className="text-on-surface-variant col-span-1">Ngân hàng:</div>
                  <div className="font-medium text-on-surface col-span-2">{getSetting('bank_name', 'Vietcombank')}</div>

                  <div className="text-on-surface-variant col-span-1">Số TK:</div>
                  <div className="font-medium text-on-surface col-span-2">{getSetting('bank_account_number', '1029384756')}</div>

                  <div className="text-on-surface-variant col-span-1">Chủ tài khoản:</div>
                  <div className="font-medium text-on-surface col-span-2">{getSetting('bank_account_holder', 'CONG TY TNHH TU TAM PHUC')}</div>

                  <div className="text-on-surface-variant col-span-1">COD:</div>
                  <div className="font-medium text-on-surface col-span-2">
                    {getSetting('cod_enabled', 'true') === 'true' 
                      ? <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs">Đang bật</span>
                      : <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded text-xs">Đang tắt</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-surface-container-lowest p-6 border-t border-outline-variant/20 flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low transition-colors rounded-sm"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2 hover:bg-primary/95 text-label-md font-label-md shadow-sm hover:scale-105 transition-all duration-300 rounded-sm disabled:opacity-50"
              >
                <Save size={16} />
                <span>{loading ? 'Đang lưu...' : 'Xác nhận lưu thay đổi'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
