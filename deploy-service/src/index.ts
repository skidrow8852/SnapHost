import { createClient, commandOptions } from "redis";
import { downloadS3Folder } from "./aws";
import { buildProject, copyFinalDist } from "./utils";

const subscriber = createClient();

(async () => {
    try {
        // Connect to Redis with error handling
        await subscriber.connect();
        console.log("Connected to Redis");

        while (true) {
            try {
                // Wait for the next item in the queue
                const response = await subscriber.brPop(
                    commandOptions({ isolated: true }),
                    "build-queue",
                    0 // Block indefinitely
                );

                if (response && response.element) {
                    const id = response.element;

                    // Process the ID
                    console.log(`Processing ID: ${id}`);
                    await downloadS3Folder(`output/${id}`);
                    await buildProject(id);
                    await copyFinalDist(id);
                    console.log(`Processing complete for ID: ${id}`);
                }
            } catch (taskError) {
                console.error("Error processing task:", taskError);
            }
        }
    } catch (connectionError) {
        console.error("Error connecting to Redis:", connectionError);
    } finally {
        await subscriber.disconnect();
        console.log("Disconnected from Redis");
    }
})();
