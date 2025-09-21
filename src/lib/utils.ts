import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function faintColor(hex, intensity = 0.8) {
    try {
        // intensity: 0 = full original color, 1 = full white
        const cleanHex = hex.replace('#', '');
        const r = parseInt(cleanHex.substring(0, 2), 16);
        const g = parseInt(cleanHex.substring(2, 4), 16);
        const b = parseInt(cleanHex.substring(4, 6), 16);

        const mix = (channel) => Math.round(channel + (255 - channel) * intensity);

        const rFaint = mix(r);
        const gFaint = mix(g);
        const bFaint = mix(b);

        return `rgb(${rFaint}, ${gFaint}, ${bFaint})`;
    } catch (e) {
        return '#ffffff';
    }
}
