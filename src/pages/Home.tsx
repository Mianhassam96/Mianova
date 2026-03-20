import { useState } from "react";
import Header from "@/components/Header";
import TextAreaInput from "@/components/TextArea";
import Controls from "@/components/Controls";
import Player from "@/components/Player";
import Footer from "@/components/Footer";
import { useSpeech } from "@/hooks/useSpeech";
import { convertAndDownload } from "@/utils/speechUtils";
import { FileAudio, Gauge, Music2, AudioLines } from "lucide-react";

/* ── Animated waveform ── */
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
  icon: Icon, label, value,
}: { icon: React.ElementType; label: string; value: string | number }) => (
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
  const [voice, setVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const { speak, pause, resume, stop, isPlaying, availableVoices } = useSpeech();

  // Set default voice once voices load
  if (availableVoices.length > 0 && !voice) setVoice(availableVoices[0].name);

  const effectiveVolume = isMuted ? 0 : volume;

  const handlePlay = () => speak(text, voice, rate, pitch, effectiveVolume);
  const handlePause = () => pause();
  const handleStop = () => stop();

  const handleToggleMute = () => setIsMuted((m) => !m);

  const handleDownload = async (format: "mp3" | "wav") => {
    const selectedVoice = availableVoices.find((v) => v.name === voice) || null;
    setIsDownloading(true);
    await convertAndDownload(text, selectedVoice, rate, pitch, effectiveVolume, format);
    setIsDownloading(false);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#0a0a1a]">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[100px]" />
        <div className="orb-2 absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full bg-violet-600/20 blur-[100px]" />
        <div className="orb-3 absolute -bottom-40 left-1/3 w-[450px] h-[450px] rounded-full bg-blue-600/15 blur-[100px]" />
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

          <Header />

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-3">
            <StatBadge icon={FileAudio} label="Voices" value={availableVoices.length} />
            <StatBadge icon={AudioLines} label="Words" value={wordCount} />
            <StatBadge icon={Gauge} label="Rate" value={`${rate.toFixed(1)}x`} />
            <StatBadge icon={Music2} label="Pitch" value={pitch.toFixed(1)} />
          </div>

          {/* Main card */}
          <div
            className={`relative rounded-2xl border transition-all duration-500 ${
              isPlaying ? "border-indigo-500/60 glow-active" : "border-white/10"
            } bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden`}
          >
            <div className="h-[2px] w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500" />

            <div className="p-6 space-y-6">
              {/* Status + waveform */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-semibold text-lg">Speech Generator</h2>
                  <p className="text-indigo-300/60 text-xs mt-0.5">
                    {isPlaying ? "Speaking…" : "Ready to speak"}
                  </p>
                </div>
                <WaveformVisualizer active={isPlaying} />
              </div>

              <TextAreaInput text={text} onChange={setText} />

              <Controls
                voices={availableVoices}
                voice={voice}
                rate={rate}
                pitch={pitch}
                volume={volume}
                isMuted={isMuted}
                onVoiceChange={setVoice}
                onRateChange={setRate}
                onPitchChange={setPitch}
                onVolumeChange={setVolume}
                onToggleMute={handleToggleMute}
              />

              <Player
                isPlaying={isPlaying}
                disabled={!text.trim()}
                isDownloading={isDownloading}
                onPlay={handlePlay}
                onPause={handlePause}
                onStop={handleStop}
                onDownload={handleDownload}
              />
            </div>
          </div>

          <p className="text-center text-[11px] text-indigo-400/40 leading-relaxed">
            Uses your browser's built-in speech synthesis. Voice availability varies by browser and OS.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}
