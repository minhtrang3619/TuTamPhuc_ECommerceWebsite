import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User as UserIcon,
  ShoppingBag,
  MapPin,
  Lock,
  LogOut,
  Camera,
  Save,
  CheckCircle,
  Clock,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Ticket,
  Heart,
  Star
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { authService, addressService, orderService, reviewService, apiClient } from '../../services';
import type { UserAddress } from '../../types';



import { mapApiProductToMockProduct, getImageUrl } from '../../utils/productMapper';
import { formatPrice } from '../../components/ui/ProductCard';
import Toast from '../../components/ui/Toast';

// Mock addresses removed

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  minOrder?: number;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  expiryDate: string;
  type: 'exclusive' | 'loyalty' | 'holiday';
  status: 'active' | 'used' | 'expired' | 'upcoming';
}

export default function ProfilePage() {

  const { user, isAuthenticated, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items: wishlistItems, fetchWishlist, removeFromWishlist } = useWishlistStore();

  // DB Orders state
  const [dbOrders, setDbOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (isAuthenticated) {
        setLoadingOrders(true);
        setOrdersError(null);
        try {
          const res = await orderService.getMyOrders();
          setDbOrders(res.items || []);
        } catch (err: any) {
          console.error("Lỗi khi tải đơn hàng:", err);
          setOrdersError(err?.message || "Không thể tải danh sách đơn hàng.");
        } finally {
          setLoadingOrders(false);
        }
      }
    };
    fetchMyOrders();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated, fetchWishlist]);

  // Dynamically compute default vouchers based on date and order history
  const vouchers = useMemo(() => {
    const Y = new Date().getFullYear();
    const now = new Date();

    const getHolidayStatus = (startMonth: number, startDay: number, endMonth: number, endDay: number) => {
      const start = new Date(Y, startMonth - 1, startDay, 0, 0, 0);
      const end = new Date(Y, endMonth - 1, endDay, 23, 59, 59);
      if (now < start) return { status: 'upcoming' as const, start, end };
      if (now > end) return { status: 'expired' as const, start, end };
      return { status: 'active' as const, start, end };
    };

    const formatD = (d: Date) => {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    };

    const list: Voucher[] = [];

    // 1. First-purchase discount (10%)
    const hasPurchasedBefore = dbOrders.some(order => order.status !== 'cancelled');
    const firstPurchaseStatus = hasPurchasedBefore ? 'used' : 'active';
    list.push({
      id: 'v_first_buy',
      code: 'CHAOMUNG10',
      title: 'Voucher Chào Mừng Thành Viên Mới',
      description: 'Giảm 10% tổng hóa đơn cho đơn đặt hàng đầu tiên tại Từ Tâm Phục.',
      discountValue: 10,
      discountType: 'percentage',
      expiryDate: 'Không thời hạn',
      type: 'exclusive',
      status: firstPurchaseStatus
    });

    // 2. Tết
    const tet = getHolidayStatus(1, 1, 2, 15);
    list.push({
      id: 'v_tet',
      code: 'TETANNHIEN10',
      title: 'Khuyến Mãi Tết Nguyên Đán',
      description: 'Giảm 10% tổng hóa đơn mừng Xuân Di Lặc đong đầy an nhiên.',
      discountValue: 10,
      discountType: 'percentage',
      expiryDate: formatD(tet.end),
      type: 'holiday',
      status: tet.status
    });

    // 3. Quốc tế Phụ nữ (8/3)
    const women = getHolidayStatus(3, 1, 3, 15);
    list.push({
      id: 'v_women',
      code: 'WOMEN10',
      title: 'Khuyến Mãi Quốc Tế Phụ Nữ 8/3',
      description: 'Giảm 10% tri ân phái đẹp, tôn vinh nét duyên dáng thanh lịch.',
      discountValue: 10,
      discountType: 'percentage',
      expiryDate: formatD(women.end),
      type: 'holiday',
      status: women.status
    });

    // 4. Ngày của Mẹ
    const mother = getHolidayStatus(5, 1, 5, 15);
    list.push({
      id: 'v_mother',
      code: 'MOTHER10',
      title: 'Khuyến Mãi Ngày Của Mẹ',
      description: 'Giảm 10% thay lời tri ân ngọt ngào hướng về đấng sinh thành.',
      discountValue: 10,
      discountType: 'percentage',
      expiryDate: formatD(mother.end),
      type: 'holiday',
      status: mother.status
    });

    // 5. Vu Lan
    const vulan = getHolidayStatus(8, 1, 8, 31);
    list.push({
      id: 'v_vulan',
      code: 'VULAN10',
      title: 'Ưu Đãi Đại Lễ Vu Lan Báo Hiếu',
      description: 'Giảm 10% cùng bạn gieo hạt giống hiếu thảo mùa Vu Lan ấm áp.',
      discountValue: 10,
      discountType: 'percentage',
      expiryDate: formatD(vulan.end),
      type: 'holiday',
      status: vulan.status
    });

    return list;
  }, [dbOrders]);

  const mappedFavorites = useMemo(() => {
    return wishlistItems.map(p => mapApiProductToMockProduct(p));
  }, [wishlistItems]);

  const handleRemoveFavorite = async (dbId?: number) => {
    if (!dbId) return;
    try {
      await removeFromWishlist(dbId);
      showToast('Đã xóa sản phẩm khỏi danh mục yêu thích.', 'info');
    } catch (err) {
      console.error("Lỗi khi xóa yêu thích:", err);
      showToast('Không thể xóa sản phẩm. Vui lòng thử lại sau.', 'info');
    }
  };

  // Selected sub-tab initialized from URL search param
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites' | 'addresses' | 'offers'>(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'favorites', 'addresses', 'offers'].includes(tab)) {
      return tab as any;
    }
    return 'profile';
  });

  // Sync activeTab when searchParams changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['profile', 'orders', 'favorites', 'addresses', 'offers'].includes(tab)) {
      setActiveTab(tab as any);
    }
  }, [searchParams]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Product Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [reviewProductName, setReviewProductName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewIsAnonymous, setReviewIsAnonymous] = useState(false);
  const [reviewOrderItemId, setReviewOrderItemId] = useState<number | null>(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewHoverRating, setReviewHoverRating] = useState<number | null>(null);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [reviewVideos, setReviewVideos] = useState<string[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const handleOpenReviewModal = (productId: number, productName: string, orderItemId: number) => {
    setReviewProductId(productId);
    setReviewProductName(productName);
    setReviewRating(5);
    setReviewTitle('');
    setReviewContent('');
    setReviewIsAnonymous(false);
    setReviewOrderItemId(orderItemId);
    setReviewImages([]);
    setReviewVideos([]);
    setMediaError(null);
    setShowReviewModal(true);
  };

  const handleReviewMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    setIsUploadingMedia(true);
    setMediaError(null);

    try {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          if (file.size > 10 * 1024 * 1024) {
            setMediaError(`Ảnh ${file.name} quá lớn. Tối đa 10MB.`);
            continue;
          }
        } else if (file.type.startsWith('video/')) {
          if (file.size > 50 * 1024 * 1024) {
            setMediaError(`Video ${file.name} quá lớn. Tối đa 50MB.`);
            continue;
          }
        } else {
          setMediaError(`File ${file.name} không được hỗ trợ. Chỉ nhận ảnh và video.`);
          continue;
        }

        const res = await reviewService.uploadReviewMedia(file);
        if (res.type === 'image') {
          setReviewImages(prev => [...prev, res.url]);
        } else {
          setReviewVideos(prev => [...prev, res.url]);
        }
      }
    } catch (err) {
      console.error(err);
      setMediaError('Tải tệp lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleRemoveImage = (urlToRemove: string) => {
    setReviewImages(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleRemoveVideo = (urlToRemove: string) => {
    setReviewVideos(prev => prev.filter(url => url !== urlToRemove));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProductId) return;

    setIsSubmittingReview(true);
    try {
      await apiClient.post(`/products/${reviewProductId}/reviews`, {
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        content: reviewContent.trim() || undefined,
        is_anonymous: reviewIsAnonymous,
        order_item_id: reviewOrderItemId,
        images: reviewImages.length > 0 ? reviewImages : undefined,
        videos: reviewVideos.length > 0 ? reviewVideos : undefined,
      });
      showToast('Đã gửi đánh giá sản phẩm thành công!');
      setShowReviewModal(false);
      if (reviewOrderItemId) {
        setDbOrders(prev => prev.map(o => ({
          ...o,
          items: o.items.map((item: any) => {
            if (item.id === reviewOrderItemId) {
              return { ...item, is_reviewed: true };
            }
            return item;
          })
        })));
      }
    } catch (err: any) {
      console.error("Lỗi khi gửi đánh giá:", err);
      const errMsg = err.response?.data?.detail || 'Không thể gửi đánh giá. Vui lòng thử lại sau.';
      showToast(errMsg, 'info');
    } finally {
      setIsSubmittingReview(false);
    }
  };



  // Helper mapping for DB statuses

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'processing': return 'Chờ lấy hàng';
      case 'shipped': return 'Đang vận chuyển';
      case 'delivered': return 'Đã giao thành công';
      case 'cancelled': return 'Đã hủy';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cod': return 'COD (Nhận hàng thanh toán)';
      case 'bank_transfer': return 'Chuyển khoản ngân hàng';
      case 'vnpay': return 'VNPAY';
      case 'momo': return 'Ví MoMo';
      default: return method;
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chưa thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'failed': return 'Thanh toán thất bại';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  // Order status sub-filters
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'shipping' | 'delivered' | 'returned' | 'cancelled'>('all');

  // Voucher / Offer filters
  const [voucherFilter, setVoucherFilter] = useState<'all' | 'used' | 'expired'>('all');
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<'all_types' | 'exclusive' | 'holiday'>('all_types');

  // Default neutral user avatar SVG data URI (styled in theme's warm brown)
  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238a726b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z'/%3E%3C/svg%3E";

  // Input states for profile
  const [fullName, setFullName] = useState(user?.full_name || 'Khách Hàng');
  const [email, setEmail] = useState(user?.email || 'khachhang@example.com');
  const [phone, setPhone] = useState(user?.phone || '0987654321');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || DEFAULT_AVATAR);

  // Shipping Address & Google Map states
  const [shippingAddress, setShippingAddress] = useState(user?.customer?.address || '');
  const [mapSearch, setMapSearch] = useState('');
  const [mapZoom, setMapZoom] = useState(15);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Security input states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  useEffect(() => {
    if (!isEditingProfile && user) {
      setFullName(user.full_name || 'Khách Hàng');
      setEmail(user.email || 'khachhang@example.com');
      setPhone(user.phone || '0987654321');
      setAvatarUrl(user.avatar || DEFAULT_AVATAR);
      setShippingAddress(user.customer?.address || '');
    }
  }, [user, isEditingProfile]);

  const handleLocateUser = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setShippingAddress(`Tọa độ: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (Định vị thành công vị trí của bạn)`);
          setIsLoadingLocation(false);
          showToast('Đã lấy tọa độ GPS từ trình duyệt thành công!');
        },
        () => {
          setTimeout(() => {
            setShippingAddress(user?.customer?.address || '');
            setIsLoadingLocation(false);
            showToast('Không thể truy cập GPS. Đang sử dụng địa chỉ mặc định.', 'info');
          }, 1000);
        }
      );
    } else {
      setShippingAddress(user?.customer?.address || '');
      setIsLoadingLocation(false);
      showToast('Trình duyệt của bạn không hỗ trợ định vị.', 'info');
    }
  };

  // Address list state
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrProvince, setNewAddrProvince] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState('');
  const [newAddrWard, setNewAddrWard] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [visibleMapId, setVisibleMapId] = useState<number | null>(null);

  // Fetch addresses on mount/auth
  useEffect(() => {
    const fetchAddresses = async () => {
      if (isAuthenticated) {
        try {
          const data = await addressService.getAddresses();
          let currentAddresses = [...data];
          
          // Auto-sync shipping address from user profile to address book
          const currentShippingAddr = user?.customer?.address;
          if (currentShippingAddr) {
            const addressExists = currentAddresses.some(addr => {
              const fullAddrStr = [addr.street, addr.ward, addr.district, addr.province]
                .filter(Boolean)
                .join(', ');
              return fullAddrStr.includes(currentShippingAddr) || currentShippingAddr.includes(addr.street);
            });

            if (!addressExists) {
              const parts = currentShippingAddr.split(',').map(p => p.trim());
              let street = currentShippingAddr;
              let ward = 'Khác';
              let district = 'Khác';
              let province = 'Khác';
              if (parts.length >= 4) {
                street = parts.slice(0, parts.length - 3).join(', ');
                ward = parts[parts.length - 3];
                district = parts[parts.length - 2];
                province = parts[parts.length - 1];
              } else if (parts.length === 3) {
                street = parts[0];
                district = parts[1];
                province = parts[2];
              }

              try {
                const isDefault = currentAddresses.length === 0;
                const newAddr = await addressService.createAddress({
                  name: user?.full_name || 'Khách Hàng',
                  phone: user?.phone || '0987654321',
                  province,
                  district,
                  ward,
                  street,
                  isDefault: isDefault
                });
                currentAddresses.push(newAddr);
              } catch (err) {
                console.error("Lỗi khi auto-sync địa chỉ vào sổ:", err);
              }
            }
          }
          
          setAddresses(currentAddresses);
        } catch (err) {
          console.error("Lỗi khi tải sổ địa chỉ:", err);
          showToast("Không thể tải sổ địa chỉ giao hàng.", "info");
        }
      }
    };
    fetchAddresses();
  }, [isAuthenticated, user]);

  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'info'
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Call API to update profile and customer details on backend
      const updatedUser = await authService.updateProfile(
        {
          full_name: fullName,
          phone: phone,
          avatar: avatarUrl,
        },
        {
          full_name: fullName,
          phone: phone,
          address: shippingAddress,
          avatar: avatarUrl,
        }
      );

      // 2. Update local state
      updateUser(updatedUser);

      // 3. Sync shippingAddress to address book if not empty
      if (shippingAddress) {
        const addressExists = addresses.some(addr => {
          const fullAddrStr = [addr.street, addr.ward, addr.district, addr.province]
            .filter(Boolean)
            .join(', ');
          return fullAddrStr.includes(shippingAddress) || shippingAddress.includes(addr.street);
        });

        if (!addressExists) {
          const parts = shippingAddress.split(',').map(p => p.trim());
          let street = shippingAddress;
          let ward = 'Khác';
          let district = 'Khác';
          let province = 'Khác';
          if (parts.length >= 4) {
            street = parts.slice(0, parts.length - 3).join(', ');
            ward = parts[parts.length - 3];
            district = parts[parts.length - 2];
            province = parts[parts.length - 1];
          } else if (parts.length === 3) {
            street = parts[0];
            district = parts[1];
            province = parts[2];
          }

          try {
            const isDefault = addresses.length === 0;
            const newAddr = await addressService.createAddress({
              name: fullName,
              phone: phone,
              province,
              district,
              ward,
              street,
              isDefault: isDefault
            });
            setAddresses(prev => [...prev, newAddr]);
          } catch (err) {
            console.error("Lỗi khi đồng bộ địa chỉ vào sổ:", err);
          }
        }
      }

      // Check password fields
      if (newPassword || confirmPassword) {
        if (!currentPassword || !newPassword || !confirmPassword) {
          showToast('Vui lòng điền đầy đủ các trường để đổi mật khẩu.', 'info');
          return;
        }
        if (newPassword !== confirmPassword) {
          showToast('Mật khẩu mới nhập lại không trùng khớp.', 'info');
          return;
        }
        if (newPassword.length < 6) {
          showToast('Mật khẩu mới phải từ 6 ký tự trở lên.', 'info');
          return;
        }

        // Call change password API
        await authService.changePassword({
          current_password: currentPassword,
          new_password: newPassword,
        });

        // Reset password inputs
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Thông tin cá nhân & mật khẩu đã được cập nhật thành công!');
        setIsEditingProfile(false);
      } else {
        showToast('Thông tin tài khoản đã được cập nhật thành công!');
        setIsEditingProfile(false);
      }
    } catch (err: any) {
      console.error("Lỗi khi cập nhật thông tin cá nhân:", err);
      const errMsg = err.response?.data?.detail || 'Cập nhật thông tin thất bại. Vui lòng thử lại sau.';
      showToast(errMsg, 'info');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrPhone || !newAddrProvince || !newAddrDistrict || !newAddrWard || !newAddrStreet) {
      showToast('Vui lòng điền đầy đủ thông tin địa chỉ.', 'info');
      return;
    }
    try {
      const isDefault = addresses.length === 0;
      const newAddress = await addressService.createAddress({
        name: newAddrName,
        phone: newAddrPhone,
        province: newAddrProvince,
        district: newAddrDistrict,
        ward: newAddrWard,
        street: newAddrStreet,
        isDefault: isDefault
      });
      setAddresses(prev => [...prev, newAddress]);
      setShowAddressForm(false);
      // Reset forms
      setNewAddrName('');
      setNewAddrPhone('');
      setNewAddrProvince('');
      setNewAddrDistrict('');
      setNewAddrWard('');
      setNewAddrStreet('');
      showToast('Đã thêm địa chỉ giao hàng mới.');
    } catch (err: any) {
      console.error("Lỗi khi thêm địa chỉ:", err);
      const errMsg = err.response?.data?.detail || 'Thêm địa chỉ thất bại. Vui lòng thử lại.';
      showToast(errMsg, 'info');
    }
  };

  const handleDeleteAddress = async (id: number) => {
    try {
      await addressService.deleteAddress(id);
      const deletedWasDefault = addresses.find(addr => addr.id === id)?.isDefault;
      const updated = addresses.filter(addr => addr.id !== id);
      if (deletedWasDefault && updated.length > 0) {
        const refreshed = await addressService.getAddresses();
        setAddresses(refreshed);
      } else {
        setAddresses(updated);
      }
      showToast('Đã xóa địa chỉ giao hàng.', 'info');
    } catch (err) {
      console.error("Lỗi khi xóa địa chỉ:", err);
      showToast('Xóa địa chỉ thất bại. Vui lòng thử lại.', 'info');
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      const updated = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id
      }));
      setAddresses(updated);
      showToast('Đã thiết lập địa chỉ mặc định mới.');
    } catch (err) {
      console.error("Lỗi khi thiết lập địa chỉ mặc định:", err);
      showToast('Thiết lập địa chỉ mặc định thất bại.', 'info');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Đăng xuất thành công. Đang chuyển hướng...', 'info');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  // Dynamic filtering of vouchers
  const filteredVouchers = vouchers.filter(voucher => {
    // 1. Filter by status sub-tab
    if (voucherFilter === 'all') {
      if (voucher.status !== 'active' && voucher.status !== 'upcoming') return false;
    } else {
      if (voucher.status !== voucherFilter) return false;
    }

    // 2. Filter by type filter
    if (voucherTypeFilter !== 'all_types') {
      if (voucher.type !== voucherTypeFilter) return false;
    }

    return true;
  });

  // Redirect to login if user is not authenticated
  if (!isAuthenticated && !user) {
    return (
      <main className="min-h-screen bg-[#fcfaf7] pt-32 pb-24 flex items-center justify-center font-sans">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white border border-[#d4c3be]/40 p-8 rounded-lg text-center shadow-lg mx-4"
        >
          <ShieldAlert className="w-16 h-16 text-[#8a726b] mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-primary mb-2">Tài khoản bảo mật</h2>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
            Chào mừng quý khách đến với Từ Tâm Phục. Vui lòng đăng nhập hoặc tạo tài khoản mới để quản lý đơn đặt hàng và địa chỉ giao nhận của mình.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/login"
              className="px-6 py-3 bg-primary text-white font-semibold text-xs tracking-wider uppercase rounded-xs hover:bg-[#2c160e] transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 border border-[#d4c3be] text-on-surface font-semibold text-xs tracking-wider uppercase rounded-xs hover:bg-[#ece0dc]/30 transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fcfaf7] pt-32 pb-24 font-sans text-xs md:text-sm text-on-surface">
      <div className="max-w-7xl mx-auto px-6 md:px-16 w-full">

        {/* Title */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#eeeeee] pb-6">
          <div>
            <span className="text-[10px] uppercase font-extrabold tracking-[0.25em] text-[#5d4037] mb-1.5 block">
              Trang thông tin khách hàng
            </span>
            <h1 className="font-serif text-3xl font-bold text-primary tracking-wide">
              Tài Khoản Của Tôi
            </h1>
          </div>
          <div className="text-xs text-on-surface-variant flex items-center gap-1">
            <span>Chào mừng quay trở lại,</span>
            <span className="text-primary font-bold">{user?.full_name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

          {/* Left panel menu cards */}
          <div className="lg:col-span-1 flex flex-col gap-6 sticky top-32">
            {/* Short Profile Header */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group w-16 h-16 rounded-full overflow-hidden bg-surface-container border border-outline-variant shadow-xs">
                <img
                  alt={user?.full_name}
                  src={avatarUrl}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    const newUrl = prompt('Nhập đường dẫn URL ảnh đại diện mới của bạn:', avatarUrl);
                    if (newUrl) setAvatarUrl(newUrl);
                  }}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-300 cursor-pointer border-none"
                  title="Thay ảnh đại diện"
                >
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <p className="font-headline-sm text-headline-sm text-primary leading-tight">{user?.full_name}</p>
                <p className="font-caption text-caption text-on-secondary-fixed-variant">Khách hàng thành viên</p>
              </div>
            </div>

            {/* Selection tabs */}
            <nav className="flex flex-col gap-6 pl-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 text-left transition-all duration-500 font-label-md text-label-md tracking-normal bg-transparent border-none cursor-pointer ${
                  activeTab === 'profile'
                    ? 'text-primary font-bold'
                    : 'text-on-secondary-fixed-variant hover:text-primary'
                }`}
              >
                <UserIcon size={20} />
                <span>Thông tin cá nhân</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-3 text-left transition-all duration-500 font-label-md text-label-md tracking-normal bg-transparent border-none cursor-pointer ${
                  activeTab === 'orders'
                    ? 'text-primary font-bold'
                    : 'text-on-secondary-fixed-variant hover:text-primary'
                }`}
              >
                <ShoppingBag size={20} />
                <span>Đơn hàng của tôi</span>
              </button>

              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex items-center gap-3 text-left transition-all duration-500 font-label-md text-label-md tracking-normal bg-transparent border-none cursor-pointer ${
                  activeTab === 'favorites'
                    ? 'text-primary font-bold'
                    : 'text-on-secondary-fixed-variant hover:text-primary'
                }`}
              >
                <Heart size={20} />
                <span>Sản phẩm yêu thích</span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center gap-3 text-left transition-all duration-500 font-label-md text-label-md tracking-normal bg-transparent border-none cursor-pointer ${
                  activeTab === 'addresses'
                    ? 'text-primary font-bold'
                    : 'text-on-secondary-fixed-variant hover:text-primary'
                }`}
              >
                <MapPin size={20} />
                <span>Địa chỉ</span>
              </button>

              <button
                onClick={() => setActiveTab('offers')}
                className={`flex items-center gap-3 text-left transition-all duration-500 font-label-md text-label-md tracking-normal bg-transparent border-none cursor-pointer ${
                  activeTab === 'offers'
                    ? 'text-primary font-bold'
                    : 'text-on-secondary-fixed-variant hover:text-primary'
                }`}
              >
                <Ticket size={20} />
                <span>Kho ưu đãi</span>
              </button>


              <div className="h-[1px] bg-outline-variant/30 my-2" />

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-left transition-all duration-500 font-label-md text-label-md tracking-normal text-on-secondary-fixed-variant hover:text-error bg-transparent border-none cursor-pointer"
              >
                <LogOut size={20} />
                <span>Đăng xuất</span>
              </button>
            </nav>
          </div>

          {/* Right main panel display details */}
          <div className="lg:col-span-3">
            <div className="min-h-[420px] relative w-full lg:pl-8">

              {/* Tab 1: Profile Editing / Viewing */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-10 border-b border-[#eeeeee] pb-4">
                    <h2 className="font-serif text-lg font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                      <Sparkles size={16} /> Thông Tin Cá Nhân
                    </h2>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-6 py-2.5 border border-primary text-primary hover:bg-[#ece0dc]/40 font-semibold text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent"
                      >
                        <Save size={13} /> Thay đổi thông tin
                      </button>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {!isEditingProfile ? (
                      <motion.div
                        key="view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                      >
                        {/* Personal Details Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div className="border-b border-[#d4c3be]/30 py-2 space-y-1">
                            <span className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest">Họ và tên</span>
                            <p className="font-body-lg text-body-lg text-primary">{fullName}</p>
                          </div>

                          <div className="border-b border-[#d4c3be]/30 py-2 space-y-1">
                            <span className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest">Số điện thoại</span>
                            <p className="font-body-lg text-body-lg text-primary">{phone}</p>
                          </div>

                          <div className="border-b border-[#d4c3be]/30 py-2 space-y-1">
                            <span className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest">Địa chỉ Email</span>
                            <p className="font-body-lg text-body-lg text-primary">{email}</p>
                          </div>
                        </div>

                        {/* Shipping Address Read-only block */}
                        <div className="space-y-4 pt-4">
                          <div className="flex items-center gap-2 text-primary border-b border-[#d4c3be]/30 pb-2">
                            <MapPin size={16} />
                            <h3 className="font-serif font-bold text-sm uppercase tracking-wider">Địa chỉ giao hàng hiện tại</h3>
                          </div>

                          {shippingAddress ? (
                            <>
                              <p className="text-sm text-on-surface font-semibold leading-relaxed py-1">
                                {shippingAddress}
                              </p>

                              {/* Map Widget (Read-Only Preview) */}
                              <div className="border border-[#eeeeee] rounded-xs overflow-hidden h-[180px] bg-[#e5e3df] max-w-2xl">
                                <iframe
                                  title="Google Map ReadOnly Preview"
                                  src={`https://maps.google.com/maps?q=${encodeURIComponent(shippingAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                  className="w-full h-full border-none pointer-events-none"
                                  loading="lazy"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-start gap-3 py-4">
                              <p className="text-sm text-on-surface-variant font-medium">Bạn chưa thiết lập địa chỉ giao hàng.</p>
                              <button
                                type="button"
                                onClick={() => setIsEditingProfile(true)}
                                className="px-4 py-2 bg-primary text-white text-xs font-semibold uppercase tracking-wider rounded-xs flex items-center gap-1.5 hover:bg-[#2c160e] transition-colors cursor-pointer border-none"
                              >
                                <Plus size={14} /> Thêm địa chỉ
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Security Details Card */}
                        <div className="border-t border-[#d4c3be]/30 pt-6 flex items-center justify-between max-w-2xl">
                          <div className="space-y-1">
                            <span className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest">Mật khẩu tài khoản</span>
                            <p className="font-mono text-[#442a22] text-sm">••••••••••••</p>
                          </div>
                          <span className="text-[10px] bg-emerald-50/50 text-emerald-700 font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                            <Lock size={10} /> Đã bảo vệ
                          </span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-8"
                      >
                        <div className="flex justify-between items-center border-b border-[#eeeeee] pb-3">
                          <h3 className="font-serif font-bold text-primary text-sm uppercase">Cập nhật thông tin chi tiết</h3>
                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                            className="text-xs text-on-surface-variant hover:text-primary hover:underline bg-transparent border-none cursor-pointer"
                          >
                            Quay lại
                          </button>
                        </div>

                        <form onSubmit={handleUpdateProfile} className="space-y-8 max-w-2xl">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                              <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Họ và tên</label>
                              <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input-line font-body-md text-body-md"
                                required
                              />
                            </div>
                            <div>
                              <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Số điện thoại</label>
                              <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="input-line font-body-md text-body-md"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Địa chỉ Email</label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="input-line font-body-md text-body-md"
                              required
                            />
                          </div>

                          {/* Địa chỉ giao hàng & Google Map */}
                          <div className="w-full h-[1px] bg-[#eeeeee] my-6" />

                          <div className="space-y-4">
                            <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                              <MapPin size={15} /> Địa Chỉ Giao Hàng & Định Vị Bản Đồ
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                              <div className="md:col-span-2">
                                <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Địa chỉ nhận hàng</label>
                                <input
                                  type="text"
                                  value={shippingAddress}
                                  onChange={(e) => setShippingAddress(e.target.value)}
                                  placeholder="Nhập địa chỉ cụ thể của bạn..."
                                  className="input-line font-body-md text-body-md"
                                  required
                                />
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={handleLocateUser}
                                  disabled={isLoadingLocation}
                                  className="w-full py-2 border border-primary text-primary hover:bg-primary/5 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 h-[38px] bg-transparent"
                                >
                                  <Sparkles size={13} className={isLoadingLocation ? "animate-spin" : ""} />
                                  {isLoadingLocation ? 'Đang định vị...' : 'Định vị GPS'}
                                </button>
                              </div>
                            </div>

                            {/* Interactive Google Map Mockup / Iframe */}
                            <div className="border border-[#d4c3be]/60 overflow-hidden bg-white shadow-xs">
                              {/* Map Header Search */}
                              <div className="bg-[#fcfaf7] px-4 py-2 border-b border-[#d4c3be]/40 flex gap-2 items-center">
                                <span className="text-[10px] uppercase font-bold text-primary">Google Map Preview:</span>
                                <input
                                  type="text"
                                  placeholder="Tìm kiếm địa điểm..."
                                  value={mapSearch}
                                  onChange={(e) => setMapSearch(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      if (mapSearch) setShippingAddress(mapSearch);
                                    }
                                  }}
                                  className="flex-1 input-line font-caption text-caption h-7 py-1"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (mapSearch) setShippingAddress(mapSearch);
                                  }}
                                  className="px-3 py-1 bg-primary text-white font-semibold text-[10px] uppercase tracking-wider hover:bg-[#2c160e] h-7 border-none cursor-pointer"
                                >
                                  Tìm
                                </button>
                              </div>

                              {/* Actual Dynamic Google Map Iframe */}
                              <div className="relative aspect-video w-full h-[220px] bg-[#e5e3df]">
                                {shippingAddress ? (
                                  <iframe
                                    title="Google Map Locator"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent(shippingAddress)}&t=&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`}
                                    className="w-full h-full border-none"
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/60 gap-1 text-xs">
                                    <MapPin size={24} className="opacity-40 animate-bounce" />
                                    Vui lòng nhập địa chỉ để xem bản đồ định vị
                                  </div>
                                )}

                                {/* Map zoom controls widget */}
                                <div className="absolute bottom-3 right-3 flex flex-col gap-1 z-10">
                                  <button
                                    type="button"
                                    onClick={() => setMapZoom(prev => Math.min(20, prev + 1))}
                                    className="w-7 h-7 bg-white text-on-surface font-bold border border-[#d4c3be]/80 shadow-sm flex items-center justify-center hover:bg-surface-container hover:scale-105 active:scale-95 text-sm cursor-pointer"
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMapZoom(prev => Math.max(1, prev - 1))}
                                    className="w-7 h-7 bg-white text-on-surface font-bold border border-[#d4c3be]/80 shadow-sm flex items-center justify-center hover:bg-surface-container hover:scale-105 active:scale-95 text-sm cursor-pointer"
                                  >
                                    -
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Đổi mật khẩu section */}
                          <div className="w-full h-[1px] bg-[#eeeeee] my-6" />

                          <div className="space-y-4">
                            <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                              <Lock size={15} /> Thiết Lập Bảo Mật & Đổi Mật Khẩu
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="relative">
                                <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Mật khẩu hiện tại</label>
                                <div className="relative">
                                  <input
                                    type={showCurrentPw ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="input-line font-body-md text-body-md pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                    className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                                  >
                                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                              </div>

                              <div className="relative">
                                <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Mật khẩu mới</label>
                                <div className="relative">
                                  <input
                                    type={showNewPw ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input-line font-body-md text-body-md pr-10"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowNewPw(!showNewPw)}
                                    className="absolute right-0 bottom-2 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                                  >
                                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="w-full">
                              <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Xác nhận mật khẩu mới</label>
                              <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-line font-body-md text-body-md"
                              />
                            </div>
                          </div>

                          <div className="flex gap-4 justify-end pt-4">
                            <button
                              type="button"
                              onClick={() => setIsEditingProfile(false)}
                              className="px-8 py-3 border border-outline-variant hover:bg-[#ece0dc]/20 text-on-secondary-fixed-variant font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer bg-transparent"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className="px-8 py-3 border border-primary text-primary hover:bg-primary/5 font-semibold text-xs tracking-wider uppercase transition-colors flex items-center gap-2 cursor-pointer bg-transparent"
                            >
                              <Save size={13} /> Lưu thông tin mới
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Tab 1.2: Favorites (Sản phẩm yêu thích) */}
              {activeTab === 'favorites' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-10 border-b border-[#eeeeee] pb-4">
                    <h2 className="font-serif text-lg font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                      <Heart size={16} /> Sản phẩm yêu thích
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {mappedFavorites.map((product) => (
                      <div key={product.id} className="group relative bg-[#fcfaf7] border border-[#d4c3be]/40 overflow-hidden rounded-sm transition-all duration-300 hover:shadow-md flex flex-col h-full justify-between">
                        {/* Product Image */}
                        <div className="aspect-[3/4] overflow-hidden bg-white relative">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Heart Icon Button (Active Favorite) */}
                          <button
                            type="button"
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-error border-none cursor-pointer hover:scale-110 transition-transform"
                            onClick={() => handleRemoveFavorite(product.dbId)}
                          >
                            <Heart size={16} fill="currentColor" />
                          </button>
                        </div>

                        {/* Product Details */}
                        <div className="p-4 flex flex-col justify-between flex-1">
                          <div>
                            <p className="text-[10px] text-on-secondary-fixed-variant uppercase tracking-widest font-semibold mb-1">
                              {product.category}
                            </p>
                            <Link to={`/san-pham/${product.id}`} className="font-serif font-bold text-sm text-[#442a22] hover:text-primary transition-colors block line-clamp-1">
                              {product.name}
                            </Link>
                          </div>
                          
                          <div className="mt-3 flex items-center justify-between border-t border-[#eeeeee] pt-2">
                            <span className="font-serif font-bold text-primary text-xs">
                              {formatPrice(product.price)}
                            </span>
                            <Link
                              to={`/san-pham/${product.id}`}
                              className="text-[10px] uppercase font-extrabold tracking-wider text-primary hover:text-primary-container transition-colors"
                            >
                              Mua ngay
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {mappedFavorites.length === 0 && (
                      <div className="col-span-3 py-16 flex flex-col items-center justify-center text-on-surface-variant/60 gap-2 border border-dashed border-[#d4c3be]/50 rounded-sm w-full">
                        <Heart size={28} className="opacity-40" />
                        <p className="text-xs font-medium">Chưa có sản phẩm yêu thích nào.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tab 1.5: Offers / Vouchers */}
              {activeTab === 'offers' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6 border-b border-[#eeeeee] pb-2">
                    <h2 className="font-serif text-lg font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                      <Ticket size={16} /> Kho Ưu Đãi Của Tôi
                    </h2>
                  </div>

                  {/* Voucher Status Tabs */}
                  <div className="flex border-b border-[#eeeeee] mb-6 overflow-x-auto scrollbar-none gap-2 md:gap-4 whitespace-nowrap pb-1">
                    {[
                      { key: 'all', label: 'Tất cả' },
                      { key: 'used', label: 'Đã dùng' },
                      { key: 'expired', label: 'Hết hạn' }
                    ].map((subTab) => {
                      const count = subTab.key === 'all'
                        ? vouchers.filter(v => v.status === 'active' || v.status === 'upcoming').length
                        : vouchers.filter(v => v.status === subTab.key).length;
                      const isActive = voucherFilter === subTab.key;
                      return (
                        <button
                          key={subTab.key}
                          type="button"
                          onClick={() => setVoucherFilter(subTab.key as any)}
                          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${isActive
                              ? 'border-primary text-primary'
                              : 'border-transparent text-on-surface-variant hover:text-primary'
                            }`}
                        >
                          {subTab.label}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-primary text-white' : 'bg-[#eeeeee] text-on-surface-variant'
                            }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Voucher Type Secondary Filters */}
                  <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
                    {[
                      { key: 'all_types', label: 'Tất cả loại thẻ' },
                      { key: 'exclusive', label: 'Chào mừng thành viên' },
                      { key: 'holiday', label: 'Dịp Lễ Hội' }
                    ].map((typeFilter) => {
                      const isActive = voucherTypeFilter === typeFilter.key;
                      return (
                        <button
                          key={typeFilter.key}
                          type="button"
                          onClick={() => setVoucherTypeFilter(typeFilter.key as any)}
                          className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all border cursor-pointer whitespace-nowrap ${isActive
                              ? 'bg-primary text-white border-primary'
                              : 'bg-transparent text-on-surface-variant border-[#d4c3be]/40 hover:border-primary hover:text-primary'
                            }`}
                        >
                          {typeFilter.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Voucher Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredVouchers.length > 0 ? (
                      filteredVouchers.map((voucher) => (
                        <div
                          key={voucher.id}
                          className={`flex border rounded-sm overflow-hidden bg-white relative transition-all ${
                              voucher.status === 'active'
                                ? 'border-[#d4c3be]/60 shadow-xs hover:shadow-md'
                                : voucher.status === 'upcoming'
                                  ? 'border-[#d4c3be]/30 opacity-55 hover:opacity-75 transition-opacity'
                                  : 'border-[#eeeeee] opacity-45'
                            }`}
                        >
                          {/* Left Ticket Stub */}
                          <div className={`w-28 flex flex-col items-center justify-center text-white px-3 relative ${
                              voucher.status === 'active'
                                ? 'bg-gradient-to-br from-primary to-[#503126]'
                                : 'bg-neutral-400'
                            }`}>
                            <div className="absolute top-0 bottom-0 left-0 w-1 flex flex-col justify-around py-1">
                              {[...Array(6)].map((_, i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-white opacity-40" />
                              ))}
                            </div>

                            <div className="text-center">
                              <span className="text-[10px] uppercase font-bold tracking-wider opacity-90">
                                {voucher.discountType === 'percentage' ? 'Giảm' : 'Giảm ngay'}
                              </span>
                              <p className="text-xl font-serif font-black leading-none my-1">
                                {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : formatPrice(voucher.discountValue)}
                              </p>
                              <span className="text-[9px] uppercase tracking-widest font-semibold px-1.5 py-0.5 bg-white/20 rounded-xs">
                                {voucher.code}
                              </span>
                            </div>
                          </div>

                          {/* Right Ticket Body */}
                          <div className="flex-1 p-4 flex flex-col justify-between space-y-2 bg-[#fcfaf7]">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs ${
                                    voucher.type === 'exclusive'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : voucher.type === 'holiday'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}>
                                  {voucher.type === 'exclusive' ? 'Chào mừng' : voucher.type === 'holiday' ? 'Lễ hội' : 'Thân thiết'}
                                </span>

                                {voucher.status === 'used' && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-gray-100 text-gray-500 border border-gray-200">
                                    Đã sử dụng
                                  </span>
                                )}
                                {voucher.status === 'expired' && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-red-100 text-red-500 border border-red-200">
                                    Hết hạn
                                  </span>
                                )}
                                {voucher.status === 'upcoming' && (
                                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-xs bg-blue-50 text-blue-700 border border-blue-200">
                                    Chưa tới ngày dùng
                                  </span>
                                )}
                              </div>

                              <h4 className="font-serif text-xs font-bold text-[#442a22] leading-tight">
                                {voucher.title}
                              </h4>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                                {voucher.description}
                              </p>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-[#eeeeee] text-[10px]">
                              <span className="text-on-surface-variant font-medium">
                                HSD: {voucher.expiryDate}
                              </span>

                              {voucher.status === 'active' ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(voucher.code);
                                    showToast(`Đã sao chép mã ưu đãi: ${voucher.code}`);
                                  }}
                                  className="px-3 py-1 bg-primary text-white hover:bg-[#2c160e] text-[9px] font-bold uppercase tracking-wider rounded-xs border-none cursor-pointer transition-colors"
                                >
                                  Dùng ngay
                                </button>
                              ) : (
                                <span className="text-on-surface-variant/50 font-bold uppercase tracking-wider">
                                  {voucher.status === 'used' ? 'Đã dùng' : voucher.status === 'expired' ? 'Hết hạn' : 'Chưa tới ngày'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Ticket cutout effect decoration */}
                          <div className="absolute top-1/2 -translate-y-1/2 left-[110px] w-2 h-4 rounded-r-full bg-white border-y border-r border-[#d4c3be]/40" />
                          <div className="absolute top-1/2 -translate-y-1/2 right-[-1px] w-2 h-4 rounded-l-full bg-white border-y border-l border-[#d4c3be]/40" />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 py-12 flex flex-col items-center justify-center text-on-surface-variant/60 gap-2 border border-dashed border-[#d4c3be]/50 rounded-sm w-full">
                        <Ticket size={28} className="opacity-40" />
                        <p className="text-xs font-medium">Không tìm thấy mã ưu đãi nào phù hợp</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Orders List */}
              {activeTab === 'orders' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-serif text-lg font-bold text-primary mb-6 border-b border-[#eeeeee] pb-2 uppercase tracking-wide">
                    Lịch Sử Mua Hàng
                  </h2>

                  <div className="flex border-b border-[#eeeeee] mb-6 overflow-x-auto scrollbar-none gap-2 md:gap-4 whitespace-nowrap pb-1">
                    {[
                      { key: 'all', label: 'Tất cả' },
                      { key: 'pending', label: 'Chờ xác nhận' },
                      { key: 'processing', label: 'Chờ lấy hàng' },
                      { key: 'shipping', label: 'Chờ giao hàng' },
                      { key: 'delivered', label: 'Đã giao' },
                      { key: 'returned', label: 'Trả hàng' },
                      { key: 'cancelled', label: 'Đã hủy' }
                    ].map((filter) => {
                      const count = filter.key === 'all'
                        ? dbOrders.length
                        : dbOrders.filter(o => {
                            if (filter.key === 'shipping') return o.status === 'shipped';
                            if (filter.key === 'returned') return o.status === 'refunded';
                            if (filter.key === 'processing') return o.status === 'processing' || o.status === 'confirmed';
                            return o.status === filter.key;
                          }).length;
                      const isActive = orderFilter === filter.key;
                      return (
                        <button
                          key={filter.key}
                          type="button"
                          onClick={() => setOrderFilter(filter.key as any)}
                          className={`pb-3 px-1.5 border-b-2 text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer bg-transparent border-none ${isActive
                              ? 'border-primary text-primary'
                              : 'border-transparent text-on-surface-variant hover:text-primary'
                            }`}
                        >
                          {filter.label}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isActive
                              ? 'bg-primary text-white'
                              : 'bg-[#ece0dc]/70 text-primary'
                            }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {loadingOrders ? (
                    <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant/60 gap-3">
                      <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <p className="text-xs font-medium">Đang tải danh sách đơn hàng...</p>
                    </div>
                  ) : ordersError ? (
                    <div className="text-center py-12 text-red-700 bg-red-50 border border-red-200 rounded-sm">
                      {ordersError}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {dbOrders.filter(order => {
                        if (orderFilter === 'all') return true;
                        if (orderFilter === 'shipping') return order.status === 'shipped';
                        if (orderFilter === 'returned') return order.status === 'refunded';
                        if (orderFilter === 'processing') return order.status === 'processing' || order.status === 'confirmed';
                        return order.status === orderFilter;
                      }).map((order) => (
                        <div
                          key={order.id}
                          onClick={(e) => {
                            if (!(e.target as HTMLElement).closest('a') && !(e.target as HTMLElement).closest('button')) {
                              navigate(`/don-hang/${order.id}`);
                            }
                          }}
                          className="border border-[#d4c3be]/40 rounded-sm overflow-hidden cursor-pointer hover:border-primary transition-colors group"
                        >
                          {/* Order info header */}
                          <div className="bg-[#ece0dc]/20 px-5 py-3 border-b border-[#d4c3be]/40 flex flex-wrap items-center justify-between gap-3 text-xs group-hover:bg-[#ece0dc]/40 transition-colors">
                            <div className="flex gap-4">
                              <div>
                                <span className="text-on-surface-variant font-medium mr-1.5">Mã đơn:</span>
                                <span className="font-mono font-bold text-primary">{order.order_code}</span>
                              </div>
                              <div>
                                <span className="text-on-surface-variant font-medium mr-1.5">Ngày mua:</span>
                                <span className="font-bold">
                                  {new Date(order.created_at).toLocaleDateString('vi-VN')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 font-bold font-sans">
                              {order.status === 'delivered' ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 text-[10px] uppercase tracking-wide">
                                  <CheckCircle size={10} /> {getStatusText(order.status)}
                                </span>
                              ) : order.status === 'cancelled' ? (
                                <span className="text-error bg-error/5 px-2.5 py-0.5 rounded-full border border-error/20 flex items-center gap-1 text-[10px] uppercase tracking-wide">
                                  {getStatusText(order.status)}
                                </span>
                              ) : (
                                <span className="text-[#8a726b] bg-[#ece0dc]/50 px-2.5 py-0.5 rounded-full border border-[#d4c3be]/30 flex items-center gap-1 text-[10px] uppercase tracking-wide">
                                  <Clock size={10} /> {getStatusText(order.status)}
                                </span>
                              )}
                              <span className="text-primary ml-2 group-hover:underline text-[10px] uppercase font-bold tracking-wide">
                                Xem chi tiết ›
                              </span>
                            </div>
                          </div>

                          {/* Order items lists */}
                          <div className="p-4 space-y-4">
                            {order.items.map((item: any, idx: number) => {
                              const pName = item.product?.name || item.product_snapshot?.name || 'Sản phẩm Từ Tâm Phục';
                              const pImage = getImageUrl(item.product?.images?.[0]?.url || item.product_snapshot?.image || '');
                              const pColor = item.product_snapshot?.color || 'Mặc định';
                              const pSize = item.product_snapshot?.size || item.size || 'Mặc định';
                              
                              return (
                                <div key={idx} className="flex gap-4 items-start">
                                  {pImage && (
                                    <img
                                      alt={pName}
                                      src={pImage}
                                      className="w-12 h-15 object-cover rounded-xs border border-[#d4c3be]/30"
                                      referrerPolicy="no-referrer"
                                    />
                                  )}
                                  <div className="flex-1">
                                    {item.product?.id ? (
                                      <Link to={`/san-pham/${item.product.slug}`} className="font-serif font-bold text-[#442a22] hover:text-primary transition-colors flex items-center gap-1">
                                        {pName} <ExternalLink size={11} className="opacity-50" />
                                      </Link>
                                    ) : (
                                      <span className="font-serif font-bold text-[#442a22]">{pName}</span>
                                    )}
                                    <div className="text-[11px] text-on-surface-variant mt-1">
                                      <span>Màu: <span className="font-bold">{pColor}</span></span>
                                      <span className="mx-2">•</span>
                                      <span>Kích cỡ: <span className="font-bold">{pSize}</span></span>
                                      <span className="mx-2">•</span>
                                      <span>Số lượng: <span className="font-bold">{item.quantity}</span></span>
                                    </div>
                                    {order.status === 'delivered' && (item.product?.id || item.product_id) && (
                                      item.is_reviewed ? (
                                        <button
                                          type="button"
                                          disabled
                                          className="mt-2 px-3 py-1 border border-[#d4c3be] text-on-surface-variant/40 font-semibold text-[10px] uppercase tracking-wider bg-transparent rounded-xs flex items-center gap-1 w-fit cursor-not-allowed opacity-60"
                                        >
                                          <CheckCircle size={11} className="text-emerald-600/60" />
                                          Đã đánh giá
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleOpenReviewModal(item.product?.id || item.product_id, pName, item.id);
                                          }}
                                          className="mt-2 px-3 py-1 border border-primary text-primary hover:bg-[#ece0dc]/30 font-semibold text-[10px] uppercase tracking-wider transition-colors cursor-pointer bg-transparent rounded-xs flex items-center gap-1 w-fit"
                                        >
                                          <Star size={11} fill="currentColor" />
                                          Đánh giá sản phẩm
                                        </button>
                                      )
                                    )}
                                  </div>
                                  <div className="text-right text-xs font-semibold">
                                    {formatPrice(item.price)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Total costs bottom */}
                          <div className="bg-[#fcfaf7] px-5 py-3 border-t border-[#eeeeee] flex justify-between items-center text-xs">
                            <div>
                              <span className="text-on-surface-variant mr-1">Hình thức thanh toán:</span>
                              <span className="font-bold text-[#5d4037]">{getPaymentMethodText(order.payment_method)}</span>
                              <span className="text-on-surface-variant/40 mx-2">•</span>
                              <span className="text-on-surface-variant mr-1">Thanh toán:</span>
                              <span className={`font-bold ${order.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {getPaymentStatusText(order.payment_status)}
                              </span>
                            </div>
                            <div className="text-right font-serif text-sm">
                              <span className="text-xs font-sans text-on-surface-variant mr-2">Tổng tiền:</span>
                              <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      ))}

                    {dbOrders.filter(order => {
                      if (orderFilter === 'all') return true;
                      if (orderFilter === 'shipping') return order.status === 'shipped';
                      if (orderFilter === 'returned') return order.status === 'refunded';
                      if (orderFilter === 'processing') return order.status === 'processing' || order.status === 'confirmed';
                      return order.status === orderFilter;
                    }).length === 0 && (
                      <div className="text-center py-12 text-on-surface-variant/80 bg-[#fcfaf7] border border-[#d4c3be]/20 rounded-sm">
                        Không có đơn hàng nào trong mục này.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

              {/* Tab 3: Addresses Book */}
              {activeTab === 'addresses' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6 border-b border-[#eeeeee] pb-2">
                    <h2 className="font-serif text-lg font-bold text-primary uppercase tracking-wide">
                      Sổ Địa Chỉ Giao Hàng
                    </h2>
                    {!showAddressForm && (
                      <button
                        onClick={() => setShowAddressForm(true)}
                        className="px-3.5 py-1.5 border border-primary text-primary hover:bg-[#eeeeee]/40 font-semibold text-xs tracking-wider uppercase transition-colors flex items-center gap-1 rounded-xs cursor-pointer"
                      >
                        <Plus size={12} /> Thêm địa chỉ mới
                      </button>
                    )}
                  </div>

                  {/* Add address dialog inline */}
                  <AnimatePresence>
                    {showAddressForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#fcfaf7] border border-[#d4c3be]/40 p-5 mb-8"
                      >
                        <h3 className="font-serif font-bold text-primary text-sm mb-4">Địa chỉ giao hàng mới</h3>
                        <form onSubmit={handleAddAddress} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Tên người nhận</label>
                              <input
                                type="text"
                                value={newAddrName}
                                onChange={(e) => setNewAddrName(e.target.value)}
                                className="input-line text-xs font-body-md text-body-md py-1.5"
                                placeholder="Họ và tên"
                                required
                              />
                            </div>
                            <div>
                              <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Số điện thoại</label>
                              <input
                                type="tel"
                                value={newAddrPhone}
                                onChange={(e) => setNewAddrPhone(e.target.value)}
                                className="input-line text-xs font-body-md text-body-md py-1.5"
                                placeholder="098..."
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                              <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Tỉnh / Thành phố</label>
                              <input
                                type="text"
                                value={newAddrProvince}
                                onChange={(e) => setNewAddrProvince(e.target.value)}
                                className="input-line text-xs font-body-md text-body-md py-1.5"
                                placeholder="Ví dụ: TP. Hồ Chí Minh"
                                required
                              />
                            </div>
                            <div>
                              <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Quận / Huyện</label>
                              <input
                                type="text"
                                value={newAddrDistrict}
                                onChange={(e) => setNewAddrDistrict(e.target.value)}
                                className="input-line text-xs font-body-md text-body-md py-1.5"
                                placeholder="Ví dụ: Quận 1"
                                required
                              />
                            </div>
                            <div>
                              <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Phường / Xã</label>
                              <input
                                type="text"
                                value={newAddrWard}
                                onChange={(e) => setNewAddrWard(e.target.value)}
                                className="input-line text-xs font-body-md text-body-md py-1.5"
                                placeholder="Ví dụ: Phường Bến Nghé"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5">Số nhà, tên đường</label>
                            <input
                              type="text"
                              value={newAddrStreet}
                              onChange={(e) => setNewAddrStreet(e.target.value)}
                              className="input-line text-xs font-body-md text-body-md py-1.5"
                              placeholder="Ví dụ: 12 Lê Lợi"
                              required
                            />
                          </div>

                          {/* Google Map Preview for new address */}
                          <div className="space-y-2">
                            <label className="block font-caption text-caption text-on-secondary-fixed-variant uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                              <MapPin size={13} /> Bản đồ định vị địa chỉ mới
                            </label>
                            <div className="border border-[#d4c3be]/60 overflow-hidden bg-white shadow-xs">
                              <div className="relative aspect-video w-full h-[180px] bg-[#e5e3df]">
                                {[newAddrStreet, newAddrWard, newAddrDistrict, newAddrProvince].some(Boolean) ? (
                                  <iframe
                                    title="Google Map Address Book Preview"
                                    src={`https://maps.google.com/maps?q=${encodeURIComponent([newAddrStreet, newAddrWard, newAddrDistrict, newAddrProvince].filter(Boolean).join(', '))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                    className="w-full h-full border-none"
                                    allowFullScreen
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant/60 gap-1 text-xs">
                                    <MapPin size={20} className="opacity-40" />
                                    Vui lòng nhập các thông tin địa chỉ ở trên để hiển thị bản đồ định vị
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-4 justify-end pt-2">
                            <button
                              type="button"
                              onClick={() => setShowAddressForm(false)}
                              className="px-6 py-2 border border-outline-variant hover:bg-[#ece0dc]/20 text-on-secondary-fixed-variant font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer bg-transparent"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-2 border border-primary text-primary hover:bg-primary/5 font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer bg-transparent"
                            >
                              Thêm địa chỉ
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* List of current addresses */}
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-5 border rounded-sm flex flex-col gap-2 transition-all ${addr.isDefault ? 'border-primary bg-[#ece0dc]/10' : 'border-[#d4c3be]/40 bg-white'
                          }`}
                      >
                        <div className="flex items-start justify-between gap-4 w-full">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-serif font-bold text-sm text-[#442a22]">{addr.name}</span>
                              {addr.isDefault && (
                                <span className="text-[9px] bg-primary text-white font-bold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-on-surface-variant font-medium">
                              Số điện thoại: <span className="font-bold text-on-surface">{addr.phone}</span>
                            </div>
                            <div className="text-xs leading-relaxed text-on-surface-variant">
                              Địa chỉ: <span className="text-on-surface font-semibold">{[addr.street, addr.ward, addr.district, addr.province].filter(p => p && p !== 'Khác').join(', ')}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 text-right">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setVisibleMapId(visibleMapId === addr.id ? null : addr.id)}
                                className="text-[10px] text-primary font-bold hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1.5"
                                title="Xem vị trí trên bản đồ"
                              >
                                <MapPin size={12} />
                                {visibleMapId === addr.id ? 'Ẩn bản đồ' : 'Xem bản đồ'}
                              </button>
                              <button
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-1 text-on-surface-variant hover:text-error transition-colors bg-transparent border-none cursor-pointer"
                                title="Xóa địa chỉ"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                            {!addr.isDefault && (
                              <button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                className="text-[10px] text-primary font-bold hover:underline bg-transparent border-none cursor-pointer"
                              >
                                Thiết lập mặc định
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Interactive Google Map embed for saved address */}
                        {visibleMapId === addr.id && (
                          <div className="mt-2 border border-[#d4c3be]/40 rounded-xs overflow-hidden h-[180px] bg-[#e5e3df] w-full">
                            <iframe
                              title={`Google Map Address ${addr.id}`}
                              src={`https://maps.google.com/maps?q=${encodeURIComponent([addr.street, addr.ward, addr.district, addr.province].filter(p => p && p !== 'Khác').join(', '))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                              className="w-full h-full border-none"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    ))}

                    {addresses.length === 0 && (
                      <div className="text-center py-10 text-on-surface-variant bg-[#fcfaf7] border border-[#d4c3be]/20 rounded-sm">
                        Chưa có địa chỉ giao hàng nào được lưu.
                      </div>
                    )}
                  </div>
                </motion.div>
              )}



              {/* Legacy security block removed */}


            </div>
          </div>

        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="bg-[#fcfaf7] border border-[#d4c3be]/40 rounded-sm shadow-xl max-w-lg w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto font-sans"
            >
              <button
                onClick={() => setShowReviewModal(false)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
              >
                <span className="text-xl font-bold">&times;</span>
              </button>

              <h2 className="font-serif text-xl md:text-2xl font-bold text-primary mb-2">
                Đánh Giá Sản Phẩm
              </h2>
              <p className="text-xs md:text-sm text-on-surface-variant mb-6 pb-4 border-b border-[#eeeeee]">
                Đánh giá cho sản phẩm: <span className="font-bold text-[#442a22]">{reviewProductName}</span>
              </p>

              <form onSubmit={handleSubmitReview} className="space-y-6 text-xs md:text-sm">
                {/* Rating selection (Stars) */}
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                    Đánh giá của bạn <span className="text-error">*</span>
                  </label>
                  <div className="flex items-center gap-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = reviewHoverRating !== null ? star <= reviewHoverRating : star <= reviewRating;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          onMouseEnter={() => setReviewHoverRating(star)}
                          onMouseLeave={() => setReviewHoverRating(null)}
                          className="text-amber-400 hover:scale-110 transition-transform bg-transparent border-none cursor-pointer p-1"
                        >
                          <Star
                            size={28}
                            fill={isFilled ? "currentColor" : "none"}
                            className="stroke-amber-400"
                          />
                        </button>
                      );
                    })}
                    <span className="ml-3 font-serif font-bold text-[#5d4037] text-sm">
                      {reviewRating} / 5
                    </span>
                  </div>
                </div>

                {/* Review Title */}
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                    Tiêu đề đánh giá
                  </label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Ví dụ: Rất hài lòng, Chất lượng tốt..."
                    className="w-full bg-[#f3f3f3]/60 border-0 border-b border-[#d4c3be] py-2 px-3 focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all duration-300 rounded-xs font-medium"
                  />
                </div>

                {/* Review Content */}
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                    Nội dung đánh giá
                  </label>
                  <textarea
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (vải, form dáng, đường may...)"
                    className="w-full bg-[#f3f3f3]/60 border-0 border-b border-[#d4c3be] p-3 focus:bg-white focus:border-primary focus:ring-0 outline-none transition-all duration-300 rounded-xs"
                    rows={4}
                  />
                 </div>

                {/* Media Upload Section */}
                <div>
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 block">
                    Hình ảnh & Video thực tế
                  </label>
                  
                  {/* Upload Controls */}
                  <div className="flex items-center gap-4 py-1.5">
                    <label className="flex items-center gap-1.5 px-4 py-2 border border-[#d4c3be] hover:bg-[#ece0dc]/20 text-[#5d4037] font-semibold text-[10px] tracking-wider uppercase rounded-xs transition-colors cursor-pointer select-none">
                      <Camera size={13} />
                      <span>Thêm ảnh / video</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleReviewMediaChange}
                        className="hidden"
                      />
                    </label>
                    
                    {isUploadingMedia && (
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        <span>Đang tải lên...</span>
                      </div>
                    )}
                  </div>
                  
                  {mediaError && (
                    <p className="text-xs text-red-600 font-semibold mt-1">{mediaError}</p>
                  )}

                  {/* Previews Grid */}
                  {(reviewImages.length > 0 || reviewVideos.length > 0) && (
                    <div className="grid grid-cols-4 gap-3 mt-3">
                      {/* Images */}
                      {reviewImages.map((url, idx) => (
                        <div key={`img-${idx}`} className="relative aspect-square rounded-xs overflow-hidden border border-[#d4c3be]/30 group">
                          <img
                            src={getImageUrl(url)}
                            alt={`Preview img ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(url)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>
                      ))}

                      {/* Videos */}
                      {reviewVideos.map((url, idx) => (
                        <div key={`vid-${idx}`} className="relative aspect-square rounded-xs overflow-hidden border border-[#d4c3be]/30 group bg-black">
                          <video
                            src={getImageUrl(url)}
                            className="w-full h-full object-cover opacity-80"
                            muted
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">▶</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideo(url)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity border-none cursor-pointer"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Anonymous Review Checkbox */}
                <div className="flex items-center gap-2 py-1 font-sans">
                  <input
                    type="checkbox"
                    id="is-anonymous"
                    checked={reviewIsAnonymous}
                    onChange={(e) => setReviewIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-primary border-[#d4c3be] rounded-xs focus:ring-primary cursor-pointer accent-primary"
                  />
                  <label htmlFor="is-anonymous" className="text-xs text-on-surface-variant font-semibold select-none cursor-pointer">
                    Đánh giá ẩn danh (không hiển thị tên của bạn trên trang chi tiết sản phẩm)
                  </label>
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 justify-end pt-4 border-t border-[#eeeeee]">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-6 py-2.5 border border-outline-variant hover:bg-[#ece0dc]/20 text-on-secondary-fixed-variant font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer bg-transparent rounded-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-6 py-2.5 bg-primary text-white font-semibold text-xs tracking-wider uppercase hover:bg-[#2c160e] transition-colors cursor-pointer border-none rounded-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSubmittingReview ? (
                      <>
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi đánh giá'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating toast alerts */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </main>
  );
}
