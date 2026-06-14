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
        icon: "/window.svg"
      });
    } else {
      requestPermission().then(granted => {
        if (granted) sendTestNotification();
      });
    }
  };

  useEffect(() => {
    if (permission !== "granted" || !settings?.pillReminderTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHourStr = now.getHours().toString().padStart(2, '0');
      const currentMinStr = now.getMinutes().toString().padStart(2, '0');
      const currentTime = `${currentHourStr}:${currentMinStr}`;
      
      const lastNotifiedDate = localStorage.getItem("siva_last_pill_notification_date");
      const todayStr = now.toDateString();

      if (currentTime === settings.pillReminderTime && lastNotifiedDate !== todayStr) {
        new Notification("SIVA: Waktunya Pil KB & Vitamin! 💊", {
          body: "Halo! Ini adalah pengingat harian Anda untuk meminum pil KB atau suplemen vitamin.",
          icon: "/window.svg"
        });
        localStorage.setItem("siva_last_pill_notification_date", todayStr);
      }
    }, 30000); // Cek setiap 30 detik

    return () => clearInterval(interval);
  }, [permission, settings?.pillReminderTime]);

  return {
    permission,
    requestPermission,
    sendTestNotification,
    isSupported: typeof window !== "undefined" && "Notification" in window
  };
}
