import mongoose, { Schema, Document, Model } from 'mongoose';

export type InviteCodeType = 'meeting' | 'session';

export interface IInviteCode extends Document {
  code: string;
  type: InviteCodeType;
  targetId: mongoose.Types.ObjectId;
  expiresAt: Date;
  maxUses?: number;
  usageCount: number;
  revoked: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InviteCodeSchema: Schema<IInviteCode> = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    type: { type: String, required: true, enum: ['meeting', 'session'] },
    targetId: { type: Schema.Types.ObjectId, required: true },
    expiresAt: { type: Date, required: true },
    maxUses: { type: Number },
    usageCount: { type: Number, default: 0 },
    revoked: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const InviteCode: Model<IInviteCode> = mongoose.model<IInviteCode>('InviteCode', InviteCodeSchema);
export default InviteCode;
