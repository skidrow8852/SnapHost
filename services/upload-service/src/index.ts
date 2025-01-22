import cors from "cors";
import { generate } from "./utils/utils";
import { revokeToken, verifyUserAccessToken } from "./utils/verifyToken";
import { buildQueue, resultQueue, redeployQueue, processDeployQueue, processReDeployQueue, processRemoveProject} from "./utils/queue";
import { prisma } from "./client/client"; 
import { getUserProjects } from "./client/client";
import IoRedisClient from "ioredis";
const { listener } = require("./database/redis");
const express = require("express");
const compression = require("compression")
const setRateLimit = require("express-rate-limit");
const rateLimiRedisClient = new IoRedisClient();
const hpp = require("hpp");
const helmet = require("helmet");

import { RedisStore as RateLimitStore } from "rate-limit-redis";
import dotenv from "dotenv";
dotenv.config();


////// ************************ Server Config **********************************
const app = express();
app.use(
    cors({
    origin: `${process.env.URL_FRONTEND_ACCESS}`,
    methods: "GET,POST,PUT,DELETE"
  }),
);
app.use(express.json());

/// compress request data
app.use(compression({ level: 6, threshold: 0 }));


app.disable("x-powered-by");


const rateLimitMiddleware = setRateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: "You have exceeded your 60 requests per minute limit.",
  legacyHeaders: false,
  store: new RateLimitStore({
    // @ts-expect-error - Known issue: the `call` function is not present in @types/ioredis
    sendCommand: (...args: string[]) => rateLimiRedisClient.call(...args),
  }),
});
app.use(rateLimitMiddleware)

// to protect against HTTP Parameter Pollution attacks
app.use(hpp());


// Headers Security with Helmet
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [
        "'self'",
      ],
      scriptSrc: [
        "'self'",
      ],
      styleSrc: [
        "'self'",
      ],
      imgSrc: [
        "'self'",
      ],
      connectSrc: [
        "'self'",
        `${process.env.URL_FRONTEND_ACCESS}`
      ],
      objectSrc: [
        "'self'",
      ],
      frameSrc: [
        "'self'"
      ],
      formAction: [
        "'self'"
      ],
      fontSrc: [
        "'self'"
      ],
      frameAncestors: [
       "'self'"
      ],
    },
  }),
);

// Prevent browsers from inferring the MIME type, reducing risk of drive-by downloads
app.use(helmet.noSniff());

// Prevent Internet Explorer from executing downloads in the site’s context
app.use(helmet.ieNoOpen());

// Enforce HTTP Strict Transport Security (HSTS) to force HTTPS connections
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));

// Set a Referrer-Policy header to limit referrer information sent to other sites
app.use(helmet.referrerPolicy({ policy: "same-origin" }));

// Enable basic XSS protection in the browser by setting the X-XSS-Protection header
app.use(helmet.xssFilter());


// Connect to Redis 
(async () => {
    try {
        await listener.connect();
        console.log("Connected to Redis");
    } catch (connectionError) {
        console.error("Error connecting to Redis:", connectionError);
    }
})();

////// ************************ Routes **********************************

// Deploy a project
app.post("/api/deploy",verifyUserAccessToken, async (req, res) => {
    try {
        const { repoUrl, userId, name } = req.body;

        if (!repoUrl || !userId || !name) {
            return res.status(400).json({ error: "repoUrl, userId, and name are required" });
        }

        if (userId?.toLowerCase() !== req.payload?.id?.toLowerCase()) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Check if a project with the same repoUrl already exists for the user
        const existingRepoProject = await prisma.project.findUnique({
            where: {
                userId_repoUrl: { 
                    userId: userId,
                    repoUrl: repoUrl
                }
            }
        });

        if (existingRepoProject) {
            return res.status(200).json({ error: "Project with this repoUrl already exists" });
        }

        // Check if a project with the same name already exists for the user
        const existingNameProject = await prisma.project.findFirst({
            where: {
                userId: userId,
                name: name
            }
        });

        if (existingNameProject) {
            return res.status(200).json({ error: "Project with this name already exists" });
        }

        const projectId = generate();

        // Add deployment job to Bull queue
        await buildQueue.add({ id: projectId, repoUrl, userId, name });

        console.log(`Project ${projectId} added to the build queue for user ${userId}`);
        res.json({ id: projectId });
    } catch (error) {
        console.error("Error deploying project:", error);
        res.status(500).json({ error: "Failed to deploy project" });
    }
});


// Redeploy a project
app.post("/api/redeploy", verifyUserAccessToken, async (req, res) => {
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
app.get("/api/projects/:userId", verifyUserAccessToken, async (req, res) => {
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
app.delete("/api/remove/user/:userId/project/:id", verifyUserAccessToken, async (req, res) => {
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
app.post("/api/revoke", verifyUserAccessToken, async (req, res) => {
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


////// ************************ Server config **********************************
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
