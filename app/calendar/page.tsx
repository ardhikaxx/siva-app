"use client";

import { useState } from "react";
import { useCycleData } from "@/context/CycleContext";
import { useJournal } from "@/hooks/useJournal";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { id } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Droplet, FileText } from "lucide-react";
import { getPhaseForDate, Phase } from "@/lib/cycleUtils";

export default function Calendar() {
  const { settings, info, loading: cycleLoading } = useCycleData();
  const { entries, loading: journalLoading } = useJournal();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  if (cycleLoading || journalLoading) {
    return (
      <div className="min-h-screen bg-brand-50 p-6 flex flex-col pb-24">
        <header className="mb-6 pt-4 flex justify-between items-center">
          <div className="h-8 w-32 bg-brand-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-brand-200 rounded-full animate-pulse"></div>
        </header>

        {/* Calendar Skeleton */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-brand-100 mb-6">
          <div className="h-6 w-48 bg-brand-100 rounded mb-4 mx-auto animate-pulse"></div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-4 w-6 bg-brand-50 rounded mx-auto animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="aspect-square bg-brand-50 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Detail Skeleton */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 h-32 animate-pulse"></div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getPhaseColor = (phase: Phase) => {
    switch (phase) {
      case "menstruasi": return "bg-brand-500 text-white";
      case "folikular": return "bg-blue-400 text-white";
      case "ovulasi": return "bg-purple-500 text-white";
      case "luteal": return "bg-yellow-500 text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPhaseSoftColor = (phase: Phase) => {
    switch (phase) {
      case "menstruasi": return "bg-brand-50 text-brand-700";
      case "folikular": return "bg-blue-50 text-blue-700";
      case "ovulasi": return "bg-purple-50 text-purple-700";
      case "luteal": return "bg-yellow-50 text-yellow-700";
      default: return "bg-gray-50 text-gray-700";
    }
  };

  const selectedDateKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedEntry = selectedDateKey ? entries[selectedDateKey] : null;
  const selectedPhase = selectedDate && settings ? getPhaseForDate(selectedDate, settings) : null;

  return (
    <div className="min-h-screen bg-brand-50 p-6 flex flex-col pb-24">
      <header className="mb-6 pt-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-900">Kalender</h1>
        <button 
          onClick={() => setCurrentDate(new Date())}
          className="text-sm font-semibold text-brand-600 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-brand-100"
        >
          Hari Ini
        </button>
      </header>

      <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-brand-100 mb-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth} className="p-2 bg-brand-50 text-brand-600 rounded-full hover:bg-brand-100">
            <ChevronLeft size={20} />
          </button>
          <h2 className="font-bold text-lg text-brand-900 uppercase tracking-wide">
            {format(currentDate, "MMMM yyyy", { locale: id })}
          </h2>
          <button onClick={nextMonth} className="p-2 bg-brand-50 text-brand-600 rounded-full hover:bg-brand-100">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Days of week */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-brand-400 mb-2">
          <div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div><div>Min</div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, i) => {
            const isSameMnth = isSameMonth(day, monthStart);
            const dateKey = format(day, "yyyy-MM-dd");
            const hasEntry = !!entries[dateKey];
            const phase = settings ? getPhaseForDate(day, settings) : null;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const today = isToday(day);

            let phaseClasses = "";
            if (isSameMnth && phase) {
              // Highlight only actual month days with subtle backgrounds
              phaseClasses = getPhaseSoftColor(phase);
            }

            return (
              <div 
                key={i} 
                onClick={() => setSelectedDate(day)}
                className={`relative p-2 h-12 flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all
                  ${!isSameMnth ? 'opacity-30' : ''} 
                  ${isSelected ? 'ring-2 ring-brand-500 shadow-md transform scale-110 z-10 font-bold bg-white' : phaseClasses}
                  ${today && !isSelected ? 'border-2 border-brand-300' : ''}
                `}
              >
                <span className={`text-sm ${isSelected ? 'text-brand-900' : ''}`}>{format(day, dateFormat)}</span>
                
                {/* Indicators container */}
                <div className="absolute bottom-1 flex gap-0.5">
                  {hasEntry && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                  {entries[dateKey]?.medications && entries[dateKey].medications.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>}
                  {(entries[dateKey]?.waterGlasses ?? 0) >= 8 && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>}
                  {phase === "menstruasi" && isSameMnth && <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <div className="flex items-center text-xs text-gray-600"><div className="w-2.5 h-2.5 rounded-full bg-brand-500 mr-1.5"></div> Menstruasi</div>
        <div className="flex items-center text-xs text-gray-600"><div className="w-2.5 h-2.5 rounded-full bg-blue-400 mr-1.5"></div> Folikular</div>
        <div className="flex items-center text-xs text-gray-600"><div className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5"></div> Ovulasi</div>
        <div className="flex items-center text-xs text-gray-600"><div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1.5"></div> Luteal</div>
      </div>

      {/* Detail for selected date */}
      {selectedDate && selectedPhase && (
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-100 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <h3 className="font-bold text-lg text-brand-900 mb-1 border-b border-brand-50 pb-2">
            {format(selectedDate, "EEEE, d MMMM yyyy", { locale: id })}
          </h3>
          
          <div className="flex items-center mt-3 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getPhaseColor(selectedPhase)}`}>
              Fase {selectedPhase}
            </span>
          </div>

          {selectedEntry ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <FileText size={16} className="text-gray-400 mr-2" />
                <span className="text-sm font-semibold text-gray-700">Jurnal Hari Ini:</span>
              </div>
              
              <div className="bg-brand-50 p-4 rounded-2xl">
                {selectedEntry.mood && (
                  <p className="text-sm mb-1"><span className="font-semibold text-brand-800">Suasana Hati:</span> {selectedEntry.mood}</p>
                )}
                <p className="text-sm mb-1"><span className="font-semibold text-brand-800">Energi:</span> {selectedEntry.energyLevel}/5</p>
                
                {selectedEntry.symptoms && selectedEntry.symptoms.length > 0 && (
                  <div className="mt-2">
                    <span className="font-semibold text-sm text-brand-800 block mb-1">Gejala:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedEntry.symptoms.map(s => (
                        <span key={s} className="bg-white text-xs px-2 py-1 rounded border border-brand-100 text-gray-600">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEntry.medications && selectedEntry.medications.length > 0 && (
                  <div className="mt-2">
                    <span className="font-semibold text-sm text-brand-800 block mb-1">Obat & Suplemen:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedEntry.medications.map(m => (
                        <span key={m} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded border border-blue-100">
                          💊 {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedEntry.waterGlasses ?? 0) > 0 && (
                  <div className="mt-3 flex items-center text-sm font-semibold text-cyan-700 bg-cyan-50 px-3 py-2 rounded-xl border border-cyan-100">
                    💧 Air Minum: {selectedEntry.waterGlasses} Gelas
                  </div>
                )}

                {selectedEntry.notes && (
                  <div className="mt-3 pt-3 border-t border-brand-100">
                    <p className="text-sm italic text-gray-600 whitespace-pre-wrap">{selectedEntry.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">Tidak ada catatan jurnal di tanggal ini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
