import { type NotificationTpes } from "@/lib/types";
import { create } from "zustand";

type State = {
  notifications: NotificationTpes[];
};

type Action = {
  setNotification: (notifications: NotificationTpes[]) => void;
  updateNotification: () => void;  
};

export const useNotificationstore = create<State & Action>((set) => ({
  notifications: [],

  setNotification: (notifications) =>
    set(() => ({
      notifications,
    })),

  updateNotification: () =>
    set((state) => ({
      notifications: state.notifications.map((notif) => ({
        ...notif,
        isRead: true,  
        updatedAt: new Date(),
      })),
    })),
}));
