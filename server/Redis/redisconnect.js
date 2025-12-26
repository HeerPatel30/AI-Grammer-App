// redisClient.js
import redis from "redis";

const client = redis.createClient({
  url: process.env.UPSTASH_REDIS_REST_URL,
  socket: { tls: true }
});

client.on("error", (err) => console.error("Redis Client Error", err));

async function connectRedis() {
  if (!client.isOpen) {
    await client.connect();
    console.log("✅ Redis connected to Upstash via node-redis!");
  }
}

export { connectRedis, client };
