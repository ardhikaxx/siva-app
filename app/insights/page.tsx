"use client";

import { useJournal } from "@/hooks/useJournal";
import { useCycleData } from "@/context/CycleContext";
import { PieChart as PieChartIcon, Activity, TrendingUp, CalendarDays, AlertTriangle, Info as InfoIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { format, parseISO, subDays } from "date-fns";
import { id } from "date-fns/locale";
import { analyzeHealth } from "@/lib/cycleUtils";

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
      entry.symptoms.forEach((sym: string) => {
        symptomCounts[sym] = (symptomCounts[sym] || 0) + 1;
      });
    }
  });

  const topSymptoms = Object.entries(symptomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  // Analyze Health
  const healthAlerts = analyzeHealth(settings, entries);

  return (
    <div className="min-h-screen bg-brand-50 p-6 pb-24">
      <header className="mb-8 pt-4">
        <h1 className="text-2xl font-bold text-brand-900">Wawasan & Analitik</h1>
        <p className="text-brand-600 text-sm">Pahami pola tubuh dan siklusmu</p>
      </header>

      {/* Health SOS Alerts */}
      {healthAlerts.length > 0 && (
        <div className="mb-8 space-y-3">
          {healthAlerts.map(alert => (
            <div 
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
            </div>
          ))}
        </div>
      )}

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

      {/* Cycle History Table */}
      {settings?.pastPeriods && settings.pastPeriods.length > 0 && (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 mb-6">
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
        </div>
      )}

    </div>
  );
}
