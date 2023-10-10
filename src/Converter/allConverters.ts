import { CvtGray8to1Dither, CvtGray8to1Fast } from "../cvt/gray/CvtGray8to1";
import { OldConverter } from "./OldConverter";
import { SimpleRowConverter } from "./SimpleRowConverter";
import { Cvt15to24Fast, Cvt15to24Quality } from "../cvt/rgb/Cvt15to24";
import { Cvt24to32, Cvt24to32AndSwapRB } from "../cvt/rgb/Cvt24to32";
import { CvtGray1toGray8 } from "../cvt/gray/CvtGray1toGray";
import { CvtGray1to24, CvtGray1to32 } from "../cvt/gray/CvtGray1toRGB";
import { IndexedRowConverter } from "./IndexedRowConverter";
import {
  CvtIndexed8To24,
  CvtIndexed8To32,
  CvtIndexed8ToRGBA,
} from "../cvt/indexed/CvtIndexedToBGR";
import { SwapRedBlue24 } from "../cvt/rgb/SwapRedBlue";
import {
  CvtGray8toRGB8,
  CvtGrayAlpha8toRGBA8,
} from "../cvt/gray/CvtGray8toRGB8";
import { CvtI1toI8, CvtI4toI8 } from "../cvt/indexed/CvtIndexedToIndexedExt";
import { PaletteShareConverter } from "./PaletteShareConverter";
import {
  CvtGray16toGray8,
  CvtGrayAlpha16toGrayAlpha8,
} from "../cvt/gray/CvtGray16";
import { Cvt48to24 } from "../cvt/rgb/Cvt48to24";
import { Cvt64to32 } from "../cvt/rgb/Cvt64to32";
import { DitherRowConverter } from "./DitherRowConverter";
import { Cvt24to15Dither, Cvt24to15Fast } from "../cvt/rgb/Cvt24to15";
import { CvtBGRtoG8, CvtRGBtoG8 } from "../cvt/rgb/Cvt24toG8";

export const allConverters: OldConverter[] = [
  // ------------------
  // RGB -> RGB
  //-------------------
  // 15
  new SimpleRowConverter("B5G5R5", "B8G8R8", Cvt15to24Quality),
  new SimpleRowConverter("R5G5B5", "R8G8B8", Cvt15to24Quality),
  new SimpleRowConverter("B5G5R5", "B8G8R8", Cvt15to24Fast),
  new SimpleRowConverter("R5G5B5", "R8G8B8", Cvt15to24Fast),
  // 24
  new SimpleRowConverter("B8G8R8", "G8", CvtBGRtoG8),
  new SimpleRowConverter("R8G8B8", "G8", CvtRGBtoG8),
  new DitherRowConverter("B8G8R8", "B5G5R5", Cvt24to15Dither),
  new SimpleRowConverter("B8G8R8", "B5G5R5", Cvt24to15Fast),
  new SimpleRowConverter("B8G8R8", "R8G8B8", SwapRedBlue24),
  new SimpleRowConverter("R8G8B8", "B8G8R8", SwapRedBlue24),
  new SimpleRowConverter("B8G8R8", "B8G8R8A8", Cvt24to32),
  new SimpleRowConverter("R8G8B8", "R8G8B8A8", Cvt24to32),
  new SimpleRowConverter("B8G8R8", "R8G8B8A8", Cvt24to32AndSwapRB),
  new SimpleRowConverter("R8G8B8", "B8G8R8A8", Cvt24to32AndSwapRB),
  // 48
  new SimpleRowConverter("B16G16R16", "B8G8R8", Cvt48to24),
  new SimpleRowConverter("R16G16B16", "R8G8B8", Cvt48to24),
  // 64
  new SimpleRowConverter("B16G16R16A16", "B8G8R8A8", Cvt64to32),
  new SimpleRowConverter("R16G16B16A16", "R8G8B8A8", Cvt64to32),

  // -----------------
  // Indexed -> RGB
  // -----------------
  new IndexedRowConverter("I8", "B8G8R8", CvtIndexed8To24),
  new IndexedRowConverter("I8", "B8G8R8A8", CvtIndexed8To32),
  new IndexedRowConverter("I8", "B8G8R8X8", CvtIndexed8To32),
  new IndexedRowConverter("I8", "R8G8B8A8", CvtIndexed8ToRGBA),
  new IndexedRowConverter("I8", "R8G8B8X8", CvtIndexed8ToRGBA),
  new IndexedRowConverter("J8", "B8G8R8A8", CvtIndexed8To32),
  new IndexedRowConverter("J8", "R8G8B8A8", CvtIndexed8ToRGBA),

  // Indexed -> Indexed
  new PaletteShareConverter("I1", "I8", CvtI1toI8),
  new PaletteShareConverter("I4", "I8", CvtI4toI8),

  // -------------
  // Gray -> RGB
  // -------------
  new SimpleRowConverter("G1", "B8G8R8", CvtGray1to24),
  new SimpleRowConverter("G1", "R8G8B8", CvtGray1to24),
  new SimpleRowConverter("G1", "B8G8R8A8", CvtGray1to32),
  new SimpleRowConverter("G1", "R8G8B8A8", CvtGray1to32),
  new SimpleRowConverter("G1", "B8G8R8X8", CvtGray1to32),
  new SimpleRowConverter("G1", "R8G8B8X8", CvtGray1to32),

  new SimpleRowConverter("G8", "B8G8R8", CvtGray8toRGB8),
  new SimpleRowConverter("G8", "R8G8B8", CvtGray8toRGB8),

  new SimpleRowConverter("G8A8", "B8G8R8A8", CvtGrayAlpha8toRGBA8),
  new SimpleRowConverter("G8A8", "R8G8B8A8", CvtGrayAlpha8toRGBA8),

  // -------------
  // Gray -> Gray
  // -------------
  new SimpleRowConverter("G1", "G8", CvtGray1toGray8),
  new DitherRowConverter("G8", "G1", CvtGray8to1Dither),
  new SimpleRowConverter("G8", "G1", CvtGray8to1Fast),
  new SimpleRowConverter("G16", "G8", CvtGray16toGray8),
  new SimpleRowConverter("G16A16", "G8A8", CvtGrayAlpha16toGrayAlpha8),
];
