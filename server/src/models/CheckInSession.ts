import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICheckInSession extends Document {
  cohort: mongoose.Types.ObjectId;
  active: boolean;
  startedBy: mongoose.Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CheckInSessionSchema: Schema<ICheckInSession> = new Schema(
  {
    cohort: { type: Schema.Types.ObjectId, ref: 'Cohort', required: true },
    active: { type: Boolean, default: true },
    startedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

const CheckInSession: Model<ICheckInSession> = mongoose.model<ICheckInSession>('CheckInSession', CheckInSessionSchema);
export default CheckInSession;
