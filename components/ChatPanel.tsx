import React, { useState, useRef, useEffect, useMemo, FC } from 'react';
import { useChat } from '../hooks/useChat.ts';
import { addChatMessage, uploadChatImage, archiveAllChatMessages, deleteChatMessage, updateChatMessage } from '../services/firebase.ts';
import { Role } from '../types.ts';
import { PaperAirplaneIcon, ChatBubbleOvalLeftEllipsisIcon, PaperClipIcon, SpinnerIcon, ArchiveBoxIcon, TrashIcon, PencilIcon, XMarkIcon, CheckIcon } from './Icons.tsx';
import type { ChatMessage } from '../types.ts';
import { toast } from 'react-hot-toast';
import ImageViewerModal from './ImageViewerModal.tsx';

interface ChatPanelProps {
  role: Role;
}

const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
};

const formatDateSeparator = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return 'اليوم';
    if (isSameDay(date, yesterday)) return 'الأمس';
    return date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
};

const DateSeparator: FC<{ date: Date }> = ({ date }) => (
    <div className="text-center text-xs text-gray-500 font-semibold my-4">
        <span className="bg-slate-200 px-3 py-1 rounded-full">{formatDateSeparator(date)}</span>
    </div>
);

const EditForm: FC<{
    message: ChatMessage,
    onSave: (messageId: string, newText: string) => void,
    onCancel: () => void
}> = ({ message, onSave, onCancel }) => {
    const [editText, setEditText] = useState(message.text || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editText.trim() && editText.trim() !== message.text) {
            onSave(message.id, editText.trim());
        } else {
            onCancel();
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-start gap-2 w-full max-w-sm ml-auto">
            <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                    }
                    if (e.key === 'Escape') onCancel();
                }}
                className="form-input flex-grow text-sm py-2 px-3 resize-none"
                rows={Math.min(5, (editText.match(/\n/g) || []).length + 2)}
                autoFocus
            />
            <div className="flex flex-col gap-1.5">
                <button type="submit" className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200"><CheckIcon className="w-4 h-4" /></button>
                <button type="button" onClick={onCancel} className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"><XMarkIcon className="w-4 h-4" /></button>
            </div>
        </form>
    );
};


const MessageBubble: FC<{
    message: ChatMessage;
    currentUserRole: Role;
    onDelete: (id: string) => void;
    onStartEdit: (message: ChatMessage) => void;
    onViewImage: (imageUrl: string) => void;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
}> = ({ message, currentUserRole, onDelete, onStartEdit, onViewImage, isFirstInGroup, isLastInGroup }) => {
    const isSender = message.sender === currentUserRole;
    const senderName = message.sender === Role.Doctor ? 'الطبيب' : 'السكرتير';
    const messageTime = message.createdAt?.toDate().toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
    }) ?? '';

    const bubbleClasses = [
        'max-w-md p-3 relative group shadow-sm',
        isSender ? 'bg-[var(--theme-color)] text-white' : 'bg-white text-gray-800 border border-gray-200/80',
        isFirstInGroup && isLastInGroup ? 'rounded-2xl' : '',
        isSender
            ? `${isFirstInGroup ? 'rounded-tr-2xl' : 'rounded-tr-md'} ${isLastInGroup ? 'rounded-br-lg' : 'rounded-br-md'} rounded-l-2xl`
            : `${isFirstInGroup ? 'rounded-tl-2xl' : 'rounded-tl-md'} ${isLastInGroup ? 'rounded-bl-lg' : 'rounded-bl-md'} rounded-r-2xl`,
    ].join(' ');

    return (
        <div className={`flex items-end gap-2 ${isSender ? 'flex-row-reverse' : 'flex-row'} ${isFirstInGroup ? 'mt-3' : 'mt-0.5'}`}>
             <div className="relative">
                <div className={bubbleClasses}>
                    {!isSender && isFirstInGroup && <p className="text-xs font-bold mb-1.5 text-[var(--theme-color)]">{senderName}</p>}
                    {message.imageUrl && (
                        <div onClick={() => onViewImage(message.imageUrl)} className="block my-1 cursor-pointer overflow-hidden rounded-lg">
                            <img src={message.imageUrl} alt="محتوى مرسل" className="max-w-full h-auto max-h-60 object-cover bg-gray-300" />
                        </div>
                    )}
                    {message.text && <p className="text-base break-words whitespace-pre-wrap">{message.text}</p>}
                </div>
                {isSender && (
                     <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full ml-[-4px] flex items-center bg-white border rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button onClick={() => onStartEdit(message)} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => onDelete(message.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
            {isLastInGroup && <p className="text-xs text-gray-400 mb-1 flex-shrink-0">{messageTime}</p>}
        </div>
    );
};

const ChatPanel: React.FC<ChatPanelProps> = ({ role }) => {
  const { messages, loading, error } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || role === Role.None || role === Role.Public) return;
    try {
      await addChatMessage({ text: newMessage.trim(), sender: role });
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error('فشل إرسال الرسالة.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
        const toastId = toast.loading('جاري حذف الرسالة...');
        try {
            await deleteChatMessage(messageId);
            toast.success('تم حذف الرسالة.', { id: toastId });
        } catch (err) {
            console.error('Failed to delete message:', err);
            toast.error('فشل حذف الرسالة.', { id: toastId });
        }
    }
  };

  const handleSaveEdit = async (messageId: string, newText: string) => {
    const toastId = toast.loading('جاري تعديل الرسالة...');
    try {
        await updateChatMessage(messageId, newText);
        toast.success('تم تعديل الرسالة.', { id: toastId });
        setEditingMessage(null);
    } catch (err) {
        console.error('Failed to edit message:', err);
        toast.error('فشل تعديل الرسالة.', { id: toastId });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadToast = toast.loading('جاري رفع الصورة...');
    try {
      const imageUrl = await uploadChatImage(file);
      await addChatMessage({ sender: role, imageUrl });
      toast.success('تم إرسال الصورة.', { id: uploadToast });
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error('فشل رفع الصورة.', { id: uploadToast });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const handleArchiveMessages = async () => {
    if (!window.confirm("سيتم أرشفة جميع الرسائل بشكل دائم. هل أنت متأكد؟")) return;

    setIsArchiving(true);
    const archiveToast = toast.loading("جاري أرشفة الرسائل...");
    try {
        const count = await archiveAllChatMessages();
        toast.success(count > 0 ? `تمت أرشفة ${count} رسالة.` : 'لا توجد رسائل للأرشفة.', { id: archiveToast });
    } catch (err) {
        toast.error("فشل في أرشفة الرسائل.", { id: archiveToast });
    } finally {
        setIsArchiving(false);
    }
  };

  const chatContent = useMemo(() => {
    if (!messages) return [];
    const elements: React.ReactNode[] = [];
    let lastDate: string | null = null;
    
    messages.forEach((msg, index) => {
        const msgDate = msg.createdAt.toDate();
        const msgDateString = msgDate.toLocaleDateString();

        if (msgDateString !== lastDate) {
            elements.push(<DateSeparator key={msgDateString} date={msgDate} />);
            lastDate = msgDateString;
        }

        const prevMsg = messages[index - 1];
        const nextMsg = messages[index + 1];
        const isFirstInGroup = !prevMsg || prevMsg.sender !== msg.sender || (msg.createdAt.toMillis() - prevMsg.createdAt.toMillis() > 300000); // 5 mins
        const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender || (nextMsg.createdAt.toMillis() - msg.createdAt.toMillis() > 300000);

        if (editingMessage?.id === msg.id) {
            elements.push(<EditForm key={`${msg.id}-edit`} message={msg} onSave={handleSaveEdit} onCancel={() => setEditingMessage(null)} />);
        } else {
            elements.push(<MessageBubble 
                key={msg.id} 
                message={msg} 
                currentUserRole={role}
                onDelete={handleDeleteMessage}
                onStartEdit={setEditingMessage}
                onViewImage={setViewingImage}
                isFirstInGroup={isFirstInGroup}
                isLastInGroup={isLastInGroup}
            />);
        }
    });

    return elements;
  }, [messages, role, editingMessage]);

  return (
     <>
        <div className="bg-white rounded-2xl shadow-lg flex flex-col h-full w-full">
            <header className="flex justify-between items-center p-4 border-b border-slate-200 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800">الدردشة الداخلية</h2>
                <button onClick={handleArchiveMessages} disabled={isArchiving} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50" title="أرشفة جميع الرسائل">
                    {isArchiving ? <SpinnerIcon className="w-5 h-5 text-gray-600" /> : <ArchiveBoxIcon className="w-5 h-5 text-gray-600"/>}
                </button>
            </header>
            <div className="flex-grow p-4 overflow-y-auto overflow-x-hidden bg-slate-50">
                {loading && <div className="flex items-center justify-center h-full"><SpinnerIcon className="w-8 h-8 text-gray-400"/></div>}
                {error && <p className="text-center text-red-500 pt-10">حدث خطأ في تحميل الرسائل.</p>}
                {!loading && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                        <ChatBubbleOvalLeftEllipsisIcon className="w-20 h-20 text-gray-300 mb-4" />
                        <p className="font-semibold text-gray-600">ابدأ محادثة</p>
                        <p className="text-sm">الرسائل بين الطبيب والسكرتير تظهر هنا.</p>
                    </div>
                )}
                <div>{chatContent}</div>
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex-shrink-0 bg-white">
                <div className="relative">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        className="form-input w-full resize-none rounded-full py-2.5 pr-12 pl-12 transition-all duration-200"
                        placeholder="اكتب رسالتك..."
                        disabled={isUploading}
                        rows={1}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center">
                         <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-2 text-gray-500 hover:text-[var(--theme-color)] hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50" title="إرفاق صورة">
                            {isUploading ? <SpinnerIcon className="w-5 h-5"/> : <PaperClipIcon className="w-5 h-5" />}
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" disabled={isUploading} />
                    </div>
                     <div className="absolute top-1/2 -translate-y-1/2 left-2 flex items-center">
                        <button type="submit" className="p-2 text-white bg-[var(--theme-color)] hover:opacity-90 rounded-full transition-transform active:scale-95 disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isUploading || !newMessage.trim()}>
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </form>
        </div>
        {viewingImage && <ImageViewerModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}
     </>
  );
};

export default ChatPanel;