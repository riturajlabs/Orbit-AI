export const buildConversationTitle = (message) => {
  if (!message) {
    return 'New Conversation';
  }

  return message.trim().slice(0, 42) || 'New Conversation';
};

export const buildGroqHistory = (messages = []) =>
  messages.map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
  }));
