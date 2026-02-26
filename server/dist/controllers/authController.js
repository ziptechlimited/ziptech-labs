"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmVerification = exports.sendVerification = exports.getMe = exports.loginUser = exports.registerUser = exports.sendVerificationLimiter = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const env_1 = require("../config/env");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const verificationService_1 = require("../services/verificationService");
const emailService_1 = require("../services/emailService");
// Generate JWT
const generateToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, env_1.config.JWT_SECRET, {
        expiresIn: "30d",
    });
};
exports.sendVerificationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
});
// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ message: "Please add all fields" });
        return;
    }
    try {
        // Check if user exists
        const userExists = yield User_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        // Create user
        const user = yield User_1.default.create({
            name,
            email,
            password,
            role, // Optional, User model handles default.
        });
        if (user) {
            try {
                const token = yield (0, verificationService_1.createEmailVerificationToken)(user._id.toString());
                yield (0, emailService_1.sendVerificationEmail)(user.email, token);
            }
            catch (e) {
                console.error("Failed to send verification email", e);
            }
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id.toString()),
            });
        }
        else {
            res.status(400).json({ message: "Invalid user data" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.registerUser = registerUser;
// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Check for user email
        const user = yield User_1.default.findOne({ email });
        if (user && (yield user.matchPassword(password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                token: generateToken(user._id.toString()),
            });
        }
        else {
            res.status(400).json({ message: "Invalid credentials" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.loginUser = loginUser;
// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        res.status(200).json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            isVerified: req.user.isVerified,
            cohort: req.user.cohort,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.getMe = getMe;
// @desc    Send verification email
// @route   POST /api/auth/send-verification
// @access  Private
const sendVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        const user = yield User_1.default.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (user.isVerified) {
            res.status(200).json({ message: "Already verified" });
            return;
        }
        const token = yield (0, verificationService_1.createEmailVerificationToken)(user._id.toString());
        try {
            yield (0, emailService_1.sendVerificationEmail)(user.email, token);
            res.status(200).json({ message: "Verification email sent" });
        }
        catch (error) {
            console.error("Email delivery failed", error);
            res.status(502).json({ message: "Failed to send email" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.sendVerification = sendVerification;
// @desc    Confirm verification
// @route   GET /api/auth/verify?token=...
// @access  Public
const confirmVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.query.token;
        if (!token) {
            res.status(400).json({ message: "Missing token" });
            return;
        }
        const result = yield (0, verificationService_1.verifyEmailToken)(token);
        if (result === "ok") {
            res.status(200).json({ message: "Email verified successfully" });
        }
        else if (result === "expired") {
            res.status(410).json({ message: "Verification link expired" });
        }
        else {
            res.status(400).json({ message: "Invalid verification link" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});
exports.confirmVerification = confirmVerification;
