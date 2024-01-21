import { rangeLimit, rangeLimit16 } from "../utils";
import { Surface } from "../Surface";

/**
 * Draw sphere for test purposes
 */

type ParamsDrawSphere = {
  surface: Surface;
  // Коэффициенты отражения ka,kd,ks задаются в процентах.
  // Должно соблюдаться соотношение ka+kd+ks = 100
  ka: number; // рассеянный свет. например 10
  ks: number; // зеркальное отражение. например 30
  n: number; // показатель n полутонов по Фонгу (n=1,2,...) (например 4)
  cx: number;
  cy: number;
  r: number;
  // value = [0..1]
  dot: (row: Uint8Array, x: number, value: number) => void;
};

/* eslint no-param-reassign: "off" */
export const dotG8 = (row: Uint8Array, x: number, value: number) => {
  row[x] = rangeLimit(value * 255);
};

export const dotG32 = (row: Uint8Array, x: number, value: number) => {
  const frow = new Float32Array(row.buffer, row.byteOffset);
  frow[x] = value;
};

export const dot24 =
  (color: [number, number, number]) =>
  (row: Uint8Array, x: number, value: number) => {
    let pos = x * 3;
    const k = 0xff * value;
    row[pos++] = rangeLimit(k * color[0]!);
    row[pos++] = rangeLimit(k * color[1]!);
    row[pos] = rangeLimit(k * color[2]!);
  };

export const dotRGB16 =
  (color: [number, number, number]) =>
  (row: Uint8Array, x: number, value: number) => {
    const wrow = new Uint16Array(row.buffer, row.byteOffset);
    const v16 = value * 0xffff;
    let pos = x * 3;
    wrow[pos++] = rangeLimit16(color[0]! * v16);
    wrow[pos++] = rangeLimit16(color[1]! * v16);
    wrow[pos] = rangeLimit16(color[2]! * v16);
  };

export const dotRGB32 =
  (color: [number, number, number]) =>
  (row: Uint8Array, x: number, value: number) => {
    const wrow = new Float32Array(row.buffer, row.byteOffset);
    let pos = x * 3;
    wrow[pos++] = color[0]! * value;
    wrow[pos++] = color[1]! * value;
    wrow[pos] = color[2]! * value;
  };

export const drawSphere = (params: ParamsDrawSphere) => {
  const { ka, ks, n, cx, cy, r, surface, dot } = params;
  const lka = ka * 29;
  const { width, height } = surface;
  const kd = 100 - ka - ks; // диффузное отражение
  const r2 = r * r;
  const xMin = Math.round(cx - r) - 1;
  const xMax = Math.round(cx + r) + 1;
  const ix2: number[] = [];
  for (let xp = xMin; xp <= xMax; xp++) {
    const x = xp - cx;
    ix2[xp] = Math.round(900.0 * x * x);
  }

  const yTop = Math.round(cy - r);
  const yBottom = Math.round(cy + r);
  for (let yp = yTop; yp <= yBottom; yp++) {
    if (yp < 0 || yp >= height) continue;
    const row = surface.getRowBuffer(yp);
    const y = yp - cy;
    const y2 = y * y;
    const xmax2 = Math.max(0, r2 - y2);
    const ixmax2 = Math.round(900.0 * xmax2);
    const xmax = Math.sqrt(xmax2);
    const xLeft = Math.max(0, Math.round(cx - xmax));
    const xRight = Math.min(Math.round(cx + xmax), width - 1);
    for (let xp = xLeft; xp <= xRight; xp++) {
      const iz2 = ixmax2 - (ix2[xp] ?? 0);
      const id2 = Math.max(0, iz2 / r2); // Квадрат диффузной интенсивности
      const id = Math.sqrt(id2);
      let Is = 0;
      if (id2 > 450) {
        const cosa900 = 2 * id2 - 900;
        Is = cosa900 / 30;
        for (let ii = 2; ii <= n; ii++) {
          Is *= cosa900 / 900;
        }
      }
      const I = (lka + kd * id + ks * Is) / 3000;
      dot(row, xp, I);
    }
  }
};
