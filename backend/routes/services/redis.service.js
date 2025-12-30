"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        if (times > 5) {
            return null; // Stop retrying after 5 attempts
        }
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
});
redis.on('error', (err) => {
    // Suppress connection errors to avoid crashing if Redis is not running
    // The application will fallback to DB
    if (process.env.NODE_ENV !== 'production') {
        console.warn('Redis warning:', err.message);
    }
});
redis.on('connect', () => {
    console.log('Redis connected successfully');
});
exports.default = redis;
