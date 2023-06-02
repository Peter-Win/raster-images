import { Converter } from "./Converter";
import { RowConverter } from "./RowConverter";
import { Cvt15to24Fast, Cvt15to24Quality } from "../cvt/rgb/Cvt15to24";
import { Cvt24to32 } from "../cvt/rgb/Cvt24to32";

export const allConverters: Converter[] = [
  // RGB -> RGB
  new RowConverter("B5G5R5", "B8G8R8", Cvt15to24Quality),
  new RowConverter("R5G5B5", "R8G8B8", Cvt15to24Quality),
  new RowConverter("B5G5R5", "B8G8R8", Cvt15to24Fast),
  new RowConverter("R5G5B5", "R8G8B8", Cvt15to24Fast),
  new RowConverter("B8G8R8", "B8G8R8A8", Cvt24to32),
  new RowConverter("R8G8B8", "R8G8B8A8", Cvt24to32),
  // Indexed -> RGB
];
