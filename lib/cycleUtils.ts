import { addDays, differenceInDays, isBefore, startOfDay, parseISO, formatISO, subDays } from "date-fns";

export type Phase = "menstruasi" | "folikular" | "ovulasi" | "luteal";

export interface CycleSettings {
  lastPeriodStart: string; // ISO Date String
  cycleLength: number;
  periodLength: number;
  pastPeriods?: string[]; // Array of ISO Date Strings
  isSmartPrediction?: boolean; // Flag if we are using calculated average
  padInventory?: number; // Stock of sanitary pads
  themeColor?: "peach" | "matcha" | "ocean" | "cyberpunk" | "lavender";
  pillReminderTime?: string; // Format: "HH:mm"
  syndromeMode?: "none" | "pcos" | "endometriosis";
  userMode?: "normal" | "ttc" | "pregnancy" | "contraception";
  pregnancyDueDate?: string; // ISO Date String
  contraceptionType?: "pill" | "iud" | "implant" | "injection" | "none";
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
  pregnancyWeek?: number;
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
  const { lastPeriodStart, cycleLength, periodLength, userMode } = settings;
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
  const { lastPeriodStart, periodLength, pastPeriods, userMode, pregnancyDueDate } = settings;
  
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

  let pregnancyWeek = undefined;
  if (userMode === "pregnancy" && pregnancyDueDate) {
    // 40 weeks total, calculate backwards from due date
    const dueDateObj = startOfDay(parseISO(pregnancyDueDate));
    const conceptionDateObj = subDays(dueDateObj, 280); // roughly 40 weeks
    const daysPregnant = differenceInDays(today, conceptionDateObj);
    pregnancyWeek = Math.max(1, Math.min(42, Math.floor(daysPregnant / 7) + 1));
  }

  return {
    cycleDayToday,
    currentPhase,
    nextPeriodDate: formatISO(nextPeriodDateObj, { representation: 'date' }),
    ovulationDate: formatISO(ovulationDateObj, { representation: 'date' }),
    fertileWindowStart: formatISO(fertileWindowStartObj, { representation: 'date' }),
    fertileWindowEnd: formatISO(fertileWindowEndObj, { representation: 'date' }),
    daysUntilNextPeriod,
    isSmartPrediction,
    pregnancyWeek
  };
};

export interface HealthAlert {
  id: string;
  title: string;
  message: string;
  severity: "warning" | "danger" | "info";
}

export const analyzeHealth = (
  settings: CycleSettings | null, 
  entries: Record<string, { symptoms?: string[], energyLevel?: number, cyclePhaseAtEntry?: string, mood?: string }>
): HealthAlert[] => {
  if (!settings) return [];
  
  const alerts: HealthAlert[] = [];
  const { pastPeriods, periodLength, cycleLength } = settings;

  // 1. Check for extreme cycle lengths
  if (pastPeriods && pastPeriods.length >= 2) {
    const sortedDates = [...pastPeriods]
      .map(d => startOfDay(parseISO(d)))
      .sort((a, b) => a.getTime() - b.getTime());
      
    let hasShortCycle = false;
    let hasLongCycle = false;
    let extremeVariation = false;

    for (let i = 1; i < sortedDates.length; i++) {
      const diff = differenceInDays(sortedDates[i], sortedDates[i-1]);
      if (diff < 21) hasShortCycle = true;
      if (diff > 35 && diff < 60) hasLongCycle = true; // > 60 might just be missed logging
      
      if (i > 1) {
        const prevDiff = differenceInDays(sortedDates[i-1], sortedDates[i-2]);
        if (Math.abs(diff - prevDiff) > 10 && prevDiff < 60 && diff < 60) {
          extremeVariation = true;
        }
      }
    }

    if (hasShortCycle) {
      alerts.push({
        id: "short_cycle",
        title: "Siklus Terlalu Singkat",
        message: "SIVA mendeteksi siklus Anda kurang dari 21 hari akhir-akhir ini. Jika ini terus berlanjut, disarankan untuk berkonsultasi dengan dokter untuk memeriksa hormon Anda.",
        severity: "warning"
      });
    }

    if (hasLongCycle) {
      alerts.push({
        id: "long_cycle",
        title: "Siklus Memanjang",
        message: "Siklus menstruasi Anda terpantau lebih dari 35 hari. Ini bisa dipicu oleh stres, kelelahan ekstrim, atau kondisi seperti PCOS. Tetap pantau dan kurangi stres.",
        severity: "warning"
      });
    }

    if (extremeVariation && !hasShortCycle && !hasLongCycle) {
      alerts.push({
        id: "irregular",
        title: "Siklus Kurang Teratur",
        message: "Terdapat perbedaan lebih dari 10 hari antar siklus Anda akhir-akhir ini. Jaga pola makan dan tidur Anda agar hormon lebih stabil.",
        severity: "info"
      });
    }
  }

  // 2. Check Period Length
  if (periodLength > 8) {
    alerts.push({
      id: "long_period",
      title: "Durasi Haid Terlalu Lama",
      message: "Durasi menstruasi Anda tercatat lebih dari 8 hari. Jika volume darah juga sangat banyak, segera konsultasikan ke dokter agar terhindar dari anemia.",
      severity: "danger"
    });
  }

  // 3. Check for severe symptoms in the last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);
  let severeCrampsCount = 0;
  let pmddSymptomCount = 0;
  
  Object.entries(entries).forEach(([dateStr, entry]) => {
    if (isBefore(thirtyDaysAgo, parseISO(dateStr))) {
      // Check for extreme pain/cramps and low energy
      const energy = entry.energyLevel ?? 3;
      const isSevere = 
        (entry.symptoms?.includes("kram") && energy <= 2) ||
        (entry.symptoms?.includes("sakit_kepala") && energy <= 2);
        
      if (isSevere) severeCrampsCount++;

      // Check for PMDD (Severe mood shifts in Luteal phase)
      if (entry.cyclePhaseAtEntry === "luteal") {
        const severeMoods = ["Sedih", "Cemas", "Kecemasan Parah", "Mudah Tersinggung", "Depresi"];
        if (entry.mood && severeMoods.includes(entry.mood) && energy <= 2) {
          pmddSymptomCount++;
        }
      }
    }
  });

  if (severeCrampsCount >= 3) {
    alerts.push({
      id: "severe_pain",
      title: "Peringatan Nyeri Berlebih",
      message: "Anda melaporkan kram/nyeri parah yang menguras energi dalam sebulan terakhir. Jika nyeri ini sangat mengganggu aktivitas harian, sebaiknya diskusikan dengan dokter kandungan.",
      severity: "danger"
    });
  }

  if (pmddSymptomCount >= 3) {
    alerts.push({
      id: "pmdd_risk",
      title: "Indikasi Risiko PMDD",
      message: "Kami mendeteksi perubahan suasana hati yang drastis (kecemasan/kesedihan mendalam) selama fase pramenstruasi (luteal) Anda. Ini bisa jadi tanda PMDD (Premenstrual Dysphoric Disorder). Pertimbangkan berkonsultasi dengan profesional.",
      severity: "danger"
    });
  }

  return alerts;
};

export interface CorrelationInsight {
  id: string;
  title: string;
  message: string;
  type: "positive" | "negative" | "info";
}

export const analyzeCorrelations = (
  entries: Record<string, { symptoms?: string[], sleepHours?: number, waterGlasses?: number, painLevel?: number, energyLevel?: number, weight?: number }>
): CorrelationInsight[] => {
  const insights: CorrelationInsight[] = [];
  const entriesList = Object.values(entries);
  if (entriesList.length < 5) return insights;

  // Sleep vs Pain correlation
  let highSleepLowPain = 0;
  let lowSleepHighPain = 0;
  let sleepPainCount = 0;

  // Water vs Bloating/Headache
  let highWaterLowSymptoms = 0;
  let lowWaterHighSymptoms = 0;
  let waterSymptomCount = 0;

  entriesList.forEach(entry => {
    // Sleep vs Pain
    if (entry.sleepHours !== undefined && entry.painLevel !== undefined) {
      sleepPainCount++;
      if (entry.sleepHours >= 7 && entry.painLevel <= 3) highSleepLowPain++;
      if (entry.sleepHours < 6 && entry.painLevel >= 5) lowSleepHighPain++;
    }

    // Water vs Bloating/Headache
    if (entry.waterGlasses !== undefined && entry.symptoms) {
      const hasHeadacheOrBloat = entry.symptoms.some(s => s.toLowerCase().includes("kembung") || s.toLowerCase().includes("sakit kepala"));
      if (entry.waterGlasses >= 7 && !hasHeadacheOrBloat) highWaterLowSymptoms++;
      if (entry.waterGlasses < 4 && hasHeadacheOrBloat) lowWaterHighSymptoms++;
      waterSymptomCount++;
    }
  });

  if (sleepPainCount >= 3) {
    if (highSleepLowPain >= 2) {
      insights.push({
        id: "sleep_pain_pos",
        title: "Tidur Cukup = Bebas Nyeri",
        message: "Kami menemukan pola: Setiap kali Anda tidur lebih dari 7 jam, intensitas nyeri Anda cenderung sangat rendah. Pertahankan kebiasaan tidur ini!",
        type: "positive"
      });
    } else if (lowSleepHighPain >= 2) {
      insights.push({
        id: "sleep_pain_neg",
        title: "Kurang Tidur Memicu Nyeri",
        message: "Terlihat pola bahwa tidur kurang dari 6 jam berkorelasi dengan meningkatnya rasa nyeri/kram. Cobalah tidur lebih awal saat siklus menstruasi tiba.",
        type: "negative"
      });
    }
  }

  if (waterSymptomCount >= 3) {
    if (highWaterLowSymptoms >= 2) {
      insights.push({
        id: "water_symp_pos",
        title: "Hidrasi Mengurangi Kembung",
        message: "Hebat! Rutin minum air (≥7 gelas) terbukti meminimalisir gejala kembung dan sakit kepala Anda.",
        type: "positive"
      });
    } else if (lowWaterHighSymptoms >= 2) {
      insights.push({
        id: "water_symp_neg",
        title: "Dehidrasi & Kembung",
        message: "Saat Anda minum kurang dari 4 gelas air, gejala kembung atau sakit kepala sering muncul. Jangan lupa perbanyak minum air putih!",
        type: "negative"
      });
    }
  }

  return insights;
};
