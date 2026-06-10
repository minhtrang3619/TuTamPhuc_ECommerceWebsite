import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks'
import { Eye, EyeOff, Sprout, ArrowRight, LogIn } from 'lucide-react'
import { useState } from 'react'

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

  return (
    <main className="min-h-screen flex items-center justify-center relative bg-surface selection:bg-primary-fixed-dim selection:text-primary overflow-x-hidden">
      {/* Background Image Container (Lotus Visual Anchor) */}
      <div className="hidden lg:block absolute inset-y-0 right-0 w-1/2 overflow-hidden">
        <div 
          className="absolute inset-0 z-10" 
          style={{ background: 'linear-gradient(to right, #f9f9f9 40%, rgba(249, 249, 249, 0) 100%)' }}
        />
        <img 
          alt="Lotus flower in vase" 
          className="h-full w-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD71yqX0giiVPBm0w6lNT2Gde2C2_wH_3PSBEBTxuPPcFuNm8mED_y1yb7gBOwtr6fQDRHUgo1sDtIQ4zcS4w47FpeDW0ZdQOsfGKMZpgks6GPsMLsyT9FThRD-O_utCPHMVP9L8AvZLQx3fMcum2at9xvsviD9kB4BGXOteeXFtcvVH_2bqvI1-lK4OUQCioulfn0l0wPTt5Xj80R3taiKeKYOKGf4j18E62-KyNP0SGAjtVxE2Fp_Pmlr9k10qQ9mQW0iqdVHEFTy=w1920"
        />
      </div>
      
      {/* Registration Container */}
      <div className="w-full max-w-[1280px] px-margin-mobile md:px-margin-desktop z-20 flex justify-start">
        <div className="w-full lg:w-1/2 max-w-lg bg-surface/80 backdrop-blur-sm lg:bg-transparent py-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Brand Header */}
          <div className="mb-12">
            <h1 className="font-headline-sm text-headline-sm text-primary tracking-widest mb-2">Từ Tâm Phục</h1>
            <p className="font-body-md text-body-md text-on-surface-variant opacity-80">Kiến tạo bình yên qua từng sợi vải.</p>
          </div>
          
          {/* Registration Title */}
          <div className="mb-10">
            <h2 className="font-headline-md text-headline-md text-primary mb-4">Tạo tài khoản mới</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Tham gia cùng cộng đồng Từ Tâm Phục để nhận ưu đãi riêng cho bạn.</p>
          </div>
          
          {/* Registration Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Full Name */}
            <div className="group relative">
              <label className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors" htmlFor="full_name">Họ và tên</label>
              <input 
                {...register('full_name')}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant py-3 font-body-md text-body-md text-on-surface transition-all duration-300 focus:border-primary focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/30" 
                id="full_name" 
                placeholder="Nguyễn Văn An" 
                type="text"
              />
              {errors.full_name && (
                <p className="text-xs text-error mt-1">{errors.full_name.message}</p>
              )}
            </div>
            
            {/* Email */}
            <div className="group relative">
              <label className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors" htmlFor="email">Email</label>
              <input 
                {...register('email')}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant py-3 font-body-md text-body-md text-on-surface transition-all duration-300 focus:border-primary focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/30" 
                id="email" 
                placeholder="example@tutamphuc.vn" 
                type="email"
              />
              {errors.email && (
                <p className="text-xs text-error mt-1">{errors.email.message}</p>
              )}
            </div>
            
            {/* Phone Number */}
            <div className="group relative">
              <label className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors" htmlFor="phone">Số điện thoại</label>
              <input 
                {...register('phone')}
                className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant py-3 font-body-md text-body-md text-on-surface transition-all duration-300 focus:border-primary focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/30" 
                id="phone" 
                placeholder="090 123 4567" 
                type="tel"
              />
              {errors.phone && (
                <p className="text-xs text-error mt-1">{errors.phone.message}</p>
              )}
            </div>
            
            {/* Passwords Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {/* Password */}
              <div className="group relative">
                <label className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors" htmlFor="password">Mật khẩu</label>
                <div className="relative">
                  <input 
                    {...register('password')}
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant py-3 font-body-md text-body-md text-on-surface pr-8 transition-all duration-300 focus:border-primary focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/30" 
                    id="password" 
                    placeholder="••••••••" 
                    type={showPassword ? "text" : "password"}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-3 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-error mt-1">{errors.password.message}</p>
                )}
              </div>
              
              {/* Confirm Password */}
              <div className="group relative">
                <label className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-2 block group-focus-within:text-primary transition-colors" htmlFor="confirm_password">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input 
                    {...register('confirm_password')}
                    className="w-full bg-transparent border-t-0 border-x-0 border-b border-outline-variant py-3 font-body-md text-body-md text-on-surface pr-8 transition-all duration-300 focus:border-primary focus:ring-0 focus:outline-none placeholder:text-on-surface-variant/30" 
                    id="confirm_password" 
                    placeholder="••••••••" 
                    type={showConfirmPassword ? "text" : "password"}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 bottom-3 text-on-surface-variant hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.confirm_password && (
                  <p className="text-xs text-error mt-1">{errors.confirm_password.message}</p>
                )}
              </div>
            </div>
            
            {/* Terms */}
            <div className="flex items-start space-x-3 pt-2">
              <input 
                className="mt-1 h-4 w-4 rounded-sm border-outline text-primary focus:ring-primary transition-all cursor-pointer bg-transparent" 
                id="terms" 
                name="terms" 
                type="checkbox"
              />
              <label className="font-caption text-caption text-on-surface-variant leading-relaxed select-none cursor-pointer" htmlFor="terms">
                Tôi đồng ý với các Điều khoản và Chính sách của cửa hàng.
              </label>
            </div>
            
            {/* Submit Button */}
            <div className="pt-6">
              <button 
                type="submit" 
                disabled={isRegistering}
                className="w-full md:w-auto px-16 py-4 border border-primary text-primary font-label-md text-label-md tracking-[0.1em] hover:tracking-[0.2em] hover:bg-primary/10 transition-all duration-500 ease-out group flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRegistering ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                    <span>ĐANG ĐĂNG KÝ...</span>
                  </>
                ) : (
                  <>
                    <span>ĐĂNG KÝ</span>
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Footer Links */}
          <div className="mt-12 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <Link 
              to="/login" 
              className="font-label-md text-label-md text-primary flex items-center space-x-2 hover:opacity-70 transition-opacity"
            >
              <span>Đã có tài khoản? Đăng nhập tại đây</span>
              <LogIn size={20} />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Decorative Floating Element */}
      <div className="hidden lg:block absolute bottom-12 left-12 opacity-30">
        <Sprout size={120} strokeWidth={0.5} className="text-primary-fixed-dim" />
      </div>
    </main>
  )
}
