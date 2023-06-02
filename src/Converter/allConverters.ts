import { Converter } from "./Converter";
import { SimpleRowConverter } from "./SimpleRowConverter";
import { Cvt15to24Fast, Cvt15to24Quality } from "../cvt/rgb/Cvt15to24";
import { Cvt24to32 } from "../cvt/rgb/Cvt24to32";
import { IndexedRowConverter } from "./IndexedRowConverter";
import {
  CvtIndexed8To24,
  CvtIndexed8To32,
} from "../cvt/indexed/CvtIndexedToBGR";

export const allConverters: Converter[] = [
  // RGB -> RGB
  new SimpleRowConverter("B5G5R5", "B8G8R8", Cvt15to24Quality),
  new SimpleRowConverter("R5G5B5", "R8G8B8", Cvt15to24Quality),
  new SimpleRowConverter("B5G5R5", "B8G8R8", Cvt15to24Fast),
  new SimpleRowConverter("R5G5B5", "R8G8B8", Cvt15to24Fast),
  new SimpleRowConverter("B8G8R8", "B8G8R8A8", Cvt24to32),
  new SimpleRowConverter("R8G8B8", "R8G8B8A8", Cvt24to32),
  // Indexed -> RGB
  new IndexedRowConverter("I8", "B8G8R8", CvtIndexed8To24),
  new IndexedRowConverter("I8", "B8G8R8A8", CvtIndexed8To32),
  new IndexedRowConverter("I8", "B8G8R8X8", CvtIndexed8To32),
];
