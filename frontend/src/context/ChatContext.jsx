import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { chatApi, parseApiError } from '../services/api';
import useAuth from '../hooks/useAuth';

export const ChatContext = createContext(null);

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const formatTime = (date) => {
  if (!date) return "";
  const parsedDate = date instanceof Date ? date : new Date(date);
  if (isNaN(parsedDate.getTime())) return "";
  return parsedDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateLabel = (date) => {
  if (!date) return "";
  const parsedDate = date instanceof Date ? date : new Date(date);
  if (isNaN(parsedDate.getTime())) return "";
  return parsedDate.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const mapMessage = (message) => ({
  id: message.id || message._id || createId(),
  role: message.role === "assistant" || message.role === "model" ? "assistant" : "user",
  content: String(message.content || ''),
  timestamp: message.timestamp || message.createdAt || new Date().toISOString(),
  isNew: Boolean(message.isNew),
});

const mapChatSummary = (chat) => ({
  id: chat.id || chat._id,
  title: chat.title || 'New Conversation',
  modelName: chat.modelName || 'llama-3.3-70b-versatile',
  updatedAt: chat.updatedAt || chat.createdAt || new Date().toISOString(),
  messageCount: chat.messageCount || 0,
  messages: Array.isArray(chat.messages) ? chat.messages.map(mapMessage) : [],
});

export function ChatProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'dark';
    }
    return window.localStorage.getItem('ai-chatbot-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', theme);
    window.localStorage.setItem('ai-chatbot-theme', theme);
  }, [theme]);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeConversationId) || null,
    [activeConversationId, conversations]
  );

  const activeMessages = activeConversation?.messages || [];

  const loadChats = useCallback(async (preferredConversationId = null) => {
    if (!isAuthenticated) {
      setConversations([]);
      setActiveConversationId(null);
      return [];
    }

    setIsLoadingChats(true);
    setError('');

    try {
      const response = await chatApi.getChats();
      const loadedChats = (response.data?.data || []).map(mapChatSummary);

      setConversations((current)=> {
        const currentMap = new Map(current.map(chat=>[chat.id, chat]));
        return loadedChats.map(chat=>{
          const oldChat=currentMap.get(chat.id);
          return {
            ...chat,
            messages: oldChat?.messages?.length ? oldChat.messages : chat.messages || []
          };
        });
      });

      if (!loadedChats.length) {
        setActiveConversationId(null);
      } else {
        setActiveConversationId((currentActiveId)=>{
          return currentActiveId;
        });
      }
      return loadedChats;
    } catch (requestError) {
      setError(parseApiError(requestError));
      setConversations([]);
      setActiveConversationId(null);
      return [];
    } finally {
      setIsLoadingChats(false);
    }
  }, [isAuthenticated]);

  const loadChatMessages = useCallback(
    async (conversationId) => {
      const existingConversation = conversations.find(
        (c) => c.id === conversationId
      );

      if (
        existingConversation?.messages?.length > 0 &&
        existingConversation.messages.some(m=>m.role==="assistant")
      ) {
        return existingConversation.messages;
      }
      
      if (!conversationId) {
        return [];
      }

      if (!isAuthenticated) {
        return conversations.find((conversation) => conversation.id === conversationId)?.messages || [];
      }

      setIsLoadingMessages(true);
      setError('');

      try {
        const response = await chatApi.getChatMessages(conversationId);
        const messages = (response.data?.data || []).map(mapMessage);
      

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  messages,
                }
              : conversation
          )
        );

        return messages;
      } catch (requestError) {
        setError(parseApiError(requestError));
        return [];
      } finally {
        setIsLoadingMessages(false);
      }
    },
    [conversations, isAuthenticated]
  );

  const selectConversation = useCallback(
    async (conversationId)=>{
      setActiveConversationId(conversationId);
      setIsSidebarOpen(false);
      await loadChatMessages(conversationId);
    },
    [loadChatMessages]
  );

  const startNewChat = useCallback(async () => {
    setError('');

    if (!isAuthenticated) {
      setError('Please sign in to create and save chats.');
      return null;
    }

    setIsLoadingChats(true);

    try {
      const response = await chatApi.createChat({ title: 'New Conversation' });
      const chat = mapChatSummary(response.data?.data || {});

      setConversations((current) => [chat, ...current.filter((item) => item.id !== chat.id)]);
      setActiveConversationId(chat.id);
      setIsSidebarOpen(false);

      return chat;
    } catch (requestError) {
      setError(parseApiError(requestError));
      return null;
    } finally {
      setIsLoadingChats(false);
    }
  }, [isAuthenticated]);

  const deleteConversation = useCallback(
    async (conversationId) => {
      if (!conversationId) {
        return null;
      }

      setError('');

      if (isAuthenticated) {
        try {
          await chatApi.deleteChat(conversationId);
        } catch (requestError) {
          if(requestError.response?.status !== 404){
              setError(parseApiError(requestError));
          }
          return [];
        }
      }

      setConversations((current) =>
        current.filter(
          (conversation) => conversation.id !== conversationId
        )
      );

      setActiveConversationId(null);
      return null;
    },
    [isAuthenticated]
  );

  const renameConversation = useCallback(
    async (conversationId, newTitle) => {
      if (!conversationId || !newTitle.trim()) return;

      try {
        await chatApi.renameChat(conversationId, newTitle);

        setConversations((current) =>
          current.map((chat) =>
            chat.id === conversationId
              ? {
                  ...chat,
                  title: newTitle.trim(),
                }
              : chat
          )
        );
      } catch (err) {
        setError(parseApiError(err));
      }
    },
    []
  );

  const clearActiveConversation = useCallback(
    () => deleteConversation(activeConversationId),
    [activeConversationId, deleteConversation]
  );

  const clearError = useCallback(() => setError(''), []);

  const sendMessage = useCallback(
    async (messageText) => {
      const content = messageText.trim();

      if (!content || isTyping || isSendingMessage) {
        return;
      }

      setError('');
      setIsTyping(true);
      setIsSendingMessage(true);

      let conversationId = activeConversationId;

      if (!isAuthenticated) {
        setError('Please sign in to send messages.');
        setIsTyping(false);
        setIsSendingMessage(false);
        return;
      }

      if (!conversationId) {
        const createdChat = await startNewChat();
        conversationId = createdChat?.id || null;
      }

      if (!conversationId) {
        setError('Unable to create or select a chat');
        setIsTyping(false);
        setIsSendingMessage(false);
        return;
      }

      const userMessage = {
        id: createId(),
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
      };

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: [...(conversation.messages || []), userMessage],
                updatedAt: userMessage.timestamp,
              }
            : conversation
        )
      );

      try {
        const response = await chatApi.sendMessage({
          chatId: conversationId,
          message: content,
        });

        const data = response.data?.data || {};
        const updatedChat = data.chat ? mapChatSummary(data.chat) : null;
        const assistantMessage = data.assistantMessage
                      ? {
                          ...mapMessage(data.assistantMessage),
                          isNew:true,
                      }
                      :null;
        const nextConversationId = updatedChat?.id || conversationId;

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === nextConversationId
              ? {
                  ...conversation,
                  ...(
                    updatedChat
                      ? {
                          title: updatedChat.title,
                          modelName: updatedChat.modelName,
                          updatedAt: updatedChat.updatedAt,
                        }
                      : {}
                  ),
                  messages: [
                    ...conversation.messages.filter(
                        m => m.id !== userMessage.id
                    ),
                    userMessage,
                    assistantMessage
                  ].filter(Boolean),
                }
              : conversation
          )
        );

        setActiveConversationId(nextConversationId);
      } catch (requestError) {
        const errorMessage = parseApiError(requestError);
        setError(errorMessage);

        setConversations((current) =>
          current.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  updatedAt: new Date().toISOString(),
                }
              : conversation
          )
        );
      } finally {
        setIsTyping(false);
        setIsSendingMessage(false);
      }
    },
    [activeConversationId, isAuthenticated, isSendingMessage, isTyping, startNewChat]
  );

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  const value = {
    conversations,
    activeConversation,
    activeConversationId,
    activeMessages,
    isLoadingChats,
    isLoadingMessages,
    isTyping,
    isSendingMessage,
    error,
    isSidebarOpen,
    theme,
    setIsSidebarOpen,
    setTheme,
    loadChats,
    loadChatMessages,
    startNewChat,
    selectConversation,
    deleteConversation,
    clearActiveConversation,
    renameConversation,
    clearError,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}