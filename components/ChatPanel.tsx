import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat.ts';
import { addChatMessage } from '../services/firebase.ts';
import { Role } from '../types.ts';
import { PaperAirplaneIcon, ChatBubbleOvalLeftEllipsisIcon, XMarkIcon } from './Icons.tsx';

interface ChatPanelProps {
  role: Role;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, loading, error } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if(isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || role === Role.None || role === Role.Public) return;
    try {
      await addChatMessage(newMessage, role);
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };
  
  if (!isOpen) {
    return (
        <button 
            onClick={() => setIsOpen(true)} 
            className="bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition"
            title="فتح الدردشة"
        >
            <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8"/>
        </button>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[500px] w-80 animate-fade-in">
      <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">الدردشة الداخلية</h2>
         <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-5 h-5 text-gray-600"/>
        </button>
      </header>
      <div className="flex-grow p-4 overflow-y-auto">
        {loading && <p className="text-center text-gray-500">جاري تحميل الرسائل...</p>}
        {error && <p className="text-center text-red-500">حدث خطأ.</p>}
        <div className="space-y-4">
          {messages.map((msg) => {
            const isSender = msg.sender === role;
            const senderRole = msg.sender === Role.Doctor ? 'D' : 'S';
            const senderName = msg.sender === Role.Doctor ? 'الطبيب' : 'السكرتير';

            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isSender ? 'justify-end' : 'justify-start'}`}>
                {!isSender && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-600">{senderRole}</div>}
                <div className={`max-w-xs p-3 rounded-lg ${isSender ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                  <p className="text-sm font-bold mb-1">{!isSender && senderName}</p>
                  <p className="text-sm">{msg.text}</p>
                </div>
                 {isSender && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-white">{senderRole}</div>}
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex-shrink-0 bg-gray-50/50 rounded-b-2xl">
        <div className="relative">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full pl-3 pr-12 py-2 bg-white border border-gray-300 rounded-full shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="اكتب رسالتك..."
          />
          <button type="submit" className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-full">
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;