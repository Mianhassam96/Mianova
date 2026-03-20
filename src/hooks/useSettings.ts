import { useState, useEffect } from "react";

interface VoiceSettings {
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
}

const DEFAULTS: VoiceSettings = { voice: "", rate: 1, pitch: 1, volume: 1 };
const KEY = "voxify_settings";

export function useSettings() {
  const [settings, setSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem(KEY);
      return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : DEFAULTS;
    } catch { return DEFAULTS; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (patch: Partial<VoiceSettings>) =>
    setSettings((s) => ({ ...s, ...patch }));

  return { settings, update };
}
