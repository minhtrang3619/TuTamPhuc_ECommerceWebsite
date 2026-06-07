/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ChatMessage, Product } from "../types";
import { X, Send, Sparkles, User, HelpCircle } from "lucide-react";

interface ZenAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProduct: Product | null;
  conversation: ChatMessage[];
  setConversation: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function ZenAssistant({
  isOpen,
  onClose,
  selectedProduct,
  conversation,
  setConversation,
}: ZenAssistantProps) {
  if (!isOpen) return null;

  const [userInput, setUserInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const predefinedPrompts = [
    "Tư vấn chọn kích cỡ theo cân nặng",
    "Cách giặt đũi dệt tay không nhăn",
    "Y phục nào ngồi thiền mát nhất?",
    "Ý nghĩa tâm linh của đồ lam nâu",
  ];

  // Auto-scroll chat history
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const newUserMsg: ChatMessage = {
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setConversation((prev) => [...prev, newUserMsg]);
    setUserInput("");
    setIsLoading(true);

    try {
      // Prompt fetch requests to server secure endpoint
      const response = await fetch("/api/consult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...conversation, newUserMsg],
          selectedProduct: selectedProduct,
        }),
      });

      const data = await response.json();
      const newBotMsg: ChatMessage = {
        sender: "assistant",
        text: data.text,
        timestamp: new Date(),
      };

      setConversation((prev) => [...prev, newBotMsg]);
    } catch (err) {
      console.error("Consultation Error:", err);
      // Fallback fallback is handled gracefully by server, but if server crashes:
      const newBotMsg: ChatMessage = {
        sender: "assistant",
        text: "A Di Đà Phật! Đạo tràng đang gặp chút gián đoạn truyền phát âm tín. Đạo hữu vui lòng chờ trong giây lát hoặc phơi tà áo lam thảnh thơi rồi quay lại nhé.",
        timestamp: new Date(),
      };
      setConversation((prev) => [...prev, newBotMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(userInput);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="assistant-drawer-overlay">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-brand-dark/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      ></div>

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        {/* Drawer container body */}
        <div 
          className="w-screen max-w-md bg-brand-bg shadow-ambient flex flex-col justify-between border-l border-brand-sand/55"
          id="assistant-sidebar"
        >
          {/* Header Panel */}
          <div className="px-5 py-6 bg-brand-ivory border-b border-brand-sand/40 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-800 animate-pulse" />
              <h2 className="font-serif-elegant text-[15px] text-brand-primary font-bold">
                Trợ Lý AI Tĩnh Tâm
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-brand-secondary hover:text-brand-primary cursor-pointer p-1 rounded-full hover:bg-brand-sand/40 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Connected Context bar */}
          {selectedProduct && (
            <div className="bg-brand-sand/30 border-b border-brand-sand/50 px-5 py-3 flex gap-3 items-center text-[11px]">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="w-8 h-10 object-cover rounded-sm"
                referrerPolicy="no-referrer"
              />
              <span className="text-brand-primary font-semibold">
                Đang đối soạn y phục: <em className="underline not-italic">"{selectedProduct.name}"</em>
              </span>
            </div>
          )}

          {/* Conversation stream scroll scope */}
          <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-4 bg-brand-bg/60" ref={scrollRef}>
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs shadow-xs flex-shrink-0 ${
                  msg.sender === "user" 
                    ? "bg-brand-primary text-brand-bg border-brand-primary" 
                    : "bg-brand-sand text-brand-primary border-brand-stone/40"
                }`}>
                  {msg.sender === "user" ? <User size={13} /> : <Sparkles size={13} className="text-amber-800" />}
                </div>

                {/* Bubble */}
                <div className="flex flex-col">
                  <div className={`rounded-lg px-4 py-3 leading-relaxed text-xs shadow-xs border ${
                    msg.sender === "user"
                      ? "bg-brand-primary/95 text-brand-bg border-brand-primary"
                      : "bg-brand-ivory text-brand-dark border-brand-sand markdown-body"
                  }`}>
                    {msg.sender === "user" ? (
                      <p>{msg.text}</p>
                    ) : (
                      // Structured Markdown parsing block
                      <div dangerouslySetInnerHTML={{ 
                        // Standard paragraph format representation for simple markdown fallback
                        __html: msg.text
                          .replace(/\n\n/g, "<br/><br/>")
                          .replace(/\n- (.*)/g, "<ul><li>$1</li></ul>")
                          .replace(/\n\d+\. (.*)/g, "<ol><li>$1</li></ol>")
                          .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                          .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      }} />
                    )}
                  </div>
                  
                  {/* Timestamp metadata */}
                  <span className={`text-[9px] text-brand-secondary/60 mt-1 ${
                    msg.sender === "user" ? "text-right" : "text-left"
                  }`}>
                    {msg.timestamp.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            ))}

            {/* AI thinking flow state */}
            {isLoading && (
              <div className="flex gap-3 mr-auto max-w-[85%]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center border bg-brand-sand text-brand-primary border-brand-stone/40 flex-shrink-0 animate-spin">
                  <Sparkles size={13} className="text-amber-800" />
                </div>
                <div className="bg-brand-ivory text-brand-dark border border-brand-sand rounded-lg px-4 py-3 text-xs shadow-xs">
                  <span className="flex gap-1 items-center italic text-brand-secondary">
                    Trợ lý đang ngẫm tịnh thư thái...
                    <span className="animate-bounce delay-100">.</span>
                    <span className="animate-bounce delay-200">.</span>
                    <span className="animate-bounce delay-300">.</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer input and shortcuts panel */}
          <div className="px-5 py-4 bg-brand-ivory border-t border-brand-sand/40 flex flex-col gap-3.5">
            {/* Quick shortcuts tags */}
            {conversation.length < 3 && !isLoading && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-brand-secondary/70 uppercase tracking-widest flex items-center gap-1">
                  <HelpCircle size={10} /> Đạo hữu dễ hỏi nhanh:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {predefinedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[10px] bg-brand-bg text-brand-primary border border-brand-sand/80 hover:border-brand-primary rounded-sm px-2.5 py-1.5 transition-all text-left shadow-xs cursor-pointer active:scale-95"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat message form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder="Hỏi từ tâm: chiều cao cân nặng, cách vắt nước đũi lanh..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-brand-bg border border-brand-stone/30 rounded-sm px-3.5 py-3 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary outline-none text-brand-dark placeholder:text-brand-stone"
                id="assistant-textbox"
              />
              <button
                type="submit"
                disabled={isLoading || !userInput.trim()}
                className={`px-4 bg-brand-primary text-brand-bg rounded-sm flex items-center justify-center transition-all shadow-md ${
                  isLoading || !userInput.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-brand-brown active:scale-95 cursor-pointer"
                }`}
                id="assistant-submit"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
