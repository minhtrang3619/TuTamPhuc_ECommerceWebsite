import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Toast from '../../components/ui/Toast';

export default function BlogPage() {
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  
  // Toast alert state
  const [toast, setToast] = useState<{ message: string; isVisible: boolean; type?: 'success' | 'info' }>({
    message: '',
    isVisible: false,
    type: 'success',
  });

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
      <div className="max-w-5xl mx-auto px-6 md:px-16 w-full font-sans">
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
          {/* Blog item 1 */}
          <div className="bg-white border border-[#eeeeee] hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden group flex flex-col justify-between">
            <div>
              <div className="aspect-[16/10] overflow-hidden bg-surface-container relative">
                <img 
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80" 
                  alt="Sự tối giản trong triết lý mặc" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                  Phong Cách Sống
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider mb-2">
                  <span>Từ Tâm Phục</span>
                  <span>•</span>
                  <span>May 30, 2026</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-primary group-hover:text-primary-container transition-colors mb-3">
                  Sự tối giản trong phong cách thời trang mộc mạc
                </h3>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed font-semibold">
                  Tại Từ Tâm Phục, trang phục không ồn ào mà hướng đến sự tối giản. Đó chính là sự kết hợp giữa chất liệu thô mộc tự nhiên và thiết kế tinh tế giúp người mặc tìm thấy sự thoải mái và tự nhiên nhất.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button 
                onClick={() => {
                  showToast('Bài viết đang được hoàn thiện...', 'info');
                }}
                className="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1 cursor-pointer bg-transparent border-0"
              >
                Xem chi tiết →
              </button>
            </div>
          </div>

          {/* Blog item 2 */}
          <div className="bg-white border border-[#eeeeee] hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden group flex flex-col justify-between">
            <div>
              <div className="aspect-[16/10] overflow-hidden bg-surface-container relative">
                <img 
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80" 
                  alt="Hành trình từ thớ gai tự nhiên đến tà áo" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-sm">
                  Thủ Công Mỹ Nghệ
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-2 text-[10px] text-on-surface-variant/60 font-semibold uppercase tracking-wider mb-2">
                  <span>Nghệ nhân Mộc Trạch</span>
                  <span>•</span>
                  <span>May 28, 2026</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-primary group-hover:text-primary-container transition-colors mb-3">
                  Hành trình nhuộm vỏ củ nâu và tết cúc rơm thủ công
                </h3>
                <p className="text-xs text-on-surface-variant/80 leading-relaxed font-semibold">
                  Tìm hiểu thấu đáo quy trình thu hái củ nâu rừng dã địa phương, chưng cất dệt tơ chéo thô sần và may ráp tà tỉ mỉ. Để mỗi tà áo lam bay lên lưu lại nét đong đầy nét quý từ làng nghề Trạch Xá thâm niên...
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <button 
                onClick={() => {
                  showToast('Bài viết đang được hoàn thiện...', 'info');
                }}
                className="text-xs font-bold text-primary hover:underline underline-offset-4 flex items-center gap-1 cursor-pointer bg-transparent border-0"
              >
                Xem chi tiết →
              </button>
            </div>
          </div>
        </div>

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
