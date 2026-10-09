"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.getSession = getSession;
exports.deleteSession = deleteSession;
const ioredis_1 = __importDefault(require("ioredis"));
const crypto_1 = __importDefault(require("crypto"));
const redis = new ioredis_1.default(process.env.REDIS_URL ?? "redis://redis:6379");
const SESSION_TTL = 60 * 60 * 24 * 30;
async function createSession(user) {
    const sessionId = crypto_1.default.randomBytes(32).toString("hex");
    await redis.set(`customer:session:${sessionId}`, JSON.stringify(user), "EX", SESSION_TTL);
    return sessionId;
}
async function getSession(sessionId) {
    const data = await redis.get(`customer:session:${sessionId}`);
    if (!data) {
        return null;
    }
    return JSON.parse(data);
}
async function deleteSession(sessionId) {
    await redis.del(`customer:session:${sessionId}`);
}
