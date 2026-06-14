"use client";

import { useState, useEffect } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { useJournal } from "@/hooks/useJournal";
import { useCycleData } from "@/context/CycleContext";
import { FileText, Edit3 } from "lucide-react";
import { useAlert } from "@/context/AlertContext";
import { motion } from "framer-motion";

const baseSymptoms = [
  "Kram", "Sakit Kepala", "Kembung", "Nyeri Punggung", 
  "Payudara Sensitif", "Mual", "Jerawat", "Kelelahan"
];

const pcosSymptoms = [
  "Jerawat Parah", "Hirsutisme (Rambut Berlebih)", "Kelelahan Ekstrem", 
  "Gula Darah Tinggi", "Nyeri Panggul", "Rambut Rontok", "Kram", "Kembung"
];

const endoSymptoms = [
  "Nyeri Panggul Kronis", "Nyeri Saat BAB/BAK", "Nyeri Punggung Bawah Menjalar", 
  "Mual & Muntah", "Bercak Darah (Spotting)", "Kram Sangat Hebat", "Kelelahan"
];

const availableMedications = [
  "Pereda Nyeri", "Suplemen Zat Besi", "Pil KB", "Vitamin", "Obat Lain"
];

const moods = ["Senang", "Tenang", "Biasa", "Cemas", "Sedih", "Mudah Tersinggung"];

export default function Journal() {
  const { entries, saveEntry, getEntry, loading: journalLoading } = useJournal();
  const { info, settings } = useCycleData();
  const { showAlert } = useAlert();
  
  const todayKey = format(new Date(), "yyyy-MM-dd");
  
  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState(3);
  const [painLevel, setPainLevel] = useState(1);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [medications, setMedications] = useState<string[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [temperature, setTemperature] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [sleepHours, setSleepHours] = useState<number | ''>('');
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
          setPainLevel(todayEntry.painLevel || 1);
          setSymptoms(todayEntry.symptoms || []);
          setMedications(todayEntry.medications || []);
          setWaterGlasses(todayEntry.waterGlasses || 0);
          setTemperature(todayEntry.temperature || '');
          setWeight(todayEntry.weight || '');
          setSleepHours(todayEntry.sleepHours || '');
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

  const toggleMedication = (medication: string) => {
    setMedications(prev => 
      prev.includes(medication) 
        ? prev.filter(m => m !== medication)
        : [...prev, medication]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await saveEntry(todayKey, {
        mood,
        energyLevel: energy,
        painLevel: painLevel,
        symptoms,
        medications,
        waterGlasses,
        temperature: typeof temperature === 'number' ? temperature : undefined,
        weight: typeof weight === 'number' ? weight : undefined,
        sleepHours: typeof sleepHours === 'number' ? sleepHours : undefined,
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
      <div className="min-h-screen bg-brand-50 p-6 flex flex-col">
        <header className="mb-4 pt-4">
          <div className="h-8 w-40 bg-brand-200 rounded animate-pulse"></div>
        </header>

        {/* Tabs Skeleton */}
        <div className="flex bg-white rounded-xl p-1 mb-6 shadow-sm">
          <div className="flex-1 py-4 bg-brand-100 rounded-lg animate-pulse mr-1"></div>
          <div className="flex-1 py-4 bg-gray-100 rounded-lg animate-pulse"></div>
        </div>

        {/* Form Skeleton */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100 h-32 animate-pulse"></div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100 h-24 animate-pulse"></div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100 h-40 animate-pulse"></div>
        </div>
      </div>
    );
  }

  const activeSymptoms = settings?.syndromeMode === 'pcos' ? pcosSymptoms : 
                         settings?.syndromeMode === 'endometriosis' ? endoSymptoms : 
                         baseSymptoms;

  // Mengurutkan entri dari yang paling baru
  const sortedHistory = Object.entries(entries).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="min-h-screen bg-brand-50 p-6 flex flex-col pb-24 overflow-x-hidden">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 pt-4"
      >
        <h1 className="text-2xl font-bold text-brand-900">Jurnal Anda</h1>
      </motion.header>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex bg-white rounded-xl p-1 mb-6 shadow-sm relative z-10"
      >
        <button 
          onClick={() => setActiveTab("form")}
          className={`relative flex-1 py-2.5 rounded-lg text-sm font-semibold flex justify-center items-center transition-colors ${activeTab === 'form' ? 'text-brand-700' : 'text-gray-500 hover:text-brand-500'}`}
        >
          {activeTab === 'form' && (
            <motion.div layoutId="journalTab" className="absolute inset-0 bg-brand-100 rounded-lg -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
          )}
          <Edit3 size={16} className="mr-2" /> Isi Jurnal Hari Ini
        </button>
        <button 
          onClick={() => setActiveTab("history")}
          className={`relative flex-1 py-2.5 rounded-lg text-sm font-semibold flex justify-center items-center transition-colors ${activeTab === 'history' ? 'text-brand-700' : 'text-gray-500 hover:text-brand-500'}`}
        >
          {activeTab === 'history' && (
            <motion.div layoutId="journalTab" className="absolute inset-0 bg-brand-100 rounded-lg -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
          )}
          <FileText size={16} className="mr-2" /> Riwayat Jurnal
        </button>
      </motion.div>

      {activeTab === "form" ? (
        <motion.form 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
          }}
          onSubmit={handleSubmit} 
          className="space-y-6 flex-1 pb-10"
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <h2 className="text-sm font-semibold text-brand-900 mb-4">Bagaimana suasana hati Anda?</h2>
            <div className="flex flex-wrap gap-2">
              {moods.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`py-2 px-4 rounded-xl text-sm font-medium transition-colors border ${mood === m ? 'bg-brand-500 text-white border-brand-500 shadow-md' : 'bg-white text-brand-700 border-brand-200 hover:bg-brand-50'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
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
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-brand-900">Intensitas Nyeri (Skala 1-10)</h2>
              <span className={`text-xs font-bold px-2 py-1 rounded-full transition-colors ${
                painLevel <= 3 ? 'bg-green-100 text-green-700' :
                painLevel <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>Level {painLevel}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={painLevel} 
              onChange={(e) => setPainLevel(parseInt(e.target.value))}
              className={`w-full transition-colors ${
                painLevel <= 3 ? 'accent-green-500' :
                painLevel <= 7 ? 'accent-yellow-500' : 'accent-red-500'
              }`}
            />
            <div className="flex justify-between text-xs text-brand-500 mt-2">
              <span>Ringan</span>
              <span>Sedang</span>
              <span>Sangat Parah</span>
            </div>
          </motion.div>
          
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <h2 className="text-sm font-semibold text-brand-900 mb-4 flex items-center">
              Keluhan Fisik 
              {settings?.syndromeMode === 'pcos' && <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase">Mode PCOS</span>}
              {settings?.syndromeMode === 'endometriosis' && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase">Mode Endometriosis</span>}
            </h2>
            <div className="flex flex-wrap gap-2">
              {activeSymptoms.map(sym => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => toggleSymptom(sym)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${symptoms.includes(sym) ? 'bg-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {sym}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <h2 className="text-sm font-semibold text-brand-900 mb-4 flex items-center">🌡️ Metrik Fisik Harian</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-brand-600 font-medium block mb-2">Suhu Basal Tubuh (°C)</label>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="Contoh: 36.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-brand-50 border-none rounded-xl text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400 font-medium text-sm transition-shadow"
                />
              </div>
              <div>
                <label className="text-xs text-brand-600 font-medium block mb-2">Berat Badan (Kg)</label>
                <input 
                  type="number"
                  step="0.1"
                  placeholder="Contoh: 55.2"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-brand-50 border-none rounded-xl text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400 font-medium text-sm transition-shadow"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="text-xs text-brand-600 font-medium block mb-2">Waktu Tidur (Jam)</label>
                <input 
                  type="number"
                  step="0.5"
                  placeholder="Contoh: 7.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full px-4 py-3 bg-brand-50 border-none rounded-xl text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400 font-medium text-sm transition-shadow"
                />
              </div>
            </div>
            <p className="text-[10px] text-brand-500 mt-3 ml-1">Suhu tubuh basal (BBT) sangat berguna untuk melacak ovulasi. Durasi tidur memengaruhi keseimbangan hormon.</p>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <h2 className="text-sm font-semibold text-brand-900 mb-4">Catatan Tambahan</h2>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-4 rounded-xl bg-brand-50 border-none focus:ring-2 focus:ring-brand-400 outline-none resize-none h-32 text-sm transition-shadow"
              placeholder="Ada yang ingin diceritakan?"
            ></textarea>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <h2 className="text-sm font-semibold text-brand-900 mb-4">Obat & Suplemen</h2>
            <div className="flex flex-wrap gap-2">
              {availableMedications.map(med => (
                <button
                  key={med}
                  type="button"
                  onClick={() => toggleMedication(med)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${medications.includes(med) ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {med}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-6 rounded-3xl shadow-sm border border-brand-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-brand-900">Konsumsi Air</h2>
              <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded-full">{waterGlasses} / 8 Gelas</span>
            </div>
            <div className="flex items-center space-x-4">
              <motion.button 
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xl"
              >-</motion.button>
              <div className="flex-1 flex justify-center gap-1">
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div 
                    initial={false}
                    animate={{ height: i < waterGlasses ? 24 : 16 }}
                    key={i} 
                    className={`w-4 rounded-b-md transition-colors ${i < waterGlasses ? 'bg-blue-400' : 'bg-gray-100'}`}
                  ></motion.div>
                ))}
              </div>
              <motion.button 
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => setWaterGlasses(waterGlasses + 1)}
                className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-xl"
              >+</motion.button>
            </div>
          </motion.div>

          <motion.button 
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSaving}
            className={`w-full py-4 rounded-xl font-semibold transition-colors shadow-md text-white ${isSaved ? 'bg-green-500' : 'bg-brand-500 hover:bg-brand-600'} ${isSaving ? 'opacity-70' : ''}`}
          >
            {isSaving ? "Menyimpan..." : isSaved ? "Berhasil Disimpan! ✓" : "Simpan Jurnal"}
          </motion.button>
        </motion.form>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="flex-1 space-y-4 pb-10"
        >
          {sortedHistory.length === 0 ? (
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }} className="bg-white rounded-3xl p-8 text-center border border-brand-100 mt-4 shadow-sm">
              <FileText size={48} className="text-brand-200 mx-auto mb-4" />
              <h3 className="font-semibold text-brand-900 mb-1">Belum Ada Jurnal</h3>
              <p className="text-sm text-gray-500">Isi jurnal hari ini untuk mulai melacak suasana hati dan keluhan fisik Anda selama siklus.</p>
            </motion.div>
          ) : (
            sortedHistory.map(([date, entry]) => (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} key={date} className="bg-white p-5 rounded-2xl shadow-sm border border-brand-100">
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
                
                <div className="mb-3 text-xs text-gray-600 flex gap-4">
                  <span><span className="font-medium">Energi:</span> {entry.energyLevel}/5</span>
                  {entry.painLevel ? (
                    <span><span className="font-medium">Nyeri:</span> Level {entry.painLevel}/10</span>
                  ) : null}
                </div>

                {entry.symptoms && entry.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {entry.symptoms.map((s: string) => (
                      <span key={s} className="bg-purple-50 text-purple-700 text-[10px] px-2 py-0.5 rounded border border-purple-100">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                
                {entry.medications && entry.medications.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {entry.medications.map((m: string) => (
                      <span key={m} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-0.5 rounded border border-blue-100">
                        💊 {m}
                      </span>
                    ))}
                  </div>
                )}

                {(entry.waterGlasses ?? 0) > 0 && (
                  <div className="flex items-center text-xs text-blue-600 font-medium mb-3">
                    💧 {entry.waterGlasses} Gelas Air
                  </div>
                )}

                {(entry.temperature || entry.weight) && (
                  <div className="flex items-center gap-4 text-xs font-bold text-brand-700 mb-3 bg-brand-50 p-2 rounded-xl border border-brand-100">
                    {entry.temperature && <span>🌡️ {entry.temperature} °C</span>}
                    {entry.weight && <span>⚖️ {entry.weight} kg</span>}
                  </div>
                )}
                
                {entry.notes && (
                  <div className="bg-brand-50 p-3 rounded-xl text-sm text-brand-900">
                    <p className="whitespace-pre-wrap">{entry.notes}</p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
