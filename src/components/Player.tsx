import { Play, Pause, Square, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileAudio } from "lucide-react";

interface Props {
  isPlaying: boolean;
  disabled: boolean;
  isDownloading: boolean;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onDownload: (format: "mp3" | "wav") => void;
}

export default function Player({
  isPlaying, disabled, isDownloading,
  onPlay, onPause, onStop, onDownload,
}: Props) {
  return (
    <div className="flex items-center gap-3 pt-1">
      {/* Play */}
      <Button
        onClick={onPlay}
        disabled={disabled || isPlaying}
        className="flex-1 h-11 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 disabled:opacity-40"
      >
        <Play className="mr-2 h-4 w-4" /> Play
      </Button>

      {/* Pause */}
      <Button
        onClick={onPause}
        disabled={!isPlaying}
        variant="outline"
        className="h-11 px-4 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:border-white/20 disabled:opacity-40"
      >
        <Pause className="h-4 w-4" />
      </Button>

      {/* Stop */}
      <Button
        onClick={onStop}
        disabled={!isPlaying}
        variant="outline"
        className="h-11 px-4 rounded-xl border-white/10 bg-white/5 text-white hover:bg-red-500/20 hover:border-red-400/30 hover:text-red-300 disabled:opacity-40"
      >
        <Square className="h-4 w-4" />
      </Button>

      {/* Download */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled || isDownloading}
            className="h-11 px-4 rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white hover:border-white/20"
          >
            <Download className={`mr-2 h-4 w-4 ${isDownloading ? "animate-bounce" : ""}`} />
            {isDownloading ? "…" : "Save"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#12122a] border-white/10 text-white">
          <DropdownMenuItem onClick={() => onDownload("mp3")} className="focus:bg-indigo-500/20 focus:text-white cursor-pointer">
            <FileAudio className="mr-2 h-4 w-4 text-indigo-400" /> Download MP3
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDownload("wav")} className="focus:bg-indigo-500/20 focus:text-white cursor-pointer">
            <FileAudio className="mr-2 h-4 w-4 text-violet-400" /> Download WAV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
