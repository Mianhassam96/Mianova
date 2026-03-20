import { Mic, Zap, Turtle, Headphones } from "lucide-react";

export interface Preset {
  label: string;
  icon: React.ElementType;
  rate: number;
  pitch: number;
}

export const PRESETS: Preset[] = [
  { label: "Normal",   icon: Mic,        rate: 1.0, pitch: 1.0 },
  { label: "Fast",     icon: Zap,        rate: 1.6, pitch: 1.1 },
  { label: "Slow",     icon: Turtle,     rate: 0.7, pitch: 0.9 },
  { label: "Podcast",  icon: Headphones, rate: 1.1, pitch: 0.95 },
];

interface Props {
  activeRate: number;
  activePitch: number;
  onSelect: (rate: number, pitch: number) => void;
}

export default function Presets({ activeRate, activePitch, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map(({ label, icon: Icon, rate, pitch }) => {
        const active = Math.abs(activeRate - rate) < 0.05 && Math.abs(activePitch - pitch) < 0.05;
        return (
          <button
            key={label}
            onClick={() => onSelect(rate, pitch)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              active
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                : "bg-white/5 border-white/10 text-indigo-300 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
