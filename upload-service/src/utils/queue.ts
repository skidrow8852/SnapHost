import path from "path";
import simpleGit from "simple-git";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { prisma } from "../database/db";

// Initialize Bull Queues
const Queue = require ("bull");
const buildQueue = new Queue("build-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const redeployQueue = new Queue("redeploy-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const resultQueue = new Queue("result-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const processDeployQueue = new Queue("proccess-deploy-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const processReDeployQueue = new Queue("proccess-deploy-queue", { redis: { host: "127.0.0.1", port: 6379 } });


// Function to deploy or redeploy a project
const deployProject = async (id: string, repoUrl: string, isRedeploy = false) => {
    const outputPath = path.join(__dirname, `output/${id}`);
    try {
        // Clone repository
        console.log(`${isRedeploy ? "Redeploying" : "Deploying"} project: ${id}`);
        await simpleGit().clone(repoUrl, outputPath, { '--force': isRedeploy ? 'true' : 'false' });

        // Upload files to S3
        const files = getAllFiles(outputPath);
        for (const file of files) {
            const relativePath = file.slice(__dirname.length + 1);
            await uploadFile(relativePath, file);
        }

        console.log(`${isRedeploy ? "Redeployment" : "Deployment"} complete for project: ${id}`);
        return { status: isRedeploy ? "redeploying" : "deploying" };
    } catch (error) {
        console.error(`Error during ${isRedeploy ? "redeployment" : "deployment"} for project: ${id}`, error);
        throw error;
    }
};

// Add job processors
buildQueue.process(async (job) => {
    const { id, repoUrl, userId } = job.data;
    console.log(`Processing deployment for project: ${id}`);
    const result = await deployProject(id, repoUrl);
    await prisma.projects.create({
        data: {
            userId : userId,
            id : id,
            repoUrl : repoUrl,
            status: result.status,
        },
    });

    await processDeployQueue.add({ id, repoUrl, userId })
});

redeployQueue.process(async (job) => {
    const { id, repoUrl, userId } = job.data;
    console.log(`Processing redeployment for project: ${id}`);
    const result = await deployProject(id, repoUrl, true);
    await prisma.projects.update({
        where: { userId , id },
        data: {
            status: result?.status,
        },
    });

    await processReDeployQueue.add({ id, repoUrl, userId })
});


resultQueue.process(async (job) => {
    const { id, userId , status, screenshot} = job.data;
    console.log(`Processing redeployment for project: ${id}`);
    await prisma.projects.update({
        where: { userId , id },
        data: {
            status: status,
            screenshot : screenshot
        },
    });
});

export { buildQueue, resultQueue, redeployQueue, processDeployQueue, processReDeployQueue};