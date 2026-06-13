import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { ref, onValue, set, get } from "firebase/database";

export interface JournalEntry {
  mood: string;
  energyLevel: number;
  symptoms: string[];
  notes: string;
  cyclePhaseAtEntry: string;
}

export function useJournal() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<Record<string, JournalEntry>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Migrate local storage if exists
      const localJournal = localStorage.getItem("siva_journal");
      const journalRef = ref(db, `users/${user.uid}/journal`);

      if (localJournal) {
        get(journalRef).then((snapshot) => {
          if (!snapshot.exists()) {
            const parsed = JSON.parse(localJournal);
            set(journalRef, parsed);
          }
          localStorage.removeItem("siva_journal");
        });
      }

      const unsubscribe = onValue(journalRef, (snapshot) => {
        if (snapshot.exists()) {
          setEntries(snapshot.val());
        } else {
          setEntries({});
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setTimeout(() => {
        const localJournal = localStorage.getItem("siva_journal");
        if (localJournal) {
          setEntries(JSON.parse(localJournal));
        } else {
          setEntries({});
        }
        setLoading(false);
      }, 0);
    }
  }, [user, authLoading]);

  const saveEntry = async (dateKey: string, entry: JournalEntry) => {
    if (user) {
      const entryRef = ref(db, `users/${user.uid}/journal/${dateKey}`);
      await set(entryRef, entry);
    } else {
      const updatedEntries = { ...entries, [dateKey]: entry };
      localStorage.setItem("siva_journal", JSON.stringify(updatedEntries));
      setEntries(updatedEntries);
    }
  };

  const getEntry = (dateKey: string) => {
    return entries[dateKey] || null;
  };

  return { entries, loading, saveEntry, getEntry };
}
