"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { useJournal } from "@/hooks/useJournal";
import { useCycleData } from "@/context/CycleContext";
import { FileText, Edit3 } from "lucide-react";
import { useAlert } from "@/context/AlertContext";

const availableSymptoms = [
  "Kram", "Sakit Kepala", "Kembung", "Nyeri Punggung", 
  "Payudara Sensitif", "Mual", "Jerawat", "Kelelahan"
];

const moods = ["Senang", "Tenang", "Biasa", "Cemas", "Sedih", "Mudah Tersinggung"];

export default function Journal() {
  const { entries, saveEntry, getEntry, loading: journalLoading } = useJournal();
  const { info } = useCycleData();
  const { showAlert } = useAlert();
  
  const todayKey = format(new Date(), "yyyy-MM-dd");
  
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState(3);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!journalLoading && activeTab === "form") {
      const todayEntry = getEntry(todayKey);
      if (todayEntry) {
        setTimeout(() => {
          setMood(todayEntry.mood || "");
          setEnergy(todayEntry.energyLevel || 3);
          setSymptoms(todayEntry.symptoms || []);
          setNotes(todayEntry.notes || "");
        }, 0);
      }
    }
  }, [journalLoading, todayKey, getEntry, activeTab]);

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveEntry(todayKey, {
        mood,
        energyLevel: energy,
        symptoms,
        notes,
        cyclePhaseAtEntry: info?.currentPhase || "unknown"
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save journal", error);
      showAlert({
        title: "Gagal Menyimpan",
        text: "Periksa koneksi atau database Anda.",
        type: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (journalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50">
        <div className="w-8 h-8 border-4 border-brand-300 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Mengurutkan entri dari yang paling baru
  const sortedHistory = Object.entries(entries).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="min-h-screen bg-brand-50 p-6 flex flex-col">
      <header className="mb-4 pt-4">
        <h1 className="text-2xl font-bold text-brand-900">Jurnal Anda</h1>
      </header>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm">
        <button 
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex justify-center items-center transition-colors ${activeTab === 'form' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <Edit3 size={16} className="mr-2" /> Isi Jurnal Hari Ini
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold flex justify-center items-center transition-colors ${activeTab === 'history' ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <FileText size={16} className="mr-2" /> Riwayat Jurnal
        </button>
      </div>

      {activeTab === "form" ? (
        <form onSubmit={handleSubmit} className="space-y-6 flex-1 pb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <h2 className="text-sm font-semibold text-brand-900 mb-4">Bagaimana suasana hati Anda?</h2>
            <div className="flex flex-wrap gap-2">
              {moods.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-colors border ${mood === m ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-brand-700 border-brand-200 hover:bg-brand-50'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <h2 className="text-sm font-semibold text-brand-900 mb-4">Tingkat Energi</h2>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={energy} 
              onChange={(e) => setEnergy(parseInt(e.target.value))}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-brand-500 mt-2">
              <span>Sangat Rendah</span>
              <span>Sangat Tinggi</span>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <h2 className="text-sm font-semibold text-brand-900 mb-4">Keluhan Fisik</h2>
            <div className="flex flex-wrap gap-2">
              {availableSymptoms.map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${symptoms.includes(sym) ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <h2 className="text-sm font-semibold text-brand-900 mb-4">Catatan Tambahan</h2>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 rounded-xl bg-brand-50 border-none focus:ring-2 focus:ring-brand-400 outline-none resize-none h-32 text-sm"
              placeholder="Ada yang ingin diceritakan?"
            ></textarea>
          </div>

          <button 
            type="submit"
            disabled={isSaving}
            className={`w-full py-4 rounded-xl font-semibold transition-colors shadow-md text-white ${isSaved ? 'bg-green-500' : 'bg-brand-500 hover:bg-brand-600'} ${isSaving ? 'opacity-70' : ''}`}
          >
            {isSaving ? "Menyimpan..." : isSaved ? "Berhasil Disimpan! ✓" : "Simpan Jurnal"}
          </button>
        </form>
      ) : (
        <div className="flex-1 space-y-4 pb-10">
          {sortedHistory.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-brand-100 mt-4 shadow-sm">
              <FileText size={48} className="text-brand-200 mx-auto mb-4" />
              <h3 className="font-semibold text-brand-900 mb-1">Belum Ada Jurnal</h3>
              <p className="text-sm text-gray-500">Isi jurnal hari ini untuk mulai melacak suasana hati dan keluhan fisik Anda selama siklus.</p>
            </div>
          ) : (
            sortedHistory.map(([date, entry]) => (
              <div key={date} className="bg-white p-5 rounded-2xl shadow-sm border border-brand-100">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-brand-900">{format(parseISO(date), "EEEE, d MMMM", { locale: id })}</p>
                    <span className={`inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-md text-white ${
                      entry.cyclePhaseAtEntry === 'menstruasi' ? 'bg-brand-500' : 
                      entry.cyclePhaseAtEntry === 'folikular' ? 'bg-blue-400' : 
                      entry.cyclePhaseAtEntry === 'ovulasi' ? 'bg-purple-500' : 
                      entry.cyclePhaseAtEntry === 'luteal' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}>
                      Fase {entry.cyclePhaseAtEntry}
                    </span>
                  </div>
                  {entry.mood && (
                    <span className="bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {entry.mood}
                    </span>
                  )}
                </div>
                
                <div className="mb-3 text-xs text-gray-600">
                  <span className="font-medium">Energi:</span> {entry.energyLevel}/5
                </div>

                {entry.symptoms && entry.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {entry.symptoms.map(s => (
                      <span key={s} className="bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded border border-purple-100">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                
                {entry.notes && (
                  <div className="bg-brand-50 p-3 rounded-xl text-sm text-brand-900">
                    <p className="whitespace-pre-wrap">{entry.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
