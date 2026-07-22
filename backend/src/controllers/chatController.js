import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';
import { buildConversationTitle, buildGroqHistory } from '../utils/chatHelpers.js';
import { generateAIReply } from '../services/aiClient.service.js';

const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile';

const toMessageDoc = (chatId, role, content) => ({
  chatId,
  role,
  parts: [{ text: content }],
});

const hydrateChat = async (chat) => {
  const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 }).lean();

  return {
    id: chat._id,
    title: chat.title,
    modelName: chat.modelName,
    createdAt: chat.createdAt,
    updatedAt: chat.updatedAt,
    messages: messages.map((message) => ({
      id: message._id,
      role: message.role === 'model' ? 'assistant' : 'user',
      content: message.parts?.[0]?.text || '',
      timestamp: message.createdAt,
    })),
  };
};

export const listChats = asyncHandler(async (req, res) => {
  const chats = await Chat.find({ userId: req.userId }).sort({ updatedAt: -1 }).lean();

  const data = await Promise.all(chats.map(async (chat) => {
    const messageCount = await Message.countDocuments({ chatId: chat._id });

    return {
      id: chat._id,
      title: chat.title,
      modelName: chat.modelName,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
      messageCount,
    };
  }));

  res.status(200).json({
    status: 'success',
    data,
  });
});

export const createChat = asyncHandler(async (req, res) => {
  const { title, modelName } = req.body || {};

  const chat = await Chat.create({
    userId: req.userId,
    title: title?.trim() || 'New Conversation',
    modelName: modelName || DEFAULT_GROQ_MODEL,
  });

  res.status(201).json({
    status: 'success',
    data: {
      id: chat._id,
      title: chat.title,
      modelName: chat.modelName,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    },
  });
});

export const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.userId });

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  const data = await hydrateChat(chat);

  res.status(200).json({
    status: 'success',
    data,
  });
});

export const renameChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { title } = req.body;

  if (!title?.trim()) {
    throw new AppError('Title is required', 400);
  }

  const chat = await Chat.findOneAndUpdate(
    {
      _id: chatId,
      userId: req.userId,
    },
    {
      title: title.trim(),
    },
    {
      new: true,
    },
  );

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      id: chat._id,
      title: chat.title,
      updatedAt: chat.updatedAt,
    },
  });
});

export const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findOneAndDelete({ _id: req.params.chatId, userId: req.userId });

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  await Message.deleteMany({ chatId: chat._id });

  res.status(200).json({
    status: 'success',
    message: 'Chat deleted successfully',
  });
});

export const sendChatMessage = asyncHandler(async (req, res) => {
  const { chatId, message, modelName } = req.body || {};

  if (!message || !message.trim()) {
    throw new AppError('Please provide a message', 400);
  }

  let chat = null;

  if (chatId) {
    chat = await Chat.findOne({ _id: chatId, userId: req.userId });

    if (!chat) {
      throw new AppError('Chat not found', 404);
    }
  } else {
    chat = await Chat.create({
      userId: req.userId,
      title: buildConversationTitle(message),
      modelName: modelName || DEFAULT_GROQ_MODEL,
    });
  }

  const userMessage = await Message.create(toMessageDoc(chat._id, 'user', message.trim()));

  const existingMessages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 }).lean();
  const previousMessages = existingMessages.slice(0, -1);
  const groqHistory = buildGroqHistory(previousMessages.map((entry) => ({
    role: entry.role === 'model' ? 'assistant' : 'user',
    content: entry.parts?.[0]?.text || '',
  })));

  let assistantReply = null;

  try {
    assistantReply = await generateAIReply({

    modelName: chat.modelName || DEFAULT_GROQ_MODEL,

    messages: groqHistory,

    prompt: message.trim(),

    sessionId: `${req.userId}_${chat._id}`,

  });
  } catch (error) {
    console.warn('[Chat] Groq reply failed, returning fallback response:', error.message);
  }

  const fallbackReply = 'Groq is not configured yet. The backend is ready to stream a response once the API key is available.';
  const replyText = assistantReply || fallbackReply;

  const modelMessage = await Message.create(toMessageDoc(chat._id, 'model', replyText));

  chat.title = chat.title === 'New Conversation' ? buildConversationTitle(message) : chat.title;
  chat.updatedAt = new Date();
  await chat.save();

  res.status(200).json({
    status: 'success',
    data: {
      chat: {
        id: chat._id,
        title: chat.title,
        modelName: chat.modelName,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      },
      userMessage: {
        id: userMessage._id,
        role: 'user',
        content: userMessage.parts?.[0]?.text || '',
        timestamp: userMessage.createdAt,
      },
      assistantMessage: {
        id: modelMessage._id,
        role: 'assistant',
        content: replyText,
        timestamp: modelMessage.createdAt,
      },
    },
  });
});

export const getChatMessages = asyncHandler(async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.chatId, userId: req.userId });

  if (!chat) {
    throw new AppError('Chat not found', 404);
  }

  const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 }).lean();

  res.status(200).json({
    status: 'success',
    data: messages.map((message) => ({
      id: message._id,
      role: message.role === 'model' ? 'assistant' : 'user',
      content: message.parts?.[0]?.text || '',
      timestamp: message.createdAt,
    })),
  });
});
