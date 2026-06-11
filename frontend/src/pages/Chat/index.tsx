import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Send, ArrowLeft, Image as ImageIcon, Smile, Paperclip, CheckCircle2, User, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getImageUrl } from '@/utils/productMapper';

interface Message {
  id: string;
  sender: 'user' | 'staff';
  text: string;
  timestamp: Date;
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
  const { isAuthenticated } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'staff',
      text: 'Chào bạn! Từ Tâm Phục có thể giúp gì cho bạn hôm nay?',
      timestamp: new Date(Date.now() - 1000 * 60 * 5)
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Handle incoming product from "Tư vấn" button
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/tin-nhan', ...location.state } });
      return;
    }

    if (location.state?.productToConsult) {
      const p = location.state.productToConsult;
      
      // Check if we already have this product as the last message to prevent duplicates on refresh
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.productInfo?.id !== p.id) {
        const newMsg: Message = {
          id: Date.now().toString(),
          sender: 'user',
          text: 'Xin chào, tôi cần tư vấn thêm về sản phẩm này.',
          timestamp: new Date(),
          productInfo: {
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.images?.[0] || ''
          }
        };
        
        setMessages(prev => [...prev, newMsg]);
        
        // Simulate staff reply
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            const replyMsg: Message = {
              id: (Date.now() + 1).toString(),
              sender: 'staff',
              text: `Dạ vâng, quý khách cần tư vấn về kích cỡ, chất liệu hay màu sắc của sản phẩm "${p.name}" ạ?`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, replyMsg]);
            setIsTyping(false);
          }, 1500);
        }, 1000);
      }
      
      // Clear state to prevent re-triggering on refresh
      window.history.replaceState({}, document.title)
    }
  }, [location, isAuthenticated, navigate, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (e?: FormEvent, textToSend?: string) => {
    if (e) e.preventDefault();
    const text = textToSend || inputValue.trim();
    if (!text) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInputValue('');

    // Simulate response
    setIsTyping(true);
    setTimeout(() => {
      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'staff',
        text: 'Cảm ơn quý khách đã phản hồi. Nhân viên Từ Tâm Phục đang kiểm tra thông tin và sẽ hỗ trợ quý khách ngay ạ.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, replyMsg]);
      setIsTyping(false);
    }, 2000);
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
      className="min-h-screen bg-[#fcfaf7] pt-24 pb-12 font-sans"
    >
      <div className="max-w-5xl mx-auto px-4 md:px-8 h-[calc(100vh-140px)] min-h-[600px] flex flex-col">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={14} /> Quay lại
          </button>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white rounded-sm border border-[#d4c3be]/40 shadow-xs flex flex-col overflow-hidden">
          
          {/* Chat Header */}
          <div className="px-6 py-4 bg-[#fcfaf7] border-b border-[#eeeeee] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#ece0dc] flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                  <Sparkles className="text-primary opacity-60" size={24} />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-primary tracking-wide">CSKH Từ Tâm Phục</h2>
                <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 size={12} /> Trực tuyến
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex gap-3 text-xs text-on-surface-variant font-medium">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fcfaf7] border border-[#eeeeee] rounded-full">
                <User size={14} /> Hỗ trợ đơn hàng
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fcfaf7] border border-[#eeeeee] rounded-full">
                <Sparkles size={14} /> Tư vấn sản phẩm
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-opacity-20">
            <div className="text-center">
              <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50 bg-[#fcfaf7] px-3 py-1 rounded-full border border-[#eeeeee]">
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
                        <Sparkles size={14} className="text-primary" />
                      </div>
                    )}

                    {/* Message Content */}
                    <div className="flex flex-col gap-1">
                      {/* Product Card if attached */}
                      {msg.productInfo && (
                        <div className={`mb-2 p-3 rounded-sm border shadow-sm flex items-start gap-3 bg-white w-64 ${isUser ? 'border-primary/20' : 'border-[#d4c3be]/40'}`}>
                          <img 
                            src={getImageUrl(msg.productInfo.image)} 
                            alt={msg.productInfo.name}
                            className="w-14 h-16 object-cover rounded-xs border border-[#eeeeee]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1">
                            <h4 className="font-serif text-xs font-bold text-[#442a22] line-clamp-2">{msg.productInfo.name}</h4>
                            <p className="text-xs font-bold text-primary mt-1">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(msg.productInfo.price)}
                            </p>
                            <Link to={`/san-pham/${msg.productInfo.id}`} className="text-[10px] text-primary hover:underline mt-1 inline-block uppercase tracking-wider font-bold">
                              Xem chi tiết
                            </Link>
                          </div>
                        </div>
                      )}

                      {/* Text Bubble */}
                      <div className={`px-4 py-3 text-sm leading-relaxed shadow-sm relative ${
                        isUser 
                          ? 'bg-primary text-white rounded-l-2xl rounded-tr-2xl rounded-br-sm' 
                          : 'bg-white text-on-surface border border-[#d4c3be]/30 rounded-r-2xl rounded-tl-2xl rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>

                      {/* Timestamp */}
                      <span className={`text-[10px] font-semibold text-on-surface-variant/60 ${isUser ? 'text-right' : 'text-left'} px-1`}>
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
                    <Sparkles size={14} className="text-primary" />
                  </div>
                  <div className="px-4 py-3 bg-white border border-[#d4c3be]/30 rounded-r-2xl rounded-tl-2xl rounded-bl-sm flex items-center gap-1 shadow-sm">
                    <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {messages.length < 4 && (
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
                  className="px-3.5 py-1.5 text-xs font-medium text-[#5d4037] bg-[#fcfaf7] border border-[#d4c3be]/50 hover:border-primary hover:bg-[#ece0dc]/30 hover:text-primary rounded-full transition-all cursor-pointer flex-shrink-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-[#eeeeee]">
            <form onSubmit={handleSendMessage} className="flex items-end gap-3">
              <div className="flex gap-2 pb-2">
                <button type="button" className="text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-1">
                  <ImageIcon size={20} />
                </button>
                <button type="button" className="text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer p-1">
                  <Paperclip size={20} />
                </button>
              </div>
              
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Nhập tin nhắn..."
                  className="w-full bg-[#fcfaf7] border border-[#d4c3be]/50 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm resize-none max-h-32 transition-colors min-h-[44px]"
                  rows={1}
                />
                <button type="button" className="absolute right-3 bottom-3 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-none cursor-pointer">
                  <Smile size={18} />
                </button>
              </div>

              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="w-12 h-12 flex-shrink-0 bg-primary text-white rounded-full flex items-center justify-center hover:bg-[#2c160e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer border-none mb-0.5"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
            <p className="text-center text-[10px] text-on-surface-variant mt-2 font-medium">
              Nhân viên CSKH thường trả lời trong vòng vài phút.
            </p>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
