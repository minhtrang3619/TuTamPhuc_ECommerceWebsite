import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Send, 
  ArrowLeft, 
  Smile, 
  Paperclip, 
  MoreVertical,
  Leaf,
  Waves,
  Sun,
  Flame,
  Headphones
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/utils/productMapper';
import apiClient from '@/services/apiClient';

interface Message {
  id: string;
  sender: 'user' | 'staff';
  text: string;
  timestamp: Date;
  imageUrl?: string;
  productInfo?: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
}

export default function CustomerChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const isTyping = false;
  const [selectedProduct, setSelectedProduct] = useState<any>(location.state?.productToConsult || null);
  const processedConsultRef = useRef<string | null>(null);

  const fetchMessages = async () => {
    try {
      const res = await apiClient.get('/chat/messages');
      const apiMsgs = res.data || [];
      if (apiMsgs.length > 0) {
        setMessages(apiMsgs.map((m: any) => ({
          id: String(m.id),
          sender: m.sender_id === user?.id ? 'user' : 'staff',
          text: m.text,
          timestamp: new Date(m.created_at),
          productInfo: m.product_info,
          imageUrl: m.image_url
        })));
      } else {
        setMessages([
          {
            id: '1',
            sender: 'staff',
            text: 'Chào bạn! Từ Tâm Phục xin nghe. Mình có thể giúp gì cho bạn hôm nay ạ?',
            timestamp: new Date(Date.now() - 1000 * 60 * 5)
          }
        ]);
      }

    } catch (err) {
      console.error("Lỗi khi tải tin nhắn:", err);
    }
  };

  // Poll for new messages every 4 seconds
  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user?.id]);

  // Handle incoming product from "Tư vấn" button
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/tin-nhan', ...location.state } });
      return;
    }

    if (location.state?.productToConsult) {
      const p = location.state.productToConsult;
      if (processedConsultRef.current === p.id) {
        return;
      }
      processedConsultRef.current = p.id;
      
      setSelectedProduct(p);
      
      const payload = {
        text: 'Xin chào, tôi cần tư vấn thêm về sản phẩm này.',
        product_info: {
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.images?.[0] || ''
        }
      };
      
      apiClient.post('/chat/messages', payload)
        .then(() => {
          fetchMessages();
        })
        .catch(err => {
          console.error("Lỗi khi gửi tin nhắn tư vấn:", err);
        });

      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, isAuthenticated, navigate, location.pathname]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior
      });
    }
  };

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      scrollToBottom('auto');
      isInitialMount.current = false;
    } else {
      scrollToBottom('smooth');
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e?: FormEvent, textToSend?: string) => {
    if (e) e.preventDefault();
    const text = textToSend || inputValue.trim();
    if (!text) return;

    if (!textToSend) setInputValue('');

    try {
      const payload = {
        text: text
      };
      await apiClient.post('/chat/messages', payload);
      fetchMessages();
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isAuthenticated) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#fcfaf7] pt-6 pb-12 font-sans"
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #d4c3be;
          border-radius: 10px;
        }
        .glass-bubble {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-[calc(100vh-140px)] min-h-[600px] flex flex-col">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={14} /> Quay lại
          </button>
        </div>

        {/* Two-Column Layout */}
        <div className="flex-grow flex gap-gutter overflow-hidden h-full">
          
          {/* Central Chat Window */}
          <section className="flex-1 flex flex-col bg-surface shadow-xs rounded-xl overflow-hidden relative border border-outline-variant/30">
            {/* Chat Header */}
            <header className="px-6 py-4 border-b border-[#d4c3be]/20 bg-surface/50 backdrop-blur-sm z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ece0dc] flex items-center justify-center text-primary border border-[#d4c3be]/40 shadow-xs">
                  <Headphones size={18} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-serif text-sm font-bold text-primary">Bộ phận CSKH</h2>
                  <p className="text-[10px] text-on-surface-variant flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Trực tuyến
                  </p>
                </div>
              </div>
              <button className="text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-1">
                <MoreVertical size={18} />
              </button>
            </header>

            {/* Chat History Area */}
            <div className="flex-1 relative overflow-hidden flex flex-col">
              {/* Lotus Background Overlay */}
              <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                <img 
                  alt="Lotus" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida/AP1WRLsnw0F-XzOGofrZk5PGcf_jxBbjfhW6aK-OzK2L51g5o5A1hUY3e8MVb3khRbhFPn2kWrq1rV7d2nTq8KOTqji_8esI53WkOdmhWySFvnamX860rGloMjKd-YAPQiTc1UGD5P2ePyGy1xwtS2bXTe0kLA3y-IvnWQNRjiCOQzBeiZri5ACaTfSAHtywz6-yXRQC0gAw4ngtOJ_XraOLKa_3gqTuCuqhtuVeCkQsYQvyYRxYC6xOFNTE8pGK"
                />
              </div>

              {/* Message scroll viewport */}
              <div ref={chatMessagesRef} className="absolute inset-0 z-10 p-6 overflow-y-auto space-y-6 custom-scrollbar" id="chat-messages">
                <div className="text-center">
                  <span className="px-4 py-1 rounded-full bg-secondary-container/50 text-[10px] text-on-secondary-container uppercase tracking-widest font-bold border border-[#d4c3be]/20">
                    Hôm nay
                  </span>
                </div>

                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id} 
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
                        
                        {/* Avatar */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-full bg-[#ece0dc] flex-shrink-0 flex items-center justify-center border border-[#d4c3be]/40 mt-1">
                            <Headphones size={14} className="text-primary" />
                          </div>
                        )}

                        {/* Message Content */}
                        <div className="flex flex-col gap-1">
                          {/* Product Card if attached */}
                          {msg.productInfo && (
                            <div 
                              onClick={() => {
                                if (msg.productInfo) {
                                  setSelectedProduct({
                                    id: msg.productInfo.id,
                                    name: msg.productInfo.name,
                                    price: msg.productInfo.price,
                                    images: [msg.productInfo.image],
                                    category: 'Pháp Phục',
                                    quote: 'Pháp phục không chỉ là y áo, mà là sự chánh niệm hiển lộ qua từng đường tơ.',
                                    description: 'Sản phẩm đang được quan tâm trong cuộc đối thoại.'
                                  });
                                }
                              }}
                              className={`mb-2 p-3 rounded-xl border shadow-xs flex items-start gap-3 bg-white/95 backdrop-blur-xs w-64 cursor-pointer transition-all hover:scale-[1.02] ${
                                isUser ? 'border-primary/20 hover:border-primary/50' : 'border-[#d4c3be]/40 hover:border-[#d4c3be]/80'
                              }`}
                            >
                              <img 
                                src={getImageUrl(msg.productInfo.image)} 
                                alt={msg.productInfo.name}
                                className="w-14 h-16 object-cover rounded-md border border-[#eeeeee]"
                                referrerPolicy="no-referrer"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-serif text-xs font-bold text-[#442a22] line-clamp-2">{msg.productInfo.name}</h4>
                                <p className="text-xs font-bold text-primary mt-1">
                                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(msg.productInfo.price)}
                                </p>
                                <span className="text-[10px] text-primary hover:underline mt-1 inline-block uppercase tracking-wider font-bold">
                                  Tư vấn sản phẩm
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Attached Image if present */}
                          {msg.imageUrl && (
                            <div className="mb-2 max-w-xs md:max-w-md rounded-lg overflow-hidden border border-[#d4c3be]/40 shadow-xs bg-white">
                              <img 
                                src={getImageUrl(msg.imageUrl)} 
                                alt="Hình ảnh đính kèm" 
                                className="w-full h-auto object-contain max-h-60"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}

                          {/* Text Bubble */}
                          <div className={`px-4 py-3 text-xs md:text-sm leading-relaxed shadow-sm relative ${
                            isUser 
                              ? 'bg-primary/90 text-white rounded-2xl rounded-tr-none shadow-xs' 
                              : 'glass-bubble bg-surface/60 border border-white/40 text-on-surface rounded-2xl rounded-tl-none shadow-xs'
                          }`}>
                            {msg.text}
                          </div>

                          {/* Timestamp */}
                          <span className={`text-[9px] font-semibold text-on-surface-variant/60 ${isUser ? 'text-right' : 'text-left'} px-1 mt-0.5`}>
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {isTyping && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-3 max-w-[70%]">
                      <div className="w-8 h-8 rounded-full bg-[#ece0dc] flex-shrink-0 flex items-center justify-center border border-[#d4c3be]/40">
                        <Headphones size={14} className="text-primary" />
                      </div>
                      <div className="px-4 py-3 bg-white border border-[#d4c3be]/30 rounded-r-2xl rounded-tl-2xl rounded-bl-sm flex items-center gap-1 shadow-sm">
                        <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Suggestions Quick Replies */}
            <div className="px-6 py-3 flex gap-2 overflow-x-auto whitespace-nowrap hide-scrollbar bg-white border-t border-[#eeeeee]">
              {[
                "Cho mình xem bảng size nhé",
                "Địa chỉ cửa hàng ở đâu vậy?",
                "Chính sách đổi trả",
                "Gặp nhân viên hỗ trợ"
              ].map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSendMessage(undefined, suggestion)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-[#5d4037] bg-[#fcfaf7] border border-[#d4c3be]/50 hover:border-primary hover:bg-[#ece0dc]/30 hover:text-primary rounded-full transition-all cursor-pointer flex-shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <footer className="p-4 border-t border-outline-variant/30 bg-surface/50 backdrop-blur-md">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-white/60 border border-outline-variant/30 rounded-full px-5 py-2.5 focus-within:border-primary transition-colors shadow-inner">
                <button type="button" className="text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-1">
                  <Smile size={18} />
                </button>
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Nhắn gửi lời tâm tình..."
                  className="flex-grow bg-transparent border-none focus:ring-0 text-xs md:text-sm placeholder:text-on-surface-variant/50 resize-none max-h-12 py-1 outline-none"
                  rows={1}
                />
                <button type="button" className="text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-1">
                  <Paperclip size={18} />
                </button>
                <div className="h-5 w-[1px] bg-outline-variant/50 mx-1"></div>
                <button 
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="text-primary hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send size={18} />
                </button>
              </form>
              <p className="text-center text-[10px] text-on-surface-variant mt-2 font-medium">
                Bộ phận CSKH thường phản hồi trong vòng vài phút.
              </p>
            </footer>
          </section>

          {/* Right Sidebar (Consultation Info) */}
          <aside className="hidden lg:flex flex-col w-[340px] gap-6 overflow-y-auto custom-scrollbar pb-10">
            {/* Dynamic Product Card */}
            {selectedProduct && (
              <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-xs">
                <h3 className="font-serif text-xs font-bold text-primary mb-4 tracking-widest uppercase border-b border-outline-variant/20 pb-2">Đang Tư Vấn</h3>
                <div className="group overflow-hidden rounded-lg mb-4 border border-outline-variant/20 aspect-square">
                  <img 
                    alt={selectedProduct.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    src={getImageUrl(selectedProduct.images?.[0] || '')}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm font-bold text-primary line-clamp-2">{selectedProduct.name}</h4>
                  <p className="text-sm text-secondary font-semibold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
                  </p>
                </div>
                <Link 
                  to={`/san-pham/${selectedProduct.id}`}
                  className="mt-6 w-full border border-primary text-primary py-2.5 px-6 rounded-full font-semibold text-xs tracking-wider uppercase hover:bg-primary/5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center text-center"
                >
                  XEM CHI TIẾT
                </Link>
              </div>
            )}

            {/* Fabric Care Tips */}
            <div className="bg-secondary-container/30 border border-outline-variant/20 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Leaf size={16} className="text-primary" />
                <h3 className="font-serif text-xs font-bold text-primary tracking-widest uppercase">Chăm Sóc Vải</h3>
              </div>
              <ul className="space-y-4 text-xs leading-relaxed text-on-surface-variant">
                <li className="flex gap-3">
                  <Waves size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Nên giặt tay bằng nước mát với xà phòng trung tính để bảo vệ sợi tơ.</span>
                </li>
                <li className="flex gap-3">
                  <Sun size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Tránh phơi trực tiếp dưới ánh nắng gắt; nên để khô tự nhiên trong bóng râm.</span>
                </li>
                <li className="flex gap-3">
                  <Flame size={16} className="text-primary shrink-0 mt-0.5" />
                  <span>Là ủi ở nhiệt độ thấp hoặc dùng bàn là hơi nước khi vải còn hơi ẩm.</span>
                </li>
              </ul>
            </div>

            {/* Zen Quote Note */}
            <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
              <p className="text-xs italic text-on-surface-variant/80 text-center leading-relaxed font-serif">
                "Pháp phục không chỉ là y áo, mà là sự chánh niệm hiển lộ qua từng đường tơ."
              </p>
            </div>
          </aside>
          
        </div>
      </div>
    </motion.div>
  );
}
