import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Toast from '../../components/ui/Toast';
import { Heart } from 'lucide-react';
import { charityService, CharityCampaign } from '@/services/charityService';
import CharityDetailView from '@/components/CharityDetailView';
import { blogService } from '@/services';
import type { BlogPost } from '@/types';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getImageUrl } from '@/utils/productMapper';


const formatPrice = (price: number) => {
  return price.toLocaleString('vi-VN') + ' ₫'
}

export default function BlogPage() {
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('charity') === 'true') {
      setIsDetailOpen(true);
    }
  }, [location]);
  
  // Toast alert state
  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type?: 'success' | 'info' }>({
    message: '',
    isVisible: false,
    type: 'success',
  });

  const [campaign, setCampaign] = useState<CharityCampaign | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await blogService.getAllPublic(1, 10);
        setPosts(res.items || []);
      } catch (err) {
        console.error("Lỗi khi tải bài viết", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const data = await charityService.getCampaigns()
        if (data && data.length > 0) {
          setCampaign(data[0])
        }
      } catch (err) {
        console.error("Failed to load charity campaign on blog page:", err)
      }
    }
    fetchCampaign()
  }, [])

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, isVisible: true, type });
  };

  const handleNewsletterSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    showToast('Đăng ký nhận tin thành công! Bản tin sẽ được gửi đến quý khách hằng tuần.', 'success');
    setNewsletterEmail('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4 }}
      className="bg-[#fcfaf7] min-h-screen pt-16 pb-24 font-sans"
    >
      <div className={`${isDetailOpen && campaign ? 'max-w-6xl' : 'max-w-5xl'} mx-auto px-6 md:px-16 w-full font-sans`}>
        {isDetailOpen && campaign ? (
          <CharityDetailView 
            campaign={campaign}
            onBack={() => {
              setIsDetailOpen(false);
              const url = new URL(window.location.href);
              url.searchParams.delete('charity');
              window.history.pushState({}, '', url.pathname + url.search);
            }}
          />
        ) : (
          <>
            <div className="text-center mb-16">
              <span className="text-[10px] tracking-[0.25em] font-sans font-extrabold text-[#5d4037] block mb-2 uppercase">Góc Chia Sẻ</span>
              <h1 className="font-serif text-3xl md:text-4.5xl text-primary font-bold mb-4">Bài Viết & Tin Tức</h1>
              <p className="text-xs text-on-surface-variant max-w-lg mx-auto font-medium">
                Nơi chia sẻ về phong cách sống tối giản, chất liệu may mặc tự nhiên và những câu chuyện sản phẩm đầy cảm hứng.
              </p>
              <div className="w-16 h-0.5 bg-primary/40 mx-auto mt-6" />
            </div>

            {/* Stories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {isLoading ? (
                <div className="col-span-1 md:col-span-2 text-center py-20 text-on-surface-variant text-sm">
                  Đang tải bài viết...
                </div>
              ) : posts.length > 0 ? (
                posts.map(post => (
                  <div key={post.id} className="bg-white border border-[#eeeeee] hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden group flex flex-col justify-between">
                    <div>
                      <Link to={`/blog/${post.slug}`} className="block">
                        <div className="aspect-[16/10] overflow-hidden bg-surface-container relative">
                          <img 
                            src={post.thumbnail ? getImageUrl(post.thumbnail) : 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'} 
                            alt={post.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                          />
                          {post.tags && post.tags.length > 0 && (
                            <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm shadow-sm">
                              {post.tags[0]}
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="p-6">
                        <div className="flex items-center space-x-2 text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider mb-2">
                          <span>{post.author?.full_name || 'Từ Tâm Phục'}</span>
                          <span>•</span>
                          <span>{post.created_at ? format(new Date(post.created_at), 'MMM dd, yyyy', { locale: vi }) : ''}</span>
                        </div>
                        <Link to={`/blog/${post.slug}`}>
                          <h3 className="font-serif text-lg font-bold text-primary group-hover:text-primary-container transition-colors mb-3 line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-on-surface-variant/80 leading-relaxed font-semibold line-clamp-3">
                          {post.excerpt || post.title}
                        </p>
                      </div>
                    </div>
                    <div className="p-6 pt-0">
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1 cursor-pointer bg-transparent border-0"
                      >
                        Xem chi tiết →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-1 md:col-span-2 text-center py-20 bg-white border border-[#eeeeee] rounded-lg">
                  <p className="text-on-surface-variant text-sm font-medium">Chưa có bài viết nào.</p>
                </div>
              )}
            </div>

            {/* Accompanying Charity Campaign Banner */}
            {campaign && (
              <div 
                onClick={() => {
                  setIsDetailOpen(true);
                  const url = new URL(window.location.href);
                  url.searchParams.set('charity', 'true');
                  window.history.pushState({}, '', url.pathname + url.search);
                }}
                className="mt-16 bg-white border border-[#eeeeee] hover:shadow-lg hover:scale-[1.002] transition-all duration-300 rounded-lg overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 cursor-pointer group"
              >
                <div className="w-full md:w-1/3 aspect-[4/3] rounded-lg overflow-hidden bg-[#faf6f0] flex items-center justify-center flex-shrink-0">
                  {campaign.image_url ? (
                    <img src={getImageUrl(campaign.image_url)} alt={campaign.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-primary/30">
                      <Heart size={48} />
                    </div>
                  )}
                </div>
                <div className="w-full md:w-2/3 space-y-4 text-left flex flex-col justify-between">
                  <div>
                    <span className="text-[9px] bg-primary/10 text-primary font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                      Chiến Dịch Đồng Hành
                    </span>
                    <h3 className="font-serif text-xl font-bold text-primary mt-3">{campaign.name}</h3>
                    {campaign.slogan && (
                      <p className="text-xs text-primary font-serif font-semibold italic mt-1">
                        {campaign.slogan}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant/80 leading-relaxed font-semibold">
                    {campaign.description}
                  </p>
                  
                  {/* Progress bar */}
                  {(() => {
                    const rawPercent = campaign.target_amount > 0 ? (campaign.raised_amount / campaign.target_amount) * 100 : 0
                    const percent = rawPercent > 0 && rawPercent < 1 
                      ? parseFloat(rawPercent.toFixed(2)) 
                      : Math.min(100, Math.round(rawPercent))
                    return (
                      <div className="space-y-2 pt-3 border-t border-[#eeeeee]">
                        <div className="flex justify-between items-end text-[10px] font-semibold text-on-surface-variant/60">
                          <span>Đóng góp đạt: {percent}%</span>
                          <span className="font-bold text-primary text-xs">
                            {formatPrice(campaign.raised_amount)} / {formatPrice(campaign.target_amount)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#eeeeee] rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${campaign.raised_amount > 0 ? Math.max(percent, 1.5) : 0}%` }} />
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Newsletter widget */}
            <div className="mt-16 bg-[#ece0dc]/30 border border-[#d4c3be]/40 rounded-sm p-8 text-center max-w-xl mx-auto">
              <h4 className="font-serif font-bold text-lg text-primary mb-2">Đăng ký nhận bản tin</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-6 font-semibold">
                Quý khách muốn nhận những chia sẻ và ưu đãi mới nhất từ Từ Tâm Phục? Vui lòng đăng ký email dưới đây.
              </p>
              <form onSubmit={handleNewsletterSignupSubmit} className="flex flex-col sm:flex-row gap-2 justify-center">
                <input 
                  type="email" 
                  placeholder="Email của quý khách..." 
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="bg-white border border-[#d4c3be]/50 rounded-sm px-4 py-2 text-xs focus:ring-1 focus:ring-primary focus:border-primary outline-none text-primary font-semibold sm:w-64"
                />
                <button 
                  type="submit"
                  className="bg-primary text-white text-xs uppercase tracking-widest font-bold px-6 py-2.5 rounded-sm hover:bg-[#2c160e] transition-colors cursor-pointer"
                >
                  Đăng ký nhận tin
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Toast notifications */}
      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        type={toast.type}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </motion.div>
  );
}
