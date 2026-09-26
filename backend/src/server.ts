import Fastify from "fastify";
import { Pool } from "pg";
import Redis from "ioredis";
import { Queue } from "bullmq";

const app = Fastify({
  logger: true,
});

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redis = new Redis(
  process.env.REDIS_URL ?? "redis://redis:6379"
);

app.get("/health", async () => {
  return {
    status: "ok",
    service: "backend",
  };
});

app.get("/health/database", async () => {
  const result = await db.query("SELECT NOW() AS now");

  return {
    status: "ok",
    database: "postgresql",
    time: result.rows[0].now,
  };
});

app.get("/health/redis", async () => {
  const result = await redis.ping();

  return {
    status: result === "PONG" ? "ok" : "error",
    redis: result,
  };
});
const backgroundQueue = new Queue(
  "background",
  {
    connection: redis,
  }
);
app.post("/dev/test-job", async () => {
  const job = await backgroundQueue.add(
    "test",
    {
      message: "Queue connection works",
      createdAt: new Date().toISOString(),
    }
  );

  return {
    status: "queued",
    jobId: job.id,
  };
});
const port = Number(process.env.PORT ?? 4000);

app.listen({
  port,
  host: "0.0.0.0",
}).catch((error) => {
  app.log.error(error);
  process.exit(1);
});