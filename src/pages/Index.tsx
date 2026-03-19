import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  Mic,
  Settings2,
  Waveform,
  FileAudio,
  Gauge,
  Music2,
} from "lucide-react";
import Footer from "@/components/Footer";
import { convertAndDownload } from "@/utils/speechUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* ── Animated waveform bars ── */
const WaveformVisualizer = ({ active }: { active: boolean }) => (
  <div className="flex items-center justify-center gap-[3px] h-10">
    {Array.from({ length: 9 }).map((_, i) => (
      <div
        key={i}
        className={`w-1 rounded-full transition-all duration-300 ${
          active
            ? "wave-bar bg-gradient-to-t from-violet-500 to-indigo-400 h-8"
            : "bg-indigo-300/40 h-2"
        }`}
      />
    ))}
  </div>
);

/* ── Stat badge ── */
const StatBadge = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) => (
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
    <Icon className="h-4 w-4 text-indigo-300" />
    <div>
      <p className="text-[10px] text-indigo-300 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-white leading-none">{value}</p>
    </div>
  </div>
);

const Index = () => {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  function loadVoices() {
    if (speechSynthesisRef.current) {
      const voices = speechSynthesisRef.current.getVoices();
      setAvailableVoices(voices);
      if (voices.length > 0 && !voice) setVoice(voices[0].name);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      speechSynthesisRef.current = window.speechSynthesis;
      loadVoices();
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.onvoiceschanged = loadVoices;
      }
    }
    return () => { speechSynthesisRef.current?.cancel(); };
  }, []);

  const speakText = () => {
    if (!text.trim()) { toast.error("Please enter some text to speak"); return; }
    if (!speechSynthesisRef.current) return;
    speechSynthesisRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = availableVoices.find((v) => v.name === voice);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = isMuted ? 0 : volume;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => { toast.error(`Error: ${e.error}`); setIsPlaying(false); };
    speechUtteranceRef.current = utterance;
    speechSynthesisRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesisRef.current?.cancel();
    setIsPlaying(false);
  };

  const toggleMute = () => {
    setIsMuted((m) => !m);
    if (speechUtteranceRef.current)
      speechUtteranceRef.current.volume = isMuted ? volume : 0;
  };

  const handleDownload = async (format: "mp3" | "wav") => {
    const selectedVoice = availableVoices.find((v) => v.name === voice) || null;
    setIsDownloading(true);
    await convertAndDownload(text, selectedVoice, rate, pitch, volume, format);
    setIsDownloading(false);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const selectedVoiceObj = availableVoices.find((v) => v.name === voice);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0a1a]">
      {/* ── Animated background orbs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="orb-2 absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="orb-3 absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-blue-600/15 blur-[100px]" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* ── Hero header ── */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-300 text-xs font-medium tracking-widest uppercase mb-2">
              <Mic className="h-3 w-3" /> AI Text to Speech
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent">
              MultiMian TTS
            </h1>
            <p className="text-indigo-300/70 text-base">
              Transform any text into natural-sounding speech — instantly.
            </p>
          </div>

          {/* ── Stats row ── */}
          <div className="flex flex-wrap justify-center gap-3">
            <StatBadge icon={FileAudio} label="Voices" value={availableVoices.length} />
            <StatBadge icon={Waveform} label="Words" value={wordCount} />
            <StatBadge icon={Gauge} label="Rate" value={`${rate.toFixed(1)}x`} />
            <StatBadge icon={Music2} label="Pitch" value={pitch.toFixed(1)} />
          </div>

          {/* ── Main card ── */}
          <div
            className={`relative rounded-2xl border transition-all duration-500 ${
              isPlaying
                ? "border-indigo-500/60 glow-active"
                : "border-white/10"
            } bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden`}
          >
            {/* Top accent line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />

            <div className="p-6 space-y-6">

              {/* ── Waveform + status ── */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-semibold text-lg">Speech Generator</h2>
                  <p className="text-indigo-300/60 text-xs mt-0.5">
                    {isPlaying ? "Speaking…" : "Ready to speak"}
                  </p>
                </div>
                <WaveformVisualizer active={isPlaying} />
              </div>

              {/* ── Textarea ── */}
              <div className="relative">
                <Textarea
                  placeholder="Type or paste your text here…"
                  className="min-h-[140px] text-sm bg-white/5 border-white/10 text-white placeholder:text-indigo-300/30 focus:border-indigo-500/60 focus:ring-indigo-500/20 resize-none rounded-xl"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-indigo-400/50 select-none">
                  {charCount} chars · {wordCount} words
                </div>
              </div>

              {/* ── Voice selector ── */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="h-3 w-3" /> Voice
                </label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-indigo-500/60 rounded-xl">
                    <SelectValue placeholder="Select a voice" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#12122a] border-white/10 text-white max-h-56">
                    {availableVoices.map((v) => (
                      <SelectItem
                        key={v.name}
                        value={v.name}
                        className="focus:bg-indigo-500/20 focus:text-white"
                      >
                        {v.name}
                        <span className="ml-2 text-indigo-400/60 text-xs">({v.lang})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVoiceObj && (
                  <p className="text-[11px] text-indigo-400/50">
                    {selectedVoiceObj.lang} · {selectedVoiceObj.localService ? "Local" : "Network"}
                  </p>
                )}
              </div>

              {/* ── Sliders ── */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings2 className="h-3 w-3" /> Controls
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white/5 rounded-xl p-4 border border-white/5">

                  {/* Volume */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-300/70">Volume</span>
                      <button
                        onClick={toggleMute}
                        className="text-indigo-300/70 hover:text-white transition-colors"
                      >
                        {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    <Slider
                      value={[isMuted ? 0 : volume]}
                      min={0} max={1} step={0.05}
                      onValueChange={(v) => { setVolume(v[0]); setIsMuted(false); }}
                      className="[&_[role=slider]]:bg-indigo-400 [&_[role=slider]]:border-indigo-500"
                    />
                    <p className="text-[10px] text-indigo-400/50 text-right">{isMuted ? "Muted" : `${Math.round(volume * 100)}%`}</p>
                  </div>

                  {/* Rate */}
                  <div className="space-y-2">
                    <span className="text-xs text-indigo-300/70">Speed</span>
                    <Slider
                      value={[rate]}
                      min={0.5} max={2} step={0.1}
                      onValueChange={(v) => setRate(v[0])}
                      className="[&_[role=slider]]:bg-violet-400 [&_[role=slider]]:border-violet-500"
                    />
                    <p className="text-[10px] text-indigo-400/50 text-right">{rate.toFixed(1)}x</p>
                  </div>

                  {/* Pitch */}
                  <div className="space-y-2">
                    <span className="text-xs text-indigo-300/70">Pitch</span>
                    <Slider
                      value={[pitch]}
                      min={0.5} max={2} step={0.1}
                      onValueChange={(v) => setPitch(v[0])}
                      className="[&_[role=slider]]:bg-blue-400 [&_[role=slider]]:border-blue-500"
                    />
                    <p className="text-[10px] text-indigo-400/50 text-right">{pitch.toFixed(1)}</p>
                  </div>

                </div>
              </div>

              {/* ── Action buttons ── */}
              <div className="flex items-center gap-3 pt-1">
                <Button
                  onClick={isPlaying ? stopSpeaking : speakText}
                  disabled={!text.trim()}
                  className={`flex-1 h-11 rounded-xl font-semibold text-sm transition-all duration-300 ${
                    isPlaying
                      ? "bg-red-500/80 hover:bg-red-500 text-white border border-red-400/30"
                      : "bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25"
                  }`}
                >
                  {isPlaying ? (
                    <><Pause className="mr-2 h-4 w-4" /> Stop</>
                  ) : (
                    <><Play className="mr-2 h-4 w-4" /> Listen</>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={!text.trim() || isDownloading}
                      className="h-11 px-4 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:border-white/20 transition-all"
                    >
                      <Download className={`mr-2 h-4 w-4 ${isDownloading ? "animate-bounce" : ""}`} />
                      {isDownloading ? "Downloading…" : "Download"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-[#12122a] border-white/10 text-white">
                    <DropdownMenuItem
                      onClick={() => handleDownload("mp3")}
                      className="focus:bg-indigo-500/20 focus:text-white cursor-pointer"
                    >
                      <FileAudio className="mr-2 h-4 w-4 text-indigo-400" /> Download MP3
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDownload("wav")}
                      className="focus:bg-indigo-500/20 focus:text-white cursor-pointer"
                    >
                      <FileAudio className="mr-2 h-4 w-4 text-violet-400" /> Download WAV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

            </div>
          </div>

          {/* ── Info note ── */}
          <p className="text-center text-[11px] text-indigo-400/40 leading-relaxed">
            Uses your browser's built-in speech synthesis. Voice availability varies by browser and OS.
          </p>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Index;
