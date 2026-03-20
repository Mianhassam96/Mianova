import { Mic, Settings2, Volume2, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  voices: SpeechSynthesisVoice[];
  voice: string;
  rate: number;
  pitch: number;
  volume: number;
  isMuted: boolean;
  onVoiceChange: (v: string) => void;
  onRateChange: (v: number) => void;
  onPitchChange: (v: number) => void;
  onVolumeChange: (v: number) => void;
  onToggleMute: () => void;
}

export default function Controls({
  voices, voice, rate, pitch, volume, isMuted,
  onVoiceChange, onRateChange, onPitchChange, onVolumeChange, onToggleMute,
}: Props) {
  const selectedVoice = voices.find((v) => v.name === voice);

  return (
    <div className="space-y-4">
      {/* Voice dropdown */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
          <Mic className="h-3 w-3" /> Voice
        </label>
        <Select value={voice} onValueChange={onVoiceChange}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-indigo-500/60 rounded-xl">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent className="bg-[#12122a] border-white/10 text-white max-h-56">
            {voices.map((v) => (
              <SelectItem key={v.name} value={v.name} className="focus:bg-indigo-500/20 focus:text-white">
                {v.name}
                <span className="ml-2 text-indigo-400/60 text-xs">({v.lang})</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedVoice && (
          <p className="text-[11px] text-indigo-400/50">
            {selectedVoice.lang} · {selectedVoice.localService ? "Local" : "Network"}
          </p>
        )}
      </div>

      {/* Sliders */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
          <Settings2 className="h-3 w-3" /> Controls
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/5 rounded-xl p-4 border border-white/5">

          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-300/70">Volume</span>
              <button onClick={onToggleMute} className="text-indigo-300/70 hover:text-white transition-colors">
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            </div>
            <Slider
              value={[isMuted ? 0 : volume]} min={0} max={1} step={0.05}
              onValueChange={(v) => { onVolumeChange(v[0]); }}
              className="[&_[role=slider]]:bg-indigo-400 [&_[role=slider]]:border-indigo-500"
            />
            <p className="text-[10px] text-indigo-400/50 text-right">
              {isMuted ? "Muted" : `${Math.round(volume * 100)}%`}
            </p>
          </div>

          {/* Speed */}
          <div className="space-y-2">
            <span className="text-xs text-indigo-300/70">Speed</span>
            <Slider
              value={[rate]} min={0.5} max={2} step={0.1}
              onValueChange={(v) => onRateChange(v[0])}
              className="[&_[role=slider]]:bg-violet-400 [&_[role=slider]]:border-violet-500"
            />
            <p className="text-[10px] text-indigo-400/50 text-right">{rate.toFixed(1)}x</p>
          </div>

          {/* Pitch */}
          <div className="space-y-2">
            <span className="text-xs text-indigo-300/70">Pitch</span>
            <Slider
              value={[pitch]} min={0.5} max={2} step={0.1}
              onValueChange={(v) => onPitchChange(v[0])}
              className="[&_[role=slider]]:bg-blue-400 [&_[role=slider]]:border-blue-500"
            />
            <p className="text-[10px] text-indigo-400/50 text-right">{pitch.toFixed(1)}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
