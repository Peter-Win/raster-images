import { Converter } from "./Converter";
import { SimpleRowConverter } from "./SimpleRowConverter";
import { Cvt15to24Fast, Cvt15to24Quality } from "../cvt/rgb/Cvt15to24";
import { Cvt24to32, Cvt24to32AndSwapRB } from "../cvt/rgb/Cvt24to32";
import { IndexedRowConverter } from "./IndexedRowConverter";
import {
  CvtIndexed8To24,
  CvtIndexed8To32,
  CvtIndexed8ToRGBA,
} from "../cvt/indexed/CvtIndexedToBGR";
import { SwapRedBlue24 } from "../cvt/rgb/SwapRedBlue";
import { CvtGray8toRGB8 } from "../cvt/gray/CvtGray8toRGB8";

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

  // -----------------
  // Indexed -> RGB
  // -----------------
  new IndexedRowConverter("I8", "B8G8R8", CvtIndexed8To24),
  new IndexedRowConverter("I8", "B8G8R8A8", CvtIndexed8To32),
  new IndexedRowConverter("I8", "B8G8R8X8", CvtIndexed8To32),
  new IndexedRowConverter("I8", "R8G8B8A8", CvtIndexed8ToRGBA),
  new IndexedRowConverter("I8", "R8G8B8X8", CvtIndexed8ToRGBA),

  // -------------
  // Gray -> RGB
  // -------------
  new SimpleRowConverter("G8", "B8G8R8", CvtGray8toRGB8),
  new SimpleRowConverter("G8", "R8G8B8", CvtGray8toRGB8),
];
