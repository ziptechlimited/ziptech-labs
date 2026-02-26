"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load .env from root of server
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../../.env") });
const getEnv = (key, defaultValue) => {
    const value = process.env[key] || defaultValue;
    if (!value) {
        throw new Error(`Missing environment variable: ${key}`);
    }
    return value;
};
exports.config = {
    PORT: parseInt(getEnv("PORT", "5001"), 10),
    MONGO_URI: getEnv("MONGO_URI"),
    JWT_SECRET: getEnv("JWT_SECRET"),
    NODE_ENV: getEnv("NODE_ENV", "development"),
    SMTP_HOST: getEnv("SMTP_HOST", "Gmail"),
    SMTP_PORT: parseInt(getEnv("SMTP_PORT", "587"), 10),
    SMTP_USER: getEnv("SMTP_USER", "your-email@gmail.com"),
    SMTP_PASS: getEnv("SMTP_PASS", "your-app-password"),
    EMAIL_FROM: getEnv("EMAIL_FROM", "no-reply@example.com"),
    APP_BASE_URL: getEnv("APP_BASE_URL", "http://localhost:5001"),
};
