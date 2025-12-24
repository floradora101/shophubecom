// Typography setup for the design system
import {
  Inter,
  Playfair_Display,
  Righteous,
  Poppins,
  Oswald,
  Crimson_Text,
} from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const righteous = Righteous({
  subsets: ["latin"],
  variable: "--font-righteous",
  display: "swap",
  weight: ["400"],
});

export const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const crimsonText = Crimson_Text({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});
