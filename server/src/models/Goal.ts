import mongoose, { Schema, Document } from 'mongoose';
import { IGoal } from '../types/shared';

// Extend IGoal or allow extra props
export interface IGoalDocument extends Omit<IGoal, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const GoalSchema: Schema<IGoalDocument> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cohort: {
        type: Schema.Types.ObjectId,
        ref: 'Cohort',
        required: true
    },
    type: {
        type: String,
        enum: ['public', 'private'],
        required: true
    },
    description: {
        type: String,
        required: [true, 'Please add a goal description'],
        trim: true,
        maxlength: [100, 'Goal cannot be more than 100 characters']
    },
    status: {
        type: String,
        enum: ['pending', 'done', 'partial', 'not_done'],
        default: 'pending'
    },
    weekNumber: {
        type: Number,
        required: true
    },
    subTasks: [{
        description: {
            type: String,
            required: true
        },
        completed: {
            type: Boolean,
            default: false
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure user can only have 1 public and 1 private goal per week
GoalSchema.index({ user: 1, weekNumber: 1, type: 1 }, { unique: true });

const Goal = mongoose.model<IGoalDocument>('Goal', GoalSchema);
export default Goal;
