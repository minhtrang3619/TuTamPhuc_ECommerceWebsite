import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks'
import { Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'

const registerSchema = z.object({
  full_name: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'],
})

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const { register: registerUser, isRegistering } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const onSubmit = ({ confirm_password: _, ...data }: RegisterFormData) => {
    registerUser(data)
  }

  // Subtle Mouse parallax for background image
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const bg = document.querySelector('.parallax-bg') as HTMLElement
      if (bg) {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.005
        const moveY = (e.clientY - window.innerHeight / 2) * 0.005
        bg.style.transform = `scale(1.01) translate(${moveX}px, ${moveY}px)`
      }
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center md:justify-end overflow-y-auto overflow-x-hidden selection:bg-primary-fixed-dim selection:text-primary py-8 md:py-0">
      {/* Background Imagery */}
      <div className="absolute inset-0 z-0">
        <img 
          alt="Từ Tâm Phục Zen Background" 
          className="parallax-bg w-full h-full object-cover transition-transform duration-100 ease-out" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAN8xrbMNIfKSjtZ0ZNO-wVosXj_SAeJ4ZbmL2-vGDfeLT7UcE1qAtKkV3dRkvicPusML1TgTTKTyGZKaU3C2lpSiQGWyyrdHGLHW1Sq2nyaLQwD8lRsQ28E0G6HNBSx3zJ5SVIui5BoL8-NVE47XYX5fqj2B9UYP5JXXZr6g8GPVbUxRHZ5_crK4WY-OtcBoe0DGvQV_LvUmG_RzcuuyGHyj55TrwUd-7YSIEAhIpzyoNasvg1d7pvXwbISmUQdDXIffw6fglep9vA"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-background/10 md:to-transparent"></div>
      </div>
      
      {/* Register Card Section */}
      <section className="relative z-10 w-full max-w-[480px] px-margin-mobile md:mr-[10%] animate-in fade-in slide-in-from-bottom-4 duration-1000 my-auto">
        <div className="bg-white/70 backdrop-blur-md p-8 md:p-10 rounded-xl shadow-[0_32px_64px_-12px_rgba(93,64,55,0.08)] border border-white/40 max-h-[90vh] overflow-y-auto">
          
          {/* Brand Anchor */}
          <header className="mb-8 text-center">
            <h1 className="font-headline-sm text-headline-sm text-primary tracking-widest mb-1">TỪ TÂM PHỤC</h1>
            <p className="font-caption text-caption text-on-surface-variant uppercase tracking-[0.2em]">Sống trọn vẹn từng khoảnh khắc</p>
          </header>
          
          {/* Form Title */}
          <div className="mb-6">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-1">Đăng ký</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Tạo tài khoản mới tại Từ Tâm Phục.</p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              
              {/* Name Input */}
              <div className="relative group">
                <label className="font-caption text-caption text-on-surface-variant block mb-0.5 group-focus-within:text-primary transition-colors">Họ và tên</label>
                <input 
                  {...register('full_name')}
                  type="text" 
                  placeholder="Nguyễn Văn A" 
                  className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-1 font-body-md text-body-md placeholder-outline-variant/50 transition-all duration-300 focus:border-primary focus:ring-0"
                />
                {errors.full_name && (
                  <p className="text-xs text-error mt-1">{errors.full_name.message}</p>
                )}
              </div>

              {/* Email Input */}
              <div className="relative group">
                <label className="font-caption text-caption text-on-surface-variant block mb-0.5 group-focus-within:text-primary transition-colors">Email của bạn</label>
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="email@example.com" 
                  className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-1 font-body-md text-body-md placeholder-outline-variant/50 transition-all duration-300 focus:border-primary focus:ring-0"
                />
                {errors.email && (
                  <p className="text-xs text-error mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Phone Input */}
              <div className="relative group">
                <label className="font-caption text-caption text-on-surface-variant block mb-0.5 group-focus-within:text-primary transition-colors">Số điện thoại (tùy chọn)</label>
                <input 
                  {...register('phone')}
                  type="tel" 
                  placeholder="0901234567" 
                  className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-1 font-body-md text-body-md placeholder-outline-variant/50 transition-all duration-300 focus:border-primary focus:ring-0"
                />
                {errors.phone && (
                  <p className="text-xs text-error mt-1">{errors.phone.message}</p>
                )}
              </div>
              
              {/* Password Input */}
              <div className="relative group">
                <label className="font-caption text-caption text-on-surface-variant block mb-0.5 group-focus-within:text-primary transition-colors">Mật khẩu</label>
                <div className="relative">
                  <input 
                    {...register('password')}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-1 font-body-md text-body-md placeholder-outline-variant/50 transition-all duration-300 focus:border-primary focus:ring-0"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-1 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div className="relative group">
                <label className="font-caption text-caption text-on-surface-variant block mb-0.5 group-focus-within:text-primary transition-colors">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input 
                    {...register('confirm_password')}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    className="w-full border-0 border-b border-outline-variant bg-transparent px-0 py-1 font-body-md text-body-md placeholder-outline-variant/50 transition-all duration-300 focus:border-primary focus:ring-0"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 bottom-1 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-xs text-error mt-1">{errors.confirm_password.message}</p>
                )}
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isRegistering}
              className="w-full py-4 bg-primary text-on-primary font-label-md text-label-md rounded-sm tracking-[0.15em] uppercase hover:bg-on-primary-fixed-variant transition-all duration-500 shadow-lg shadow-primary/10 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRegistering ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                  Đang đăng ký...
                </>
              ) : 'Đăng ký'}
            </button>
          </form>
          
          {/* Footer/Link */}
          <footer className="mt-8 pt-6 border-t border-outline-variant/30 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Đã có tài khoản? 
              <Link to="/login" className="text-primary font-medium hover:underline underline-offset-4 decoration-primary/30 transition-all ml-1">
                Đăng nhập
              </Link>
            </p>
          </footer>
        </div>
        
        {/* Secondary Decorative Elements */}
        <div className="mt-6 text-center opacity-40">
          <p className="font-caption text-caption text-on-surface-variant italic">"Trải nghiệm mua sắm an tâm tại Từ Tâm Phục"</p>
        </div>
      </section>
    </main>
  )
}
