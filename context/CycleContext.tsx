"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, set, get } from "firebase/database";
import { CycleSettings, CycleInfo, calculateCycleInfo } from "@/lib/cycleUtils";

interface CycleContextType {
  settings: CycleSettings | null;
  info: CycleInfo | null;
  updateSettings: (newSettings: CycleSettings) => Promise<void>;
  loading: boolean;
  markPeriodStart: (startDate: string) => Promise<void>;
}

const CycleContext = createContext<CycleContextType>({
  settings: null,
  info: null,
  updateSettings: async () => {},
  loading: true,
  markPeriodStart: async () => {},
});

export const CycleProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<CycleSettings | null>(null);
  const [info, setInfo] = useState<CycleInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Load from local storage or firebase
  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Load from Firebase
      const profileRef = ref(db, `users/${user.uid}/profile/cycleSettings`);
      
      // Try to migrate local storage first if it exists
      const localSettings = localStorage.getItem("siva_cycle_settings");
      if (localSettings) {
        get(profileRef).then((snapshot) => {
          if (!snapshot.exists()) {
            // Migrate
            const parsed = JSON.parse(localSettings);
            set(profileRef, parsed);
          }
          localStorage.removeItem("siva_cycle_settings");
        });
      }

      const unsubscribe = onValue(profileRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setSettings(data);
          setInfo(calculateCycleInfo(data));
        } else {
          setSettings(null);
          setInfo(null);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Load from Local Storage
      setTimeout(() => {
        const localSettings = localStorage.getItem("siva_cycle_settings");
        if (localSettings) {
          const parsed = JSON.parse(localSettings);
          setSettings(parsed);
          setInfo(calculateCycleInfo(parsed));
        } else {
          setSettings(null);
          setInfo(null);
        }
        setLoading(false);
        setLoading(false);
      }, 0);
    }
  }, [user, authLoading]);

  // Apply theme color
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (settings?.themeColor) {
        document.documentElement.setAttribute("data-theme", settings.themeColor);
      } else {
        document.documentElement.setAttribute("data-theme", "peach");
      }
    }
  }, [settings?.themeColor]);

  const updateSettings = async (newSettings: CycleSettings) => {
    if (user) {
      const profileRef = ref(db, `users/${user.uid}/profile/cycleSettings`);
      await set(profileRef, newSettings);
    } else {
      localStorage.setItem("siva_cycle_settings", JSON.stringify(newSettings));
      setSettings(newSettings);
      setInfo(calculateCycleInfo(newSettings));
    }
  };

  const markPeriodStart = async (startDate: string) => {
    if (!settings) return;
    
    const pastPeriods = settings.pastPeriods || [];
    // Only push if not already marked for this date
    if (!pastPeriods.includes(startDate)) {
      pastPeriods.push(startDate);
    }
    
    const newSettings = {
      ...settings,
      lastPeriodStart: startDate,
      pastPeriods: pastPeriods,
    };
    await updateSettings(newSettings);
  };

  return (
    <CycleContext.Provider value={{ settings, info, updateSettings, loading: loading || authLoading, markPeriodStart }}>
      {children}
    </CycleContext.Provider>
  );
};

export const useCycleData = () => useContext(CycleContext);
