import { createClient } from "redis";

const url = process.env.REDIS_URL || 'redis://localhost:6379';
export const listener = createClient({ url });
