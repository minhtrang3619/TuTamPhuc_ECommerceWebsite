import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks'
import { Eye, EyeOff, X, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { authService } from '@/services'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ 
    resolver: zodResolver(loginSchema)
  })
  const [showPassword, setShowPassword] = useState(false)

  // Forgot password states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false)
  const [forgotPhone, setForgotPhone] = useState('')
  const [isSendingForgot, setIsSendingForgot] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [demoPassword, setDemoPassword] = useState('')

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotError('')
    setForgotSuccess('')
    setDemoPassword('')
    
    const phoneTrimmed = forgotPhone.trim()
    if (!phoneTrimmed) {
      setForgotError('Vui lòng nhập số điện thoại')
      return
    }

    setIsSendingForgot(true)
    try {
      const res = await authService.forgotPasswordPhone(phoneTrimmed)
      setForgotSuccess(res.message)
      if (res.demo_password) {
        setDemoPassword(res.demo_password)
      }
    } catch (err: any) {
      console.error(err)
      const msg = err.response?.data?.detail || 'Đã có lỗi xảy ra. Vui lòng thử lại.'
      setForgotError(msg)
    } finally {
      setIsSendingForgot(false)
    }
  }

  const handleForgotClose = () => {
    setIsForgotModalOpen(false)
    setForgotPhone('')
    setForgotError('')
    setForgotSuccess('')
    setDemoPassword('')
  }

  const onSubmit = (data: LoginFormData) => {
    login(data)
  }

  // Subtle Mouse parallax for background image
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const bg = document.querySelector('.parallax-bg') as HTMLElement
      if (bg) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.005
        const moveY = (e.clientY - window.innerHeight / 2) * 0.005
        bg.style.transform = `scale(1.05) translate(${moveX}px, ${moveY}px)`
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <main className="relative min-h-screen w-full flex items-center justify-start overflow-hidden selection:bg-primary-fixed-dim selection:text-primary">
      {/* Background Imagery */}
      <div className="absolute inset-0 z-0">
        <img 
          alt="Từ Tâm Phục Zen Lotus" 
          className="parallax-bg w-full h-full object-cover transition-transform duration-100 ease-out" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD71yqX0giiVPBm0w6lNT2Gde2C2_wH_3PSBEBTxuPPcFuNm8mED_y1yb7gBOwtr6fQDRHUgo1sDtIQ4zcS4w47FpeDW0ZdQOsfGKMZpgks6GPsMLsyT9FThRD-O_utCPHMVP9L8AvZLQx3fMcum2at9xvsviD9kB4BGXOteeXFtcvVH_2bqvI1-lK4OUQCioulfn0l0wPTt5Xj80R3taiKeKYOKGf4j18E62-KyNP0SGAjtVxE2Fp_Pmlr9k10qQ9mQW0iqdVHEFTy=w1920"
          style={{ transform: 'scale(1.05) translate(1.1px, 2.44px)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/10 to-transparent md:from-background/60 md:via-background/20"></div>
      </div>
      
      {/* Login Card Section */}
      <section className="relative z-10 w-full max-w-[480px] px-margin-mobile md:ml-[10%] animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="bg-white/75 backdrop-blur-[20px] p-10 md:p-12 rounded-xl shadow-[0_32px_64px_-12px_rgba(93,64,55,0.08)] border border-white/50">
          
          {/* Brand Anchor */}
          <header className="mb-12 text-center">
            <h1 className="font-headline-sm text-headline-sm text-primary tracking-widest mb-2">TỪ TÂM PHỤC</h1>
            <p className="font-caption text-caption text-on-surface-variant uppercase tracking-[0.2em]">Sống trọn vẹn từng khoảnh khắc</p>
          </header>
          
          {/* Form Title */}
          <div className="mb-8">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Chào mừng bạn trở lại</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Đăng nhập để tiếp tục mua sắm cùng Từ Tâm Phục.</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
              
              {/* Email Input */}
              <div className="relative group">
                <label className="font-caption text-caption text-on-surface-variant block mb-1 group-focus-within:text-primary transition-colors">Email</label>
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="example@gmail.com" 
                  className="w-full border-0 border-b border-outline-variant bg-transparent px-0 font-body-md text-body-md placeholder-outline-variant/50 transition-all duration-300 focus:border-primary focus:ring-0 focus:outline-none"
                />
                {errors.email && (
                  <p className="text-xs text-error mt-1 absolute -bottom-5">{errors.email.message}</p>
                )}
              </div>
              
              {/* Password Input */}
              <div className="relative group">
                <label className="font-caption text-caption text-on-surface-variant block mb-1 group-focus-within:text-primary transition-colors">Mật khẩu</label>
                <div className="relative">
                  <input 
                    {...register('password')}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    className="w-full border-0 border-b border-outline-variant bg-transparent px-0 font-body-md text-body-md placeholder-outline-variant/50 transition-all duration-300 focus:border-primary focus:ring-0 focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} strokeWidth={1.5} /> : <Eye size={20} strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error mt-1 absolute -bottom-5">{errors.password.message}</p>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  className="w-4 h-4 rounded-sm border-outline text-primary focus:ring-primary transition-all bg-transparent"
                />
                <span className="font-caption text-caption text-on-surface-variant group-hover:text-on-surface transition-colors">Ghi nhớ đăng nhập</span>
              </label>
              <button 
                type="button"
                onClick={() => setIsForgotModalOpen(true)} 
                className="font-caption text-caption text-primary hover:opacity-70 transition-opacity bg-transparent border-none p-0 cursor-pointer"
              >
                Quên mật khẩu?
              </button>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoggingIn}
              className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md rounded-sm tracking-[0.15em] uppercase hover:bg-on-primary-fixed-variant transition-all duration-500 shadow-lg shadow-primary/10 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                  Đang đăng nhập...
                </>
              ) : 'Đăng nhập'}
            </button>
          </form>
          
          {/* Footer/Link */}
          <footer className="mt-10 pt-8 border-t border-outline-variant/30 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Bạn chưa có tài khoản? 
              <Link to="/register" className="text-primary font-medium hover:underline underline-offset-4 decoration-primary/30 transition-all ml-1">
                Đăng ký ngay
              </Link>
            </p>
          </footer>
        </div>
        
        {/* Secondary Decorative Elements */}
        <div className="mt-8 text-center opacity-40">
          <p className="font-caption text-caption text-on-surface-variant italic">"Y phục xứng kỳ đức"</p>
        </div>
      </section>
      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleForgotClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-white p-8 md:p-10 rounded-xl shadow-[0_24px_48px_rgba(93,64,55,0.12)] border border-outline-variant/30 font-sans text-left z-10"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={handleForgotClose}
                className="absolute right-4 top-4 p-1 rounded-full text-on-surface-variant hover:bg-[#eeeeee] transition-all border-none bg-transparent cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="mb-6">
                <h3 className="font-serif text-xl font-bold text-primary mb-2">Quên mật khẩu</h3>
                <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                  Nhập số điện thoại đã đăng ký của bạn. Hệ thống sẽ tạo mật khẩu mới tạm thời và gửi đến số điện thoại của bạn qua SMS.
                </p>
              </div>

              {!forgotSuccess ? (
                <form onSubmit={handleForgotSubmit} className="space-y-6">
                  <div className="relative group">
                    <label className="font-caption text-[11px] uppercase tracking-wider text-on-surface-variant block mb-1 group-focus-within:text-primary transition-colors">
                      Số điện thoại đăng ký
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 0987654321"
                      value={forgotPhone}
                      onChange={(e) => setForgotPhone(e.target.value)}
                      className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-1.5 font-body-md text-body-md placeholder-outline-variant/40 transition-all duration-300 focus:border-primary focus:ring-0 focus:outline-none"
                      disabled={isSendingForgot}
                    />
                    {forgotError && (
                      <p className="text-xs text-error mt-1">{forgotError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingForgot}
                    className="w-full py-3.5 bg-primary text-on-primary font-label-md text-xs rounded-sm tracking-[0.1em] uppercase hover:bg-on-primary-fixed-variant transition-all duration-500 flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSendingForgot ? (
                      <>
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      'Gửi mật khẩu mới'
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-start gap-3 bg-emerald-50/60 border border-emerald-100 p-4 rounded-lg text-emerald-800">
                    <CheckCircle className="text-emerald-700 mt-0.5 flex-shrink-0" size={18} />
                    <div className="text-xs space-y-1">
                      <p className="font-bold">Thành công!</p>
                      <p>{forgotSuccess}</p>
                    </div>
                  </div>

                  {demoPassword && (
                    <div className="bg-[#faf6f0] border border-[#d4c3be]/40 p-4 rounded-lg text-xs space-y-2">
                      <p className="font-bold text-primary uppercase tracking-wider text-[10px]">• Chế độ Demo •</p>
                      <p className="text-on-surface-variant leading-relaxed">
                        Hệ thống đã tạo mật khẩu mới tạm thời cho bạn là:
                      </p>
                      <div className="bg-white border border-[#eeeeee] rounded py-2 px-3 text-center font-mono font-bold text-base text-primary tracking-widest shadow-xs select-all">
                        {demoPassword}
                      </div>
                      <p className="text-[10px] text-on-surface-variant/70 italic leading-relaxed">
                        * Quý khách có thể copy mật khẩu này để đăng nhập ngay và đổi mật khẩu trong trang Cá nhân.
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleForgotClose}
                    className="w-full py-3 bg-[#eeeeee] hover:bg-[#dddddd] text-on-surface-variant font-label-md text-xs rounded-sm uppercase tracking-wider transition-colors cursor-pointer border-none"
                  >
                    Đóng
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
