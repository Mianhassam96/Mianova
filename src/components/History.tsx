import { Clock, Trash2, X } from "lucide-react";

interface Props {
  history: string[];
  onSelect: (text: string) => void;
  onRemove: (idx: number) => void;
  onClear: () => void;
}

export default function History({ history, onSelect, onRemove, onClear }: Props) {
  if (history.length === 0) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="h-3 w-3" /> Recent
        </label>
        <button onClick={onClear} className="text-[11px] text-indigo-400/50 hover:text-red-400 transition-colors flex items-center gap-1">
          <Trash2 className="h-3 w-3" /> Clear all
        </button>
      </div>
      <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
        {history.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 group bg-white/5 hover:bg-white/10 rounded-lg px-3 py-2 cursor-pointer transition-colors"
            onClick={() => onSelect(entry)}>
            <p className="flex-1 text-xs text-indigo-200/80 truncate">{entry}</p>
            <button onClick={(e) => { e.stopPropagation(); onRemove(i); }}
              className="opacity-0 group-hover:opacity-100 text-indigo-400/50 hover:text-red-400 transition-all">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
