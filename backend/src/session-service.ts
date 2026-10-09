import Redis from "ioredis";
import crypto from "crypto";

type SessionUser = {
  userId: string;
  role: string;
  name: string | null;
  email: string;
  picture: string | null;
};

const redis = new Redis(
  process.env.REDIS_URL ?? "redis://redis:6379"
);

const SESSION_TTL = 60 * 60 * 24 * 30;

export async function createSession(
  user: SessionUser
) {
  const sessionId =
    crypto.randomBytes(32).toString("hex");

  await redis.set(
    `customer:session:${sessionId}`,
    JSON.stringify(user),
    "EX",
    SESSION_TTL
  );

  return sessionId;
}

export async function getSession(
  sessionId: string
) {
  const data = await redis.get(
    `customer:session:${sessionId}`
  );

  if (!data) {
    return null;
  }

  return JSON.parse(data) as SessionUser;
}

export async function deleteSession(
  sessionId: string
) {
  await redis.del(
    `customer:session:${sessionId}`
  );
}