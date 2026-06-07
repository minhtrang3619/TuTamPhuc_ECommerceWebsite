import { useState } from 'react'
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

interface Message {
  id: number
  sender: 'customer' | 'agent'
  text: string
  time: string
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
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      name: 'Lê Hoài Nam',
      initials: 'L',
      lastMessage: 'Cảm ơn shop, chất liệu linen rất thoáng...',
      time: '14:20',
      statusText: 'Đang xem sản phẩm...',
      tier: 'Hạng Thượng Hải',
      email: 'nam.lh@email.com',
      phone: '090 ••• ••88',
      address: 'Quận 2, TP. Hồ Chí Minh',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9SmNu0ic8AxjtdwDV1EEOObvJfF2w7yaneFIXAmaBI2MsJW7SR0492N0We_ehoIjNJ_dyPsaQD-CholDFELo-yASo5coAn-DAPGMWkgOVbOQXBfwVy5lwn2rtftsuGwCzh4asMLh-6avftUUuFfbm_bbZTtiyALgLuL_dPhYDKQxh05DzqezL9ep7ce9Tl9tz7GtN_p2Okyuc_tdYGfkm6I0kQNeN7iV3Fla7tIJsT6gxMz0cVz04K_baalF7gOqWRLFhOZIc4gSm',
      recentOrders: [
        { id: '#TTP-8921', status: 'Hoàn thành', item: 'Áo Lụa Tự Nhiên - M', price: '1.250.000đ' },
        { id: '#TTP-8402', date: '12/09/2023', status: 'Đã hoàn thành', item: 'Bộ Trà Đạo Gốm Thủ Công', price: '2.800.000đ' }
      ],
      messages: [
        { id: 1, sender: 'customer', text: 'Chào shop, mình nhận được áo hôm qua rồi. Chất vải lụa tơ tằm thật sự tuyệt vời, cảm giác nhẹ nhàng như mây lướt trên da.', time: '14:18' },
        { id: 2, sender: 'agent', text: 'Từ Tâm Phục rất vui khi nghe bạn hài lòng. Chất liệu này được dệt thủ công để giữ trọn vẹn sự thông thoáng cho những buổi thiền trà. Bạn có cần hỗ trợ gì thêm về cách bảo quản không ạ?', time: '14:20' },
        { id: 3, sender: 'customer', text: 'Cảm ơn shop, chất liệu linen rất thoáng, mình muốn hỏi thêm về mẫu quần ống rộng phối cùng.', time: '14:22' }
      ]
    },
    {
      id: 2,
      name: 'Nguyễn An Nhiên',
      initials: 'N',
      lastMessage: 'Tôi muốn đổi kích cỡ áo Pháp phục...',
      time: '13:45',
      unread: true,
      statusText: 'Đang chờ phản hồi',
      tier: 'Thành viên mới',
      email: 'nhien.na@email.com',
      phone: '093 ••• ••11',
      address: 'Hoàn Kiếm, Hà Nội',
      recentOrders: [
        { id: '#TTP-8109', status: 'Đang xử lý', item: 'Áo Tràng Đay Thiền - S', price: '2.450.000đ' }
      ],
      messages: [
        { id: 1, sender: 'customer', text: 'Tôi muốn đổi kích cỡ áo Pháp phục vừa nhận hôm qua từ size M sang size S.', time: '13:45' }
      ]
    },
    {
      id: 3,
      name: 'Trần Thanh Vân',
      initials: 'T',
      lastMessage: 'Sản phẩm tuyệt vời, mình sẽ ủng hộ tiếp.',
      time: 'Hôm qua',
      statusText: 'Đã hoàn thành tư vấn',
      tier: 'Hạng Bạch Kim',
      email: 'van.tt@email.com',
      phone: '097 ••• ••33',
      address: 'Hải Châu, Đà Nẵng',
      recentOrders: [
        { id: '#TTP-7911', status: 'Hoàn thành', item: 'Khăn Choàng Lụa Họa Sen', price: '1.890.000đ' }
      ],
      messages: [
        { id: 1, sender: 'customer', text: 'Sản phẩm tuyệt vời, mình sẽ ủng hộ tiếp.', time: 'Hôm qua' }
      ]
    }
  ])

  const [activeId, setActiveId] = useState(1)
  const [inputText, setInputText] = useState('')

  const activeChat = conversations.find(c => c.id === activeId) || conversations[0]

  const handleSendMessage = () => {
    if (!inputText.trim()) return
    const newMessage: Message = {
      id: activeChat.messages.length + 1,
      sender: 'agent',
      text: inputText,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    setConversations(prev => prev.map(c => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMessage: inputText,
          time: newMessage.time,
          messages: [...c.messages, newMessage]
        }
      }
      return c
    }))
    setInputText('')
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
