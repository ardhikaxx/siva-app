"use client";

import React from "react";
import { Phase } from "@/lib/cycleUtils";
import { motion } from "framer-motion";

interface CycleWheelProps {
  cycleLength: number;
  periodLength: number;
  currentDay: number;
  currentPhase: Phase;
}

export default function CycleWheel({ cycleLength, periodLength, currentDay, currentPhase }: CycleWheelProps) {
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 24;
  
  const ovulationDay = cycleLength - 14;

  const getPhaseColor = (phase: Phase) => {
    switch (phase) {
      case "menstruasi": return "var(--color-phase-menstruasi)";
      case "folikular": return "var(--color-phase-folikular)";
      case "ovulasi": return "var(--color-phase-ovulasi)";
      case "luteal": return "var(--color-phase-luteal)";
      default: return "#ddd";
    }
  };

  const calculateDashArray = (days: number) => {
    return (days / cycleLength) * circumference;
  };

  const getOffset = (startDay: number) => {
    return circumference - ((startDay - 1) / cycleLength) * circumference;
  };

  // Phase ranges
  const phases = [
    { name: "menstruasi" as Phase, start: 1, days: periodLength },
    { name: "folikular" as Phase, start: periodLength + 1, days: ovulationDay - 2 - periodLength },
    { name: "ovulasi" as Phase, start: ovulationDay - 1, days: 3 },
    { name: "luteal" as Phase, start: ovulationDay + 2, days: cycleLength - (ovulationDay + 1) },
  ];

  const currentAngle = ((currentDay - 1) / cycleLength) * 360;

  return (
    <div className="relative flex justify-center items-center p-4">
      <svg width={300} height={300} viewBox="0 0 300 300" className="transform -rotate-90">
        {phases.map((phase, idx) => {
          const dash = calculateDashArray(phase.days);
          const gap = circumference - dash;
          const offset = getOffset(phase.start);
          return (
            <circle
              key={idx}
              cx="150"
              cy="150"
              r={radius}
              fill="transparent"
              stroke={getPhaseColor(phase.name)}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="opacity-80"
            />
          );
        })}
        
        {/* Indicator for current day */}
        <motion.circle
          cx="150"
          cy="150"
          r={radius}
          fill="transparent"
          stroke="#fff"
          strokeWidth={strokeWidth + 4}
          strokeDasharray={`4 ${circumference - 4}`}
          strokeDashoffset={getOffset(currentDay)}
          className="drop-shadow-md"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: getOffset(currentDay) }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-sm font-medium text-brand-600 uppercase tracking-wider mb-1">Hari Ke</span>
        <span className="text-5xl font-bold text-brand-900">{currentDay}</span>
        <span className="text-xs font-semibold px-3 py-1 rounded-full mt-2 capitalize text-white" style={{ backgroundColor: getPhaseColor(currentPhase) }}>
          Fase {currentPhase}
        </span>
      </div>
    </div>
  );
}
