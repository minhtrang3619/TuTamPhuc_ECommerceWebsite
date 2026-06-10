import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks'
import { Eye, EyeOff } from 'lucide-react'
import { useState, useEffect } from 'react'

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
              <Link to="/forgot-password" className="font-caption text-caption text-primary hover:opacity-70 transition-opacity">
                Quên mật khẩu?
              </Link>
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
    </main>
  )
}
