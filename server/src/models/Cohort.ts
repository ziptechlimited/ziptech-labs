import mongoose, { Schema, Document } from 'mongoose';
import { ICohort } from '../types/shared';

export interface ICohortDocument extends Omit<ICohort, '_id' | 'inviteCode'>, Document {
  _id: mongoose.Types.ObjectId;
  inviteCode?: string; // Make optional in Doc if generated?
}

const CohortSchema: Schema<ICohortDocument> = new Schema({
    name: {
        type: String,
        required: [true, 'Please add a cohort name'],
        trim: true,
        maxlength: [50, 'Name can not be more than 50 characters']
    },
    facilitator: { // Facilitator was not in ICohort explicitly? shared had 'members'. 
                   // Let's check shared.ts content again.
                   // ICohort in shared.ts: _id, name, startDate, endDate, members, ...
                   // It didn't have facilitator?
                   // Use local definition if shared is incomplete or update shared.
                   // I should update shared to be accurate.
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    inviteCode: {
        type: String,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate Invite Code pre-save
CohortSchema.pre('save', function(next) {
    if (!this.inviteCode) {
        this.inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    next();
});

const Cohort = mongoose.model<ICohortDocument>('Cohort', CohortSchema);
export default Cohort;
