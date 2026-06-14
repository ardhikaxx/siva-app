"use client";

import { useEffect } from "react";
import { useCycleData } from "@/context/CycleContext";
import { useJournal } from "@/hooks/useJournal";
import { useAuth } from "@/context/AuthContext";
import { format, parseISO, subDays, isAfter } from "date-fns";
import { id } from "date-fns/locale";

export default function ReportPage() {
  const { settings, info } = useCycleData();
  const { entries } = useJournal();
  const { user } = useAuth();

  useEffect(() => {
    // Automatically trigger print dialog when loaded
    if (settings && entries) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [settings, entries]);

  if (!settings) return <div className="p-10 text-center">Memuat data...</div>;

  // Filter entries for the last 90 days
  const ninetyDaysAgo = subDays(new Date(), 90);
  const recentEntries = Object.entries(entries)
    .filter(([dateStr]) => isAfter(parseISO(dateStr), ninetyDaysAgo))
    .sort((a, b) => a[0].localeCompare(b[0])); // chronologically

  // Get top symptoms
  const symptomCounts: Record<string, number> = {};
  recentEntries.forEach(([_, entry]) => {
    entry.symptoms?.forEach(sym => {
      symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="bg-white text-black min-h-screen p-8 print:p-0 max-w-4xl mx-auto">
      <div className="border-b-2 border-brand-500 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-brand-700 mb-2">Laporan Kesehatan SIVA</h1>
        <p className="text-sm text-gray-600">Dibuat pada: {format(new Date(), "d MMMM yyyy", { locale: id })}</p>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div><strong>Nama:</strong> {user?.displayName || "Pengguna Anonim"}</div>
          <div><strong>Email:</strong> {user?.email || "-"}</div>
          <div><strong>Mode:</strong> {
            settings.userMode === "pregnancy" ? "Kehamilan" :
            settings.userMode === "ttc" ? "Program Hamil" :
            settings.userMode === "contraception" ? `Kontrasepsi (${settings.contraceptionType})` : "Normal"
          }</div>
          <div><strong>Fokus Sindrom:</strong> {settings.syndromeMode?.toUpperCase() || "Tidak Ada"}</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Ringkasan Siklus (Rata-rata)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Rata-rata Panjang Siklus</p>
            <p className="text-2xl font-bold">{settings.cycleLength} Hari</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Rata-rata Durasi Haid</p>
            <p className="text-2xl font-bold">{settings.periodLength} Hari</p>
          </div>
        </div>
      </div>

      {settings.userMode === 'pregnancy' && info?.pregnancyWeek && (
        <div className="mb-8 bg-pink-50 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Status Kehamilan</h2>
          <p><strong>Usia Kehamilan:</strong> Minggu ke-{info.pregnancyWeek}</p>
          <p><strong>HPL:</strong> {settings.pregnancyDueDate ? format(parseISO(settings.pregnancyDueDate), "d MMMM yyyy", { locale: id }) : "-"}</p>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Keluhan Teratas (90 Hari Terakhir)</h2>
        {topSymptoms.length > 0 ? (
          <ul className="list-disc pl-5">
            {topSymptoms.map(([sym, count]) => (
              <li key={sym} className="mb-1">{sym} <span className="text-gray-500">({count} hari)</span></li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-600">Tidak ada keluhan yang dicatat.</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Log Harian Terakhir (30 Hari)</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-left">Tanggal</th>
              <th className="border p-2 text-left">Suhu (°C)</th>
              <th className="border p-2 text-left">Berat (Kg)</th>
              <th className="border p-2 text-left">Tidur (Jam)</th>
              <th className="border p-2 text-left">Nyeri</th>
              <th className="border p-2 text-left">Keluhan Utama</th>
            </tr>
          </thead>
          <tbody>
            {recentEntries.slice(-30).reverse().map(([dateStr, entry]) => (
              <tr key={dateStr} className="border-b">
                <td className="border p-2">{format(parseISO(dateStr), "d MMM yyyy", { locale: id })}</td>
                <td className="border p-2">{entry.temperature || "-"}</td>
                <td className="border p-2">{entry.weight || "-"}</td>
                <td className="border p-2">{entry.sleepHours || "-"}</td>
                <td className="border p-2">{entry.painLevel || "-"}</td>
                <td className="border p-2">{entry.symptoms?.slice(0,2).join(", ") || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-400 print:block">
        Dicetak secara otomatis dari Aplikasi SIVA (Siklus Interaktif Vitalitas wanitA). 
        Data ini bersifat rahasia dan diperuntukkan bagi konsultasi medis profesional.
      </div>
      
      <div className="mt-8 print:hidden flex justify-center gap-4">
        <button onClick={() => window.print()} className="bg-brand-500 text-white px-6 py-2 rounded-lg font-bold">Cetak / Simpan PDF</button>
        <button onClick={() => window.history.back()} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-bold">Kembali</button>
      </div>
    </div>
  );
}
