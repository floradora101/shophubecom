import type { LandscapeTheme } from "@/lib/types/heroSlides.types";

export interface LandscapeThemeClasses {
  container: string;
  badge: string;
  headline: string;
  highlight: string;
  description: string;
  button: string;
  overlay: string;
}

export function getLandscapeTheme(
  theme: LandscapeTheme
): LandscapeThemeClasses {
  switch (theme) {
    case "glass-red":
      return {
        container:
          "backdrop-blur-xl bg-black/20 border border-white/10 p-5 md:p-12 rounded-lg shadow-2xl",
        badge:
          "bg-red-600 text-white px-2.5 py-1 md:px-4 md:py-1.5 rounded-lg text-[9px] md:text-xs font-bold tracking-widest uppercase mb-3 md:mb-6",
        headline:
          "text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] md:leading-none mb-0.5 md:mb-2",
        highlight:
          "text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-red-600 leading-[1.1] md:leading-none mb-3 md:mb-6",
        description:
          "text-white/70 text-xs sm:text-sm md:text-lg lg:text-xl max-w-xl mb-5 md:mb-8 font-medium leading-relaxed",
        button:
          "bg-red-600 hover:bg-red-700 text-white border-none shadow-[0_0_20px_rgba(220,38,38,0.4)] px-5 h-9 md:h-12",
        overlay: "bg-gradient-to-r from-black/80 via-black/40 to-transparent",
      };
    case "minimal-white":
      return {
        container: "p-5 md:p-12 rounded-lg",
        badge:
          "bg-white text-red-600 px-2.5 py-1 md:px-4 md:py-1.5 rounded-lg text-[9px] md:text-xs font-bold tracking-widest uppercase mb-3 md:mb-6 shadow-sm",
        headline:
          "text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] md:leading-none mb-0.5 md:mb-2",
        highlight:
          "text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-white/90 leading-[1.1] md:leading-none mb-3 md:mb-6 italic",
        description:
          "text-white/60 text-xs sm:text-sm md:text-lg lg:text-xl max-w-xl mb-5 md:mb-8 font-light leading-relaxed",
        button:
          "bg-white hover:bg-gray-100 text-red-600 border-none shadow-xl px-5 h-9 md:h-12",
        overlay: "bg-black/40",
      };
    case "bold-dark":
      return {
        container:
          "bg-red-600/10 backdrop-blur-md border-l-4 border-red-600 p-5 md:p-12 rounded-lg",
        badge:
          "border border-red-600 text-red-600 px-2.5 py-1 md:px-4 md:py-1.5 rounded-lg text-[9px] md:text-xs font-bold tracking-[0.2em] uppercase mb-3 md:mb-6",
        headline:
          "text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] mb-2 md:mb-4 uppercase",
        highlight:
          "text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-red-900 leading-[0.9] mb-4 md:mb-8 uppercase",
        description:
          "text-white/80 text-sm sm:text-base md:text-xl lg:text-2xl max-w-2xl mb-6 md:mb-10 font-bold uppercase tracking-tight leading-tight",
        button:
          "bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 transition-all duration-300 px-5 h-9 md:h-12",
        overlay: "bg-gradient-to-t from-black via-transparent to-transparent",
      };
    case "centered-glass":
      return {
        container:
          "backdrop-blur-2xl bg-black/40 border border-white/10 p-5 md:p-10 rounded-lg text-center max-w-3xl mx-auto shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]",
        badge:
          "bg-linear-to-r from-red-600 to-red-500 text-white px-4 py-1 rounded-lg text-[9px] md:text-xs font-black tracking-[0.3em] uppercase mb-4 sm:mb-6 mx-auto inline-flex items-center gap-2 shadow-lg",
        headline:
          "text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-white leading-none mb-0.5 tracking-tighter",
        highlight:
          "text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-red-600 leading-none mb-4 sm:mb-6 tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.2)]",
        description:
          "text-white/80 text-xs sm:text-sm md:text-lg max-w-xl mx-auto mb-6 sm:mb-8 font-medium leading-relaxed tracking-tight",
        button:
          "bg-white text-red-600 hover:bg-red-600 hover:text-white border-none px-6 sm:px-10 h-9 sm:h-14 text-sm sm:text-lg font-black rounded-lg transition-all duration-500 hover:scale-105 shadow-xl active:scale-95",
        overlay: "bg-black/60 backdrop-blur-[1px]",
      };
    case "right-industrial":
      return {
        container:
          "ml-auto p-5 md:p-12 lg:p-16 text-right border-r-4 md:border-r-8 border-red-600 bg-linear-to-l from-black/80 to-transparent rounded-lg",
        badge:
          "bg-red-600 text-white px-2.5 py-1 md:px-4 md:py-1.5 rounded-lg text-[9px] md:text-xs font-mono font-bold tracking-widest uppercase mb-3 md:mb-6 ml-auto",
        headline:
          "text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-mono font-black text-white leading-none mb-2 md:mb-4",
        highlight:
          "text-2xl xs:text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-mono font-black text-red-600 leading-none mb-4 md:mb-8",
        description:
          "text-gray-300 text-xs sm:text-sm md:text-lg lg:text-xl max-w-lg ml-auto mb-6 md:mb-10 font-mono tracking-tight leading-relaxed",
        button:
          "bg-white text-black hover:bg-red-600 hover:text-white border-none rounded-lg font-mono font-bold shadow-lg transition-all px-5 h-9 md:h-12",
        overlay: "bg-linear-to-l from-black via-transparent to-transparent",
      };
    case "clean-modern":
      return {
        container: "max-w-4xl p-5 md:p-0",
        badge:
          "text-red-600 text-[10px] md:text-sm font-bold tracking-[0.4em] uppercase mb-5 sm:mb-8 flex items-center gap-3 before:w-6 sm:before:w-8 before:h-px before:bg-red-600",
        headline:
          "text-3xl xs:text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-1 sm:mb-2",
        highlight:
          "text-3xl xs:text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-red-600 tracking-tighter leading-[0.85] mb-5 sm:mb-8 drop-shadow-2xl",
        description:
          "text-white/90 text-sm sm:text-lg md:text-xl lg:text-2xl max-w-2xl mb-8 sm:mb-12 font-medium tracking-tight leading-snug border-l-2 border-white/20 pl-4 sm:pl-6",
        button:
          "bg-red-600 hover:bg-white hover:text-red-600 text-white border-none px-6 sm:px-12 h-10 sm:h-16 text-[11px] sm:text-lg font-bold rounded-lg transition-all duration-300 uppercase tracking-widest",
        overlay: "bg-gradient-to-r from-black/90 via-black/20 to-transparent",
      };
    default:
      return {
        container: "",
        badge: "",
        headline: "",
        highlight: "",
        description: "",
        button: "",
        overlay: "",
      };
  }
}
