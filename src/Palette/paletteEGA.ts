import { Palette } from "./Palette";

const N = 0xaa; // Norm color
const D = 0x55; // Dark color (for dark gray)
const H = 255; // High color
const A = 255; // alpha

export const paletteEGA: Readonly<Palette> = Object.freeze([
  [0, 0, 0, A], // 0:Black
  [N, 0, 0, A], // 1:Blue
  [0, N, 0, A], // 2:Green
  [N, N, 0, A], // 3:Cyan
  [0, 0, N, A], // 4: Red
  [N, 0, N, A], // 5:Magenta
  [0, D, N, A], // 6:Brown
  [N, N, N, A], // 7:light gray
  [D, D, D, A], // 8: dark gray
  [H, D, D, A], // 9: light blue
  [D, H, D, A], // 10: light green
  [H, H, D, A], // 11: light cyan
  [D, D, H, A], // 12: light red
  [H, D, H, A], // 13: light magenta
  [D, H, H, A], // 14: yellow
  [H, H, H, A], // 15: white
]);

// indices of the EGA palette
export enum iEGA {
  black,
  blue,
  green,
  cyan,
  red,
  magenta,
  brown,
  lightGray,
  darkGray,
  lightBlue,
  lightGreen,
  lightCyan,
  lightRed,
  lightMagenta,
  yellow,
  white,
}
