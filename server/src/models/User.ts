import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, UserRole } from "../types/shared";
import slugify from "slugify";

export interface IUserDocument extends Omit<IUser, "_id">, Document {
  _id: mongoose.Types.ObjectId;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUserDocument> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.FOUNDER,
    },
    bio: { type: String, maxlength: 400 },
    avatarUrl: { type: String },
    company: { type: String, maxlength: 120 },
    website: { type: String, maxlength: 200 },
    location: { type: String, maxlength: 120 },
    headline: { type: String, maxlength: 140 },
    companyOneLiner: { type: String, maxlength: 160 },
    sector: { type: String, maxlength: 60 },
    stage: {
      type: String,
      enum: ["idea", "pre-seed", "seed", "series-a", "growth"],
    },
    fundraising: { type: Boolean, default: false },
    raiseAmount: { type: String, maxlength: 40 },
    linkedin: { type: String, maxlength: 200 },
    twitter: { type: String, maxlength: 200 },
    isProfilePublic: { type: Boolean, default: true },
    watchlist: [{ type: Schema.Types.ObjectId, ref: "User" }],
    slug: { type: String, unique: true, sparse: true },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    verificationTokenHash: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
    cohort: {
      type: Schema.Types.ObjectId,
      ref: "Cohort",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
  },
);

// Password Hash Middleware
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  if (this.password) {
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Match Password Method
UserSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure a unique slug is set (used for public report URLs)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("name") && this.slug) return next();
  const base = slugify(this.name || "", { lower: true, strict: true }) || "founder";
  let candidate = base;
  let n = 1;
  const Model = this.constructor as Model<IUserDocument>;
  while (await Model.exists({ slug: candidate, _id: { $ne: this._id } })) {
    n += 1;
    candidate = `${base}-${n}`;
  }
  this.slug = candidate;
  next();
});

const User = mongoose.model<IUserDocument>("User", UserSchema);
export default User;
