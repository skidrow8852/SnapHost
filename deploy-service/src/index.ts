import { createClient, commandOptions } from "redis";
import { downloadS3Folder, removeSourceCodeFromS3 } from "./aws";
import { buildProject, copyFinalDist, removeSourceCode } from "./utils";
import { screenshotPage } from "./metrics";

const subscriber = createClient();
const publisher = createClient();

async function processTask(queueName: string, id: string) {
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
        await publisher.hSet("status", id, "deployed");

        // take a screenshot of the HomePage of the deployed project
        const values = await screenshotPage(`https://${id}/${process.env.HOSTNAME}/`, id )
        if(!values.error){
            // TODO -- save screenshot and update status to DB
        }
    } catch (error) {
        console.error(`[${queueName}] Error processing ID: ${id}`, error);
        await publisher.hSet("status", id, "failed");
    }
}

(async () => {
    try {
        // Connect to Redis
        await subscriber.connect();
        await publisher.connect();
        console.log("Connected to Redis");

        const queues = ["build-queue", "redeploy-queue"];

        while (true) {
            for (const queue of queues) {
                try {
                    // Wait for the next item in the queue
                    const response = await subscriber.brPop(
                        commandOptions({ isolated: true }),
                        queue,
                        0 // Block indefinitely
                    );

                    if (response && response.element) {
                        const id = response.element;
                        await processTask(queue, id);
                    }
                } catch (taskError) {
                    console.error(`[${queue}] Error fetching task:`, taskError);
                }
            }
        }
    } catch (connectionError) {
        console.error("Error connecting to Redis:", connectionError);
    } finally {
        console.log("Shutting down...");
        await subscriber.disconnect();
        await publisher.disconnect();
        console.log("Disconnected from Redis");
    }
})();

// Handle process termination signals
process.on("SIGINT", async () => {
    console.log("Received SIGINT. Exiting...");
    await subscriber.disconnect();
    await publisher.disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Received SIGTERM. Exiting...");
    await subscriber.disconnect();
    await publisher.disconnect();
    process.exit(0);
});
