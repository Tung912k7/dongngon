import { useState } from "react";

export interface NotificationState {
  isOpen: boolean;
  message: string;
  type: "error" | "success" | "info";
  title?: string;
}

export function useAuthNotification() {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    message: "",
    type: "info",
  });

  const showNotification = (
    message: string,
    type: "error" | "success" | "info" = "info",
    title?: string
  ) => {
    setNotification({ isOpen: true, message, type, title });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    notification,
    setNotification,
    showNotification,
    closeNotification,
  };
}
