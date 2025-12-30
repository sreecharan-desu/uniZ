import Redis from 'ioredis';
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
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

export default redis;
