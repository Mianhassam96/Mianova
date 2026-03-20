import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [wordIndex, setWordIndex] = useState(-1);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const loopRef = useRef(false);
  const lastArgsRef = useRef<[string, string, number, number, number] | null>(null);

  function loadVoices() {
    const voices = synthRef.current?.getVoices() ?? [];
    setAvailableVoices(voices);
  }

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    loadVoices();
    synthRef.current.onvoiceschanged = loadVoices;
    return () => { synthRef.current?.cancel(); };
  }, []);

  const speak = (text: string, voice: string, rate: number, pitch: number, volume: number) => {
    if (!text.trim()) { toast.error("Please enter some text to speak"); return; }
    lastArgsRef.current = [text, voice, rate, pitch, volume];
    synthRef.current?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = availableVoices.find((v) => v.name === voice);
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onboundary = (e) => {
      if (e.name === "word") {
        const spoken = text.slice(0, e.charIndex);
        const idx = spoken.split(/\s+/).filter(Boolean).length;
        setWordIndex(idx);
      }
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setWordIndex(-1);
      if (loopRef.current && lastArgsRef.current) {
        setTimeout(() => speak(...lastArgsRef.current!), 500);
      }
    };
    utterance.onerror = (e) => { toast.error(`Error: ${e.error}`); setIsPlaying(false); setWordIndex(-1); };
    utteranceRef.current = utterance;
    synthRef.current?.speak(utterance);
  };

  const pause = () => { synthRef.current?.pause(); setIsPlaying(false); };
  const resume = () => { synthRef.current?.resume(); setIsPlaying(true); };
  const stop = () => { synthRef.current?.cancel(); setIsPlaying(false); setWordIndex(-1); loopRef.current = false; };

  const setLoop = (val: boolean) => { loopRef.current = val; };

  return { speak, pause, resume, stop, setLoop, isPlaying, availableVoices, wordIndex };
}
