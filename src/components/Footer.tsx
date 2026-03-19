import { Github, Mic } from "lucide-react";

const Footer = () => (
  <footer className="relative w-full border-t border-white/5 bg-white/[0.02] backdrop-blur-sm">
    <div className="max-w-2xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
          <Mic className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <p className="text-white text-sm font-semibold leading-none">MultiMian TTS</p>
          <p className="text-indigo-400/50 text-[10px] mt-0.5">Browser-powered speech synthesis</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="https://github.com/Mianhassam96"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-indigo-400/60 hover:text-indigo-300 transition-colors text-xs"
        >
          <Github className="h-4 w-4" />
          <span>Mianhassam96</span>
        </a>
        <span className="text-indigo-400/30 text-xs">
          © {new Date().getFullYear()} MultiMian
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;
