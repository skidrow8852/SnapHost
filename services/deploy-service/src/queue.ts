import dotenv from "dotenv";
dotenv.config();

// Initialize Bull Queues

const Queue = require ("bull");
const processDeployQueue = new Queue("proccess-deploy-queue", { redis: { host: process.env.REDIS_HOST, port: 6379 } });
const processReDeployQueue = new Queue("proccess-redeploy-queue", { redis: { host: process.env.REDIS_HOST, port: 6379 } });
const resultQueue = new Queue("result-queue", { redis: { host: process.env.REDIS_HOST, port: 6379 } });
const processRemoveProject = new Queue("proccess-remove-queue", { redis: { host: process.env.REDIS_HOST, port: 6379 } });

export { resultQueue,processDeployQueue, processReDeployQueue, processRemoveProject};