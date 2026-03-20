import { useState, useEffect } from "react";
import Header from "@/components/Header";
import TextAreaInput from "@/components/TextArea";
import Controls from "@/components/Controls";
import Player from "@/components/Player";
import History from "@/components/History";
import Footer from "@/components/Footer";
import { useSpeech } from "@/hooks/useSpeech";
import { useSettings } from "@/hooks/useSettings";
import { useHistory } from "@/hooks/useHistory";
import { convertAndDownload } from "@/utils/speechUtils";
import { FileAudio, Gauge, Music2, AudioLines } from "lucide-react";

const WaveformVisualizer = ({ active }: { active: boolean }) => (
  <div className="flex items-center justify-center gap-[3px] h-10">
    {Array.from({ length: 9 }).map((_, i) => (
      <div key={i} className={`w-1 rounded-full transition-all duration-300 ${active ? "wave-bar bg-gradient-to-t from-violet-500 to-indigo-400 h-8" : "bg-indigo-300/40 h-2"}`} />
    ))}
  </div>
);

const StatBadge = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
    <Icon className="h-4 w-4 text-indigo-300" />
    <div>
      <p className="text-[10px] text-indigo-300 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-white leading-none">{value}</p>
    </div>
  </div>
);

export default function Home() {
  const [text, setText] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [langFilter, setLangFilter] = useState("all");
  const [darkMode, setDarkMode] = useState(true);

  const { settings, update } = useSettings();
  const { history, addEntry, removeEntry, clearHistory } = useHistory();
  const { speak, pause, resume, stop, setLoop, isPlaying, availableVoices, wordIndex } = useSpeech();

  // Apply dark mode to html element
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Set default voice once voices load
  useEffect(() => {
    if (availableVoices.length > 0 && !settings.voice) {
      update({ voice: availableVoices[0].name });
    }
  }, [availableVoices]);

  const effectiveVolume = isMuted ? 0 : settings.volume;

  const handlePlay = () => {
    setIsPaused(false);
    addEntry(text);
    speak(text, settings.voice, settings.rate, settings.pitch, effectiveVolume);
  };

  const handlePause = () => { pause(); setIsPaused(true); };
  const handleResume = () => { resume(); setIsPaused(false); };
  const handleStop = () => { stop(); setIsPaused(false); setIsLooping(false); setLoop(false); };

  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    setLoop(next);
  };

  const handleDownload = async (format: "mp3" | "wav") => {
    const selectedVoice = availableVoices.find((v) => v.name === settings.voice) || null;
    setIsDownloading(true);
    await convertAndDownload(text, selectedVoice, settings.rate, settings.pitch, effectiveVolume, format);
    setIsDownloading(false);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden ${darkMode ? "bg-[#0a0a1a]" : "bg-slate-100"}`}>
      {darkMode && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px]" />
          <div className="orb-2 absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-violet-600/20 blur-[100px]" />
          <div className="orb-3 absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-blue-600/15 blur-[100px]" />
        </div>
      )}

      <div className="relative flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Header darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />

          <div className="flex flex-wrap justify-center gap-3">
            <StatBadge icon={FileAudio} label="Voices" value={availableVoices.length} />
            <StatBadge icon={AudioLines} label="Words" value={wordCount} />
            <StatBadge icon={Gauge} label="Rate" value={`${settings.rate.toFixed(1)}x`} />
            <StatBadge icon={Music2} label="Pitch" value={settings.pitch.toFixed(1)} />
          </div>

          <div className={`relative rounded-2xl border transition-all duration-500 ${isPlaying ? "border-indigo-500/60 glow-active" : darkMode ? "border-white/10" : "border-slate-200"} ${darkMode ? "bg-white/5 backdrop-blur-xl" : "bg-white"} shadow-2xl overflow-hidden`}>
            <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={`font-semibold text-lg ${darkMode ? "text-white" : "text-slate-800"}`}>Speech Generator</h2>
                  <p className="text-indigo-300/60 text-xs mt-0.5">{isPlaying ? "Speaking…" : isPaused ? "Paused" : "Ready to speak"}</p>
                </div>
                <WaveformVisualizer active={isPlaying} />
              </div>

              <TextAreaInput text={text} onChange={setText} wordIndex={wordIndex} />

              <Controls
                voices={availableVoices}
                voice={settings.voice}
                rate={settings.rate}
                pitch={settings.pitch}
                volume={settings.volume}
                isMuted={isMuted}
                langFilter={langFilter}
                onVoiceChange={(v) => update({ voice: v })}
                onRateChange={(v) => update({ rate: v })}
                onPitchChange={(v) => update({ pitch: v })}
                onVolumeChange={(v) => update({ volume: v })}
                onToggleMute={() => setIsMuted((m) => !m)}
                onLangFilterChange={setLangFilter}
              />

              <Player
                isPlaying={isPlaying}
                isPaused={isPaused}
                disabled={!text.trim()}
                isDownloading={isDownloading}
                isLooping={isLooping}
                onPlay={handlePlay}
                onPause={handlePause}
                onResume={handleResume}
                onStop={handleStop}
                onDownload={handleDownload}
                onToggleLoop={handleToggleLoop}
              />

              <History
                history={history}
                onSelect={setText}
                onRemove={removeEntry}
                onClear={clearHistory}
              />
            </div>
          </div>

          <p className={`text-center text-[11px] leading-relaxed ${darkMode ? "text-indigo-400/40" : "text-slate-400"}`}>
            Uses your browser's built-in speech synthesis. Voice availability varies by browser and OS.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
