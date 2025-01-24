import { downloadS3Folder, removeProjectFolderFromS3, removeSourceCodeFromS3 } from "./aws";
import { buildProject, copyFinalDist, removeSourceCode } from "./utils";
import { screenshotPage } from "./metrics";
import { resultQueue,processDeployQueue, processReDeployQueue, processRemoveProject} from "./queue"

async function processTask(queueName: string, id: string, userId: string, type: string) {
    try {
        console.log(`[${queueName}] Processing ID: ${id}`);

        // Download files from S3
        await downloadS3Folder(`output/${id}`);

        // Build and copy final distribution
        if (type === 'react') {
            await buildProject(id);
        }
        await copyFinalDist(id);

        // Remove source code after build from local machine
        await removeSourceCode(id);

        console.log(`[${queueName}] Processing complete for ID: ${id}`);

        // Take a screenshot of the HomePage of the deployed project
        const values = await screenshotPage(`https://${id}.${process.env.HOSTNAME}/`, id);
        if (!values.error) {
            const result = {
                status: values.status,
                screenshot: values.screenshot,
            };
            await resultQueue.add({ id, userId, screenshot: result.screenshot, status: result.status });
        }
    } catch (error) {
        console.error(`[${queueName}] Error processing ID: ${id}`, error);
        throw error;
    }
}

processDeployQueue.process(async (job) => {
    const { id, userId, type } = job.data;
    console.log(`Processing deployment for project: ${id}`);
    await processTask("deploy", id, userId, type);
});

processReDeployQueue.process(async (job) => {
    const { id, userId, type } = job.data;
    console.log(`Processing redeployment for project: ${id}`);
    await processTask("redeploy", id, userId, type);
});

processRemoveProject.process(async (job) => {
    const { id } = job.data;
    console.log(`Processing removal for project folder: ${id}`);
    try {
        await removeProjectFolderFromS3(id);
    } catch (error) {
        console.error(`Error removing project folder ${id} from S3:`, error);
        throw error; 
    }
});

const shutdown = async () => {
    console.log("Received shutdown. Exiting...");
    try {
        await resultQueue.close();
        await processDeployQueue.close();
        await processReDeployQueue.close();
        await processRemoveProject.close();
        console.log("All queues closed. Exiting process.");
        process.exit(0);
    } catch (error) {
        console.error("Error during shutdown:", error);
        process.exit(1);
    }
};

// Handle process termination signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);