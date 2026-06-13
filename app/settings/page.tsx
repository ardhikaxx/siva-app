"use client";

import { useAuth } from "@/context/AuthContext";
import { useCycleData } from "@/context/CycleContext";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { LogOut, User, Settings as SettingsIcon, AlertCircle, Trash2, Moon, Sun } from "lucide-react";
import { useAlert } from "@/context/AlertContext";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { settings } = useCycleData();
  const router = useRouter();
  const { confirm } = useAlert();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="min-h-screen bg-brand-50 p-6">
      <header className="mb-8 pt-4">
        <h1 className="text-2xl font-bold text-brand-900">Profil & Pengaturan</h1>
      </header>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100 mb-6 flex items-center">
        <div className="w-16 h-16 bg-brand-100 text-brand-500 rounded-full flex justify-center items-center mr-4">
          <User size={32} />
        </div>
        <div>
          <h2 className="font-bold text-brand-900 text-lg">{user ? user.displayName || 'Pengguna' : 'Tamu'}</h2>
          <p className="text-brand-500 text-sm">{user ? user.email : 'Belum masuk ke akun'}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-brand-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-brand-50 flex items-center">
          <SettingsIcon size={20} className="text-brand-500 mr-3" />
          <h3 className="font-semibold text-brand-900">Pengaturan Siklus</h3>
        </div>
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-700">Durasi Siklus</span>
            <span className="font-medium bg-brand-50 px-3 py-1 rounded-lg text-brand-900">{settings?.cycleLength || '-'} hari</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-700">Durasi Menstruasi</span>
            <span className="font-medium bg-brand-50 px-3 py-1 rounded-lg text-brand-900">{settings?.periodLength || '-'} hari</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-brand-700">Haid Terakhir</span>
            <span className="font-medium bg-brand-50 px-3 py-1 rounded-lg text-brand-900">
              {settings ? format(parseISO(settings.lastPeriodStart), "d MMM yyyy", { locale: id }) : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center border-t border-brand-50 pt-4 mt-2">
            <span className="text-sm text-brand-700 flex items-center"><Moon size={16} className="mr-2" /> Tampilan Gelap (Dark Mode)</span>
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-12 h-6 bg-brand-200 rounded-full relative flex items-center px-1"
              >
                <div className={`w-4 h-4 rounded-full bg-brand-500 transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`}></div>
              </button>
            )}
          </div>
          <button 
            onClick={() => router.push("/onboarding?edit=true")}
            className="w-full text-brand-600 text-sm font-semibold py-2 mt-4 bg-brand-50 rounded-xl hover:bg-brand-100 transition-colors"
          >
            Ubah Pengaturan Siklus
          </button>
        </div>
      </div>

      {!user ? (
        <div className="bg-white rounded-3xl shadow-sm border border-brand-100 p-5 mb-6 text-center">
          <AlertCircle size={32} className="text-brand-400 mx-auto mb-3" />
          <h3 className="font-semibold text-brand-900 mb-2">Simpan Data Anda</h3>
          <p className="text-sm text-brand-600 mb-4">Buat akun untuk mencadangkan data siklus dan jurnal Anda dengan aman.</p>
          <button 
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-brand-500 text-white rounded-xl font-semibold"
          >
            Masuk / Daftar
          </button>
        </div>
      ) : (
        <button 
          onClick={handleSignOut}
          className="w-full bg-white text-red-500 font-semibold py-4 rounded-2xl flex justify-center items-center shadow-sm border border-red-100 mb-4"
        >
          <LogOut size={20} className="mr-2" /> Keluar dari Akun
        </button>
      )}

      {!user && (
         <button 
         onClick={handleResetData}
         className="w-full bg-red-50 text-red-600 font-semibold py-4 rounded-2xl flex justify-center items-center shadow-sm hover:bg-red-100 transition-colors"
       >
         <Trash2 size={20} className="mr-2" /> Hapus Data Lokal
       </button>
      )}
    </div>
  );
}
