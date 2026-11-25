import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUserDocument } from "../models/User";
import { config } from "../config/env";
import rateLimit from "express-rate-limit";
import {
  createEmailVerificationToken,
  verifyEmailToken,
} from "../services/verificationService";
import { sendVerificationEmail } from "../services/emailService";

// Generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, config.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const sendVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ message: "Please add all fields" });
    return;
  }

  try {
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    // Only founder and investor accounts can be self-registered. Facilitators and
    // admins are provisioned via scripts/createAdmin.ts or by an admin.
    const selfServeRoles = ["founder", "investor"];
    if (role && !selfServeRoles.includes(role)) {
      res.status(403).json({ message: "This role cannot be self-registered" });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "founder",
    });

    if (user) {
      try {
        const token = await createEmailVerificationToken(user._id.toString());
        await sendVerificationEmail(user.email, token);
      } catch (e) {
        console.error("Failed to send verification email", e);
      }
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        slug: user.slug,
        isVerified: user.isVerified,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        slug: user.slug,
        isVerified: user.isVerified,
        cohort: user.cohort,
        token: generateToken(user._id.toString()),
      });
    } else {
      res.status(400).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }

    const u = req.user;
    res.status(200).json({
      _id: u._id,
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      slug: u.slug,
      isVerified: u.isVerified,
      cohort: u.cohort,
      avatarUrl: u.avatarUrl,
      headline: u.headline,
      bio: u.bio,
      company: u.company,
      companyOneLiner: u.companyOneLiner,
      website: u.website,
      location: u.location,
      sector: u.sector,
      stage: u.stage,
      fundraising: u.fundraising,
      raiseAmount: u.raiseAmount,
      linkedin: u.linkedin,
      twitter: u.twitter,
      isProfilePublic: u.isProfilePublic !== false,
      watchlist: u.watchlist ?? [],
      createdAt: u.createdAt,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Send verification email
// @route   POST /api/auth/send-verification
// @access  Private
export const sendVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authorized" });
      return;
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (user.isVerified) {
      res.status(200).json({ message: "Already verified" });
      return;
    }
    const token = await createEmailVerificationToken(user._id.toString());
    try {
      await sendVerificationEmail(user.email, token);
      res.status(200).json({ message: "Verification email sent" });
    } catch (error) {
      console.error("Email delivery failed", error);
      res.status(502).json({ message: "Failed to send email" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Confirm verification
// @route   GET /api/auth/verify?token=...
// @access  Public
export const confirmVerification = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const token = req.query.token as string | undefined;
    if (!token) {
      res.status(400).json({ message: "Missing token" });
      return;
    }
    const result = await verifyEmailToken(token);
    // Browsers following the email link land back in the app.
    if (req.accepts(["json", "html"]) === "html") {
      res.redirect(`${config.CLIENT_URL}/login?verified=${result}`);
      return;
    }
    if (result === "ok") {
      res.status(200).json({ message: "Email verified successfully" });
    } else if (result === "expired") {
      res.status(410).json({ message: "Verification link expired" });
    } else {
      res.status(400).json({ message: "Invalid verification link" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
