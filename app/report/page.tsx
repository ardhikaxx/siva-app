"use client";

import { useEffect, useState } from "react";
import { useCycleData } from "@/context/CycleContext";
import { useJournal } from "@/hooks/useJournal";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Printer, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { analyzeHealth } from "@/lib/cycleUtils";

export default function MedicalReport() {
  const { settings, info } = useCycleData();
  const { entries } = useJournal();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handlePrint = () => {
    window.print();
  };

  const healthAlerts = analyzeHealth(settings, entries);
  const sortedEntries = Object.entries(entries).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="min-h-screen bg-white">
      {/* Non-printable Header */}
      <div className="print:hidden p-4 bg-brand-50 border-b border-brand-100 flex justify-between items-center sticky top-0 z-50">
        <button onClick={() => router.back()} className="flex items-center text-brand-600 font-semibold px-3 py-2 bg-white rounded-xl shadow-sm border border-brand-100">
          <ChevronLeft size={16} className="mr-1" /> Kembali
        </button>
        <button onClick={handlePrint} className="flex items-center bg-brand-500 text-white font-bold px-4 py-2 rounded-xl shadow-md hover:bg-brand-600 transition-colors">
          <Printer size={18} className="mr-2" /> Cetak / Simpan PDF
        </button>
      </div>

      {/* Printable Report Content */}
      <div className="p-8 max-w-4xl mx-auto text-black bg-white" id="printable-report">
        
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest">SIVA</h1>
            <p className="text-sm text-gray-600">Laporan Pemantauan Siklus & Kesehatan</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-sm">Tanggal Cetak:</p>
            <p className="text-sm">{format(new Date(), "d MMMM yyyy", { locale: id })}</p>
          </div>
        </div>

        {/* Ringkasan Siklus */}
        <section className="mb-8">
          <h2 className="text-xl font-bold bg-gray-100 p-2 mb-4 uppercase text-sm">Ringkasan Siklus</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><span className="font-semibold">Rata-rata Durasi Siklus:</span> {settings?.cycleLength} Hari</p>
              <p><span className="font-semibold">Rata-rata Lama Haid:</span> {settings?.periodLength} Hari</p>
            </div>
            <div>
              <p><span className="font-semibold">Hari Pertama Haid Terakhir:</span> {settings?.lastPeriodStart ? format(parseISO(settings.lastPeriodStart), "d MMMM yyyy", { locale: id }) : '-'}</p>
              <p><span className="font-semibold">Prediksi Haid Berikutnya:</span> {info?.nextPeriodDate ? format(parseISO(info.nextPeriodDate), "d MMMM yyyy", { locale: id }) : '-'}</p>
            </div>
          </div>
        </section>

        {/* Health Alerts */}
        {healthAlerts.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold bg-gray-100 p-2 mb-4 uppercase text-sm">Peringatan Medis (Sistem Otomatis)</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              {healthAlerts.map(alert => (
                <li key={alert.id}>
                  <strong>{alert.title}</strong>: {alert.message}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Riwayat Siklus Sebelumnya */}
        {settings?.pastPeriods && settings.pastPeriods.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-bold bg-gray-100 p-2 mb-4 uppercase text-sm">Riwayat Haid 6 Bulan Terakhir</h2>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-2">Tanggal Mulai</th>
                  <th className="py-2 text-right">Perkiraan Jarak (Siklus)</th>
                </tr>
              </thead>
              <tbody>
                {[...settings.pastPeriods]
                  .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                  .slice(0, 6)
                  .map((dateStr, index, arr) => {
                    let length = "-";
                    if (index < arr.length - 1) {
                      const current = new Date(dateStr);
                      const previous = new Date(arr[index + 1]);
                      length = `${Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))} hari`;
                    }
                    return (
                      <tr key={dateStr} className="border-b border-gray-200">
                        <td className="py-2">{format(parseISO(dateStr), "d MMMM yyyy", { locale: id })}</td>
                        <td className="py-2 text-right">{length}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </section>
        )}

        {/* Catatan Jurnal & Gejala */}
        <section>
          <h2 className="text-xl font-bold bg-gray-100 p-2 mb-4 uppercase text-sm">Log Jurnal & Gejala (30 Hari Terakhir)</h2>
          {sortedEntries.length === 0 ? (
            <p className="text-sm italic text-gray-500">Tidak ada catatan jurnal.</p>
          ) : (
            <div className="space-y-4">
              {sortedEntries.slice(0, 30).map(([date, entry]) => (
                <div key={date} className="border-b border-gray-200 pb-3 text-sm">
                  <div className="flex justify-between font-bold mb-1">
                    <span>{format(parseISO(date), "d MMMM yyyy", { locale: id })}</span>
                    <span className="text-gray-500 font-normal">Fase: {entry.cyclePhaseAtEntry}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-800">
                    {entry.symptoms && entry.symptoms.length > 0 && (
                      <p><strong>Gejala:</strong> {entry.symptoms.join(", ")}</p>
                    )}
                    {entry.medications && entry.medications.length > 0 && (
                      <p><strong>Obat:</strong> {entry.medications.join(", ")}</p>
                    )}
                    {entry.mood && (
                      <p><strong>Mood:</strong> {entry.mood}</p>
                    )}
                    {(entry.waterGlasses ?? 0) > 0 && (
                      <p><strong>Air:</strong> {entry.waterGlasses} Gelas</p>
                    )}
                  </div>
                  {entry.notes && (
                    <p className="text-xs mt-1 italic text-gray-600">Catatan: "{entry.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-12 text-center text-xs text-gray-400 border-t border-gray-200 pt-4">
          Dokumen ini dicetak dari Aplikasi SIVA (Siklus Interaktif Vitalitas Wanita). Data di atas merupakan rangkuman pencatatan mandiri pasien.
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          nav {
            display: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
}
