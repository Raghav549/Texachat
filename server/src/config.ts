// TEXA Server Environment Configuration
import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  database: {
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/texa",
  },

  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "texa-jwt-secret-dev",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || "",
    authToken: process.env.TWILIO_AUTH_TOKEN || "",
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || "",
    verifyServiceSid: process.env.TWILIO_VERIFY_SERVICE_SID || "",
  },

  encryption: {
    masterKey: process.env.ENCRYPTION_MASTER_KEY || "texa-master-key-32-bytes-secure!!",
  },
};
