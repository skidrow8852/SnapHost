import cors from "cors";
import path from "path";
import { generate } from "./utils/utils";
import { getAllFiles } from "./utils/file";
import { revokeToken, verifyUserAccessToken } from "./utils/verifyToken";
import { buildQueue, resultQueue, redeployQueue, processDeployQueue, processReDeployQueue} from "./utils/queue";
import { prisma } from "./database/db";
const { listener } = require("./database/redis");
const express = require("express");

const app = express();
app.use(cors());
app.use(express.json());

(async () => {
    try {
        await listener.connect();
        console.log("Connected to Redis");
    } catch (connectionError) {
        console.error("Error connecting to Redis:", connectionError);
    }
})();

// Deploy a project
app.post("/deploy", verifyUserAccessToken, async (req, res) => {
    try {
        const { repoUrl, userId } = req.body;
        if (!repoUrl || !userId) {
            return res.status(400).json({ error: "repoUrl and userId are required" });
        }

        if (userId?.toLowerCase() !== req.payload?.id?.toLowerCase()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Generate a unique project ID
        const id = generate();

        // Add deployment job to Bull queue
        await buildQueue.add({ id, repoUrl, userId });

        console.log(`Project ${id} added to the build queue for user ${userId}`);
        res.json({ id });
    } catch (error) {
        console.error("Error deploying project:", error);
        res.status(500).json({ error: "Failed to deploy project" });
    }
});

// Redeploy a project
app.post("/redeploy", verifyUserAccessToken, async (req, res) => {
    try {
        const { userId, id, repoUrl } = req.body;

        if (userId?.toLowerCase() !== req.payload?.id?.toLowerCase()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if the project exists locally
        const outputPath = path.join(__dirname, `output/${id}`);
        const files = getAllFiles(outputPath);
        if (!files || files.length === 0) {
            return res.status(400).json({ error: "Project does not exist. Use /deploy instead." });
        }

        // Add redeployment job to Bull queue
        await redeployQueue.add({ id, repoUrl, userId });
        res.json({ id, status: "redeploying" });
    } catch (error) {
        console.error("Error redeploying project:", error);
        res.status(500).json({ error: "Failed to redeploy project" });
    }
});

// Get all user projects
app.get("/status/:userId", verifyUserAccessToken, async (req, res) => {
    try {
        if (req.params?.userId?.toLowerCase() !== req.payload?.id?.toLowerCase()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const status = await prisma.users.findUnique({
            where: { userId: req.params?.userId },
            include: {
                projects: true,
            },
        });

        res.send({ result: status?.projects });
    } catch (error) {
        console.error("Error fetching project status:", error);
        res.status(500).json({ error: "Failed to fetch project status" });
    }
});

// Revoke token
app.post("/revoke", verifyUserAccessToken, async (req, res) => {
    try {
        const { userId } = req.body;

        if (userId?.toLowerCase() !== req.payload?.id?.toLowerCase() || !req.payload?.jti) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        await revokeToken(req.payload?.jti);
        res.status(200).json({ status: "success" });
    } catch (error) {
        console.error("Error revoking token:", error);
        res.status(500).json({ error: "Failed to revoke token" });
    }
});

process.on("SIGINT", async () => {
    console.log("Shutting down...");
    await listener.disconnect();
    await buildQueue.close();
    await redeployQueue.close();
    await resultQueue.close();
    await processDeployQueue.close();
    await processReDeployQueue.close();
    process.exit(0);
});

// Start the server
app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
