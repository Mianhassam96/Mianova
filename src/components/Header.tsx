import { Mic, Sun, Moon } from "lucide-react";

interface Props {
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function Header({ darkMode, onToggleDark }: Props) {
  return (
    <div className="text-center space-y-3 relative">
      <button
        onClick={onToggleDark}
        className="absolute right-0 top-0 p-2 rounded-xl bg-white/5 border border-white/10 text-indigo-300 hover:bg-white/10 transition-colors"
        title="Toggle dark/light mode"
      >
        {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-300 text-xs font-medium tracking-widest uppercase mb-2">
        <Mic className="h-3 w-3" /> AI Text to Speech
      </div>
      <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent">
        Voxify
      </h1>
      <p className="text-indigo-300/70 text-base">
        Transform any text into natural-sounding speech — instantly.
      </p>
    </div>
  );
}
