import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

// Global notification state shared across the app.
// Handles fetching unread notifications and marking them as read.
const NotificationContext = createContext();

function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications/notification");
        setNotifications(response.data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const token = localStorage.getItem("token");

    if (token) {
      fetchNotifications();
    }
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/notification/${notificationId}/read`);

      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        markAsRead,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}

export default NotificationProvider;
