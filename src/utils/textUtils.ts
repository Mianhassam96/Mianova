/** Clean messy text: normalize spaces, line breaks, symbols */
export const cleanText = (text: string): string =>
  text
    .replace(/\r\n|\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]+$/gm, "")
    .trim();

/** Detect dominant language from text (simple heuristic) */
export const detectLang = (text: string): string => {
  const urdu = /[\u0600-\u06FF]/.test(text);
  const arabic = /[\u0600-\u06FF\u0750-\u077F]/.test(text);
  const chinese = /[\u4E00-\u9FFF]/.test(text);
  const japanese = /[\u3040-\u30FF]/.test(text);
  const korean = /[\uAC00-\uD7AF]/.test(text);
  const french = /[àâçéèêëîïôùûüÿœæ]/i.test(text);
  const spanish = /[áéíóúüñ¿¡]/i.test(text);
  if (urdu || arabic) return "ur";
  if (chinese) return "zh";
  if (japanese) return "ja";
  if (korean) return "ko";
  if (french) return "fr";
  if (spanish) return "es";
  return "en";
};

/** Pick best voice for detected language */
export const pickBestVoice = (
  voices: SpeechSynthesisVoice[],
  lang: string
): SpeechSynthesisVoice | null => {
  const exact = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
  const local = voices.find((v) => v.lang.toLowerCase().startsWith(lang) && v.localService);
  return local ?? exact ?? voices[0] ?? null;
};
