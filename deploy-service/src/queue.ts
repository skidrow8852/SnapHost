// Initialize Bull Queues
const Queue = require ("bull");
const processDeployQueue = new Queue("proccess-deploy-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const processReDeployQueue = new Queue("proccess-deploy-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const resultQueue = new Queue("result-queue", { redis: { host: "127.0.0.1", port: 6379 } });

export { resultQueue,processDeployQueue, processReDeployQueue};