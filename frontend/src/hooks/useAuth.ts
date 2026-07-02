import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { authService } from '@/services'
import { useAuthStore } from '@/store'

export function useAuth() {
  const { user, isAuthenticated, accessToken, logout: storeLogout, setUser, setTokens } =
    useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (tokens) => {
      setTokens(tokens.access_token, tokens.refresh_token)
      const me = await authService.getMe()
      setUser(me)
      toast.success('Đăng nhập thành công!')
      if (['admin', 'staff', 'shop_staff', 'customer_service'].includes(me.role?.toLowerCase())) {
        navigate('/admin')
      } else {
        navigate('/')
      }
    },
    onError: () => {
      toast.error('Email hoặc mật khẩu không đúng')
    },
  })

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.')
      navigate('/login')
    },
    onError: (error: any) => {
      if (error?.response?.status === 400 || error?.response?.status === 409 || error?.response?.data?.detail?.toLowerCase()?.includes('exist')) {
        toast.error('Email đã tồn tại. Vui lòng sử dụng email khác hoặc đăng nhập.')
      } else {
        toast.error(error?.response?.data?.detail || 'Đăng ký thất bại. Vui lòng thử lại.')
      }
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      storeLogout()
      queryClient.clear()
      navigate('/login')
      toast.success('Đã đăng xuất')
    },
  })

  return {
    user,
    isAuthenticated,
    accessToken,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}
