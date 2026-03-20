import { Textarea } from "@/components/ui/textarea";

interface Props {
  text: string;
  onChange: (val: string) => void;
}

export default function TextAreaInput({ text, onChange }: Props) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="space-y-1">
      <div className="relative">
        <Textarea
          placeholder="Type or paste your text here…"
          className="min-h-[140px] text-sm bg-white/5 border-white/10 text-white placeholder:text-indigo-300/30 focus:border-indigo-500/60 focus:ring-indigo-500/20 resize-none rounded-xl"
          value={text}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="absolute bottom-3 right-3 text-[10px] text-indigo-400/50 select-none">
          {charCount} chars · {wordCount} words
        </div>
      </div>
      {text.length > 0 && (
        <button
          onClick={() => onChange("")}
          className="text-[11px] text-indigo-400/50 hover:text-indigo-300 transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );
}
