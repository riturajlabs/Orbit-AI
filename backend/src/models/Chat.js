/**
 * @file Chat.js
 * @description Chat Session schema representing conversations between users and the AI bot.
 */

import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      trim: true,
    },
    // Allows referencing the model used for the chat
    modelName: {
      type: String,
      default: 'llama-3.1-8b-instant',
    },
  },
  {
    timestamps: true,
  },
);

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
