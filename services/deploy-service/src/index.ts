import { downloadS3Folder, removeProjectFolderFromS3, removeSourceCodeFromS3 } from "./aws";
import { buildProject, copyFinalDist, removeSourceCode } from "./utils";
import { screenshotPage } from "./metrics";
import { resultQueue,processDeployQueue, processReDeployQueue, processRemoveProject} from "./queue"

async function processTask(queueName: string, id: string, userId: string, type : string) {
    try {
        console.log(`[${queueName}] Processing ID: ${id}`);
        
        // Download files
        await downloadS3Folder(`output/${id}`);
        
        // Build and copy final distribution
        if(type == 'react'){
            await buildProject(id);
        }
        await copyFinalDist(id);

         // Remove source code after build from machine
        await removeSourceCode(id);

        // Remove source code after build from S3 (except dist or build folders)
        await removeSourceCodeFromS3(id);
        
        console.log(`[${queueName}] Processing complete for ID: ${id}`);

        // take a screenshot of the HomePage of the deployed project
        const values = await screenshotPage(`https://${id}/${process.env.HOSTNAME}/`, id )
        if(!values.error){
            const result = {
                status : values.status,
                screenshot : values.screenshot
            }
            await resultQueue.add({ id, userId , screenshot : result.screenshot, status : result.status})
        }
    } catch (error) {
        console.error(`[${queueName}] Error processing ID: ${id}`, error);
    }
}

processDeployQueue.process(async (job) => {
    const { id, userId , type} = job.data;
    console.log(`Processing deployment for project: ${id}`);
    await processTask("deploy", id,userId,type);
});

processReDeployQueue.process(async (job) => {
    const { id, userId , type} = job.data;
    console.log(`Processing redeployment for project: ${id}`);
    await processTask("redeploy", id,userId,type);
    
});

processRemoveProject.process(async (job) => {
    const { id } = job.data;
    console.log(`Processing removale for project folder: ${id}`);
    await removeProjectFolderFromS3(id)
    
});

const shutdown = async () => {
    console.log("Received shutdown. Exiting...");
    await resultQueue.close();
    await processDeployQueue.close();
    await processReDeployQueue.close();
    await processRemoveProject.close();
    process.exit(0);
}

// Handle process termination signals
process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);
