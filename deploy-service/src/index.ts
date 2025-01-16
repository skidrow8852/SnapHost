import { downloadS3Folder, removeSourceCodeFromS3 } from "./aws";
import { buildProject, copyFinalDist, removeSourceCode } from "./utils";
import { screenshotPage } from "./metrics";
import { resultQueue,processDeployQueue, processReDeployQueue} from "./queue"

async function processTask(queueName: string, id: string, userId: string) {
    try {
        console.log(`[${queueName}] Processing ID: ${id}`);
        
        // Download files
        await downloadS3Folder(`output/${id}`);
        
        // Build and copy final distribution
        await buildProject(id);
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
    const { id, userId } = job.data;
    console.log(`Processing deployment for project: ${id}`);
    await processTask("deploy", id,userId);
});

processReDeployQueue.process(async (job) => {
    const { id, userId } = job.data;
    console.log(`Processing redeployment for project: ${id}`);
    await processTask("redeploy", id,userId);
    
});


// Handle process termination signals
process.on("SIGINT", async () => {
    console.log("Received SIGINT. Exiting...");
    await resultQueue.close();
    await processDeployQueue.close();
    await processReDeployQueue.close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Received SIGTERM. Exiting...");
     await resultQueue.close();
    await processDeployQueue.close();
    await processReDeployQueue.close();
    process.exit(0);
});
