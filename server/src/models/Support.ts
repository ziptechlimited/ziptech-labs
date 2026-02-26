import mongoose, { Schema, Document } from 'mongoose';

export interface ISupport extends Document {
    goal: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    type: 'support' | 'help' | 'endorse';
    message?: string;
    week: number;
}

const supportSchema = new Schema({
    goal: {
        type: Schema.Types.ObjectId,
        ref: 'Goal',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['support', 'help', 'endorse'],
        required: true
    },
    message: {
        type: String,
        maxlength: 120
    },
    week: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

supportSchema.index({ goal: 1, user: 1, week: 1 }, { unique: true });

export default mongoose.model<ISupport>('Support', supportSchema);
