import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Search, 
  Send, 
  MoreVertical, 
  Video, 
  Mail, 
  Phone, 
  MapPin, 
  PlusCircle, 
  Leaf, 
  Award,
  Plus
} from 'lucide-react'
import apiClient from '@/services/apiClient'
import { getImageUrl } from '@/utils/productMapper'

interface Message {
  id: number
  sender: 'customer' | 'agent'
  text: string
  time: string
  imageUrl?: string
  productInfo?: {
    id: string
    name: string
    price: number
    image: string
  }
}

interface Conversation {
  id: number
  name: string
  initials: string
  lastMessage: string
  time: string
  unread?: boolean
  avatar?: string
  statusText?: string
  tier: string
  email: string
  phone: string
  address: string
  recentOrders: Array<{
    id: string
    date?: string
    status: string
    item: string
    price: string
  }>
  messages: Message[]
}

export default function AdminCustomerChat() {
  const [searchTerm, setSearchTerm] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<number | null>(null)
  const [inputText, setInputText] = useState('')

  const [searchParams] = useSearchParams()
  const customerIdParam = searchParams.get('customerId')

  const fetchConversations = async () => {
    try {
      const res = await apiClient.get('/chat/conversations')
      const data = res.data || []
      
      const mapped: Conversation[] = data.map((c: any) => ({
        ...c,
        messages: (c.messages || []).map((m: any) => ({
          id: m.id,
          sender: m.sender_id === c.id ? 'customer' : 'agent',
          text: m.text,
          time: new Date(m.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          imageUrl: m.image_url,
          productInfo: m.product_info
        }))
      }))

      setConversations(mapped)

      if (mapped.length > 0 && activeId === null) {
        if (customerIdParam) {
          const targetId = parseInt(customerIdParam, 10)
          if (mapped.some(c => c.id === targetId)) {
            setActiveId(targetId)
          } else {
            setActiveId(mapped[0].id)
          }
        } else {
          setActiveId(mapped[0].id)
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách hội thoại:", err)
    }
  }

  // Sync activeId with query parameters
  useEffect(() => {
    if (customerIdParam) {
      const targetId = parseInt(customerIdParam, 10)
      if (!isNaN(targetId) && activeId !== targetId) {
        setActiveId(targetId)
      }
    }
  }, [customerIdParam, activeId])

  // Poll for conversation list and messages
  useEffect(() => {
    fetchConversations()
    const interval = setInterval(fetchConversations, 4000)
    return () => clearInterval(interval)
  }, [activeId, customerIdParam])

  // Mark messages as read when activeId changes
  useEffect(() => {
    if (activeId !== null) {
      apiClient.get(`/chat/conversations/${activeId}/messages`)
        .then(() => {
          fetchConversations()
        })
        .catch(err => console.error("Lỗi khi đánh dấu đã đọc:", err))
    }
  }, [activeId])

  const activeChat = conversations.find(c => c.id === activeId) || conversations[0]
  const messageEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [activeId, activeChat?.messages?.length])


  // Find the product info currently being consulted for this conversation (most recent message with productInfo)
  const activeProductInfo = activeChat?.messages
    ? [...activeChat.messages].reverse().find(m => m.productInfo)?.productInfo
    : undefined

  if (!activeChat) {
    return (
      <div className="flex h-[calc(100vh-12rem)] border border-outline-variant/20 rounded-xl overflow-hidden bg-white shadow-sm items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary opacity-60">
            <Leaf size={24} />
          </div>
          <p className="text-on-surface-variant text-sm font-serif italic">Hộp thư trống. Hiện chưa có cuộc trò chuyện nào từ khách hàng.</p>
        </div>
      </div>
    )
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return
    try {
      const payload = {
        text: inputText,
        customer_id: activeChat.id
      }
      await apiClient.post('/chat/messages', payload)
      setInputText('')
      fetchConversations()
    } catch (err) {
      console.error("Lỗi khi gửi tin nhắn:", err)
    }
  }

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex h-[calc(100vh-12rem)] border border-outline-variant/20 rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Left Column: Conversations List */}
      <section className="w-80 border-r border-outline-variant/20 flex flex-col bg-surface-container-lowest">
        <div className="p-4 border-b border-outline-variant/10">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60" size={16} />
            <input 
              type="text" 
              placeholder="Tìm kiếm hội thoại..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-surface-container-low border-none rounded-full pl-9 pr-4 py-1.5 text-xs w-full focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-outline-variant/10">
          {filteredConversations.map((c) => {
            const isActive = c.id === activeId
            return (
              <div 
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`p-4 cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-primary/5 border-l-4 border-primary' 
                    : 'hover:bg-surface-container-low/40'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-sm font-semibold ${isActive ? 'text-primary' : 'text-on-surface'}`}>{c.name}</p>
                  <span className="text-[10px] opacity-40">{c.time}</span>
                </div>
                <p className="text-xs text-on-surface-variant truncate pr-4">{c.lastMessage}</p>
                {c.unread && (
                  <div className="mt-2 flex">
                    <span className="px-2 py-0.5 bg-primary-container text-[8px] text-white rounded-full uppercase tracking-wider font-semibold">
                      Mới
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Middle Column: Chat Detail */}
      <section className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {/* Chat Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-outline-variant/10 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center font-serif text-primary text-base font-semibold">
              {activeChat.initials}
            </div>
            <div>
              <h3 className="text-sm font-bold text-primary">{activeChat.name}</h3>
              <p className="text-[10px] text-green-600 font-semibold uppercase tracking-wider">{activeChat.statusText || 'Đang hoạt động'}</p>
            </div>
          </div>
          <div className="flex gap-3 text-on-surface-variant">
            <button className="hover:text-primary transition-colors p-1.5 hover:bg-surface-container-low rounded-full">
              <Video size={18} />
            </button>
            <button className="hover:text-primary transition-colors p-1.5 hover:bg-surface-container-low rounded-full">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
          <div className="flex justify-center my-2">
            <span className="text-[10px] opacity-50 bg-surface-container px-3 py-1 rounded-full uppercase tracking-widest font-semibold">
              Hôm Nay
            </span>
          </div>

          {activeChat.messages.map((m) => {
            const isAgent = m.sender === 'agent'
            return (
              <div 
                key={m.id} 
                className={`flex gap-3 max-w-[80%] ${isAgent ? 'self-end flex-row-reverse' : ''}`}
              >
                {isAgent ? (
                  <div className="w-8 h-8 rounded-full bg-primary-container flex-shrink-0 flex items-center justify-center">
                    <Leaf size={14} className="text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex-shrink-0 flex items-center justify-center font-serif text-primary text-xs font-semibold">
                    {activeChat.initials}
                  </div>
                )}
                <div className={`space-y-1 ${isAgent ? 'text-right' : ''}`}>
                  {m.imageUrl && (
                    <div className={`mb-2 max-w-xs rounded-lg overflow-hidden border border-outline-variant/10 shadow-sm bg-white ${isAgent ? 'ml-auto' : ''}`}>
                      <img 
                        src={getImageUrl(m.imageUrl)} 
                        alt="Đính kèm" 
                        className="w-full h-auto object-contain max-h-60"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  )}
                  {m.productInfo && (
                    <Link
                      to={`/san-pham/${m.productInfo.id}`}
                      target="_blank"
                      className={`mb-2 p-3 rounded-xl border shadow-xs flex items-start gap-3 bg-white/95 backdrop-blur-xs w-64 cursor-pointer transition-all hover:scale-[1.02] border-[#d4c3be]/40 hover:border-primary/50 text-left block ${isAgent ? 'ml-auto' : ''}`}
                    >
                      <img 
                        src={getImageUrl(m.productInfo.image)} 
                        alt={m.productInfo.name}
                        className="w-14 h-16 object-cover rounded-md border border-[#eeeeee]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs font-bold text-[#442a22] line-clamp-2">{m.productInfo.name}</h4>
                        <p className="text-xs font-bold text-primary mt-1">
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.productInfo.price)}
                        </p>
                        <span className="text-[10px] text-primary hover:underline mt-1 inline-block uppercase tracking-wider font-bold">
                          Tư vấn sản phẩm
                        </span>
                      </div>
                    </Link>
                  )}
                  <div className={`p-4 rounded-xl text-sm leading-relaxed shadow-sm ${
                    isAgent 
                      ? 'bg-primary-container text-white rounded-tr-none' 
                      : 'bg-white text-on-surface border border-outline-variant/10 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[9px] opacity-40 px-1">{m.time}</span>
                </div>
              </div>
            )
          })}
          <div ref={messageEndRef} />
        </div>


        {/* Input Area */}
        <div className="p-4 border-t border-outline-variant/10 bg-white">
          <div className="flex items-end gap-3 bg-surface-container-low rounded-xl p-2 border border-outline-variant/20">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <PlusCircle size={20} />
            </button>
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-24 outline-none" 
              placeholder="Nhập tin nhắn..."
              rows={1}
            />
            <button 
              onClick={handleSendMessage}
              className="p-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Right Column: Customer Info Summary */}
      <section className="w-72 border-l border-outline-variant/20 bg-surface-container-lowest overflow-y-auto">
        <div className="p-6 flex flex-col items-center text-center border-b border-outline-variant/10">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-primary/20 p-0.5">
            <img 
              alt="Customer Avatar" 
              className="w-full h-full rounded-full object-cover" 
              src={activeChat.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'} 
            />
          </div>
          <h4 className="font-serif text-lg font-bold text-primary">{activeChat.name}</h4>
          <div className="mt-2 flex items-center gap-1.5 bg-primary/10 px-2.5 py-0.5 rounded-full text-primary">
            <Award size={12} />
            <span className="text-[9px] uppercase tracking-wider font-semibold">{activeChat.tier}</span>
          </div>
        </div>
        
        <div className="p-5 space-y-6">
          {activeProductInfo && (
            <div className="bg-white border border-outline-variant/30 rounded-xl p-4 shadow-xs">
              <h5 className="font-serif text-[10px] font-bold text-primary mb-3 tracking-widest uppercase border-b border-outline-variant/20 pb-2">Đang Tư Vấn</h5>
              <div className="group overflow-hidden rounded-lg mb-3 border border-outline-variant/20 aspect-square">
                <img 
                  alt={activeProductInfo.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={getImageUrl(activeProductInfo.image)}
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="space-y-1 text-left">
                <h6 className="font-serif text-xs font-bold text-[#442a22] line-clamp-2">{activeProductInfo.name}</h6>
                <p className="text-xs text-primary font-semibold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(activeProductInfo.price)}
                </p>
              </div>
              <Link 
                to={`/san-pham/${activeProductInfo.id}`}
                target="_blank"
                className="mt-4 w-full border border-primary text-primary py-2 px-4 rounded-full font-semibold text-[10px] tracking-wider uppercase hover:bg-primary/5 active:scale-[0.98] transition-all duration-300 flex items-center justify-center text-center"
              >
                XEM CHI TIẾT
              </Link>
            </div>
          )}

          <div>
            <h5 className="text-[10px] opacity-50 uppercase tracking-widest font-semibold mb-3">Thông tin liên hệ</h5>
            <div className="space-y-3 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-primary/70 shrink-0" />
                <span className="truncate">{activeChat.email}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-primary/70 shrink-0" />
                <span>{activeChat.phone}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-primary/70 shrink-0" />
                <span className="truncate">{activeChat.address}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <h5 className="text-[10px] opacity-50 uppercase tracking-widest font-semibold">Đơn hàng gần đây</h5>
              <span className="text-[10px] text-primary cursor-pointer border-b border-primary/20 hover:border-primary">Tất cả</span>
            </div>
            <div className="space-y-3">
              {activeChat.recentOrders.map((order, idx) => (
                <div key={idx} className="p-3 bg-surface-container-low/50 border border-outline-variant/10 rounded-lg text-xs">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{order.id}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                      order.status.includes('thành') 
                        ? 'text-green-700 bg-green-50' 
                        : 'text-primary-container bg-primary-container/10'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="opacity-80 text-[11px] truncate">{order.item}</p>
                  <p className="font-semibold mt-1 text-primary">{order.price}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button className="w-full py-2.5 border border-primary text-primary hover:bg-primary/5 transition-colors font-semibold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 rounded-sm">
              <Plus size={14} />
              Tạo đơn hàng mới
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
