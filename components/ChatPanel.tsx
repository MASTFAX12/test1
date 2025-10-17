import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat.ts';
import { addChatMessage, uploadChatImage, archiveOldChatMessages, deleteChatMessage } from '../services/firebase.ts';
import { Role } from '../types.ts';
import { PaperAirplaneIcon, ChatBubbleOvalLeftEllipsisIcon, XMarkIcon, PaperClipIcon, SpinnerIcon, ArchiveBoxIcon, TrashIcon } from './Icons.tsx';
import { usePrevious } from '../hooks/usePrevious.ts';
import type { ChatMessage } from '../types.ts';
import { toast } from 'react-hot-toast';

interface ChatPanelProps {
  role: Role;
  isEmbedded?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ role, isEmbedded = false }) => {
  const [isOpen, setIsOpen] = useState(isEmbedded);
  const { messages, loading, error } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [hasUnread, setHasUnread] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessages = usePrevious(messages);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if(isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  // Effect to detect new messages and show notification badge
  useEffect(() => {
    if (!isOpen && prevMessages && messages.length > prevMessages.length) {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage.sender !== role) {
        setHasUnread(true);
      }
    }
  }, [messages, prevMessages, isOpen, role]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || role === Role.None || role === Role.Public) return;
    try {
      await addChatMessage({ text: newMessage, sender: role });
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error('فشل إرسال الرسالة.');
    }
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        try {
            await deleteChatMessage(messageId);
            toast.success('تم حذف الرسالة.');
        } catch (err) {
            console.error('Failed to delete message:', err);
            toast.error('فشل حذف الرسالة.');
        }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadChatImage(file);
      await addChatMessage({ sender: role, imageUrl });
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error('فشل رفع الصورة.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const handleArchiveMessages = async () => {
    const confirmArchive = window.confirm("سيتم أرشفة جميع الرسائل التي مر عليها أكثر من 24 ساعة بشكل دائم. هل أنت متأكد من المتابعة؟");
    if (!confirmArchive) return;

    setIsArchiving(true);
    const archiveToast = toast.loading("جاري أرشفة الرسائل القديمة...");
    try {
        const count = await archiveOldChatMessages();
        if (count > 0) {
            toast.success(`تمت أرشفة ${count} رسالة بنجاح.`, { id: archiveToast });
        } else {
            toast.success('لا توجد رسائل قديمة للأرشفة.', { id: archiveToast });
        }
    } catch (err) {
        console.error("Failed to archive messages:", err);
        toast.error("فشل في أرشفة الرسائل.", { id: archiveToast });
    } finally {
        setIsArchiving(false);
    }
  };

  const handleOpenChat = () => {
      setIsOpen(true);
      setHasUnread(false);
  }

  if (!isOpen) {
    return (
        <button 
            onClick={handleOpenChat} 
            className="bg-blue-600 text-white w-16 h-16 rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition relative"
            title="فتح الدردشة"
        >
            <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8"/>
            {hasUnread && (
                <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white" />
            )}
        </button>
    );
  }

  const containerClasses = isEmbedded
    ? "flex flex-col h-[60vh] max-h-[420px]"
    : "bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[70vh] max-h-[500px] w-[90vw] max-w-sm animate-fade-in";


  return (
    <div className={containerClasses}>
      {!isEmbedded && (
        <header className="flex justify-between items-center p-4 border-b flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-800">الدردشة الداخلية</h2>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleArchiveMessages}
                    disabled={isArchiving}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="أرشفة الرسائل القديمة (أقدم من 24 ساعة)"
                >
                    {isArchiving ? <SpinnerIcon className="w-5 h-5 text-gray-600" /> : <ArchiveBoxIcon className="w-5 h-5 text-gray-600"/>}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-gray-200">
                    <XMarkIcon className="w-5 h-5 text-gray-600"/>
                </button>
            </div>
        </header>
      )}
      <div className="flex-grow p-4 overflow-y-auto bg-gray-50/50">
        {loading && <p className="text-center text-gray-500 pt-10">جاري تحميل الرسائل...</p>}
        {error && <p className="text-center text-red-500 pt-10">حدث خطأ.</p>}
        {!loading && messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <ChatBubbleOvalLeftEllipsisIcon className="w-20 h-20 text-gray-300 mb-4" />
                <p className="font-semibold text-gray-600">ابدأ محادثة</p>
                <p className="text-sm">الرسائل بين الطبيب والسكرتير تظهر هنا.</p>
              </div>
        )}
        <div className="space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} currentUserRole={role} onDelete={handleDeleteMessage} />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex-shrink-0 bg-gray-100/70 rounded-b-2xl">
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/*"
            disabled={isUploading}
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 rounded-full transition-colors disabled:opacity-50"
            title="إرفاق صورة"
          >
            {isUploading ? <SpinnerIcon className="w-5 h-5"/> : <PaperClipIcon className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="w-full pl-12 pr-12 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-full shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition"
            placeholder="اكتب رسالتك..."
            disabled={isUploading}
          />
          <button 
            type="submit" 
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-transform active:scale-95 disabled:bg-gray-400"
            disabled={isUploading || !newMessage.trim()}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

const MessageBubble: React.FC<{message: ChatMessage; currentUserRole: Role; onDelete: (id: string) => void;}> = ({ message, currentUserRole, onDelete }) => {
    const isSender = message.sender === currentUserRole;
    const senderName = message.sender === Role.Doctor ? 'الطبيب' : 'السكرتير';
    const messageTime = message.createdAt?.toDate().toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
    }) ?? '';

    return (
        <div className={`flex flex-col group ${isSender ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center gap-2 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
                {isSender && (
                    <button 
                        onClick={() => onDelete(message.id)}
                        className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="حذف الرسالة"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
                <div className={`max-w-xs p-3 rounded-2xl ${isSender ? 'bg-blue-500 text-white rounded-br-lg' : 'bg-gray-200 text-gray-800 rounded-bl-lg'}`}>
                    {!isSender && <p className="text-xs font-bold mb-1 text-blue-600">{senderName}</p>}
                    {message.imageUrl && (
                        <a href={message.imageUrl} target="_blank" rel="noopener noreferrer" className="block my-1">
                            <img src={message.imageUrl} alt="محتوى مرسل" className="rounded-lg max-w-full h-auto max-h-48 object-cover bg-gray-300" />
                        </a>
                    )}
                    {message.text && <p className="text-sm break-words">{message.text}</p>}
                </div>
            </div>
            <p className={`text-xs text-gray-400 mt-1 px-1 ${isSender ? 'text-right pl-8' : 'text-left'}`}>{messageTime}</p>
        </div>
    );
};

export default ChatPanel;
