/**
 * @file Message.js
 * @description Message schema containing individual prompts and responses within a Chat Session.
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'model'],
      required: true,
    },
    parts: [
      {
        text: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
