import mongoose, { Schema, Document } from 'mongoose';
import { ICheckIn } from '../types/shared';

export interface ICheckInDocument extends Omit<ICheckIn, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const CheckInSchema: Schema<ICheckInDocument> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    goal: {
        type: Schema.Types.ObjectId,
        ref: 'Goal',
        required: true
    },
    weekNumber: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['done', 'partial', 'not_done'],
        required: true
    },
    blockerNote: {
        type: String,
        maxlength: [200, 'Blocker note cannot be more than 200 characters']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// One check-in per goal
CheckInSchema.index({ goal: 1 }, { unique: true });

const CheckIn = mongoose.model<ICheckInDocument>('CheckIn', CheckInSchema);
export default CheckIn;
