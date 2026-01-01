
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

async function clearCache() {
  const keys = await redis.keys('student:profile:*');
  if (keys.length > 0) {
    console.log('Deleting keys:', keys);
    await redis.del(...keys);
  } else {
    console.log('No student profile keys found.');
  }
  process.exit(0);
}

clearCache();
