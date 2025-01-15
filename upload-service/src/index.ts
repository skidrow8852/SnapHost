import express , {Request, Response} from "express";
import cors from "cors";
import simpleGit from "simple-git";
import path from "path";
import { generate } from "./utils";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { createClient } from "redis";

const publisher = createClient();
const subscriber = createClient();

(async () => {
    await publisher.connect();
    await subscriber.connect();
    console.log("Connected to Redis");
})();

const app = express();
app.use(cors());
app.use(express.json());

// Function to deploy or redeploy a project
const deployProject = async (id: string, repoUrl: string, isRedeploy = false) => {
    const outputPath = path.join(__dirname, `output/${id}`);

    try {
        // Clone repository (overwrite if redeploying)
        console.log(`${isRedeploy ? "Redeploying" : "Deploying"} project: ${id}`);
        await simpleGit().clone(repoUrl, outputPath, { "--force": isRedeploy });

        // Upload files to S3
        const files = getAllFiles(outputPath);
        for (const file of files) {
            const relativePath = file.slice(__dirname.length + 1);
            await uploadFile(relativePath, file);
        }

        console.log(`${isRedeploy ? "Redeployment" : "Deployment"} complete for project: ${id}`);
        const statusKey = isRedeploy ? "redeploy-status" : "status";
        await publisher.hSet(statusKey, id, isRedeploy ? "redeployed" : "deployed");
    } catch (error) {
        console.error(`Error during ${isRedeploy ? "redeployment" : "deployment"} for project: ${id}`, error);
    }
};


// Deploy a project
app.post("/deploy", async (req : Request, res : Response) => {
    try {
        const { repoUrl, userId } = req.body;

        if (!repoUrl || !userId) {
            return res.status(400).json({ error: "repoUrl and userId are required" });
        }
        // Generate a unique project ID
        const id = generate();

        // Deploy the project (your custom deployment logic)
        await deployProject(id, repoUrl);

        // Add the project ID to the build queue
        await publisher.lPush("build-queue", id);

        // Retrieve existing projects for the user
        const existingProjects = JSON.parse(
            (await subscriber.hGet("user-projects", userId)) || "[]"
        );
        // Add the new project ID to the user's project list
        const updatedProjects = [...existingProjects, id];
        await subscriber.hSet("user-projects", userId, JSON.stringify(updatedProjects));

        console.log(`Project ${id} deployed for user ${userId}`);

        // Return the project ID
        res.json({ id });
    } catch (error) {
        console.error("Error deploying project:", error);
        res.status(500).json({ error: "Failed to deploy project" });
    }
});


// Get the status of a project deployment
app.get("/status/:id", async (req : Request, res : Response) => {
    try {
        const id = req.params.id as string;
        const status = await subscriber.hGet("status", id) || await subscriber.hGet("redeploy-status", id);
        res.json({ id, status });
    } catch (error) {
        console.error("Error fetching status:", error);
        res.status(500).json({ error: "Failed to fetch status" });
    }
});

// Redeploy an existing project
app.post("/redeploy", async (req : Request, res : Response) => {
    try {
        const id = req.body.id;
        const repoUrl = req.body.repoUrl;
        const outputPath = path.join(__dirname, `output/${id}`);

        // Check if the project exists before redeploying
        if (!getAllFiles(outputPath)?.length) {
            return res.status(400).json({ error: "Project does not exist. Use /deploy instead." });
        }

        await deployProject(id, repoUrl, true);
        await publisher.lPush("redeploy-queue", id);
        res.json({ id, status: "redeploying" });
    } catch (error) {
        console.error("Error redeploying project:", error);
        res.status(500).json({ error: "Failed to redeploy project" });
    }
});

// Get all deployed projects for a user (TODO: Add user identification logic)
app.get("/projects/:userId", async (req : Request, res : Response) => {
    try {
        const userId = req.params.userId;

        // Get all project IDs for the user
        const projectIds = await subscriber.hGet("user-projects", userId);

        if (!projectIds) {
            return res.status(200).json({ message: "No projects found for this user" });
        }

        const projectIdsArray = JSON.parse(projectIds);

        // Fetch deployment statuses for the user's projects
        const projects = await Promise.all(
            projectIdsArray.map(async (projectId: string) => {
                const status = await subscriber.hGet("status", projectId);
                const redeployStatus = await subscriber.hGet("redeploy-status", projectId);
                return {
                    projectId,
                    status: status || redeployStatus || "unknown",
                };
            })
        );

        res.json({ projects });
    } catch (error) {
        console.error("Error fetching user projects:", error);
        res.status(500).json({ error: "Failed to fetch user projects" });
    }
});


// Start the server
app.listen(5000, () => {
    console.log("Server is running on http://localhost:5000");
});
