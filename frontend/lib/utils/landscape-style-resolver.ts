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

export function getLandscapeTheme(theme: LandscapeTheme): LandscapeThemeClasses {
  switch (theme) {
    case "glass-red":
      return {
        container: "backdrop-blur-xl bg-black/20 border border-white/10 p-6 md:p-12 rounded-lg shadow-2xl",
        badge: "bg-red-600 text-white px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 md:mb-6",
        headline: "text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] md:leading-none mb-1 md:mb-2",
        highlight: "text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-red-600 leading-[1.1] md:leading-none mb-4 md:mb-6",
        description: "text-white/70 text-sm md:text-lg lg:text-xl max-w-xl mb-6 md:mb-8 font-medium leading-relaxed",
        button: "bg-red-600 hover:bg-red-700 text-white border-none shadow-[0_0_20px_rgba(220,38,38,0.4)]",
        overlay: "bg-gradient-to-r from-black/80 via-black/40 to-transparent",
      };
    case "minimal-white":
      return {
        container: "p-6 md:p-12 rounded-lg",
        badge: "bg-white text-red-600 px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 md:mb-6 shadow-sm",
        headline: "text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] md:leading-none mb-1 md:mb-2",
        highlight: "text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-light text-white/90 leading-[1.1] md:leading-none mb-4 md:mb-6 italic",
        description: "text-white/60 text-sm md:text-lg lg:text-xl max-w-xl mb-6 md:mb-8 font-light leading-relaxed",
        button: "bg-white hover:bg-gray-100 text-red-600 border-none shadow-xl",
        overlay: "bg-black/40",
      };
    case "bold-dark":
      return {
        container: "bg-red-600/10 backdrop-blur-md border-l-4 border-red-600 p-6 md:p-12 rounded-lg",
        badge: "border border-red-600 text-red-600 px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase mb-4 md:mb-6",
        headline: "text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.9] mb-3 md:mb-4 uppercase",
        highlight: "text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-600 to-red-900 leading-[0.9] mb-6 md:mb-8 uppercase",
        description: "text-white/80 text-base md:text-xl lg:text-2xl max-w-2xl mb-8 md:mb-10 font-bold uppercase tracking-tight leading-tight",
        button: "bg-transparent border-2 border-white text-white hover:bg-white hover:text-red-600 transition-all duration-300",
        overlay: "bg-gradient-to-t from-black via-transparent to-transparent",
      };
    case "centered-glass":
      return {
        container: "backdrop-blur-2xl bg-black/40 border border-white/10 p-6 md:p-10 rounded-lg text-center max-w-3xl mx-auto shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]",
        badge: "bg-linear-to-r from-red-600 to-red-500 text-white px-5 py-1.5 rounded-lg text-[10px] md:text-xs font-black tracking-[0.3em] uppercase mb-6 mx-auto inline-flex items-center gap-2 shadow-lg",
        headline: "text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-white leading-none mb-1 tracking-tighter",
        highlight: "text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black text-red-600 leading-none mb-6 tracking-tighter drop-shadow-[0_0_20px_rgba(220,38,38,0.2)]",
        description: "text-white/80 text-sm md:text-lg max-w-xl mx-auto mb-8 font-medium leading-relaxed tracking-tight",
        button: "bg-white text-red-600 hover:bg-red-600 hover:text-white border-none px-8 md:px-10 h-12 md:h-14 text-base md:text-lg font-black rounded-lg transition-all duration-500 hover:scale-105 shadow-xl active:scale-95",
        overlay: "bg-black/60 backdrop-blur-[1px]",
      };
    case "right-industrial":
      return {
        container: "ml-auto p-6 md:p-12 lg:p-16 text-right border-r-4 md:border-r-8 border-red-600 bg-linear-to-l from-black/80 to-transparent rounded-lg",
        badge: "bg-red-600 text-white px-3 py-1 md:px-4 md:py-1.5 rounded-lg text-[10px] md:text-xs font-mono font-bold tracking-widest uppercase mb-4 md:mb-6 ml-auto",
        headline: "text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-mono font-black text-white leading-none mb-3 md:mb-4",
        highlight: "text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-mono font-black text-red-600 leading-none mb-6 md:mb-8",
        description: "text-gray-300 text-sm md:text-lg lg:text-xl max-w-lg ml-auto mb-8 md:mb-10 font-mono tracking-tight leading-relaxed",
        button: "bg-white text-black hover:bg-red-600 hover:text-white border-none rounded-lg font-mono font-bold shadow-lg transition-all",
        overlay: "bg-linear-to-l from-black via-transparent to-transparent",
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
