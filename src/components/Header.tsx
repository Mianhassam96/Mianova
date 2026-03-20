import { Mic } from "lucide-react";

export default function Header() {
  return (
    <div className="text-center space-y-3">
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
