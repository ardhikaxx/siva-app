"use client";

import { useAuth } from "@/context/AuthContext";
import { useCycleData } from "@/context/CycleContext";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { LogOut, User, Settings as SettingsIcon, AlertCircle, Trash2, Moon } from "lucide-react";
import { useAlert } from "@/context/AlertContext";

import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { settings, updateSettings } = useCycleData();
  const router = useRouter();
  const { confirm, showAlert } = useAlert();
  const { t, language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { permission, requestPermission } = useNotifications();

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  const updatePadInventory = async (change: number) => {
    if (!settings) return;
    const currentInventory = settings.padInventory || 0;
    const newInventory = Math.max(0, currentInventory + change);
    await updateSettings({ ...settings, padInventory: newInventory });
  };

  const handleSignOut = async () => {
    confirm({
      title: 'Keluar Akun',
      text: 'Apakah Anda yakin ingin keluar?',
      confirmText: 'Ya, Keluar',
      onConfirm: async () => {
        await signOut();
        router.push("/");
      }
    });
  };

  const handleResetData = () => {
    confirm({
      title: 'Hapus Data Lokal',
      text: 'Apakah Anda yakin ingin menghapus data siklus lokal Anda? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      onConfirm: () => {
        localStorage.removeItem("siva_cycle_settings");
        window.location.href = "/onboarding";
      }
    });
  };

  return (
    <div className="min-h-screen bg-brand-50 p-6 pb-24 overflow-x-hidden">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 pt-4"
      >
        <h1 className="text-2xl font-bold text-brand-900">{t('settings_title')}</h1>
      </motion.header>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100 mb-6 flex items-center">
          <div className="w-16 h-16 bg-brand-100 text-brand-500 rounded-full flex justify-center items-center mr-4 overflow-hidden">
            {user?.photoURL && !imgError ? (
              <Image 
                src={user.photoURL} 
                alt="Foto Profil" 
                width={64}
                height={64}
                className="w-full h-full object-cover" 
                onError={() => setImgError(true)} 
              />
            ) : (
              <User size={32} />
            )}
          </div>
          <div>
            <h2 className="font-bold text-brand-900 text-lg">{user ? user.displayName || 'Pengguna' : 'Tamu'}</h2>
            <p className="text-brand-500 text-sm">{user ? user.email : 'Belum masuk ke akun'}</p>
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white rounded-3xl shadow-sm border border-brand-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-brand-50 flex items-center">
            <SettingsIcon size={20} className="text-brand-500 mr-3" />
            <h3 className="font-semibold text-brand-900">{t('settings_cycle_settings')}</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-700">{t('settings_cycle_length')}</span>
              <span className="font-medium bg-brand-50 px-3 py-1 rounded-lg text-brand-900">{settings?.cycleLength || '-'} hari</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-700">{t('settings_period_length')}</span>
              <span className="font-medium bg-brand-50 px-3 py-1 rounded-lg text-brand-900">{settings?.periodLength || '-'} hari</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-brand-700">{t('settings_last_period')}</span>
              <span className="font-medium bg-brand-50 px-3 py-1 rounded-lg text-brand-900">
                {settings ? format(parseISO(settings.lastPeriodStart), "d MMM yyyy", { locale: id }) : '-'}
              </span>
            </div>
            
            <div className="flex justify-between items-center border-t border-brand-50 pt-4 mt-2">
              <span className="text-sm text-brand-700">{t('settings_pad_inventory')}</span>
              <div className="flex items-center space-x-3">
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updatePadInventory(-1)}
                  className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold"
                >-</motion.button>
                <span className="font-bold text-brand-900 w-4 text-center">{settings?.padInventory || 0}</span>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={() => updatePadInventory(1)}
                  className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold"
                >+</motion.button>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-brand-50 pt-4 mt-2">
              <span className="text-sm text-brand-700">{t('settings_theme')}</span>
              <div className="flex gap-2">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateSettings({ ...settings!, themeColor: "peach" })} className={`w-6 h-6 rounded-full bg-[#fa3c61] ${(!settings?.themeColor || settings.themeColor === 'peach') ? 'ring-2 ring-offset-2 ring-brand-500' : ''}`} />
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateSettings({ ...settings!, themeColor: "matcha" })} className={`w-6 h-6 rounded-full bg-[#22c55e] ${settings?.themeColor === 'matcha' ? 'ring-2 ring-offset-2 ring-green-500' : ''}`} />
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateSettings({ ...settings!, themeColor: "ocean" })} className={`w-6 h-6 rounded-full bg-[#3b82f6] ${settings?.themeColor === 'ocean' ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`} />
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateSettings({ ...settings!, themeColor: "cyberpunk" })} className={`w-6 h-6 rounded-full bg-[#d946ef] ${settings?.themeColor === 'cyberpunk' ? 'ring-2 ring-offset-2 ring-fuchsia-500' : ''}`} />
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => updateSettings({ ...settings!, themeColor: "lavender" })} className={`w-6 h-6 rounded-full bg-[#a855f7] ${settings?.themeColor === 'lavender' ? 'ring-2 ring-offset-2 ring-purple-500' : ''}`} />
              </div>
            </div>



            <div className="flex justify-between items-center border-t border-brand-50 pt-4 mt-2">
              <span className="text-sm text-brand-700 flex items-center">🌐 {t('settings_language')}</span>
              <div className="flex bg-brand-50 rounded-lg p-1">
                <button 
                  onClick={() => setLanguage('id')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'id' ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-400'}`}
                >
                  ID
                </button>
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-white text-brand-700 shadow-sm' : 'text-brand-400'}`}
                >
                  EN
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-brand-50 pt-4 mt-2">
              <div>
                <span className="text-sm text-brand-700 block font-medium">🩺 {t('settings_syndrome_mode')}</span>
                <span className="text-xs text-brand-400 block max-w-[200px] mt-1 leading-tight">Ubah opsi keluhan jurnal menjadi spesifik</span>
              </div>
              <select 
                value={settings?.syndromeMode || "none"}
                onChange={(e) => updateSettings({ ...settings!, syndromeMode: e.target.value as "none" | "pcos" | "endometriosis" })}
                className="bg-brand-50 border border-brand-200 text-brand-900 text-xs rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none"
              >
                <option value="none">{t('settings_syndrome_none')}</option>
                <option value="pcos">PCOS</option>
                <option value="endometriosis">Endometriosis</option>
              </select>
            </div>

            <div className="flex justify-between items-center border-t border-brand-50 pt-4 mt-2">
              <div>
                <span className="text-sm text-brand-700 block font-medium">👤 Mode Pengguna</span>
                <span className="text-xs text-brand-400 block max-w-[200px] mt-1 leading-tight">Sesuaikan aplikasi dengan fase hidup Anda</span>
              </div>
              <select 
                value={settings?.userMode || "normal"}
                onChange={(e) => updateSettings({ ...settings!, userMode: e.target.value as "normal" | "ttc" | "pregnancy" | "contraception" })}
                className="bg-brand-50 border border-brand-200 text-brand-900 text-xs rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2 outline-none"
              >
                <option value="normal">Normal</option>
                <option value="ttc">Program Hamil (TTC)</option>
                <option value="pregnancy">Kehamilan</option>
                <option value="contraception">Kontrasepsi</option>
              </select>
            </div>

            {settings?.userMode === "pregnancy" && (
              <div className="flex justify-between items-center border-t border-brand-50 pt-4 mt-2 bg-pink-50 p-3 rounded-xl">
                <div>
                  <span className="text-sm text-brand-700 block font-medium">👶 Hari Perkiraan Lahir (HPL)</span>
                </div>
                <input 
                  type="date" 
                  value={settings?.pregnancyDueDate || ""}
                  onChange={(e) => updateSettings({ ...settings!, pregnancyDueDate: e.target.value })}
                  className="bg-white border border-brand-200 text-brand-900 text-xs rounded-lg p-2 outline-none"
                />
              </div>
            )}

            {settings?.userMode === "contraception" && (
              <div className="flex justify-between items-center border-t border-brand-50 pt-4 mt-2 bg-blue-50 p-3 rounded-xl">
                <div>
                  <span className="text-sm text-brand-700 block font-medium">💊 Jenis Kontrasepsi</span>
                </div>
                <select 
                  value={settings?.contraceptionType || "pill"}
                  onChange={(e) => updateSettings({ ...settings!, contraceptionType: e.target.value as "pill" | "iud" | "implant" | "injection" | "none" })}
                  className="bg-white border border-brand-200 text-brand-900 text-xs rounded-lg p-2 outline-none"
                >
                  <option value="pill">Pil KB</option>
                  <option value="iud">IUD</option>
                  <option value="implant">Implan</option>
                  <option value="injection">Suntik</option>
                  <option value="none">Lainnya</option>
                </select>
              </div>
            )}

            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/onboarding?edit=true")}
              className="w-full text-brand-600 text-sm font-semibold py-2 mt-4 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors"
            >
              {t('settings_change_cycle')}
            </motion.button>
          </div>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white rounded-3xl shadow-sm border border-brand-100 overflow-hidden mb-6">
          <div className="p-4 border-b border-brand-50 flex items-center">
            <AlertCircle size={20} className="text-brand-500 mr-3" />
            <h3 className="font-semibold text-brand-900">{t('settings_notifications')}</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-brand-700 block font-medium">Izin Notifikasi</span>
                <span className="text-xs text-brand-400">{permission === 'granted' ? 'Diizinkan' : 'Belum Diizinkan'}</span>
              </div>
              {permission !== 'granted' && (
                <button 
                  onClick={async () => {
                    const granted = await requestPermission();
                    if (granted) showAlert({ title: "Berhasil", text: "Notifikasi SIVA telah diaktifkan!", type: "success" });
                  }}
                  className="bg-brand-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                >
                  Izinkan
                </button>
              )}
            </div>

            {permission === 'granted' && (
              <div className="flex justify-between items-center border-t border-brand-50 pt-4 mt-2">
                <div>
                  <span className="text-sm text-brand-700 block font-medium">{t('settings_pill_reminder')}</span>
                  <span className="text-xs text-brand-400">Pilih jam untuk menerima pengingat harian</span>
                </div>
                <input 
                  type="time" 
                  value={settings?.pillReminderTime || ""}
                  onChange={(e) => updateSettings({ ...settings!, pillReminderTime: e.target.value })}
                  className="bg-brand-50 border border-brand-200 text-brand-900 text-sm rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2"
                />
              </div>
            )}
          </div>
        </motion.div>

        {!user ? (
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white rounded-3xl shadow-sm border border-brand-100 p-5 mb-6 text-center">
            <AlertCircle size={32} className="text-brand-400 mx-auto mb-3" />
            <h3 className="font-semibold text-brand-900 mb-2">Simpan Data Anda</h3>
            <p className="text-sm text-brand-600 mb-4">Buat akun untuk mencadangkan data siklus dan jurnal Anda dengan aman.</p>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/login")}
              className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold shadow-md"
            >
              Masuk / Daftar
            </motion.button>
          </motion.div>
        ) : (
          <motion.button 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignOut}
            className="w-full bg-white text-red-500 font-semibold py-4 rounded-2xl flex justify-center items-center shadow-sm border border-red-100 mb-4"
          >
            <LogOut size={20} className="mr-2" /> {t('settings_logout')}
          </motion.button>
        )}

        {!user && (
          <motion.button 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileTap={{ scale: 0.98 }}
            onClick={handleResetData}
            className="w-full bg-red-50 text-red-600 font-semibold py-4 rounded-2xl flex justify-center items-center shadow-sm hover:bg-red-100 transition-colors"
          >
            <Trash2 size={20} className="mr-2" /> {t('settings_delete_data')}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}
