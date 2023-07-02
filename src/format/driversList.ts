import { Driver } from "./Driver";
import { driverBmp } from "./bmp/driverBmp";
import { driverGif } from "./gif/driverGif";

export const driversList: readonly Driver[] = Object.freeze([
  driverBmp,
  driverGif,
]);
