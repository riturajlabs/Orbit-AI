import Navbar from '../components/Navbar';
import MainLayout from '../components/MainLayout';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import useChat from '../hooks/useChat';

import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function Chat() {
  const {
    conversations,
    activeConversation,
    activeConversationId, // Ensure this is extracted
    activeMessages,
    isTyping,
    isSendingMessage,
    error,
    clearError,
    sendMessage,
    selectConversation,
    startNewChat,
    isLoadingMessages,
    isLoadingChats,
  } = useChat();

  const { chatId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 1. Aapka Original Logic: URL me ID ho toh chat load karo
  useEffect(() => {
    if (!chatId) return;
    const exists = conversations.some(chat => chat.id === chatId);
    if (exists && activeConversation?.id !== chatId) {
      selectConversation(chatId);
    }
  }, [chatId, conversations, activeConversation?.id, selectConversation]);


  // 2. THE FIX: Jab naya chat bane, toh bas URL me uski ID add kar do
  useEffect(() => {
    // Agar URL me ID nahi hai, par context me active chat aa chuka hai (Naya chat ban gaya)
    if (!chatId && activeConversationId) {
      // Current base path nikalte hain bina kisi hardcode ke
      const basePath = location.pathname.endsWith('/') 
        ? location.pathname.slice(0, -1) 
        : location.pathname;
        
      // URL update kar do (e.g. /chat -> /chat/12345)
      navigate(`${basePath}/${activeConversationId}`, { replace: true });
    }
  }, [chatId, activeConversationId, location.pathname, navigate]);

  return (
    <MainLayout
      sidebar={<Sidebar />}
      content={
        <>
          <ChatWindow
            title={activeConversation?.title || 'New Chat'}
            messages={activeMessages}
            isTyping={isTyping || isLoadingMessages || isLoadingChats}
          />
          {error && (
            <div className="chat-error-toast">
              <div className="d-flex align-items-center gap-2 chat-alert">
                <i className="bi bi-exclamation-triangle-fill"></i>
                <span>{error}</span>
              </div>
              <button onClick={clearError} className="chat-error-close">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          )}
        </>
      }
      composer={
        <ChatInput 
          onSend={sendMessage} 
          disabled={isTyping} 
          isLoading={isSendingMessage} 
        />
      }
    />
  );
}