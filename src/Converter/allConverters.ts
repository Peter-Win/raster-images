import { ConverterFactoryDescr } from "./ConverterFactory";
import {
  factoryDithering,
  factoryIndexedDown,
  factoryIndexedUp,
  factoryPalette,
  factoryQuant2,
  factoryRowOp,
} from "./factories";
import { cmyk16toRgb16, cmyka16toRgba16 } from "./rowOps/cmyk/cmyk16";
import { cmyk32to16, cmyka32to16 } from "./rowOps/cmyk/cmyk32";
import { cmyk8to16, cmyka8to16 } from "./rowOps/cmyk/cmyk8";
import {
  gray16toGray8,
  grayAlpha16toGrayAlpha8,
} from "./rowOps/gray/gray16toGray8";
import { gray1toGray8 } from "./rowOps/gray/gray1toGray";
import { gray1toRgb24, gray1toRgba32 } from "./rowOps/gray/gray1toRgb";
import {
  gray32toGray16,
  gray32toGray8,
  grayAlpha32to16,
} from "./rowOps/gray/gray32";
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
import {
  rgb15to24Fast,
  rgb15to24Quality,
  rgb15to32Quality,
} from "./rowOps/rgb/rgb15";
import {
  rgb16to24Fast,
  rgb16to24Quality,
  rgb16to32Quality,
} from "./rowOps/rgb/rgb16";
import { rgb24to15Dither, rgb24to15Fast } from "./rowOps/rgb/rgb24to15";
import { bgr24toG8, rgb24toG8 } from "./rowOps/rgb/rgb24toG8";
import {
  rgb24toRgba32,
  rgb24toRgba32AndSwapRB,
} from "./rowOps/rgb/rgb24toRgba32";
import { rgb32swap, rgb32to16 } from "./rowOps/rgb/rgb32";
import { rgb48to24Fast } from "./rowOps/rgb/rgb48to24";
import { rgbFloat64to32 } from "./rowOps/rgb/rgb64";
import { rgb64to32Fast } from "./rowOps/rgb/rgb64to32";
import { rgba32to16 } from "./rowOps/rgb/rgba32";
import { swapRedBlue24, swapRedBlue32 } from "./rowOps/rgb/swapRedBlue";

export const allConverters: ConverterFactoryDescr[] = [
  // ------------------
  // RGB -> RGB
  //-------------------
  // 15 bits
  factoryRowOp("B5G5R5", "B8G8R8", rgb15to24Quality, { speed: 90 }, "quality"),
  factoryRowOp("B5G5R5", "B8G8R8", rgb15to24Fast, { quality: 90 }, "fast"),
  factoryRowOp(
    "B5G5R5",
    "B8G8R8A8",
    rgb15to32Quality,
    { speed: 90 },
    "quality"
  ),
  // 16 bits
  factoryRowOp("B5G6R5", "B8G8R8", rgb16to24Quality, { speed: 90 }, "quality"),
  factoryRowOp("B5G6R5", "B8G8R8", rgb16to24Fast, { quality: 90 }, "fast"),
  factoryRowOp(
    "B5G6R5",
    "B8G8R8A8",
    rgb16to32Quality,
    { speed: 90 },
    "quality"
  ),
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
  // RGB 3*32
  factoryRowOp("R32G32B32", "R16G16B16", rgb32to16, {
    loss: true,
    speed: 90,
    quality: 90,
  }),
  factoryRowOp("B32G32R32", "B16G16R16", rgb32to16, {
    loss: true,
    speed: 90,
    quality: 90,
  }),
  factoryRowOp("R32G32B32", "B32G32R32", rgb32swap, {
    loss: false,
    speed: 90,
    quality: 90,
  }),
  factoryRowOp("B32G32R32", "R32G32B32", rgb32swap, {
    loss: false,
    speed: 90,
    quality: 90,
  }),
  // RGB 4*32
  factoryRowOp("R32G32B32A32", "R16G16B16A16", rgba32to16, {
    loss: true,
    speed: 90,
    quality: 90,
  }),
  factoryRowOp("B32G32R32A32", "B16G16R16A16", rgba32to16, {
    loss: true,
    speed: 90,
    quality: 90,
  }),
  // RGB 3*64
  factoryRowOp("R64G64B64", "R32G32B32", rgbFloat64to32, {
    loss: true,
    speed: 90,
    quality: 90,
  }),
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
  // Gray32
  factoryRowOp("G32", "G8", gray32toGray8, { loss: true }),
  factoryRowOp("G32", "G16", gray32toGray16, { loss: true }),
  // Gray32 + Alpha
  factoryRowOp("G32A32", "G16A16", grayAlpha32to16, { loss: true }),

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
  // ------ CMYK -------
  // cmyk8
  factoryRowOp("C8M8Y8K8", "C16M16Y16K16", cmyk8to16),
  factoryRowOp("C8M8Y8K8A8", "C16M16Y16K16A16", cmyka8to16),
  // cmyk16
  factoryRowOp("C16M16Y16K16", "R16G16B16", cmyk16toRgb16, { loss: true }),
  factoryRowOp("C16M16Y16K16A16", "R16G16B16A16", cmyka16toRgba16, {
    loss: true,
  }),
  // cmyk32
  factoryRowOp("C32M32Y32K32", "C16M16Y16K16", cmyk32to16, { loss: true }),
  factoryRowOp("C32M32Y32K32A32", "C16M16Y16K16A16", cmyka32to16, {
    loss: true,
  }),
];
