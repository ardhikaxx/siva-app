"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCycleData } from "@/context/CycleContext";
import { formatISO, parseISO, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import { CalendarDays, Clock, Activity, ArrowRight, Flower2 } from "lucide-react";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const { showAlert } = useAlert();
  
  const { updateSettings, settings, loading } = useCycleData();
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [cycleLength, setCycleLength] = useState<number | "">(28);
  const [periodLength, setPeriodLength] = useState<number | "">(5);
  const [step, setStep] = useState(1);

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
    if (!lastPeriodStart || !cycleLength || !periodLength) {
      showAlert({
        title: "Perhatian",
        text: "Silakan lengkapi semua data.",
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

  const nextStep = () => {
    if (step === 1 && !lastPeriodStart) {
      showAlert({ title: "Tunggu sebentar", text: "Kapan hari pertama haid terakhirmu?", type: "warning" });
      return;
    }
    setStep(step + 1);
  };

  if (loading || (settings && !isEditMode)) {
    return (
      <div className="min-h-screen bg-brand-50 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-[2rem] shadow-sm border border-brand-100">
          <div className="h-8 w-3/4 bg-brand-200 rounded-full mb-4 animate-pulse mx-auto"></div>
          <div className="h-4 w-full bg-brand-100 rounded-full mb-8 animate-pulse"></div>
          
          <div className="space-y-6">
            <div className="h-16 w-full bg-brand-50 rounded-2xl animate-pulse"></div>
            <div className="h-16 w-full bg-brand-50 rounded-2xl animate-pulse"></div>
            <div className="h-16 w-full bg-brand-50 rounded-2xl animate-pulse"></div>
          </div>
          
          <div className="mt-8 h-14 w-full bg-brand-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-brand-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl border border-white/50 relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-tr from-brand-400 to-brand-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3"
          >
            <Flower2 className="text-white" size={32} />
          </motion.div>
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-brand-800 mb-2 tracking-tight">
            Selamat Datang di SIVA
          </h1>
          <p className="text-brand-600 text-sm font-medium">
            {isEditMode ? "Perbarui informasi siklus Anda" : "Mari kita sesuaikan SIVA dengan ritme alami tubuhmu."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            {/* Step 1: Last Period */}
            <motion.div 
              initial={false}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-white rounded-2xl p-4 border border-brand-100 shadow-sm focus-within:ring-2 focus-within:ring-brand-400 transition-all"
            >
              <label className="flex items-center text-sm font-bold text-brand-900 mb-3">
                <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center mr-3 text-brand-500">
                  <CalendarDays size={16} />
                </div>
                Kapan hari pertama haid terakhirmu?
              </label>
              <input 
                type="date" 
                value={lastPeriodStart}
                onChange={(e) => setLastPeriodStart(e.target.value)}
                className="w-full bg-brand-50/50 p-3.5 rounded-xl border-none focus:ring-0 text-brand-900 font-medium outline-none cursor-pointer"
                required
              />
            </motion.div>

            {/* Step 2: Cycle & Period Lengths */}
            <AnimatePresence>
              {(step > 1 || isEditMode) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 overflow-hidden"
                >
                  <div className="bg-white rounded-2xl p-4 border border-brand-100 shadow-sm focus-within:ring-2 focus-within:ring-brand-400 transition-all">
                    <label className="flex items-center text-sm font-bold text-brand-900 mb-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center mr-3 text-brand-500">
                        <Activity size={16} />
                      </div>
                      Berapa lama rata-rata siklusmu?
                    </label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        min="21"
                        max="60"
                        value={cycleLength}
                        onChange={(e) => setCycleLength(e.target.value ? parseInt(e.target.value) : "")}
                        className="w-20 text-center bg-brand-50/50 p-3 rounded-xl border-none focus:ring-0 text-brand-900 font-black text-lg outline-none"
                        required
                      />
                      <span className="ml-3 text-brand-500 font-medium text-sm">Hari (Biasanya 28 hari)</span>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-brand-100 shadow-sm focus-within:ring-2 focus-within:ring-brand-400 transition-all">
                    <label className="flex items-center text-sm font-bold text-brand-900 mb-3">
                      <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center mr-3 text-brand-500">
                        <Clock size={16} />
                      </div>
                      Berapa hari haidmu biasanya?
                    </label>
                    <div className="flex items-center">
                      <input 
                        type="number" 
                        min="2"
                        max="15"
                        value={periodLength}
                        onChange={(e) => setPeriodLength(e.target.value ? parseInt(e.target.value) : "")}
                        className="w-20 text-center bg-brand-50/50 p-3 rounded-xl border-none focus:ring-0 text-brand-900 font-black text-lg outline-none"
                        required
                      />
                      <span className="ml-3 text-brand-500 font-medium text-sm">Hari (Biasanya 5 hari)</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4">
            {step === 1 && !isEditMode ? (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={nextStep}
                className="w-full py-4 bg-brand-900 text-white rounded-2xl font-bold flex items-center justify-center shadow-lg shadow-brand-200 transition-all"
              >
                Lanjut <ArrowRight size={18} className="ml-2" />
              </motion.button>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl font-bold shadow-lg shadow-brand-200 transition-all flex items-center justify-center"
              >
                <Flower2 size={18} className="mr-2" /> {isEditMode ? "Simpan Perubahan" : "Mulai Perjalanan SIVA"}
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
      
      {/* Footer Text */}
      <p className="mt-8 text-brand-400 text-xs text-center max-w-xs relative z-10">
        Data Anda dienkripsi dengan aman dan sepenuhnya menjadi milik privasi Anda.
      </p>
    </div>
  );
}

export default function Onboarding() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-50 p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-sm border border-brand-100">
          <div className="h-8 w-3/4 bg-brand-200 rounded mb-4 animate-pulse mx-auto"></div>
          <div className="h-4 w-full bg-brand-100 rounded mb-8 animate-pulse"></div>
          
          <div className="space-y-6">
            <div className="h-16 w-full bg-brand-50 rounded-2xl animate-pulse"></div>
            <div className="h-16 w-full bg-brand-50 rounded-2xl animate-pulse"></div>
            <div className="h-16 w-full bg-brand-50 rounded-2xl animate-pulse"></div>
          </div>
          
          <div className="mt-8 h-12 w-full bg-brand-200 rounded-xl animate-pulse"></div>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
