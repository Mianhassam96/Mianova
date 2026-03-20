import { useState, useEffect } from "react";

const KEY = "voxify_history";
const MAX = 10;

export function useHistory() {
  const [history, setHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(history));
  }, [history]);

  const addEntry = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setHistory((h) => {
      const filtered = h.filter((e) => e !== trimmed);
      return [trimmed, ...filtered].slice(0, MAX);
    });
  };

  const removeEntry = (idx: number) =>
    setHistory((h) => h.filter((_, i) => i !== idx));

  const clearHistory = () => setHistory([]);

  return { history, addEntry, removeEntry, clearHistory };
}
