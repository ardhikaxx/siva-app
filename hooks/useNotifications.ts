"use client";

import { useState, useEffect } from "react";
import { useCycleData } from "@/context/CycleContext";

export function useNotifications() {
  const { settings } = useCycleData();
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Browser Anda tidak mendukung notifikasi.");
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      return perm === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  };

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("SIVA: Pengingat Minum Air 💧", {
        body: "Jangan lupa untuk minum air agar tetap terhidrasi hari ini!",
        icon: "/icons/icon-192x192.png", // Assuming PWA icon exists
        badge: "/icons/icon-192x192.png"
      });
    } else {
      requestPermission().then(granted => {
        if (granted) sendTestNotification();
      });
    }
  };

  return {
    permission,
    requestPermission,
    sendTestNotification,
    isSupported: typeof window !== "undefined" && "Notification" in window
  };
}
