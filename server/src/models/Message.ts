import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  cohort: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  content: string;
  isPinned: boolean;
  isMuted: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema<IMessage> = new Schema(
  {
    cohort: {
      type: Schema.Types.ObjectId,
      ref: 'Cohort',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isMuted: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Message: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema);
export default Message;
