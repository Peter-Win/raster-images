import { Driver } from "./Driver";
import { driverBmp } from "./bmp/driverBmp";
import { driverGif } from "./gif/driverGif";
import { driverPng } from "./png/driverPng";
import { driverPnm } from "./pnm/driverPnm";

export const driversList: readonly Driver[] = Object.freeze([
  driverBmp,
  driverGif,
  driverPng,
  driverPnm,
]);
