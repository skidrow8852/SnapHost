import path from "path";
import simpleGit from "simple-git";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { deleteFolder, getProjectType } from "./utils";
import {createProject, updateProject} from "../client/client"
import fs from "fs";
import { listener } from "../database/redis";
import dotenv from "dotenv";
dotenv.config();

// Initialize Bull Queues


const Queue = require ("bull");
const buildQueue = new Queue("build-queue", { redis: { host: process.env.REDIS_HOST, port: 6379 } });
const redeployQueue = new Queue("redeploy-queue", { redis: { host: process.env.REDIS_HOST, port: 6379 } });
const resultQueue = new Queue("result-queue", { redis: { host: process.env.REDIS_HOST, port: 6379 } });
const processDeployQueue = new Queue("proccess-deploy-queue", { redis: { host: process.env.REDIS_HOST, port: 6379 } });
const processReDeployQueue = new Queue("proccess-redeploy-queue", { redis: { host: process.env.REDIS_HOST, port: 6379 } });
const processRemoveProject = new Queue("proccess-remove-queue", { redis: { host: process.env.REDIS_HOST, port: 6379 } });
const io = require("../socket/socket");


// Function to deploy or redeploy a project
const deployProject = async (id: string, repoUrl: string, isRedeploy = false) => {
    const outputPath = path.join(__dirname, `output/${id}`);
    const git = simpleGit();
    try {
        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath, { recursive: true });
        }

        // Clone repository
        console.log(`${isRedeploy ? "Redeploying" : "Deploying"} project: ${id}`);
        await git.clone(repoUrl, outputPath);

        // Get latest commit details
        const commitDetails = await git.log([`${outputPath}/.git`]);
        const latestCommit = commitDetails.latest;
        const commitMessage = latestCommit?.message;
        const commitTime = new Date(latestCommit?.date).toLocaleString();
        
        // Get the current branch
        const currentBranch = await git.revparse(["--abbrev-ref", "HEAD"]);

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
        return { 
            status: isRedeploy ? "redeploying" : "deploying", 
            type: projectType,
            folderToDeploy,
            commitMessage,
            commitTime,
            currentBranch
        };
    } catch (error) {
        console.error(`Error during ${isRedeploy ? "redeployment" : "deployment"} for project: ${id}`, error);
        throw error;
    }
};

// Add job processors
buildQueue.process(async (job) => {
    const { id, repoUrl, userId , name} = job.data;
    try {
        console.log(`Processing deployment for project: ${id}`);
        const result = await deployProject(id, repoUrl);
        const type = result?.type || "unknown"
        const project = await createProject({
                userId : userId,
                projectId : id,
                repoUrl : repoUrl,
                status: result.status || "deploying",
                type,
                name,
                commit : result.commitMessage,
                branch : result.currentBranch,
                time : result.commitTime
            })
            if(project){
                await listener.del(`projects:${userId.toLowerCase()}`)
            }

        await processDeployQueue.add({ id, repoUrl, userId , type})
        deleteFolder(result.folderToDeploy);
    }
    
    catch(error){
        console.error(`Error during task processing for project: ${id}`, error);
    }
});

redeployQueue.process(async (job) => {
    const { id, repoUrl, userId} = job.data;
    try {
        
        console.log(`Processing redeployment for project: ${id}`);
        const result = await deployProject(id, repoUrl, true);
        const type = result?.type || "unknown"
        const project = await updateProject(userId,id,{
                status: result?.status,
                type
            })

            if(project){
                await listener.del(`projects:${userId.toLowerCase()}`)
            }
    
        await processReDeployQueue.add({ id, repoUrl, userId , type})
        deleteFolder(result.folderToDeploy);
        
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

    const userIds = io.getConnectedSocketIds();
    try {
        const project = await updateProject(userId,id,{
                status: 'deployed',
                screenshot: screenshot,
            })

        if(project){
                await listener.del(`projects:${userId.toLowerCase()}`)
            }

        // Emit success message to connected clients
        if (userIds[userId?.toLowerCase()]) {
            userIds[userId?.toLowerCase()]?.forEach(
              (element: string) => {
                io.getIO()
                  .to(element)
                  .emit("deploy-success", { id, screenshot });
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


export { buildQueue, resultQueue, redeployQueue, processDeployQueue, processReDeployQueue,processRemoveProject};