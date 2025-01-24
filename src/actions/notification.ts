"use server";

import { db } from "@/server/db";

// Get all user notifications
export async function getAllNotifications(userId: string) {
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

  return data; 
}