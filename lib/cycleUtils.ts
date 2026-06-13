import { addDays, differenceInDays, isBefore, startOfDay, parseISO, formatISO } from "date-fns";

export type Phase = "menstruasi" | "folikular" | "ovulasi" | "luteal";

export interface CycleSettings {
  lastPeriodStart: string; // ISO Date String
  cycleLength: number;
  periodLength: number;
}

export interface CycleInfo {
  cycleDayToday: number;
  currentPhase: Phase;
  nextPeriodDate: string; // ISO Date String
  fertileWindowStart: string; // ISO Date String
  fertileWindowEnd: string; // ISO Date String
  ovulationDate: string; // ISO Date String
  daysUntilNextPeriod: number;
}

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
  const { lastPeriodStart, cycleLength, periodLength } = settings;
  const today = startOfDay(new Date());
  const lastPeriodDate = startOfDay(parseISO(lastPeriodStart));
  
  const daysSinceLastPeriod = differenceInDays(today, lastPeriodDate);
  const cycleDayToday = (daysSinceLastPeriod % cycleLength) + 1;
  
  const ovulationDay = cycleLength - 14;
  const currentPhase = getPhaseForDate(today, settings);
  
  const currentCycleStart = addDays(lastPeriodDate, Math.floor(daysSinceLastPeriod / cycleLength) * cycleLength);
  
  const nextPeriodDateObj = addDays(currentCycleStart, cycleLength);
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
    daysUntilNextPeriod
  };
};
