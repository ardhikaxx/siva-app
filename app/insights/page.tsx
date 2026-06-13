"use client";

import { useJournal } from "@/hooks/useJournal";
import { useCycleData } from "@/context/CycleContext";
import { PieChart as PieChartIcon, Activity, TrendingUp, CalendarDays } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { id } from "date-fns/locale";

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
    };
  });

  // Calculate most common symptoms
  const symptomCounts: Record<string, number> = {};
  Object.values(entries).forEach(entry => {
    if (entry.symptoms) {
      entry.symptoms.forEach(sym => {
        symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
      });
    }
  });

  const topSymptoms = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-brand-50 p-6 pb-24">
      <header className="mb-8 pt-4">
        <h1 className="text-2xl font-bold text-brand-900">Wawasan & Analitik</h1>
        <p className="text-brand-600 text-sm">Pahami pola tubuh dan siklusmu</p>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center mb-2">
            <CalendarDays size={20} />
          </div>
          <p className="text-xs text-brand-600 mb-1">Rata-Rata Siklus</p>
          <p className="text-xl font-bold text-brand-900">{settings?.cycleLength || 28} Hari</p>
          {info?.isSmartPrediction && (
            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full mt-1">Disesuaikan</span>
          )}
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100 flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 bg-brand-100 text-brand-500 rounded-full flex items-center justify-center mb-2">
            <Activity size={20} />
          </div>
          <p className="text-xs text-brand-600 mb-1">Durasi Menstruasi</p>
          <p className="text-xl font-bold text-brand-900">{settings?.periodLength || 5} Hari</p>
        </div>
      </div>

      {/* Energy Chart */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 mb-6">
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
      </div>

      {/* Symptoms Bar Chart */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 mb-6">
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
      </div>

    </div>
  );
}
