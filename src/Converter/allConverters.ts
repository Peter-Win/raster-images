import { Converter } from "./Converter";
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
import { CvtGray8toRGB8 } from "../cvt/gray/CvtGray8toRGB8";
import { CvtI1toI8, CvtI4toI8 } from "../cvt/indexed/CvtIndexedToIndexedExt";
import { PaletteShareConverter } from "./PaletteShareConverter";
import { CvtGray16toGray8 } from "../cvt/gray/CvtGray16";
import { Cvt48to24 } from "../cvt/rgb/Cvt48to24";

export const allConverters: Converter[] = [
  // ------------------
  // RGB -> RGB
  //-------------------
  // 15
  new SimpleRowConverter("B5G5R5", "B8G8R8", Cvt15to24Quality),
  new SimpleRowConverter("R5G5B5", "R8G8B8", Cvt15to24Quality),
  new SimpleRowConverter("B5G5R5", "B8G8R8", Cvt15to24Fast),
  new SimpleRowConverter("R5G5B5", "R8G8B8", Cvt15to24Fast),
  // 24
  new SimpleRowConverter("B8G8R8", "R8G8B8", SwapRedBlue24),
  new SimpleRowConverter("R8G8B8", "B8G8R8", SwapRedBlue24),
  new SimpleRowConverter("B8G8R8", "B8G8R8A8", Cvt24to32),
  new SimpleRowConverter("R8G8B8", "R8G8B8A8", Cvt24to32),
  new SimpleRowConverter("B8G8R8", "R8G8B8A8", Cvt24to32AndSwapRB),
  new SimpleRowConverter("R8G8B8", "B8G8R8A8", Cvt24to32AndSwapRB),
  // 48
  new SimpleRowConverter("B16G16R16", "B8G8R8", Cvt48to24),
  new SimpleRowConverter("R16G16B16", "R8G8B8", Cvt48to24),

  // -----------------
  // Indexed -> RGB
  // -----------------
  new IndexedRowConverter("I8", "B8G8R8", CvtIndexed8To24),
  new IndexedRowConverter("I8", "B8G8R8A8", CvtIndexed8To32),
  new IndexedRowConverter("I8", "B8G8R8X8", CvtIndexed8To32),
  new IndexedRowConverter("I8", "R8G8B8A8", CvtIndexed8ToRGBA),
  new IndexedRowConverter("I8", "R8G8B8X8", CvtIndexed8ToRGBA),

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

  // -------------
  // Gray -> Gray
  // -------------
  new SimpleRowConverter("G1", "G8", CvtGray1toGray8),
  new SimpleRowConverter("G16", "G8", CvtGray16toGray8),
];
