/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { usePersonStore } from "@/store/user";
import { generateToken, timeAgo } from "@/lib/utils";
import { useNotificationstore } from "@/store/notification";
import { type User } from "@/lib/types";
import {
  getAllNotifications,
  markAllNotificationAsRead,
} from "@/actions/notification";
import { Bell } from "lucide-react";

interface NotificationDropdownProps {
  user: User;
}

function NotificationDropdown({ user }: NotificationDropdownProps) {
  const { token } = usePersonStore((state) => state);
  const notifications = useNotificationstore((state) => state.notifications);
  const setNotifications = useNotificationstore(
    (state) => state.setNotification,
  );
  const clearNotifications = useNotificationstore(
    (state) => state.updateNotification,
  );

  useEffect(() => {
    usePersonStore.getState().setUser({
      name: user.name ?? "",
      email: user.email ?? "",
      avatar: user.image ?? "",
      id: user.id ?? "",
    });
  }, [user]);

  useEffect(() => {
    const fetchToken = async () => {
      if (token.length < 5) {
        try {
          const response: string = await generateToken(user.id);
          if (response.length > 2) {
            usePersonStore.getState().updateUser({
              token: response,
            });
          }
        } catch (error) {
          console.error("Error generating token:", error);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchToken();
  }, [user]);

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      clearNotifications();
      await markAllNotificationAsRead(user.id);
      
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsData = await getAllNotifications(user.id);
        if (notificationsData) {
          setNotifications(notificationsData);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user, setNotifications]);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-pink relative h-10 w-10 rounded-xl border border-[#D6DFE6] hover:bg-[rgba(182,187,191,0.1)]">
            <Bell color="#B6BBBF" fill="#B6BBBF" />
            {notifications?.length !== 0 &&
            notifications?.findIndex((notif) => notif?.isRead == false) !== -1 &&
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-[#F876C0] to-[#FED90C]"></span>
            }
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex max-h-[400px] min-h-[300px] w-80 flex-col overflow-hidden rounded-2xl">
          <div className="flex-1 gap-4 overflow-auto p-4 pl-8">
            <h4 className="pb-4 font-medium leading-none">Notifications</h4>
            {notifications?.length == 0 ? (
              <div className="flex min-h-[200px] items-center justify-center text-center">
                <div className="items-center text-center">
                  <div className="flex items-center justify-center">
                    <Bell className="h-16 w-16" />
                  </div>
                  <p className="pt-5">Empty Notification Box</p>
                </div>
              </div>
            ) : (
              <div>
                {notifications?.map((notification, index) => (
                  <div
                    key={index}
                    className="mb-2 grid grid-cols-[25px_1fr] items-start pb-1 last:mb-0 last:pb-0"
                  >
                    {!notification.isRead ? (
                      <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-gradient-to-tr from-[#F876C0] to-[#FED90C]" />
                    ) : (
                      <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-[#B6BBBF]" />
                    )}
                    <div className="grid gap-1">
                      <p className="text-sm font-medium">
                        {notification.value}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {timeAgo(notification?.createdAt?.toLocaleString())}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="mt-2 flex justify-center pb-2">
            <Button
              disabled={
                notifications?.length == 0 ||
                notifications.findIndex((notif) => notif?.isRead == false) == -1
              }
              variant="outline"
              className="w-[80%] rounded-xl bg-[#2A2C33] text-white hover:bg-[black] hover:text-white"
              onClick={handleMarkAllAsRead}
            >
              Mark All as Read
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default NotificationDropdown;
