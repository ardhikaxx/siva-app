"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCycleData } from "@/context/CycleContext";
import { formatISO, parseISO, format } from "date-fns";
import { motion } from "framer-motion";
import { useAlert } from "@/context/AlertContext";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const { showAlert } = useAlert();
  
  const { updateSettings, settings, loading } = useCycleData();
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);

  useEffect(() => {
    // Redirect ke beranda jika sudah punya settings dan BUKAN dalam mode edit
    if (!loading && settings && !isEditMode) {
      router.push("/");
    } else if (!loading && settings && isEditMode) {
      // Pre-fill form jika dalam mode edit
      setTimeout(() => {
        setLastPeriodStart(format(parseISO(settings.lastPeriodStart), "yyyy-MM-dd"));
        setCycleLength(settings.cycleLength);
        setPeriodLength(settings.periodLength);
      }, 0);
    }
  }, [settings, loading, router, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastPeriodStart) {
      showAlert({
        title: "Perhatian",
        text: "Silakan pilih tanggal hari pertama haid terakhir.",
        type: "warning"
      });
      return;
    }
    
    await updateSettings({
      lastPeriodStart: formatISO(new Date(lastPeriodStart), { representation: "date" }),
      cycleLength: Number(cycleLength),
      periodLength: Number(periodLength),
      pastPeriods: [formatISO(new Date(lastPeriodStart), { representation: "date" })]
    });
    
    router.push("/");
  };

  if (loading || (settings && !isEditMode)) {
    return null; // Atau spinner
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl"
      >
        <h1 className="text-4xl font-black text-brand-500 mb-1 text-center tracking-tight">SIVA</h1>
        <p className="text-brand-700 font-semibold text-center text-sm mb-4">Siklus Interaktif Vitalitas wanitA</p>
        
        <p className="text-brand-900 mb-8 text-center text-sm">Mari kita mulai dengan mengatur informasi dasar siklus menstruasi Anda.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-brand-900 mb-2">Hari Pertama Haid Terakhir</label>
            <input 
              type="date" 
              value={lastPeriodStart}
              onChange={(e) => setLastPeriodStart(e.target.value)}
              className="w-full p-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-900 mb-2">Rata-rata Durasi Siklus (Hari)</label>
            <input 
              type="number" 
              min="21"
              max="35"
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value))}
              className="w-full p-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
              required
            />
            <p className="text-xs text-brand-600 mt-1">Normalnya antara 21-35 hari</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-900 mb-2">Rata-rata Durasi Menstruasi (Hari)</label>
            <input 
              type="number" 
              min="2"
              max="10"
              value={periodLength}
              onChange={(e) => setPeriodLength(parseInt(e.target.value))}
              className="w-full p-3 rounded-xl border border-brand-200 focus:ring-2 focus:ring-brand-400 focus:border-brand-400 outline-none"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold transition-colors shadow-lg"
          >
            {isEditMode ? "Simpan Perubahan" : "Mulai Pantau Siklus"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="w-8 h-8 border-4 border-brand-300 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
