import { ConverterFactoryDescr } from "./ConverterFactory";
import {
  factoryDithering,
  factoryIndexedDown,
  factoryIndexedUp,
  factoryPalette,
  factoryQuant2,
  factoryRowOp,
} from "./factories";
import {
  gray16toGray8,
  grayAlpha16toGrayAlpha8,
} from "./rowOps/gray/gray16toGray8";
import { gray1toGray8 } from "./rowOps/gray/gray1toGray";
import { gray1toRgb24, gray1toRgba32 } from "./rowOps/gray/gray1toRgb";
import {
  gray8toGray1Dither,
  gray8toGray1Fast,
} from "./rowOps/gray/gray8toGray1";
import {
  gray8toRgb8,
  gray8toRgba8,
  grayAlpha8toRgba8,
} from "./rowOps/gray/gray8toRgb8";
import {
  indexed8toRgb24,
  indexed8toRgb32,
  makePaletteCacheBgra,
  makePaletteCacheRgba,
} from "./rowOps/indexed/indexed8toRgb";
import {
  pack8to1bit,
  pack8to4bits,
} from "./rowOps/indexed/indexedToIndexedDown";
import {
  indexed1toIndexed8,
  indexed4toIndexed8,
} from "./rowOps/indexed/indexedToIndexedUp";
import { rgb15to24Fast, rgb15to24Quality } from "./rowOps/rgb/rgb15to24";
import { rgb24to15Dither, rgb24to15Fast } from "./rowOps/rgb/rgb24to15";
import { bgr24toG8, rgb24toG8 } from "./rowOps/rgb/rgb24toG8";
import {
  rgb24toRgba32,
  rgb24toRgba32AndSwapRB,
} from "./rowOps/rgb/rgb24toRgba32";
import { rgb48to24Fast } from "./rowOps/rgb/rgb48to24";
import { rgb64to32Fast } from "./rowOps/rgb/rgb64to32";
import { swapRedBlue24, swapRedBlue32 } from "./rowOps/rgb/swapRedBlue";

export const allConverters: ConverterFactoryDescr[] = [
  // ------------------
  // RGB -> RGB
  //-------------------
  // 15 bits
  factoryRowOp("B5G5R5", "B8G8R8", rgb15to24Quality, { speed: 90 }, "quality"),
  factoryRowOp("B5G5R5", "B8G8R8", rgb15to24Fast, { quality: 90 }, "fast"),
  // 24 bits
  factoryDithering(
    "B8G8R8",
    "B5G5R5",
    rgb24to15Dither,
    { speed: 60, quality: 90 },
    "dither"
  ),
  factoryRowOp(
    "B8G8R8",
    "B5G5R5",
    rgb24to15Fast,
    { speed: 90, quality: 70 },
    "fast"
  ),
  factoryRowOp("B8G8R8", "R8G8B8", swapRedBlue24),
  factoryRowOp("R8G8B8", "B8G8R8", swapRedBlue24),
  factoryRowOp("B8G8R8", "B8G8R8A8", rgb24toRgba32),
  factoryRowOp("R8G8B8", "R8G8B8A8", rgb24toRgba32),
  factoryRowOp("B8G8R8", "R8G8B8A8", rgb24toRgba32AndSwapRB),
  factoryRowOp("R8G8B8", "B8G8R8A8", rgb24toRgba32AndSwapRB),
  // 32 bits
  factoryRowOp("B8G8R8A8", "R8G8B8A8", swapRedBlue32),
  factoryRowOp("R8G8B8A8", "B8G8R8A8", swapRedBlue32),
  // 48 bits
  factoryRowOp(
    "R16G16B16",
    "R8G8B8",
    rgb48to24Fast,
    { loss: true, quality: 90 },
    "fast"
  ),
  factoryRowOp(
    "B16G16R16",
    "B8G8R8",
    rgb48to24Fast,
    { loss: true, quality: 90 },
    "fast"
  ),
  // 64 bits
  factoryRowOp(
    "R16G16B16A16",
    "R8G8B8A8",
    rgb64to32Fast,
    { loss: true, quality: 90 },
    "fast"
  ),
  factoryRowOp(
    "B16G16R16A16",
    "B8G8R8A8",
    rgb64to32Fast,
    { loss: true, quality: 90 },
    "fast"
  ),
  // RGB -> Gray
  factoryRowOp("R8G8B8", "G8", rgb24toG8, {
    loss: true,
    speed: 90,
    quality: 90,
  }),
  factoryRowOp("B8G8R8", "G8", bgr24toG8, {
    loss: true,
    speed: 90,
    quality: 90,
  }),
  // RGB -> I8
  factoryQuant2({ speed: 50, quality: 60, dithering: true }, "dither"),
  factoryQuant2({ speed: 55, quality: 40, dithering: false }, "no dither"),

  // -------------
  // Gray
  // -------------
  // Gray 1
  factoryRowOp("G1", "G8", gray1toGray8),
  factoryRowOp("G1", "B8G8R8", gray1toRgb24),
  factoryRowOp("G1", "R8G8B8", gray1toRgb24),
  factoryRowOp("G1", "B8G8R8A8", gray1toRgba32),
  factoryRowOp("G1", "R8G8B8A8", gray1toRgba32),
  // Gray 8
  factoryDithering(
    "G8",
    "G1",
    gray8toGray1Dither,
    { speed: 80, quality: 70 },
    "dither"
  ),
  factoryRowOp(
    "G8",
    "G1",
    gray8toGray1Fast,
    { quality: 1, loss: true },
    "fast"
  ),
  factoryRowOp("G8", "B8G8R8", gray8toRgb8),
  factoryRowOp("G8", "R8G8B8", gray8toRgb8),
  factoryRowOp("G8", "B8G8R8A8", gray8toRgba8),
  factoryRowOp("G8", "R8G8B8A8", gray8toRgba8),
  // Gray8 + Alpha
  factoryRowOp("G8A8", "R8G8B8A8", grayAlpha8toRgba8),
  factoryRowOp("G8A8", "B8G8R8A8", grayAlpha8toRgba8),
  // Gray16
  factoryRowOp("G16", "G8", gray16toGray8, { loss: true }),
  // Gray16+Alpha
  factoryRowOp("G16A16", "G8A8", grayAlpha16toGrayAlpha8, { loss: true }),

  // -------------
  // Indexed
  // -------------
  factoryPalette("I8", "B8G8R8", indexed8toRgb24, makePaletteCacheBgra),
  factoryPalette("I8", "R8G8B8", indexed8toRgb24, makePaletteCacheRgba),
  factoryPalette("I8", "B8G8R8A8", indexed8toRgb32, makePaletteCacheBgra),
  factoryPalette("I8", "R8G8B8A8", indexed8toRgb32, makePaletteCacheRgba),
  factoryPalette("J8", "B8G8R8A8", indexed8toRgb32, makePaletteCacheBgra),
  factoryPalette("J8", "R8G8B8A8", indexed8toRgb32, makePaletteCacheBgra),
  // Indexed -> Indexed Up
  factoryIndexedUp("I1", "I8", indexed1toIndexed8),
  factoryIndexedUp("I4", "I8", indexed4toIndexed8),
  // Indexed down
  factoryIndexedDown("I8", "I4", pack8to4bits, {
    dithering: true,
    quality: 80,
    speed: 60,
  }),
  factoryIndexedDown("I8", "I4", pack8to4bits, {
    dithering: false,
    quality: 60,
    speed: 70,
  }),
  factoryIndexedDown("I8", "I1", pack8to1bit, {
    dithering: true,
    quality: 80,
    speed: 60,
  }),
];
