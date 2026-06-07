import { useState } from 'react'
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video,
  CheckCheck
} from 'lucide-react'

export default function AdminChat() {
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [activeChatId, setActiveChatId] = useState(1)

  const [chats, setChats] = useState([
    {
      id: 1,
      name: 'Minh Nguyễn',
      avatar: 'M',
      lastMessage: 'Dạ vầy mình lấy size L nha shop ơi.',
      time: '10:42 AM',
      unreadCount: 2,
      online: true,
      messages: [
        { sender: 'customer', text: 'Xin chào, mình muốn hỏi về áo choàng thiền Linen ạ.', time: '10:30 AM' },
        { sender: 'staff', text: 'Nam Mô A Di Đà Phật. Từ Tâm Phục xin chào đạo hữu. Đạo hữu muốn tư vấn về kích thước hay màu sắc của áo ạ?', time: '10:32 AM' },
        { sender: 'customer', text: 'Mình cao 1m75, nặng 70kg thì mặc size nào vừa nhỉ?', time: '10:35 AM' },
        { sender: 'staff', text: 'Dạ với chiều cao và cân nặng của đạo hữu, mặc size L sẽ rất thoải mái và trang nghiêm khi hành lễ ạ.', time: '10:38 AM' },
        { sender: 'customer', text: 'Dạ vầy mình lấy size L nha shop ơi.', time: '10:42 AM' }
      ]
    },
    {
      id: 2,
      name: 'Emma Thompson',
      avatar: 'E',
      lastMessage: 'Thank you for the guidance.',
      time: '9:15 AM',
      unreadCount: 0,
      online: false,
      messages: [
        { sender: 'customer', text: 'Hello, do you ship internationally?', time: '9:00 AM' },
        { sender: 'staff', text: 'Greetings. Yes, we support international shipping for our Zen collection. It usually takes 7-14 business days.', time: '9:10 AM' },
        { sender: 'customer', text: 'Thank you for the guidance.', time: '9:15 AM' }
      ]
    },
    {
      id: 3,
      name: 'Lê Tú Anh',
      avatar: 'T',
      lastMessage: 'Đơn hàng #TTP-9019 của mình đã giao chưa ạ?',
      time: 'Hôm qua',
      unreadCount: 0,
      online: true,
      messages: [
        { sender: 'customer', text: 'Đơn hàng #TTP-9019 của mình đã giao chưa ạ?', time: 'Hôm qua' }
      ]
    }
  ])

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0]

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    const newMessage = {
      sender: 'staff',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setChats(prevChats => prevChats.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          lastMessage: messageText,
          time: 'Vừa xong',
          messages: [...chat.messages, newMessage]
        }
      }
      return chat
    }))

    setMessageText('')
  }

  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="page-transition flex h-[calc(100vh-8rem)] rounded-xl overflow-hidden shadow-[0_10px_32px_-4px_rgba(68,42,34,0.05)] border border-outline-variant/10 bg-surface-container-lowest animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar List */}
      <div className="w-80 border-r border-outline-variant/20 flex flex-col h-full bg-surface-container-low/30">
        <div className="p-4 border-b border-outline-variant/10">
          <div className="flex items-center bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/30">
            <Search size={14} className="text-on-surface-variant mr-2" />
            <input 
              type="text" 
              placeholder="Tìm hội thoại..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs font-body-md placeholder:text-outline p-0 w-full"
            />
          </div>
        </div>

        <div className="flex-grow overflow-y-auto divide-y divide-outline-variant/10">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id)
                // Reset unread count
                setChats(prev => prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c))
              }}
              className={`w-full text-left p-4 flex gap-3 transition-colors ${
                activeChatId === chat.id 
                  ? 'bg-primary/5 border-l-2 border-primary' 
                  : 'hover:bg-surface-container-low/50 border-l-2 border-transparent'
              }`}
            >
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
                  {chat.avatar}
                </div>
                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface-container-lowest"></span>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-semibold text-sm text-on-surface truncate">{chat.name}</span>
                  <span className="text-[10px] text-on-surface-variant/50">{chat.time}</span>
                </div>
                <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'text-primary font-bold' : 'text-on-surface-variant/70'}`}>
                  {chat.lastMessage}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="flex-shrink-0 flex items-center">
                  <span className="bg-primary text-on-primary text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {chat.unreadCount}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow flex flex-col h-full bg-surface-container-lowest">
        {/* Chat Header */}
        <div className="px-6 py-3 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm">
              {activeChat.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-sm text-on-surface">{activeChat.name}</h3>
              <p className="text-[10px] text-on-surface-variant/60 flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${activeChat.online ? 'bg-emerald-500' : 'bg-on-surface-variant/40'}`}></span>
                {activeChat.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors rounded">
              <Phone size={16} />
            </button>
            <button className="p-2 hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors rounded">
              <Video size={16} />
            </button>
            <button className="p-2 hover:bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors rounded">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-surface/30">
          {activeChat.messages.map((msg, idx) => {
            const isStaff = msg.sender === 'staff'
            return (
              <div 
                key={idx} 
                className={`flex ${isStaff ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[70%] rounded-lg px-4 py-2 text-sm shadow-[0_2px_8px_-2px_rgba(68,42,34,0.03)] ${
                  isStaff 
                    ? 'bg-primary text-on-primary rounded-tr-none' 
                    : 'bg-surface-container-low text-on-surface rounded-tl-none'
                }`}>
                  <p className="leading-relaxed font-body-md">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                    isStaff ? 'text-on-primary/60' : 'text-on-surface-variant/40'
                  }`}>
                    <span>{msg.time}</span>
                    {isStaff && <CheckCheck size={10} />}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant/20 flex items-center gap-3">
          <button type="button" className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-full transition-colors">
            <Paperclip size={18} />
          </button>
          <button type="button" className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-full transition-colors">
            <Smile size={18} />
          </button>
          
          <input 
            type="text" 
            placeholder="Viết câu trả lời..." 
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-grow bg-surface-container-low border-none focus:ring-1 focus:ring-primary/20 rounded-full px-5 py-2.5 text-sm font-body-md placeholder:text-outline/70"
          />

          <button 
            type="submit" 
            className="p-2.5 bg-primary text-on-primary hover:bg-primary/95 rounded-full transition-all flex items-center justify-center shadow-md hover:scale-105"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
