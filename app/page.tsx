"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCycleData } from "@/context/CycleContext";
import { useAuth } from "@/context/AuthContext";
import CycleWheel from "@/components/CycleWheel";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Droplet, Info, Calendar as CalendarIcon, UserCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useAlert } from "@/context/AlertContext";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { settings, info, loading: cycleLoading, markPeriodStart } = useCycleData();
  const { user, loading: authLoading } = useAuth();
  const { confirm, showAlert } = useAlert();

  useEffect(() => {
    if (!cycleLoading && !authLoading && !settings) {
      router.push("/onboarding");
    }
  }, [cycleLoading, authLoading, settings, router]);

  useEffect(() => {
    if (info && settings) {
      if (info.daysUntilNextPeriod <= 3 && (settings.padInventory === undefined || settings.padInventory < 3)) {
        const popupShownKey = `siva_pad_alert_shown_${info.nextPeriodDate}`;
        if (!localStorage.getItem(popupShownKey)) {
          setTimeout(() => {
            showAlert({
              title: "Pengingat Restok Cerdas 🛍️",
              text: `Pembalutmu sisa ${settings.padInventory || 0}, sepertinya haidmu sebentar lagi datang. Jangan lupa mampir ke minimarket!`,
              type: "warning"
            });
            localStorage.setItem(popupShownKey, "true");
          }, 1000);
        }
      }
    }
  }, [info, settings, showAlert]);

  if (cycleLoading || authLoading || !settings || !info) {
    return (
      <div className="min-h-screen bg-brand-50 p-6 flex flex-col items-center pb-24">
        {/* Header Skeleton */}
        <div className="w-full flex justify-between items-start mb-6 pt-4">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-brand-200 rounded animate-pulse"></div>
            <div className="h-4 w-48 bg-brand-100 rounded animate-pulse"></div>
          </div>
          <div className="w-10 h-10 bg-brand-200 rounded-full animate-pulse"></div>
        </div>

        {/* Cycle Wheel Skeleton */}
        <div className="relative w-64 h-64 mb-8">
          <div className="absolute inset-0 rounded-full border-[12px] border-brand-100 animate-pulse"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="h-10 w-16 bg-brand-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-24 bg-brand-100 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="w-full mb-4 space-y-4">
          <div className="h-16 w-full bg-brand-100 rounded-2xl animate-pulse"></div>
          <div className="h-20 w-full bg-brand-100 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  const getPhaseDescription = (phase: string) => {
    switch (phase) {
      case "menstruasi": return "Tubuh meluruhkan lapisan rahim. Waktu untuk istirahat dan memulihkan energi.";
      case "folikular": return "Energi dan suasana hati cenderung meningkat. Waktu yang baik untuk aktivitas produktif.";
      case "ovulasi": return "Masa subur puncak. Energi berada pada tingkat tertinggi.";
      case "luteal": return "Energi mulai menurun menjelang haid. Waktu yang baik untuk perawatan diri.";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 p-6 pb-24 overflow-x-hidden">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex justify-between items-center mb-8 pt-4"
      >
        <div>
          <h1 className="text-3xl font-black text-brand-500 tracking-tight">SIVA</h1>
          <p className="text-brand-400 text-[10px] uppercase font-bold tracking-wider mb-2">Siklus Interaktif Vitalitas wanitA</p>
          <p className="text-brand-900 font-bold mt-1">Halo, {user ? user.displayName || 'Pengguna' : 'Tamu'}!</p>
          <p className="text-brand-600 text-xs mt-0.5">{format(new Date(), "EEEE, d MMMM yyyy", { locale: id })}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {!user && (
            <button 
              onClick={() => router.push("/login")}
              className="flex items-center bg-white text-brand-600 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border border-brand-100"
            >
              <UserCircle size={14} className="mr-1" /> Masuk
            </button>
          )}
          <button 
            onClick={() => router.push("/settings")}
            className="w-10 h-10 rounded-full bg-white text-brand-600 flex items-center justify-center shadow-sm border border-brand-100 overflow-hidden"
          >
            {user?.photoURL ? (
              <Image src={user.photoURL} alt="Profil" width={40} height={40} className="w-full h-full object-cover rounded-full" />
            ) : (
              <UserCircle size={20} />
            )}
          </button>
        </div>
      </motion.header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        className="bg-white rounded-[2rem] p-6 shadow-xl mb-8 flex flex-col items-center relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-100 rounded-tr-full opacity-50"></div>
        
        <CycleWheel 
          cycleLength={settings.cycleLength} 
          periodLength={settings.periodLength} 
          currentDay={info.cycleDayToday} 
          currentPhase={info.currentPhase} 
        />
        
        <div className="mt-6 text-center w-full relative z-10">
          <p className="text-brand-900 font-medium text-sm px-4">
            {getPhaseDescription(info.currentPhase)}
          </p>
        </div>
      </motion.div>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.2
            }
          }
        }}
      >
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100"
          >
            <div className="flex items-center text-brand-500 mb-2">
              <Droplet size={20} className="mr-2" />
              <h3 className="font-semibold text-sm">Haid Berikutnya</h3>
            </div>
            <p className="text-2xl font-bold text-brand-900 mb-1">{info.daysUntilNextPeriod} <span className="text-sm font-normal">hari lagi</span></p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-brand-500">{format(parseISO(info.nextPeriodDate), "d MMM yyyy", { locale: id })}</p>
              {info.isSmartPrediction && (
                <span className="text-[10px] bg-brand-100 text-brand-600 px-1.5 py-0.5 rounded animate-pulse">
                  Pintar 🧠
                </span>
              )}
            </div>
          </motion.div>

          <motion.div 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.02 }}
            className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100"
          >
            <div className="flex items-center text-brand-500 mb-2">
              <CalendarIcon size={20} className="mr-2 text-purple-500" />
              <h3 className="font-semibold text-sm">Masa Subur</h3>
            </div>
            <p className="text-sm font-bold text-brand-900 leading-tight mb-1">
              {format(parseISO(info.fertileWindowStart), "d MMM", { locale: id })} - {format(parseISO(info.fertileWindowEnd), "d MMM", { locale: id })}
            </p>
            <p className="text-xs text-brand-500">Puncak: {format(parseISO(info.ovulationDate), "d MMM", { locale: id })}</p>
          </motion.div>
        </div>

        <motion.button 
          variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            confirm({
              title: 'Konfirmasi Haid',
              text: 'Apakah Anda yakin ingin menandai hari ini sebagai hari pertama haid?',
              confirmText: 'Ya, Tandai',
              onConfirm: () => {
                markPeriodStart(format(new Date(), "yyyy-MM-dd"));
                showAlert({
                  title: 'Berhasil!',
                  text: 'Siklus baru Anda telah tercatat.',
                  type: 'success'
                });
              }
            });
          }}
          className="w-full py-4 bg-brand-100 text-brand-700 rounded-2xl font-semibold flex justify-center items-center mb-4 transition-colors hover:bg-brand-200"
        >
          <Droplet size={20} className="mr-2" /> Tandai Hari Pertama Haid
        </motion.button>

        {/* Sisterhood Forum Banner */}
        <motion.div 
          variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.location.href = '/community'}
          className="mb-4 w-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-2xl p-5 text-white shadow-md cursor-pointer flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-lg mb-1 flex items-center">
              SIVA Sisterhood <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">Baru</span>
            </h3>
            <p className="text-xs text-white/80">Forum cerita & dukungan anonim wanita.</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
            <span className="text-xl">💬</span>
          </div>
        </motion.div>

        {/* Pad Inventory Warning */}
        {info.daysUntilNextPeriod <= 5 && (settings.padInventory === undefined || settings.padInventory < 5) && (
          <motion.div 
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
            className="bg-orange-50 border border-orange-200 p-4 rounded-2xl flex items-start mb-6"
          >
            <div className="bg-orange-100 text-orange-600 p-2 rounded-full mr-3">
              <Info size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-orange-900 text-sm">Cek Stok Pembalut!</h4>
              <p className="text-xs text-orange-800 mt-1">
                Haid Anda sebentar lagi tiba, namun stok pembalut Anda tercatat sisa <span className="font-bold">{settings.padInventory || 0}</span>. Jangan lupa beli persiapan ya!
              </p>
            </div>
          </motion.div>
        )}

        {/* Daily Tip Card */}
        {info && (
          <motion.div 
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }}
            className="bg-gradient-to-br from-brand-400 to-brand-500 p-5 rounded-3xl shadow-md mb-6 relative overflow-hidden text-white"
          >
            <div className="absolute -right-4 -top-4 w-20 h-20 bg-white rounded-full opacity-10"></div>
            <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-white rounded-full opacity-10"></div>
            <h3 className="text-sm font-bold mb-2 flex items-center relative z-10">
              <span className="text-xl mr-2">
                {info.currentPhase === 'menstruasi' ? '💧' : 
                 info.currentPhase === 'folikular' ? '✨' : 
                 info.currentPhase === 'ovulasi' ? '🌸' : '🌿'}
              </span>
              Tips Pintar Hari Ini
            </h3>
            <p className="text-sm leading-relaxed relative z-10 opacity-90">
              {info.currentPhase === 'menstruasi' && "Istirahat yang cukup sangat penting. Jangan lupa perbanyak minum air hangat dan konsumsi makanan kaya zat besi seperti bayam atau daging merah."}
              {info.currentPhase === 'folikular' && "Energi kamu sedang memuncak! Hormon estrogen sedang naik. Ini waktu yang tepat untuk melakukan olahraga kardio ringan atau mencoba hal baru."}
              {info.currentPhase === 'ovulasi' && "Kamu sedang berada di puncak masa subur dan merasa sangat percaya diri! Nikmati energi positif ini untuk bersosialisasi atau proyek penting."}
              {info.currentPhase === 'luteal' && "Wajar jika merasa sedikit sensitif, lelah, atau craving makanan manis. Luangkan waktu untuk relaksasi. Kurangi kafein jika perut kembung."}
            </p>
          </motion.div>
        )}

        {!user && (
          <motion.div 
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start"
          >
            <Info size={24} className="text-blue-500 mr-3 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-medium text-blue-900 text-sm">Data Anda belum dicadangkan</h4>
              <p className="text-xs text-blue-700 mt-1 mb-2">Buat akun untuk mencadangkan data dan mengaksesnya dari perangkat lain.</p>
              <button onClick={() => router.push("/login")} className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium">Buat Akun</button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
