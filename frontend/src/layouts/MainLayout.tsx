import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CartDrawer } from '@/components/cart/CartDrawer'
import CheckoutModal from '@/components/ui/CheckoutModal'
import ZenAssistant from '@/components/layout/ZenAssistant'
import { ChatMessage } from '@/types'

export function MainLayout() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [conversation, setConversation] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: 'Từ Tâm Phục xin kính chào quý khách. Trợ lý AI có thể hỗ trợ quý khách tư vấn kích cỡ hoặc chất liệu trang phục phù hợp nhất ạ?',
      timestamp: new Date(),
    },
  ])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-20">
        <Outlet />
      </main>
      <Footer onOpenAssistant={() => setIsAssistantOpen(true)} />
      <CartDrawer />
      <CheckoutModal />
      <ZenAssistant 
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        selectedProduct={null}
        conversation={conversation}
        setConversation={setConversation}
      />
    </div>
  )
}
