/* eslint-disable @typescript-eslint/no-unsafe-return */
"use server";

import redis from "@/lib/redis";
import { db } from "@/server/db";

// Get all user notifications
export async function getAllNotifications(userId: string) {

    const cachedNotifications = await redis.get(`notifications:${userId}`);
  if (cachedNotifications) {
    try {
      return JSON.parse(cachedNotifications); 
    } catch (error) {
      console.error("Error parsing cached data:", error);
      return []; 
    }
  }
  const data = await db.notification.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!data || data.length === 0) {
    return null;
  }

  await redis.set(`notifications:${userId}`, JSON.stringify(data), "EX", 3600 * 24); 

  return data;
}

// Mark all notifications for a specific user as read
export async function markAllNotificationAsRead(userId: string) {
  const data = await db.notification.updateMany({
    where: {
      userId: userId,
    },
    data: {
      isRead: true,
    },
  });

  if (data.count === 0) {
    return null;
  }

  await redis.del(`notifications:${userId}`)

  return data; 
}