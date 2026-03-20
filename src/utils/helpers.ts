/** Returns word count for a given string */
export const wordCount = (text: string): number =>
  text.trim() ? text.trim().split(/\s+/).length : 0;

/** Clamps a number between min and max */
export const clamp = (val: number, min: number, max: number): number =>
  Math.min(Math.max(val, min), max);

/** Extracts the base language code from a BCP-47 tag (e.g. "en-US" → "en") */
export const baseLang = (lang: string): string => lang.split("-")[0] || "en";
