import { toast } from "sonner";

// Google Translate TTS supports max 200 chars per request
const CHUNK_SIZE = 200;

/**
 * Split text into chunks that fit within Google TTS limit
 */
const splitText = (text: string): string[] => {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];

  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > CHUNK_SIZE) {
      if (current) chunks.push(current.trim());
      // If a single sentence is too long, split by words
      if (sentence.length > CHUNK_SIZE) {
        const words = sentence.split(" ");
        let wordChunk = "";
        for (const word of words) {
          if ((wordChunk + " " + word).length > CHUNK_SIZE) {
            if (wordChunk) chunks.push(wordChunk.trim());
            wordChunk = word;
          } else {
            wordChunk += (wordChunk ? " " : "") + word;
          }
        }
        if (wordChunk) chunks.push(wordChunk.trim());
        current = "";
      } else {
        current = sentence;
      }
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.filter(Boolean);
};

/**
 * Fetch MP3 blob for a single text chunk via Google Translate TTS
 */
const fetchChunkMp3 = async (chunk: string, lang: string): Promise<ArrayBuffer> => {
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TTS fetch failed: ${res.status}`);
  return res.arrayBuffer();
};

/**
 * Concatenate multiple ArrayBuffers into one
 */
const concatBuffers = (buffers: ArrayBuffer[]): ArrayBuffer => {
  const total = buffers.reduce((sum, b) => sum + b.byteLength, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) {
    result.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }
  return result.buffer;
};

/**
 * Detect language code from selected SpeechSynthesisVoice, fallback to 'en'
 */
const getLangCode = (voice: SpeechSynthesisVoice | null): string => {
  if (!voice) return "en";
  // voice.lang is like "en-US", "fr-FR" — Google TTS wants "en", "fr", etc.
  return voice.lang.split("-")[0] || "en";
};

/**
 * Downloads a blob as a file
 */
export const downloadAudio = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Convert text to speech via Google Translate TTS and download as MP3 or WAV.
 * WAV is produced by wrapping the MP3 PCM data — for true WAV, we decode via AudioContext.
 */
export const convertAndDownload = async (
  text: string,
  voice: SpeechSynthesisVoice | null,
  _rate: number,
  _pitch: number,
  _volume: number,
  format: "mp3" | "wav" = "mp3"
) => {
  if (!text.trim()) {
    toast.error("Please enter some text to convert");
    return;
  }

  toast.info("Fetching audio...");

  try {
    const lang = getLangCode(voice);
    const chunks = splitText(text);

    // Fetch all chunks in parallel
    const buffers = await Promise.all(chunks.map((c) => fetchChunkMp3(c, lang)));
    const combined = concatBuffers(buffers);

    let blob: Blob;
    let ext: string;

    if (format === "wav") {
      // Decode MP3 → PCM → encode as WAV
      const audioCtx = new AudioContext();
      const decoded = await audioCtx.decodeAudioData(combined.slice(0));
      audioCtx.close();
      blob = new Blob([encodeWav(decoded)], { type: "audio/wav" });
      ext = "wav";
    } else {
      blob = new Blob([combined], { type: "audio/mpeg" });
      ext = "mp3";
    }

    const words = text.trim().split(/\s+/).slice(0, 3).join("_");
    downloadAudio(blob, `${words}_speech.${ext}`);
    toast.success(`Downloaded as ${ext.toUpperCase()}`);
  } catch (err) {
    console.error(err);
    toast.error("Download failed. The TTS service may be unavailable or blocked by CORS.");
  }
};

/**
 * Encode an AudioBuffer as a WAV file (PCM 16-bit)
 */
function encodeWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numSamples = buffer.length * numChannels;
  const dataLength = numSamples * 2; // 16-bit = 2 bytes per sample
  const arrayBuffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(arrayBuffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);          // PCM chunk size
  view.setUint16(20, 1, true);           // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true); // byte rate
  view.setUint16(32, numChannels * 2, true);              // block align
  view.setUint16(34, 16, true);          // bits per sample
  writeStr(36, "data");
  view.setUint32(40, dataLength, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(ch)[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return arrayBuffer;
}
