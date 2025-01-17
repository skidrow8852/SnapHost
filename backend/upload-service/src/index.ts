import cors from "cors";
import { generate } from "./utils/utils";
import { revokeToken, verifyUserAccessToken } from "./utils/verifyToken";
import { buildQueue, resultQueue, redeployQueue, processDeployQueue, processReDeployQueue, processRemoveProject} from "./utils/queue";
import { prisma } from "./client/client"; 
import { getUserProjects } from "./client/client";
const { listener } = require("./database/redis");
const express = require("express");
import dotenv from "dotenv";
dotenv.config();

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
app.post("/deploy", async (req, res) => {
    try {
        const { repoUrl, userId } = req.body;
        if (!repoUrl || !userId) {
            return res.status(400).json({ error: "repoUrl and userId are required" });
        }

         if (userId?.toLowerCase() !== req.payload?.id?.toLowerCase()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const project = await prisma.project.findUnique({
                where: {
                    userId_repoUrl: { 
                        userId: userId,
                        repoUrl: repoUrl
                    }
                }
            });


        if (project) {
            return res.status(200).json({ error: "Project already exists" });
        }
        


       
        const projectId = generate();

        // Add deployment job to Bull queue
        await buildQueue.add({ id : projectId, repoUrl, userId });

        console.log(`Project ${projectId} added to the build queue for user ${userId}`);
        res.json({ id : projectId });
    } catch (error) {
        console.error("Error deploying project:", error);
        res.status(500).json({ error: "Failed to deploy project" });
    }
});

// Redeploy a project
app.post("/redeploy", verifyUserAccessToken, async (req, res) => {
    try {
        const { userId, id } = req.body;

        if (userId?.toLowerCase() !== req.payload?.id?.toLowerCase()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if the project exists
        const project = await prisma.project.findUnique({
            where: { userId: userId , id : id},
        });
        if (!project) {
            return res.status(400).json({ error: "Project does not exist. Use /deploy instead." });
        }


        // Add redeployment job to Bull queue
        await redeployQueue.add({ id : project.projectId, repoUrl : project.repoUrl, userId, type : project.type });
        res.json({ id, status: "redeploying" });
    } catch (error) {
        console.error("Error redeploying project:", error);
        res.status(500).json({ error: "Failed to redeploy project" });
    }
});

// Get all user projects
app.get("/projects/:userId", verifyUserAccessToken, async (req, res) => {
    try {
        if (req.params?.userId?.toLowerCase() !== req.payload?.id?.toLowerCase()) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        const key = `projects:${req.params?.userId?.toLowerCase()}`
        const value = await listener.get(key);
            if (value) {
                const data = JSON.parse(value);
                return res.send({result : data});
            }

        const projects = await getUserProjects(req.params?.userId)

        const projectsWithViewCount = await Promise.all(
            projects?.map(async (project) => {
                const redisKey = `pageViews:${project.id}`;
                const viewCount = await listener.get(redisKey); 

                // Convert the view count to a number
                const views = viewCount ? parseInt(viewCount, 10) : 0;

                return { ...project, view: views };
            }) || []
        );
        
        await listener.set(key, JSON.stringify(projectsWithViewCount))
        res.send({ result: projectsWithViewCount });
    } catch (error) {
        console.error("Error fetching project status:", error);
        res.status(500).json({ error: "Failed to fetch project status" });
    }
});


// delete a project
app.delete("/remove/user/:userId/project/:id", verifyUserAccessToken, async (req, res) => {
    try {
        if (req.params?.userId?.toLowerCase() !== req.payload?.id?.toLowerCase()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const project = await prisma.project.findUnique({
            where: { userId: req.params?.userId , id : req.params?.id},
        });

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        await prisma.project.delete({
            where: { id: req.params?.id },
        });

        const redisKey = `pageViews:${project.projectId}`;
        res.status(200).json({ result: "Project deleted successfully" });
        await listener.del(redisKey);
        await processRemoveProject.add({id : project.projectId})

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

const shutdown = async () => {
    console.log("Shutting down...");
    await listener.disconnect();
    await buildQueue.close();
    await redeployQueue.close();
    await resultQueue.close();
    await processDeployQueue.close();
    await processReDeployQueue.close();
    await processRemoveProject.close();
    process.exit(0);

}

const server = require("http").createServer(app);

// Initializing the Socket
require("./socket/socket").init(server);

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);


const PORT = process.env.PORT || 5000;
// Start the server
server.listen(PORT, () => {
  console.log("server is listening");
});
