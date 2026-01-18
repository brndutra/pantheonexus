import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-')   // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start of text
    .replace(/-+$/, '');      // Trim - from end of text
}

export const getDuotoneMatrix = (color1, color2) => {
    // Color1: Shadows (dark), Color2: Highlights (light)
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        } : { r: 0, g: 0, b: 0 };
    }

    const c1 = hexToRgb(color1 || '#000000');
    const c2 = hexToRgb(color2 || '#ffffff');

    const r1 = c1.r, g1 = c1.g, b1 = c1.b; // Shadows
    const r2 = c2.r, g2 = c2.g, b2 = c2.b; // Highlights

    // Luminance coefficients (Rec. 709)
    const lumR = 0.2126;
    const lumG = 0.7152;
    const lumB = 0.0722;

    // R = (Rh - Rs) * Lum + Rs
    const rDiff = r2 - r1;
    const gDiff = g2 - g1;
    const bDiff = b2 - b1;

    // The matrix for feColorMatrix type="matrix"
    // R G B A Offset
    return `${rDiff * lumR} ${rDiff * lumG} ${rDiff * lumB} 0 ${r1} ${gDiff * lumR} ${gDiff * lumG} ${gDiff * lumB} 0 ${g1} ${bDiff * lumR} ${bDiff * lumG} ${bDiff * lumB} 0 ${b1} 0 0 0 1 0`;
}

// Global Decorative Constants
export const DECOR_GREEK = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'λ', 'μ', 'π', 'σ', 'φ', 'ψ', 'ω', 'Δ', 'Σ', 'Ξ', 'Ψ', 'Ω'];
export const DECOR_HIERO = ['𓀀', '𓁀', '𓂀', '𓃀', '𓄀', '𓅀', '𓆀', '𓇀', '𓈀', '𓉀', '𓊪', '𓋴', '𓍝', '𓎛', '𓏏', '𓐬'];
export const DECOR_RUNES = ['ᚠ', 'ᚡ', 'ᚢ', 'ᚣ', 'ᚤ', 'ᚥ', 'ᚦ', 'ᚧ', 'ᚨ', 'ᚩ', 'ᚪ', 'ᚫ', 'ᚬ', 'ᚭ', 'ᚮ', 'ᚰ', 'ᚱ', 'ᚲ', 'ᚳ', 'ᚴ', 'ᚵ', 'ᚶ', 'ᚷ', 'ᚸ', 'ᚹ', 'ᚺ', 'ᚻ', 'ᚼ', 'ᚽ', 'ᚾ', 'ᚿ'];

export const getRandomDecor = (set) => set[Math.floor(Math.random() * set.length)];