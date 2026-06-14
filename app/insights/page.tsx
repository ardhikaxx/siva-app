"use client";

import { useJournal } from "@/hooks/useJournal";
import { useCycleData } from "@/context/CycleContext";
import { PieChart as PieChartIcon, Activity, TrendingUp, CalendarDays, AlertTriangle, Info as InfoIcon, Smile } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { id } from "date-fns/locale";
import { analyzeHealth, analyzeCorrelations } from "@/lib/cycleUtils";
import { motion } from "framer-motion";

export default function Insights() {
  const { entries } = useJournal();
  const { settings, info } = useCycleData();

  // Prepare Data for Mood/Energy Chart
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i);
    const key = format(d, "yyyy-MM-dd");
    const entry = entries[key];
    return {
      date: format(d, "dd MMM", { locale: id }),
      energy: entry?.energyLevel || null,
      mood: entry?.mood || "Tidak ada",
      weight: entry?.weight || null,
      sleep: entry?.sleepHours || null,
    };
  });

  // Calculate most common symptoms
  const symptomCounts: Record<string, number> = {};
  Object.values(entries).forEach(entry => {
    if (entry.symptoms) {
      entry.symptoms.forEach((sym: string) => {
        symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
      });
    }
  });

  const topSymptoms = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Calculate mood per phase correlation
  const phaseMoods: Record<string, Record<string, number>> = {
    menstruasi: {},
    folikular: {},
    ovulasi: {},
    luteal: {}
  };

  Object.values(entries).forEach(entry => {
    if (entry.cyclePhaseAtEntry && entry.mood) {
      const phase = entry.cyclePhaseAtEntry;
      const mood = entry.mood;
      if (phaseMoods[phase]) {
        phaseMoods[phase][mood] = (phaseMoods[phase][mood] || 0) + 1;
      }
    }
  });

  const getDominantMood = (phase: string) => {
    const moods = phaseMoods[phase];
    if (Object.keys(moods).length === 0) return null;
    return Object.entries(moods).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  const phaseMoodInsights = [
    { phase: "Menstruasi", mood: getDominantMood("menstruasi"), color: "bg-brand-100 text-brand-700" },
    { phase: "Folikular", mood: getDominantMood("folikular"), color: "bg-blue-100 text-blue-700" },
    { phase: "Ovulasi", mood: getDominantMood("ovulasi"), color: "bg-purple-100 text-purple-700" },
    { phase: "Luteal", mood: getDominantMood("luteal"), color: "bg-yellow-100 text-yellow-700" },
  ].filter(item => item.mood);
    
  // Analyze Health
  const healthAlerts = analyzeHealth(settings, entries);

  return (
    <div className="min-h-screen bg-brand-50 p-6 pb-24 overflow-x-hidden">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 pt-4 flex justify-between items-start"
      >
        <div>
          <h1 className="text-2xl font-bold text-brand-900">Wawasan & Analitik</h1>
          <p className="text-brand-600 text-sm">Pahami pola tubuh dan siklusmu</p>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            // Check if router exists, else fallback to window.location (router requires import which we might need to add if not present)
            window.location.href = '/report';
          }}
          className="bg-brand-500 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-sm flex items-center hover:bg-brand-600 transition-colors"
        >
          Cetak PDF
        </motion.button>
      </motion.header>

      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
      >
        {/* Health SOS Alerts */}
        {healthAlerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {healthAlerts.map(alert => (
              <motion.div 
                variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                key={alert.id} 
                className={`p-4 rounded-2xl border ${
                  alert.severity === 'danger' ? 'bg-red-50 border-red-200' :
                  alert.severity === 'warning' ? 'bg-orange-50 border-orange-200' :
                  'bg-blue-50 border-blue-200'
                } flex items-start shadow-sm`}
              >
                <div className="mr-3 mt-0.5">
                  {alert.severity === 'danger' && <AlertTriangle size={20} className="text-red-500" />}
                  {alert.severity === 'warning' && <AlertTriangle size={20} className="text-orange-500" />}
                  {alert.severity === 'info' && <InfoIcon size={20} className="text-blue-500" />}
                </div>
                <div>
                  <h3 className={`text-sm font-bold ${
                    alert.severity === 'danger' ? 'text-red-900' :
                    alert.severity === 'warning' ? 'text-orange-900' :
                    'text-blue-900'
                  }`}>{alert.title}</h3>
                  <p className={`text-xs mt-1 leading-relaxed ${
                    alert.severity === 'danger' ? 'text-red-700' :
                    alert.severity === 'warning' ? 'text-orange-800' :
                    'text-blue-800'
                  }`}>{alert.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Advanced Correlations */}
        {(() => {
          const correlations = analyzeCorrelations(entries);
          if (correlations.length > 0) {
            return (
              <div className="mb-8 space-y-3">
                <h2 className="text-sm font-bold text-brand-900 mb-2 px-1">✨ Korelasi Cerdas SIVA</h2>
                {correlations.map(insight => (
                  <motion.div 
                    variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}
                    key={insight.id} 
                    className={`p-4 rounded-2xl border ${
                      insight.type === 'positive' ? 'bg-green-50 border-green-200' :
                      insight.type === 'negative' ? 'bg-orange-50 border-orange-200' :
                      'bg-blue-50 border-blue-200'
                    } flex items-start shadow-sm`}
                  >
                    <div className="mr-3 mt-0.5">
                      {insight.type === 'positive' && <Smile size={20} className="text-green-500" />}
                      {insight.type === 'negative' && <AlertTriangle size={20} className="text-orange-500" />}
                      {insight.type === 'info' && <InfoIcon size={20} className="text-blue-500" />}
                    </div>
                    <div>
                      <h3 className={`text-sm font-bold ${
                        insight.type === 'positive' ? 'text-green-900' :
                        insight.type === 'negative' ? 'text-orange-900' :
                        'text-blue-900'
                      }`}>{insight.title}</h3>
                      <p className={`text-xs mt-1 leading-relaxed ${
                        insight.type === 'positive' ? 'text-green-800' :
                        insight.type === 'negative' ? 'text-orange-800' :
                        'text-blue-800'
                      }`}>{insight.message}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            );
          }
          return null;
        })()}

        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center mb-2">
              <CalendarDays size={20} />
            </div>
            <p className="text-xs text-brand-600 mb-1">Rata-Rata Siklus</p>
            <p className="text-xl font-bold text-brand-900">{settings?.cycleLength || 28} Hari</p>
            {info?.isSmartPrediction && (
              <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1">Disesuaikan</span>
            )}
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100 flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center mb-2">
              <Activity size={20} />
            </div>
            <p className="text-xs text-brand-600 mb-1">Durasi Menstruasi</p>
            <p className="text-xl font-bold text-brand-900">{settings?.periodLength || 5} Hari</p>
          </motion.div>
        </div>

        {/* Energy Chart */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 mb-6">
          <div className="flex items-center mb-4">
            <TrendingUp size={20} className="text-brand-500 mr-2" />
            <h2 className="font-bold text-brand-900">Tren Energi 7 Hari Terakhir</h2>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#fecdd3" />
                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#fda4af'}} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{fontSize: 10, fill: '#fda4af'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#881028' }}
                />
                <Line type="monotone" dataKey="energy" name="Level Energi" stroke="#fa3c61" strokeWidth={3} dot={{r: 4, fill: '#fa3c61', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Weight and Sleep Chart */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100">
            <div className="flex items-center mb-4">
              <Activity size={20} className="text-blue-500 mr-2" />
              <h2 className="font-bold text-brand-900">Berat Badan (Kg)</h2>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={last7Days} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line type="monotone" dataKey="weight" name="Berat (Kg)" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100">
            <div className="flex items-center mb-4">
              <Activity size={20} className="text-indigo-500 mr-2" />
              <h2 className="font-bold text-brand-900">Durasi Tidur (Jam)</h2>
            </div>
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last7Days} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 12]} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="sleep" name="Tidur (Jam)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Symptoms Bar Chart */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 mb-6">
          <div className="flex items-center mb-4">
            <PieChartIcon size={20} className="text-brand-500 mr-2" />
            <h2 className="font-bold text-brand-900">Gejala Paling Sering</h2>
          </div>
          
          {topSymptoms.length > 0 ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSymptoms} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#fecdd3" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fontSize: 10, fill: '#881028'}} axisLine={false} tickLine={false} width={100} />
                  <Tooltip 
                    cursor={{fill: '#ffe3e8'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" name="Frekuensi" fill="#ff6f8c" radius={[0, 8, 8, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-brand-400 text-sm">Belum ada data gejala yang dicatat di jurnal.</p>
            </div>
          )}
        </motion.div>

        {/* Mood Correlation Chart/Cards */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 mb-6">
          <div className="flex items-center mb-4">
            <Smile size={20} className="text-brand-500 mr-2" />
            <h2 className="font-bold text-brand-900">Korelasi Suasana Hati</h2>
          </div>
          
          {phaseMoodInsights.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 mb-2">Suasana hati yang paling dominan di setiap fase berdasarkan catatan Anda:</p>
              {phaseMoodInsights.map((insight) => (
                <div key={insight.phase} className="flex justify-between items-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-sm font-semibold text-gray-700">Fase {insight.phase}</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${insight.color}`}>
                    {insight.mood}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-brand-400 text-sm">Belum cukup data suasana hati untuk dianalisis.</p>
            </div>
          )}
        </motion.div>

        {/* Cycle History Table */}
        {settings?.pastPeriods && settings.pastPeriods.length > 0 && (
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 mb-6">
            <div className="flex items-center mb-4">
              <CalendarDays size={20} className="text-brand-500 mr-2" />
              <h2 className="font-bold text-brand-900">Riwayat Siklus Lengkap</h2>
            </div>
            
            <div className="overflow-hidden rounded-xl border border-brand-50">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-50 text-brand-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Mulai Haid</th>
                    <th className="px-4 py-3 font-semibold text-right">Durasi Siklus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-50">
                  {[...settings.pastPeriods]
                    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                    .map((dateStr, index, arr) => {
                      let length = "-";
                      if (index < arr.length - 1) {
                        const current = new Date(dateStr);
                        const previous = new Date(arr[index + 1]);
                        length = `${Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24))} hari`;
                      }
                      return (
                        <tr key={dateStr} className="hover:bg-brand-50/50 transition-colors">
                          <td className="px-4 py-3 text-brand-900">{format(parseISO(dateStr), "d MMMM yyyy", { locale: id })}</td>
                          <td className="px-4 py-3 text-right font-medium text-brand-700">{length}</td>
                        </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
