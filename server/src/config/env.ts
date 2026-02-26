import dotenv from "dotenv";
import path from "path";

// Load .env from root of server
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

interface Config {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  NODE_ENV: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  EMAIL_FROM: string;
  APP_BASE_URL: string;
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config: Config = {
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
