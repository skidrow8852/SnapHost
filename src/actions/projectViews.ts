/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
"use server";
import { db } from "@/server/db";
import redis from "@/lib/redis";

// Helper function to get the start and end dates for a given interval
function getDateRange(interval: "daily" | "weekly" | "monthly" | "yearly") {
  const now = new Date();
  switch (interval) {
    case "daily":
      return {
        startTime: new Date(now),
        endTime: new Date(now),
      };
    case "weekly":
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 6); // Last 7 days
      return {
        startTime: weekStart,
        endTime: now,
      };
    case "monthly":
      const monthStart = new Date(now);
      monthStart.setDate(now.getDate() - 29); // Last 30 days
      return {
        startTime: monthStart,
        endTime: now,
      };
    case "yearly":
      const yearStart = new Date(now);
      yearStart.setFullYear(now.getFullYear() - 1); // Last 12 months
      return {
        startTime: yearStart,
        endTime: now,
      };
    default:
      throw new Error("Invalid interval");
  }
}

// Get last 7 days of daily views for a project
export async function getWeeklyViews(projectId: string) {
  const { startTime, endTime } = getDateRange("weekly");
  const redisKey = `pageViews:weekly:${projectId}:${startTime.toISOString().split("T")[0]}`;

  const cachedViews = await redis.get(redisKey);
  if (cachedViews) {
    try {
      return JSON.parse(cachedViews);
    } catch (error) {
      console.error("Error parsing cached weekly views:", error);
      return null;
    }
  }

  const views = await db.projectView.findMany({
    where: {
      projectId,
      timeInterval: "daily",
      startTime: {
        gte: startTime,
        lte: endTime,
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  if (!views || views.length === 0) {
    return null;
  }

  await redis.set(redisKey, JSON.stringify(views), "EX", 3600 * 24); 
  return views;
}

// Get last 30 days of daily views for a project
export async function getMonthlyViews(projectId: string) {
  const { startTime, endTime } = getDateRange("monthly");
  const redisKey = `pageViews:monthly:${projectId}:${startTime.toISOString().split("T")[0]}`;

  const cachedViews = await redis.get(redisKey);
  if (cachedViews) {
    try {
      return JSON.parse(cachedViews);
    } catch (error) {
      console.error("Error parsing cached monthly views:", error);
      return null;
    }
  }

  const views = await db.projectView.findMany({
    where: {
      projectId,
      timeInterval: "daily",
      startTime: {
        gte: startTime,
        lte: endTime,
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  if (!views || views.length === 0) {
    return null;
  }

  await redis.set(redisKey, JSON.stringify(views), "EX", 3600 * 24); 
  return views;
}

// Get last 12 months of monthly views for a project
export async function getYearlyViews(projectId: string) {
  const { startTime, endTime } = getDateRange("yearly");
  const redisKey = `pageViews:yearly:${projectId}:${startTime.toISOString().split("T")[0]}`;

  const cachedViews = await redis.get(redisKey);
  if (cachedViews) {
    try {
      return JSON.parse(cachedViews);
    } catch (error) {
      console.error("Error parsing cached yearly views:", error);
      return null;
    }
  }

  const views = await db.projectView.findMany({
    where: {
      projectId,
      timeInterval: "monthly",
      startTime: {
        gte: startTime,
        lte: endTime,
      },
    },
    orderBy: {
      startTime: "asc",
    },
  });

  if (!views || views.length === 0) {
    return null;
  }

  await redis.set(redisKey, JSON.stringify(views), "EX", 3600 * 24); // Cache for 24 hours
  return views;
}

// Get lifetime views for a project (grouped by year)
export async function getLifetimeViews(projectId: string) {
  const redisKey = `pageViews:yearly:${projectId}`;

  const cachedViews = await redis.get(redisKey);
  if (cachedViews) {
    try {
      return JSON.parse(cachedViews);
    } catch (error) {
      console.error("Error parsing cached lifetime views:", error);
      return null;
    }
  }

  const views = await db.projectView.findMany({
    where: {
      projectId,
      timeInterval: "yearly",
    },
    orderBy: {
      startTime: "asc",
    },
  });

  if (!views || views.length === 0) {
    return null;
  }

  await redis.set(redisKey, JSON.stringify(views), "EX", 3600 * 24); 
  return views;
}