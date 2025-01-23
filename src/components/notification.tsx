/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useEffect, useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Button } from './ui/button';
import { usePersonStore } from '@/store/user';
import { generateToken } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

interface NotificationDropdownProps {
  children: React.ReactNode;
  user: User;
}

function NotificationDropdown({ children, user }: NotificationDropdownProps) {
  const { token } = usePersonStore((state) => state)

  const [notifications, setNotifications] = useState([
    { message: 'New order received', time: '5 min ago' },
    { message: 'Payment processed', time: '10 min ago' },
    { message: 'Item shipped', time: '1 hour ago' },
  ]);

  useEffect(() => {
    usePersonStore.getState().setUser({
              name: user.name ?? '',
              email: user.email ?? '',
              avatar: user.image ?? '',
              id: user.id ?? '',
            });
  }, [user]);


    useEffect(() => {
    const fetchToken = async () => {
      if (token.length < 5) {
        try {
          const response : string = await generateToken(user.id);
          if (response.length > 2) {
            usePersonStore.getState().updateUser({
              token: response,
              
            });
          }
        } catch (error) {
          console.error('Error generating token:', error);
        }
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchToken();
  }, [user]);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 max-h-[400px] overflow-auto rounded-2xl">
          <div className="grid gap-4 p-4">
            <h4 className="font-medium leading-none">Notifications</h4>
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="mb-1 grid grid-cols-[25px_1fr] items-start pb-1 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-gradient-to-tr from-[#F876C0] to-[#FED90C]" />
                <div className="grid gap-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{notification.time}</p>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="rounded-xl mt-2 bg-[#2A2C33] text-white hover:bg-[black] hover:text-white"
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
