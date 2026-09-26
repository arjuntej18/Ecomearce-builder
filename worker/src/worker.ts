import { Worker } from "bullmq";
import IORedis from "ioredis";

const redisUrl =
  process.env.REDIS_URL ?? "redis://redis:6379";

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "background",
  async (job) => {
    console.log(
      `Processing job: ${job.id} (${job.name})`
    );

    console.log("Job data:", job.data);

    return {
      status: "completed",
    };
  },
  {
    connection,
  }
);

worker.on("ready", () => {
  console.log("Worker connected to Redis");
});

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(
    `Job failed: ${job?.id}`,
    error
  );
});

process.on("SIGTERM", async () => {
  await worker.close();
  await connection.quit();
  process.exit(0);
});