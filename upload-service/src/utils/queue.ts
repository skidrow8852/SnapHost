import path from "path";
import simpleGit from "simple-git";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { prisma } from "../database/db";
import { deleteFolderRecursive, getProjectType } from "./utils";
import fs from "fs";

// Initialize Bull Queues
const Queue = require ("bull");
const buildQueue = new Queue("build-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const redeployQueue = new Queue("redeploy-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const resultQueue = new Queue("result-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const processDeployQueue = new Queue("proccess-deploy-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const processReDeployQueue = new Queue("proccess-deploy-queue", { redis: { host: "127.0.0.1", port: 6379 } });
const io = require("../socket/socket");

// Function to deploy or redeploy a project
const deployProject = async (id: string, repoUrl: string, isRedeploy = false) => {
    const outputPath = path.join(__dirname, `output/${id}`);
    try {
        // Clone repository
        console.log(`${isRedeploy ? "Redeploying" : "Deploying"} project: ${id}`);
        await simpleGit().clone(repoUrl, outputPath, { '--force': isRedeploy ? 'true' : 'false' });

        // Identify the project type
        const projectType = await getProjectType(outputPath);
        console.log(`Project type identified as: ${projectType}`);

        let folderToDeploy = outputPath;

        // If it's a static project, move files into the dist folder
        if (projectType == "static") {
            const distPath = path.join(outputPath, "dist");

            // Create dist folder if it doesn't exist
            if (!fs.existsSync(distPath)) {
                fs.mkdirSync(distPath);
            }

            const files = getAllFiles(outputPath);
            files.forEach((file) => {
                const fileName = path.basename(file);
                const destPath = path.join(distPath, fileName);
                fs.renameSync(file, destPath); 
            });

            folderToDeploy = distPath; 
        }
        const filesToUpload = getAllFiles(folderToDeploy);
        for (const file of filesToUpload) {
            const relativePath = file.slice(__dirname.length + 1);
            await uploadFile(relativePath, file);
        }

        console.log(`${isRedeploy ? "Redeployment" : "Deployment"} complete for project: ${id}`);
        return { status: isRedeploy ? "redeploying" : "deploying", type: projectType , folderToDeploy};
    } catch (error) {
        console.error(`Error during ${isRedeploy ? "redeployment" : "deployment"} for project: ${id}`, error);
        throw error;
    }
};
// Add job processors
buildQueue.process(async (job) => {
    const { id, repoUrl, userId , folderToDeploy} = job.data;
    try {
        console.log(`Processing deployment for project: ${id}`);
        const result = await deployProject(id, repoUrl);
        const type = result?.type || "unknown"
        await prisma.project.create({
            data: {
                userId : userId,
                id : id,
                repoUrl : repoUrl,
                status: result.status,
                type
            },
        });

        await processDeployQueue.add({ id, repoUrl, userId , type})
        deleteFolderRecursive(folderToDeploy);
    }
    
    catch(error){
        console.error(`Error during task processing for project: ${id}`, error);
    }
});

redeployQueue.process(async (job) => {
    const { id, repoUrl, userId , folderToDeploy} = job.data;
    try {
        
        console.log(`Processing redeployment for project: ${id}`);
        const result = await deployProject(id, repoUrl, true);
        const type = result?.type || "unknown"
        await prisma.project.update({
            where: { userId , id },
            data: {
                status: result?.status,
                type
            },
        });
    
        await processReDeployQueue.add({ id, repoUrl, userId , type})
        deleteFolderRecursive(folderToDeploy);
        
    }catch(error){
        console.error(`Error during task processing for project: ${id}`, error);
    }
});


resultQueue.process(async (job) => {
    const { id, userId, screenshot } = job.data;
    console.log(`Processing result of deployment for project: ${id}`);

    if (!userId || !screenshot) {
        const errorMessage = `Missing required data: ${!userId ? 'userId' : 'screenshot'}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    let userIds = io.getConnectedSocketIds();
    try {
        await prisma.project.update({
            where: { userId, id },
            data: {
                status: 'deployed',
                screenshot: screenshot,
            },
        });

        // Emit success message to connected clients
        if (userIds[userId?.toLowerCase()]) {
            userIds[userId?.toLowerCase()]?.forEach(
              (element: string) => {
                io.getIO()
                  .to(element)
                  .emit("deploy-success", { id, status, screenshot });
              },
            );
        }

        console.log(`Project ${id} successfully deployed`);
    } catch (error) {
        // Emit failure message to connected clients if error occurs
        if (userIds[userId?.toLowerCase()]) {
            userIds[userId?.toLowerCase()]?.forEach(
              (element: string) => {
                io.getIO()
                  .to(element)
                  .emit("deploy-failed", { error });
              },
            );
        }
        console.error(`Error during task processing for project: ${id}`, error);
    }
});


export { buildQueue, resultQueue, redeployQueue, processDeployQueue, processReDeployQueue};