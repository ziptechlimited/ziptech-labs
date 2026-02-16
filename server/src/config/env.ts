import dotenv from 'dotenv';
import path from 'path';

// Load .env from root of server
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  NODE_ENV: string;
}

const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config: Config = {
  PORT: parseInt(getEnv('PORT', '5001'), 10),
  MONGO_URI: getEnv('MONGO_URI'),
  JWT_SECRET: getEnv('JWT_SECRET', 'secret'),
  NODE_ENV: getEnv('NODE_ENV', 'development'),
};
