import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
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
  ChevronRight,
  ExternalLink,
  Ticket
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { PRODUCTS } from '../../data';
import { formatPrice } from '../../components/ui/ProductCard';
import Toast from '../../components/ui/Toast';

// Mock orders using actual product references for realistic images
const MOCK_ORDERS = [
  {
    id: 'ORD-77291',
    date: '2026-05-24',
    status: 'delivered', // pending | processing | shipping | delivered | returned | cancelled
    statusText: 'Đã giao thành công',
    paymentMethod: 'Chuyển khoản ngân hàng',
    paymentStatus: 'Đã thanh toán',
    items: [
      {
        product: PRODUCTS[0], // Pháp Phục Linen Tự Nhiên
        color: PRODUCTS[0].colors[0],
        size: 'M',
        quantity: 1,
        price: PRODUCTS[0].price
      },
      {
        product: PRODUCTS[2] || PRODUCTS[0], // Khăn Lụa Thêu Sen
        color: (PRODUCTS[2] || PRODUCTS[0]).colors[0],
        size: 'S',
        quantity: 2,
        price: (PRODUCTS[2] || PRODUCTS[0]).price
      }
    ],
    shippingFee: 30000,
    discount: 50000,
    total: PRODUCTS[0].price + ((PRODUCTS[2] || PRODUCTS[0]).price * 2) + 30000 - 50000
  },
  {
    id: 'ORD-10928',
    date: '2026-05-29',
    status: 'processing', // Chờ lấy hàng
    statusText: 'Chờ lấy hàng',
    paymentMethod: 'COD (Thanh toán khi nhận hàng)',
    paymentStatus: 'Chưa thanh toán',
    items: [
      {
        product: PRODUCTS[1] || PRODUCTS[0], // Áo Dài Cách Tân Silk Trắng
        color: (PRODUCTS[1] || PRODUCTS[0]).colors[0],
        size: 'L',
        quantity: 1,
        price: (PRODUCTS[1] || PRODUCTS[0]).price
      }
    ],
    shippingFee: 30000,
    discount: 0,
    total: (PRODUCTS[1] || PRODUCTS[0]).price + 30000
  },
  {
    id: 'ORD-55412',
    date: '2026-05-30',
    status: 'pending', // Chờ xác nhận
    statusText: 'Chờ xác nhận',
    paymentMethod: 'Chuyển khoản ngân hàng',
    paymentStatus: 'Chưa thanh toán',
    items: [
      {
        product: PRODUCTS[2] || PRODUCTS[0],
        color: (PRODUCTS[2] || PRODUCTS[0]).colors[0],
        size: 'M',
        quantity: 1,
        price: (PRODUCTS[2] || PRODUCTS[0]).price
      }
    ],
    shippingFee: 30000,
    discount: 0,
    total: (PRODUCTS[2] || PRODUCTS[0]).price + 30000
  },
  {
    id: 'ORD-98271',
    date: '2026-05-28',
    status: 'shipping', // Chờ giao hàng
    statusText: 'Đang vận chuyển',
    paymentMethod: 'Ví Momo',
    paymentStatus: 'Đã thanh toán',
    items: [
      {
        product: PRODUCTS[0],
        color: PRODUCTS[0].colors[1] || PRODUCTS[0].colors[0],
        size: 'XL',
        quantity: 1,
        price: PRODUCTS[0].price
      }
    ],
    shippingFee: 15000,
    discount: 15000,
    total: PRODUCTS[0].price + 15000 - 15000
  },
  {
    id: 'ORD-88123',
    date: '2026-05-20',
    status: 'cancelled', // Đã hủy
    statusText: 'Đã hủy',
    paymentMethod: 'Chuyển khoản ngân hàng',
    paymentStatus: 'Đã hoàn tiền',
    items: [
      {
        product: PRODUCTS[1] || PRODUCTS[0],
        color: (PRODUCTS[1] || PRODUCTS[0]).colors[0],
        size: 'S',
        quantity: 1,
        price: (PRODUCTS[1] || PRODUCTS[0]).price
      }
    ],
    shippingFee: 30000,
    discount: 0,
    total: (PRODUCTS[1] || PRODUCTS[0]).price + 30000
  },
  {
    id: 'ORD-44102',
    date: '2026-05-15',
    status: 'returned', // Trả hàng
    statusText: 'Đã trả hàng',
    paymentMethod: 'COD (Thanh toán khi nhận hàng)',
    paymentStatus: 'Đã hoàn tiền',
    items: [
      {
        product: PRODUCTS[2] || PRODUCTS[0],
        color: (PRODUCTS[2] || PRODUCTS[0]).colors[0],
        size: 'L',
        quantity: 1,
        price: (PRODUCTS[2] || PRODUCTS[0]).price
      }
    ],
    shippingFee: 30000,
    discount: 0,
    total: (PRODUCTS[2] || PRODUCTS[0]).price + 30000
  }
];

// Mock addresses
const INITIAL_ADDRESSES = [
  {
    id: 1,
    name: 'Nguyễn Văn Khách',
    phone: '0987654321',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    street: '12 Lê Lợi',
    isDefault: true
  },
  {
    id: 2,
    name: 'Nguyễn Văn Khách (Văn phòng)',
    phone: '0987654322',
    province: 'Hà Nội',
    district: 'Quận Hoàn Kiếm',
    ward: 'Phường Tràng Tiền',
    street: '45 Tràng Tiền',
    isDefault: false
  }
];

interface Voucher {
  id: string;
  code: string;
  title: string;
  description: string;
  minOrder?: number;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  expiryDate: string;
  type: 'exclusive' | 'loyalty';
  status: 'active' | 'used' | 'expired';
}

const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v1',
    code: 'TUTAMVIP15',
    title: 'Voucher Độc Quyền Tri Ân Khách Hàng',
    description: 'Giảm 15% tổng hóa đơn cho mọi đơn hàng từ 500.000đ.',
    minOrder: 500000,
    discountValue: 15,
    discountType: 'percentage',
    expiryDate: '30/06/2026',
    type: 'exclusive',
    status: 'active'
  },
  {
    id: 'v2',
    code: 'TUTAM50K',
    title: 'Ưu Đãi Khách Hàng Thân Thiết',
    description: 'Giảm 50.000đ cho khách hàng có tài khoản thân thiết hạng Vàng trở lên.',
    minOrder: 300000,
    discountValue: 50000,
    discountType: 'fixed',
    expiryDate: '15/07/2026',
    type: 'loyalty',
    status: 'active'
  },
  {
    id: 'v3',
    code: 'FREESHIPMAX',
    title: 'Miễn Phí Vận Chuyển Toàn Quốc',
    description: 'Freeship tối đa 30.000đ cho đơn hàng từ 200.000đ.',
    minOrder: 200000,
    discountValue: 30000,
    discountType: 'fixed',
    expiryDate: '25/06/2026',
    type: 'exclusive',
    status: 'active'
  },
  {
    id: 'v4',
    code: 'TUTAMDADUNG',
    title: 'Khuyến Mãi Độc Quyền 10%',
    description: 'Giảm 10% khi mua các sản phẩm Pháp Phục mới.',
    minOrder: 400000,
    discountValue: 10,
    discountType: 'percentage',
    expiryDate: '20/05/2026',
    type: 'exclusive',
    status: 'used'
  },
  {
    id: 'v5',
    code: 'TUTAMEXPIRED',
    title: 'Quà Tặng Tri Ân Thành Viên Thân Thiết',
    description: 'Giảm giá 100.000đ nhân dịp sinh nhật khách hàng thân thiết.',
    minOrder: 0,
    discountValue: 100000,
    discountType: 'fixed',
    expiryDate: '10/05/2026',
    type: 'loyalty',
    status: 'expired'
  }
];

export default function ProfilePage() {
  const { user, isAuthenticated, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  // Selected sub-tab
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses' | 'offers'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Order status sub-filters
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'shipping' | 'delivered' | 'returned' | 'cancelled'>('all');

  // Voucher / Offer filters
  const [voucherFilter, setVoucherFilter] = useState<'all' | 'used' | 'expired'>('all');
  const [voucherTypeFilter, setVoucherTypeFilter] = useState<'all_types' | 'exclusive' | 'loyalty'>('all_types');

  // Default neutral user avatar SVG data URI (styled in theme's warm brown)
  const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238a726b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z'/%3E%3C/svg%3E";

  // Input states for profile
  const [fullName, setFullName] = useState(user?.full_name || 'Khách Hàng');
  const [email, setEmail] = useState(user?.email || 'khachhang@example.com');
  const [phone, setPhone] = useState(user?.phone || '0987654321');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || DEFAULT_AVATAR);

  // Shipping Address & Google Map states
  const [shippingAddress, setShippingAddress] = useState('70 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh');
  const [mapSearch, setMapSearch] = useState('');
  const [mapZoom, setMapZoom] = useState(15);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Security input states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

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
            setShippingAddress('70 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh');
            setIsLoadingLocation(false);
            showToast('Không thể truy cập GPS. Đang sử dụng địa chỉ mặc định.', 'info');
          }, 1000);
        }
      );
    } else {
      setShippingAddress('70 Lê Lợi, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh');
      setIsLoadingLocation(false);
      showToast('Trình duyệt của bạn không hỗ trợ định vị.', 'info');
    }
  };

  // Address list state
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrProvince, setNewAddrProvince] = useState('');
  const [newAddrDistrict, setNewAddrDistrict] = useState('');
  const [newAddrWard, setNewAddrWard] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');

  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'info'
  });

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ isVisible: true, message, type });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update profile details
    updateUser({
      full_name: fullName,
      email,
      phone,
      avatar: avatarUrl
    });
    
    // Check password fields
    if (currentPassword || newPassword || confirmPassword) {
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
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrPhone || !newAddrProvince || !newAddrDistrict || !newAddrWard || !newAddrStreet) {
      showToast('Vui lòng điền đầy đủ thông tin địa chỉ.', 'info');
      return;
    }
    const newAddress = {
      id: Date.now(),
      name: newAddrName,
      phone: newAddrPhone,
      province: newAddrProvince,
      district: newAddrDistrict,
      ward: newAddrWard,
      street: newAddrStreet,
      isDefault: addresses.length === 0
    };
    setAddresses([...addresses, newAddress]);
    setShowAddressForm(false);
    // Reset forms
    setNewAddrName('');
    setNewAddrPhone('');
    setNewAddrProvince('');
    setNewAddrDistrict('');
    setNewAddrWard('');
    setNewAddrStreet('');
    showToast('Đã thêm địa chỉ giao hàng mới.');
  };

  const handleDeleteAddress = (id: number) => {
    const updated = addresses.filter(addr => addr.id !== id);
    // If we delete default, make the first one default
    if (addresses.find(addr => addr.id === id)?.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    setAddresses(updated);
    showToast('Đã xóa địa chỉ giao hàng.', 'info');
  };

  const handleSetDefaultAddress = (id: number) => {
    const updated = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    }));
    setAddresses(updated);
    showToast('Đã thiết lập địa chỉ mặc định mới.');
  };

  const handleLogout = () => {
    logout();
    showToast('Đăng xuất thành công. Đang chuyển hướng...', 'info');
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  // Dynamic filtering of vouchers
  const filteredVouchers = MOCK_VOUCHERS.filter(voucher => {
    // 1. Filter by status sub-tab
    if (voucherFilter === 'all') {
      if (voucher.status !== 'active') return false;
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
          <div className="lg:col-span-1 flex flex-col gap-6">
            {/* Short Profile Header */}
            <div className="bg-white border border-[#d4c3be]/40 rounded-sm p-6 flex flex-col items-center text-center shadow-xs">
              <div className="relative group mb-3">
                <img 
                  alt={user?.full_name}
                  src={avatarUrl}
                  className="w-20 h-20 rounded-full object-cover border border-[#d4c3be]/50"
                />
                <button 
                  onClick={() => {
                    const newUrl = prompt('Nhập đường dẫn URL ảnh đại diện mới của bạn:', avatarUrl);
                    if (newUrl) setAvatarUrl(newUrl);
                  }}
                  className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full hover:scale-105 transition-transform cursor-pointer"
                  title="Thay ảnh đại diện"
                >
                  <Camera size={12} />
                </button>
              </div>
              <h3 className="font-serif text-base font-bold text-primary">{user?.full_name}</h3>
              <span className="text-[10px] bg-[#ece0dc]/60 text-primary font-semibold px-2 py-0.5 rounded-full mt-1.5 border border-[#d4c3be]/20">
                Thành viên Từ Tâm
              </span>
            </div>

            {/* Selection tabs */}
            <div className="bg-white border border-[#d4c3be]/40 rounded-sm overflow-hidden shadow-xs">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between border-b border-[#eeeeee] transition-all font-semibold ${
                  activeTab === 'profile' ? 'bg-[#ece0dc]/30 text-primary border-l-4 border-l-primary pl-4' : 'hover:bg-[#fcfaf7]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <UserIcon size={15} /> Thông tin cá nhân
                </span>
                <ChevronRight size={14} className="opacity-45" />
              </button>
              
              <button 
                onClick={() => setActiveTab('orders')}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between border-b border-[#eeeeee] transition-all font-semibold ${
                  activeTab === 'orders' ? 'bg-[#ece0dc]/30 text-primary border-l-4 border-l-primary pl-4' : 'hover:bg-[#fcfaf7]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <ShoppingBag size={15} /> Lịch sử đơn hàng
                </span>
                <ChevronRight size={14} className="opacity-45" />
              </button>
              
              <button 
                onClick={() => setActiveTab('addresses')}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between border-b border-[#eeeeee] transition-all font-semibold ${
                  activeTab === 'addresses' ? 'bg-[#ece0dc]/30 text-primary border-l-4 border-l-primary pl-4' : 'hover:bg-[#fcfaf7]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <MapPin size={15} /> Sổ địa chỉ nhận hàng
                </span>
                <ChevronRight size={14} className="opacity-45" />
              </button>
              
              <button 
                onClick={() => setActiveTab('offers')}
                className={`w-full text-left px-5 py-3.5 flex items-center justify-between border-b border-[#eeeeee] transition-all font-semibold ${
                  activeTab === 'offers' ? 'bg-[#ece0dc]/30 text-primary border-l-4 border-l-primary pl-4' : 'hover:bg-[#fcfaf7]'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Ticket size={15} /> Kho ưu đãi của tôi
                </span>
                <ChevronRight size={14} className="opacity-45" />
              </button>
              
              {/* Security tab is now integrated into personal info */}

              <button 
                onClick={handleLogout}
                className="w-full text-left px-5 py-4 flex items-center gap-2.5 text-error hover:bg-error/5 transition-all font-semibold border-none cursor-pointer bg-transparent"
              >
                <LogOut size={15} /> Đăng xuất tài khoản
              </button>
            </div>
          </div>

          {/* Right main panel display details */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-[#d4c3be]/40 rounded-sm p-6 md:p-8 min-h-[420px] shadow-xs relative">
              
              {/* Tab 1: Profile Editing / Viewing */}
              {activeTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6 border-b border-[#eeeeee] pb-2">
                    <h2 className="font-serif text-lg font-bold text-primary uppercase tracking-wide flex items-center gap-2">
                      <Sparkles size={16} /> Thông Tin Cá Nhân
                    </h2>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="px-4 py-2 border border-primary text-primary hover:bg-[#ece0dc]/40 font-semibold text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5 rounded-xs cursor-pointer bg-transparent"
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
                        className="space-y-6"
                      >
                        {/* Personal Details Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="p-4 border border-[#d4c3be]/30 bg-[#fcfaf7] rounded-sm space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Họ và tên</span>
                            <p className="font-serif font-bold text-[#442a22] text-sm">{fullName}</p>
                          </div>
                          
                          <div className="p-4 border border-[#d4c3be]/30 bg-[#fcfaf7] rounded-sm space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Số điện thoại</span>
                            <p className="font-semibold text-on-surface text-sm">{phone}</p>
                          </div>

                          <div className="p-4 border border-[#d4c3be]/30 bg-[#fcfaf7] rounded-sm space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Địa chỉ Email</span>
                            <p className="font-semibold text-on-surface text-sm">{email}</p>
                          </div>
                        </div>

                        {/* Shipping Address Read-only block */}
                        <div className="p-5 border border-[#d4c3be]/30 rounded-sm space-y-3.5 bg-white">
                          <div className="flex items-center gap-2 text-primary">
                            <MapPin size={16} />
                            <h3 className="font-serif font-bold text-sm uppercase tracking-wider">Địa chỉ giao hàng hiện tại</h3>
                          </div>
                          
                          <p className="text-xs text-on-surface font-semibold leading-relaxed bg-[#fcfaf7] p-3.5 border border-[#eeeeee] rounded-xs">
                            {shippingAddress}
                          </p>

                          {/* Map Widget (Read-Only Preview) */}
                          <div className="border border-[#eeeeee] rounded-xs overflow-hidden h-[180px] bg-[#e5e3df]">
                            <iframe
                              title="Google Map ReadOnly Preview"
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(shippingAddress)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                              className="w-full h-full border-none pointer-events-none"
                              loading="lazy"
                            />
                          </div>
                        </div>

                        {/* Security Details Card */}
                        <div className="p-5 border border-[#d4c3be]/30 bg-[#fcfaf7] rounded-sm flex items-center justify-between">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant">Mật khẩu tài khoản</span>
                            <p className="font-mono text-[#442a22] text-sm">••••••••••••</p>
                          </div>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
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
                        className="bg-[#fcfaf7] border border-[#d4c3be]/40 rounded-sm p-6 space-y-6"
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

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-[11px] uppercase tracking-widest font-semibold text-primary mb-2">Họ và tên</label>
                              <input 
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-[#d4c3be] rounded-sm focus:border-primary focus:ring-0 text-xs md:text-sm bg-white"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] uppercase tracking-widest font-semibold text-primary mb-2">Số điện thoại</label>
                              <input 
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-[#d4c3be] rounded-sm focus:border-primary focus:ring-0 text-xs md:text-sm bg-white"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] uppercase tracking-widest font-semibold text-primary mb-2">Địa chỉ Email</label>
                            <input 
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-3.5 py-2.5 border border-[#d4c3be] rounded-sm focus:border-primary focus:ring-0 text-xs md:text-sm bg-white"
                              required
                            />
                          </div>

                          {/* Địa chỉ giao hàng & Google Map */}
                          <div className="w-full h-px bg-[#eeeeee] my-6" />
                          
                          <div className="space-y-4">
                            <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                              <MapPin size={15} /> Địa Chỉ Giao Hàng & Định Vị Bản Đồ
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                              <div className="md:col-span-2">
                                <label className="block text-[11px] uppercase tracking-widest font-semibold text-primary mb-2">Địa chỉ nhận hàng</label>
                                <input 
                                  type="text"
                                  value={shippingAddress}
                                  onChange={(e) => setShippingAddress(e.target.value)}
                                  placeholder="Nhập địa chỉ cụ thể của bạn..."
                                  className="w-full px-3.5 py-2.5 border border-[#d4c3be] rounded-sm focus:border-primary focus:ring-0 text-xs md:text-sm bg-white"
                                  required
                                />
                              </div>
                              <div>
                                <button
                                  type="button"
                                  onClick={handleLocateUser}
                                  disabled={isLoadingLocation}
                                  className="w-full py-2.5 border border-primary text-primary hover:bg-primary/5 font-semibold text-xs tracking-wider uppercase rounded-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 h-[38px] bg-transparent"
                                >
                                  <Sparkles size={13} className={isLoadingLocation ? "animate-spin" : ""} />
                                  {isLoadingLocation ? 'Đang định vị...' : 'Định vị GPS'}
                                </button>
                              </div>
                            </div>

                            {/* Interactive Google Map Mockup / Iframe */}
                            <div className="border border-[#d4c3be]/60 rounded-sm overflow-hidden bg-white shadow-xs">
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
                                  className="flex-1 px-3 py-1 border border-[#d4c3be]/80 rounded-sm text-xs focus:outline-none focus:border-primary bg-white h-7"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (mapSearch) setShippingAddress(mapSearch);
                                  }}
                                  className="px-3 py-1 bg-primary text-white font-semibold text-[10px] uppercase tracking-wider rounded-sm hover:bg-[#2c160e] h-7 border-none cursor-pointer"
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
                                    className="w-7 h-7 bg-white text-on-surface font-bold rounded-sm border border-[#d4c3be]/80 shadow-sm flex items-center justify-center hover:bg-surface-container hover:scale-105 active:scale-95 text-sm cursor-pointer"
                                  >
                                    +
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setMapZoom(prev => Math.max(1, prev - 1))}
                                    className="w-7 h-7 bg-white text-on-surface font-bold rounded-sm border border-[#d4c3be]/80 shadow-sm flex items-center justify-center hover:bg-surface-container hover:scale-105 active:scale-95 text-sm cursor-pointer"
                                  >
                                    -
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Đổi mật khẩu section */}
                          <div className="w-full h-px bg-[#eeeeee] my-6" />
                          
                          <div className="space-y-4">
                            <h3 className="font-serif text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                              <Lock size={15} /> Thiết Lập Bảo Mật & Đổi Mật Khẩu
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                              <div className="relative">
                                <label className="block text-[11px] uppercase tracking-widest font-semibold text-primary mb-2">Mật khẩu hiện tại</label>
                                <div className="relative">
                                  <input 
                                    type={showCurrentPw ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-[#d4c3be] rounded-sm focus:border-primary text-xs md:text-sm bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                                  >
                                    {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                              </div>

                              <div className="relative">
                                <label className="block text-[11px] uppercase tracking-widest font-semibold text-primary mb-2">Mật khẩu mới</label>
                                <div className="relative">
                                  <input 
                                    type={showNewPw ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3.5 py-2.5 border border-[#d4c3be] rounded-sm focus:border-primary text-xs md:text-sm bg-white"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => setShowNewPw(!showNewPw)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer"
                                  >
                                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="w-full">
                              <label className="block text-[11px] uppercase tracking-widest font-semibold text-primary mb-2">Xác nhận mật khẩu mới</label>
                              <input 
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-3.5 py-2.5 border border-[#d4c3be] rounded-sm focus:border-primary text-xs md:text-sm bg-white"
                              />
                            </div>
                          </div>

                          <div className="flex gap-4 justify-end pt-4">
                            <button
                              type="button"
                              onClick={() => setIsEditingProfile(false)}
                              className="px-6 py-3 border border-[#eeeeee] hover:bg-[#eeeeee]/40 text-on-surface font-semibold text-xs tracking-wider uppercase rounded-xs transition-colors cursor-pointer bg-transparent"
                            >
                              Hủy
                            </button>
                            <button
                              type="submit"
                              className="px-6 py-3 bg-primary text-white font-semibold text-xs tracking-wider uppercase rounded-xs hover:bg-[#2c160e] transition-colors flex items-center gap-2 cursor-pointer border-none"
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
                        ? MOCK_VOUCHERS.filter(v => v.status === 'active').length
                        : MOCK_VOUCHERS.filter(v => v.status === subTab.key).length;
                      const isActive = voucherFilter === subTab.key;
                      return (
                        <button
                          key={subTab.key}
                          type="button"
                          onClick={() => setVoucherFilter(subTab.key as any)}
                          className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                            isActive 
                              ? 'border-primary text-primary' 
                              : 'border-transparent text-on-surface-variant hover:text-primary'
                          }`}
                        >
                          {subTab.label}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-primary text-white' : 'bg-[#eeeeee] text-on-surface-variant'
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
                      { key: 'exclusive', label: 'Khuyến mãi độc quyền' },
                      { key: 'loyalty', label: 'Khách hàng thân thiết' }
                    ].map((typeFilter) => {
                      const isActive = voucherTypeFilter === typeFilter.key;
                      return (
                        <button
                          key={typeFilter.key}
                          type="button"
                          onClick={() => setVoucherTypeFilter(typeFilter.key as any)}
                          className={`px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full transition-all border cursor-pointer whitespace-nowrap ${
                            isActive 
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
                              : 'border-[#eeeeee] opacity-65'
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
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {voucher.type === 'exclusive' ? 'Độc quyền' : 'Thân thiết'}
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
                                  {voucher.status === 'used' ? 'Đã dùng' : 'Hết hạn'}
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
                        ? MOCK_ORDERS.length 
                        : MOCK_ORDERS.filter(o => o.status === filter.key).length;
                      const isActive = orderFilter === filter.key;
                      return (
                        <button
                          key={filter.key}
                          type="button"
                          onClick={() => setOrderFilter(filter.key as any)}
                          className={`pb-3 px-1.5 border-b-2 text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer bg-transparent border-none ${
                            isActive 
                              ? 'border-primary text-primary' 
                              : 'border-transparent text-on-surface-variant hover:text-primary'
                          }`}
                        >
                          {filter.label}
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            isActive 
                              ? 'bg-primary text-white' 
                              : 'bg-[#ece0dc]/70 text-primary'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="space-y-6">
                    {MOCK_ORDERS.filter(order => orderFilter === 'all' ? true : order.status === orderFilter).map((order) => (
                      <div 
                        key={order.id}
                        className="border border-[#d4c3be]/40 rounded-sm overflow-hidden"
                      >
                        {/* Order info header */}
                        <div className="bg-[#ece0dc]/20 px-5 py-3 border-b border-[#d4c3be]/40 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex gap-4">
                            <div>
                              <span className="text-on-surface-variant font-medium mr-1.5">Mã đơn:</span>
                              <span className="font-mono font-bold text-primary">{order.id}</span>
                            </div>
                            <div>
                              <span className="text-on-surface-variant font-medium mr-1.5">Ngày mua:</span>
                              <span className="font-bold">{order.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold">
                            {order.status === 'delivered' ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 text-[10px] uppercase font-sans tracking-wide">
                                <CheckCircle size={10} /> {order.statusText}
                              </span>
                            ) : order.status === 'cancelled' ? (
                              <span className="text-error bg-error/5 px-2.5 py-0.5 rounded-full border border-error/20 flex items-center gap-1 text-[10px] uppercase font-sans tracking-wide">
                                {order.statusText}
                              </span>
                            ) : (
                              <span className="text-[#8a726b] bg-[#ece0dc]/50 px-2.5 py-0.5 rounded-full border border-[#d4c3be]/30 flex items-center gap-1 text-[10px] uppercase font-sans tracking-wide">
                                <Clock size={10} /> {order.statusText}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order items lists */}
                        <div className="p-4 space-y-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-start">
                              <img 
                                alt={item.product.name}
                                src={item.product.images[0]}
                                className="w-12 h-15 object-cover rounded-xs border border-[#d4c3be]/30"
                              />
                              <div className="flex-1">
                                <Link to={`/san-pham/${item.product.id}`} className="font-serif font-bold text-[#442a22] hover:text-primary transition-colors flex items-center gap-1">
                                  {item.product.name} <ExternalLink size={11} className="opacity-50" />
                                </Link>
                                <div className="text-[11px] text-on-surface-variant mt-1">
                                  <span>Màu: <span className="font-bold">{item.color.name}</span></span>
                                  <span className="mx-2">•</span>
                                  <span>Kích cỡ: <span className="font-bold">{item.size}</span></span>
                                  <span className="mx-2">•</span>
                                  <span>Số lượng: <span className="font-bold">{item.quantity}</span></span>
                                </div>
                              </div>
                              <div className="text-right text-xs font-semibold">
                                {formatPrice(item.price)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total costs bottom */}
                        <div className="bg-[#fcfaf7] px-5 py-3 border-t border-[#eeeeee] flex justify-between items-center text-xs">
                          <div>
                            <span className="text-on-surface-variant mr-1">Hình thức thanh toán:</span>
                            <span className="font-bold text-[#5d4037]">{order.paymentMethod}</span>
                            <span className="text-on-surface-variant/40 mx-2">•</span>
                            <span className="text-on-surface-variant mr-1">Thanh toán:</span>
                            <span className={`font-bold ${order.paymentStatus === 'Đã thanh toán' ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {order.paymentStatus}
                            </span>
                          </div>
                          <div className="text-right font-serif text-sm">
                            <span className="text-xs font-sans text-on-surface-variant mr-2">Tổng tiền:</span>
                            <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {MOCK_ORDERS.filter(order => orderFilter === 'all' ? true : order.status === orderFilter).length === 0 && (
                      <div className="text-center py-12 text-on-surface-variant/80 bg-[#fcfaf7] border border-[#d4c3be]/20 rounded-sm">
                        Không có đơn hàng nào trong mục này.
                      </div>
                    )}
                  </div>
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
                        className="bg-[#fcfaf7] border border-[#d4c3be]/40 rounded-sm p-5 mb-8"
                      >
                        <h3 className="font-serif font-bold text-primary text-sm mb-4">Địa chỉ giao hàng mới</h3>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase font-semibold text-primary mb-1">Tên người nhận</label>
                              <input 
                                type="text"
                                value={newAddrName}
                                onChange={(e) => setNewAddrName(e.target.value)}
                                className="w-full px-3 py-2 border border-[#d4c3be] rounded-sm text-xs focus:border-primary"
                                placeholder="Họ và tên"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-semibold text-primary mb-1">Số điện thoại</label>
                              <input 
                                type="tel"
                                value={newAddrPhone}
                                onChange={(e) => setNewAddrPhone(e.target.value)}
                                className="w-full px-3 py-2 border border-[#d4c3be] rounded-sm text-xs focus:border-primary"
                                placeholder="098..."
                                required
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase font-semibold text-primary mb-1">Tỉnh / Thành phố</label>
                              <input 
                                type="text"
                                value={newAddrProvince}
                                onChange={(e) => setNewAddrProvince(e.target.value)}
                                className="w-full px-3 py-2 border border-[#d4c3be] rounded-sm text-xs focus:border-primary"
                                placeholder="Ví dụ: TP. Hồ Chí Minh"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-semibold text-primary mb-1">Quận / Huyện</label>
                              <input 
                                type="text"
                                value={newAddrDistrict}
                                onChange={(e) => setNewAddrDistrict(e.target.value)}
                                className="w-full px-3 py-2 border border-[#d4c3be] rounded-sm text-xs focus:border-primary"
                                placeholder="Ví dụ: Quận 1"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-semibold text-primary mb-1">Phường / Xã</label>
                              <input 
                                type="text"
                                value={newAddrWard}
                                onChange={(e) => setNewAddrWard(e.target.value)}
                                className="w-full px-3 py-2 border border-[#d4c3be] rounded-sm text-xs focus:border-primary"
                                placeholder="Ví dụ: Phường Bến Nghé"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-semibold text-primary mb-1">Số nhà, tên đường</label>
                            <input 
                              type="text"
                              value={newAddrStreet}
                              onChange={(e) => setNewAddrStreet(e.target.value)}
                              className="w-full px-3 py-2 border border-[#d4c3be] rounded-sm text-xs focus:border-primary"
                              placeholder="Ví dụ: 12 Lê Lợi"
                              required
                            />
                          </div>

                          <div className="flex gap-3 justify-end pt-2">
                            <button 
                              type="button"
                              onClick={() => setShowAddressForm(false)}
                              className="px-4 py-2 border border-[#eeeeee] text-on-surface hover:bg-[#eeeeee]/40 font-semibold text-xs uppercase tracking-wider rounded-xs bg-transparent cursor-pointer"
                            >
                              Hủy
                            </button>
                            <button 
                              type="submit"
                              className="px-5 py-2 bg-primary text-white font-semibold text-xs uppercase tracking-wider rounded-xs hover:bg-[#2c160e] transition-colors cursor-pointer border-none"
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
                        className={`p-5 border rounded-sm flex items-start justify-between gap-4 transition-all ${
                          addr.isDefault ? 'border-primary bg-[#ece0dc]/10' : 'border-[#d4c3be]/40 bg-white'
                        }`}
                      >
                        <div className="space-y-1.5">
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
                            Địa chỉ: <span className="text-on-surface font-semibold">{addr.street}, {addr.ward}, {addr.district}, {addr.province}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 text-right">
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1 text-on-surface-variant hover:text-error transition-colors bg-transparent border-none cursor-pointer"
                            title="Xóa địa chỉ"
                          >
                            <Trash2 size={15} />
                          </button>
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
