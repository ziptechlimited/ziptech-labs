import crypto from "crypto";
import User from "../models/User";

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const createEmailVerificationToken = async (
  userId: string,
): Promise<string> => {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const hash = hashToken(token);
  const expires = new Date(Date.now() + TOKEN_TTL_MS);
  await User.findByIdAndUpdate(userId, {
    verificationTokenHash: hash,
    verificationTokenExpires: expires,
  });
  return token;
};

export const verifyEmailToken = async (
  token: string,
): Promise<"ok" | "expired" | "invalid"> => {
  const hash = hashToken(token);
  const user = await User.findOne({ verificationTokenHash: hash });
  if (!user) return "invalid";
  if (
    !user.verificationTokenExpires ||
    user.verificationTokenExpires.getTime() < Date.now()
  ) {
    return "expired";
  }
  user.isVerified = true;
  user.verifiedAt = new Date();
  user.verificationTokenHash = undefined as any;
  user.verificationTokenExpires = undefined as any;
  await user.save();
  return "ok";
};
