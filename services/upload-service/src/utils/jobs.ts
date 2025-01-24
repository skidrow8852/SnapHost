import cron from "node-cron";
import { listener } from "../database/redis";
import { prisma } from "../client/client";

// Function to fetch and store Redis data in PostgreSQL
export async function storeProjectViews() {
  try {
    const keys = await listener.keys("pageViews:*");

    if (!keys || keys.length === 0) {
      console.log("No Redis keys found. Skipping update.");
      return;
    }

    for (const key of keys) {
      const [_, interval, projectId, date] = key.split(":");

      // Fetch view count from Redis
      const viewCount = await listener.get(key);

      // Skip if the view count is invalid or missing
      if (!viewCount || isNaN(parseInt(viewCount, 10))) {
        console.log(`Invalid or missing view count for key: ${key}. Skipping.`);
        continue;
      }

      // Calculate start and end times based on the interval
      let startTime, endTime;
      const currentDate = new Date(date);

      switch (interval) {
        case "daily":
          startTime = new Date(currentDate);
          startTime.setHours(0, 0, 0, 0);
          endTime = new Date(currentDate);
          endTime.setHours(23, 59, 59, 999);
          break;

        case "weekly":
          startTime = new Date(currentDate);
          startTime.setDate(currentDate.getDate() - currentDate.getDay());
          startTime.setHours(0, 0, 0, 0);
          endTime = new Date(startTime);
          endTime.setDate(startTime.getDate() + 6);
          endTime.setHours(23, 59, 59, 999);
          break;

        case "monthly":
          startTime = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          startTime.setHours(0, 0, 0, 0);
          endTime = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
          endTime.setHours(23, 59, 59, 999);
          break;

        case "yearly":
          startTime = new Date(currentDate.getFullYear(), 0, 1);
          startTime.setHours(0, 0, 0, 0);
          endTime = new Date(currentDate.getFullYear(), 11, 31);
          endTime.setHours(23, 59, 59, 999);
          break;

        default:
          console.error(`Unsupported interval: ${interval}`);
          continue;
      }

      // Upsert the data into the PostgreSQL table
      await prisma.projectView.upsert({
        where: {
          projectId_timeInterval_startTime: {
            projectId,
            timeInterval: interval,
            startTime,
          },
        },
        update: {
          viewCount: parseInt(viewCount, 10),
          endTime,
          updatedAt: new Date(),
        },
        create: {
          projectId,
          viewCount: parseInt(viewCount, 10),
          timeInterval: interval,
          startTime,
          endTime,
        },
      });

      console.log(`Stored project views for projectId: ${projectId}, interval: ${interval}`);
    }

    // Update the total views count in the Project table
    await updateTotalViews();
  } catch (error) {
    console.error("Error storing project views in PostgreSQL:", error);
  }
}

// Function to update the total views count in the Project table
async function updateTotalViews() {
  try {
    // Fetch all projects
    const projects = await prisma.project.findMany();

    for (const project of projects) {
      // Calculate the total views for the project
      const totalViews = await prisma.projectView.aggregate({
        where: {
          projectId: project.projectId,
        },
        _sum: {
          viewCount: true,
        },
      });

      // Only update if total views are valid and greater than 0
      if (totalViews._sum.viewCount !== null && totalViews._sum.viewCount > 0) {
        await prisma.project.update({
          where: {
            projectId: project.projectId,
          },
          data: {
            views: totalViews._sum.viewCount,
          },
        });

        console.log(`Updated total views for projectId: ${project.projectId}`);
        await listener.del(`projects:${project.userId}`)
      } else {
        console.log(`No valid views found for projectId: ${project.projectId}. Skipping update.`);
      }
    }
  } catch (error) {
    console.error("Error updating total views in the Project table:", error);
  }
}

// Schedule the cron job to run every day at midnight
cron.schedule("0 0 * * *", storeProjectViews, {
  timezone: "UTC",
});