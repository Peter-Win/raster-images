import { Driver } from "./Driver";
import { driverBmp } from "./bmp/driverBmp";

export const driversList: readonly Driver[] = Object.freeze([driverBmp]);
