import { addDays, differenceInDays, isBefore, startOfDay, parseISO, formatISO } from "date-fns";

export type Phase = "menstruasi" | "folikular" | "ovulasi" | "luteal";

export interface CycleSettings {
  lastPeriodStart: string; // ISO Date String
  cycleLength: number;
  periodLength: number;
  pastPeriods?: string[]; // Array of ISO Date Strings (e.g. ['2023-01-01', '2023-01-29', '2023-02-27'])
  isSmartPrediction?: boolean; // Flag if we are using calculated average
}

export interface CycleInfo {
  cycleDayToday: number;
  currentPhase: Phase;
  nextPeriodDate: string; // ISO Date String
  fertileWindowStart: string; // ISO Date String
  fertileWindowEnd: string; // ISO Date String
  ovulationDate: string; // ISO Date String
  daysUntilNextPeriod: number;
  isSmartPrediction: boolean;
}

// Helper to calculate average cycle length based on past periods
export const calculateAverageCycleLength = (pastPeriods: string[], fallbackLength: number): number => {
  if (!pastPeriods || pastPeriods.length < 2) return fallbackLength;
  
  // Sort dates chronologically
  const sortedDates = [...pastPeriods]
    .map(d => startOfDay(parseISO(d)))
    .sort((a, b) => a.getTime() - b.getTime());
    
  let totalDays = 0;
  let count = 0;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const diff = differenceInDays(sortedDates[i], sortedDates[i-1]);
    // Only count reasonable cycle lengths to avoid skewing average from missed logs
    if (diff >= 20 && diff <= 45) {
      totalDays += diff;
      count++;
    }
  }
  
  if (count === 0) return fallbackLength;
  return Math.round(totalDays / count);
};

export const getPhaseForDate = (date: Date, settings: CycleSettings): Phase => {
  const { lastPeriodStart, cycleLength, periodLength } = settings;
  const targetDate = startOfDay(date);
  const lastPeriodDate = startOfDay(parseISO(lastPeriodStart));
  
  const daysSinceLastPeriod = differenceInDays(targetDate, lastPeriodDate);
  
  // If the date is before the last period start, we can't accurately predict without history
  // but for simplicity, we extrapolate backwards or just handle positive days
  let cycleDay = (daysSinceLastPeriod % cycleLength) + 1;
  if (cycleDay <= 0) {
    cycleDay = cycleLength + cycleDay;
  }
  
  const ovulationDay = cycleLength - 14;
  
  if (cycleDay >= 1 && cycleDay <= periodLength) return "menstruasi";
  if (cycleDay > periodLength && cycleDay <= ovulationDay - 2) return "folikular";
  if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) return "ovulasi";
  return "luteal";
};

export const calculateCycleInfo = (settings: CycleSettings): CycleInfo => {
  const { lastPeriodStart, periodLength, pastPeriods } = settings;
  
  // Apply smart prediction if history exists
  let effectiveCycleLength = settings.cycleLength;
  let isSmartPrediction = false;
  
  if (pastPeriods && pastPeriods.length >= 2) {
    const avg = calculateAverageCycleLength(pastPeriods, settings.cycleLength);
    if (avg !== settings.cycleLength) {
      effectiveCycleLength = avg;
      isSmartPrediction = true;
    }
  }
  
  const today = startOfDay(new Date());
  const lastPeriodDate = startOfDay(parseISO(lastPeriodStart));
  
  const daysSinceLastPeriod = differenceInDays(today, lastPeriodDate);
  const cycleDayToday = (daysSinceLastPeriod % effectiveCycleLength) + 1;
  
  const ovulationDay = effectiveCycleLength - 14;
  const currentPhase = getPhaseForDate(today, { ...settings, cycleLength: effectiveCycleLength });
  
  const currentCycleStart = addDays(lastPeriodDate, Math.floor(daysSinceLastPeriod / effectiveCycleLength) * effectiveCycleLength);
  
  const nextPeriodDateObj = addDays(currentCycleStart, effectiveCycleLength);
  const ovulationDateObj = addDays(currentCycleStart, ovulationDay - 1);
  const fertileWindowStartObj = addDays(currentCycleStart, ovulationDay - 5);
  const fertileWindowEndObj = addDays(currentCycleStart, ovulationDay);

  const daysUntilNextPeriod = differenceInDays(nextPeriodDateObj, today);

  return {
    cycleDayToday,
    currentPhase,
    nextPeriodDate: formatISO(nextPeriodDateObj, { representation: 'date' }),
    ovulationDate: formatISO(ovulationDateObj, { representation: 'date' }),
    fertileWindowStart: formatISO(fertileWindowStartObj, { representation: 'date' }),
    fertileWindowEnd: formatISO(fertileWindowEndObj, { representation: 'date' }),
    daysUntilNextPeriod,
    isSmartPrediction
  };
};
