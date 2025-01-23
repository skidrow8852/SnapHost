import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import simpleGit from "simple-git";

import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { deleteFolder, getProjectType } from "./utils";
import { createProject, updateProject } from "../client/client";
import { listener } from "../database/redis";

dotenv.config();
const Queue = require ("bull");
const io = require("../socket/socket");
// Redis configuration
const REDIS_CONFIG = { host: process.env.REDIS_HOST, port: 6379 };

// Queue initialization
const buildQueue = new Queue("build-queue", { redis: REDIS_CONFIG });
const redeployQueue = new Queue("redeploy-queue", { redis: REDIS_CONFIG });
const resultQueue = new Queue("result-queue", { redis: REDIS_CONFIG });
const processDeployQueue = new Queue("process-deploy-queue", { redis: REDIS_CONFIG });
const processReDeployQueue = new Queue("process-redeploy-queue", { redis: REDIS_CONFIG });
const processRemoveProject = new Queue("process-remove-queue", { redis: REDIS_CONFIG });

// Constants
const OUTPUT_DIR = path.join(__dirname, "output");

// Notify user utility function
const notifyUser = (type: string, userId: string, message: Record<string, any>) => {
    const userIds = io.getConnectedSocketIds();
    const sockets = userIds[userId.toLowerCase()] || [];
    sockets.forEach((socketId: string) => io.getIO().to(socketId).emit(type, message));
};

interface GitCommit {
    hash: string;
    date: string;
    message: string;
    author_name: string;
    author_email: string;
}

// Deploy/redeploy project logic
const deployProject = async (
    id: string,
    repoUrl: string,
    userId: string,
    isRedeploy = false,
): Promise<{
    status: string;
    type: string;
    folderToDeploy: string;
    commitMessage: string;
    commitTime: string;
    currentBranch: string;
}> => {
    const outputPath = path.join(OUTPUT_DIR, id);
    const git = simpleGit();

    try {
        // Ensure output directory exists
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        console.log(`${isRedeploy ? "Redeploying" : "Deploying"} project: ${id}`);

        // Clone repository
        await git.clone(repoUrl, outputPath);

        // Get latest commit details
        const commitDetails = await git.log([`${outputPath}/.git`]);
        const latestCommit = commitDetails?.latest as GitCommit;
        const commitMessage = latestCommit?.message || "No commit message";
        const commitTime = new Date(latestCommit?.date).toLocaleString();
        const currentBranch = await git.revparse(["--abbrev-ref", "HEAD"]);

        // Identify project type
        const projectType = await getProjectType(outputPath);
        console.log(`Project type identified: ${projectType}`);

        let folderToDeploy = outputPath;

        // Handle static project
        if (projectType === "static") {
            const distPath = path.join(outputPath, "dist");
            fs.mkdirSync(distPath, { recursive: true });

            const files = getAllFiles(outputPath);
            files.forEach((file) => {
                const destPath = path.join(distPath, path.basename(file));
                fs.renameSync(file, destPath);
            });

            folderToDeploy = distPath;
        }

        if (projectType !== "react" && projectType !== "static") {
            notifyUser("type-not-supported", userId, {
                id,
                message: `Project type ${projectType} not supported. ${isRedeploy ? "Redeployment" : "Deployment"} failed.`,
            });
            deleteFolder(outputPath);
            throw new Error("Project type 'Unknown'");
        }

        // Upload files
        const filesToUpload = getAllFiles(folderToDeploy);
        for (const file of filesToUpload) {
            const relativePath = file.slice(__dirname.length + 1);
            await uploadFile(relativePath, file);
        }

        console.log(`${isRedeploy ? "Redeployment" : "Deployment"} completed for project: ${id}`);
        return { status: isRedeploy ? "redeploying" : "deploying", type: projectType, folderToDeploy, commitMessage, commitTime, currentBranch };

    } catch (error) {
        console.error(`Error during ${isRedeploy ? "redeployment" : "deployment"}: ${id}`, error);
        throw error;
    }
};

// Job processors
buildQueue.process(async (job) => {
        const { id, repoUrl, userId, name } = job.data;
        try {
            console.log(`Processing deployment for project: ${id}`);
            const result = await deployProject(id, repoUrl, userId);
            const project = await createProject({
                userId,
                projectId: id,
                repoUrl,
                status: result.status,
                type: result.type,
                name,
                commit: result.commitMessage,
                branch: result.currentBranch,
                time: result.commitTime,
            });

            if (project) await listener.del(`projects:${userId.toLowerCase()}`);
            await processDeployQueue.add({ id, repoUrl, userId, type: result.type });
            deleteFolder(result.folderToDeploy);
        } catch (error) {
            console.error(`Error processing deployment for project: ${id}`, error);
        }
    });

redeployQueue.process(async (job) => {
        const { id, repoUrl, userId } = job.data;
        try {
            console.log(`Processing redeployment for project: ${id}`);
            const result = await deployProject(id, repoUrl, userId, true);
            const project = await updateProject(userId, id, {
                status: result.status,
                type: result.type,
            });

            if (project) await listener.del(`projects:${userId.toLowerCase()}`);
            await processReDeployQueue.add({ id, repoUrl, userId, type: result.type });
            deleteFolder(result.folderToDeploy);
        } catch (error) {
            console.error(`Error processing redeployment for project: ${id}`, error);
        }
    });

resultQueue.process(async (job) => {
        const { id, userId, screenshot } = job.data;
        if (!userId || !screenshot) {
            const missingField = !userId ? "userId" : "screenshot";
            console.error(`Missing required field: ${missingField}`);
            throw new Error(`Missing required field: ${missingField}`);
        }

        try {
            console.log(`Processing deployment result for project: ${id}`);
            const project = await updateProject(userId, id, { status: "deployed", screenshot });
            if (project) {
                notifyUser("deploy-success", userId, { id, screenshot });
                await listener.del(`projects:${userId.toLowerCase()}`);
            }
        } catch (error) {
            notifyUser("deploy-failed", userId, { id, error });
            console.error(`Error processing result for project: ${id}`, error);
        }
    });


export { buildQueue, resultQueue, redeployQueue, processDeployQueue, processReDeployQueue, processRemoveProject };
