import { Palette } from "./Palette";

const N = 0xaa; // Norm color
const D = 0x55; // Dark color (for dark gray)
const H = 255; // High color
const A = 255; // alpha

export const paletteEGA: Readonly<Palette> = Object.freeze([
  [0, 0, 0, A], // 0:Black
  [0, 0, N, A], // 1:Blue
  [0, N, 0, A], // 2:Green
  [0, N, N, A], // 3:Cyan
  [N, 0, 0, A], // 4: Red
  [N, 0, N, A], // 5:Magenta
  [N, D, 0, A], // 6:Yellow
  [N, N, N, A], // 7:light gray
  [D, D, D, A], // 8: dark gray
  [D, D, H, A], // 9: light blue
  [D, H, D, A], // 10: light green
  [D, H, H, A], // 11: light cyan
  [H, D, D, A], // 12: light red
  [H, D, H, A], // 13: light magenta
  [H, H, D, A], // 14: yellow
  [H, H, H, A], // 15: white
]);
