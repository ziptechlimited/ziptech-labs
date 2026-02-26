import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMeetingRSVP {
  user: mongoose.Types.ObjectId;
  status: "yes" | "maybe" | "no";
}

export interface IMeeting extends Document {
  cohort: mongoose.Types.ObjectId;
  title: string;
  agenda?: string;
  scheduledAt: Date;
  duration: number;
  rsvps: IMeetingRSVP[];
  attendance: mongoose.Types.ObjectId[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const MeetingSchema: Schema<IMeeting> = new Schema(
  {
    cohort: {
      type: Schema.Types.ObjectId,
      ref: "Cohort",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    agenda: {
      type: String,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 60,
    },
    rsvps: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        status: {
          type: String,
          enum: ["yes", "maybe", "no"],
          default: "yes",
        },
      },
    ],
    attendance: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Meeting: Model<IMeeting> = mongoose.model<IMeeting>(
  "Meeting",
  MeetingSchema,
);
export default Meeting;
