import { ProgressInfo } from "raster-images/Converter/ProgressInfo";
import { ParcelSurface } from "raster-images/Surface";

export type MsgOnImageLoad = {
    type: "onImageLoad";
    image: ParcelSurface;
}

export type MsgOnError = {
    type: "onError";
    error: Error;
}

export type MsgOnStartLoading = {
    type: "onStart";
}

export type MsgOnProgress = {
    type: "onProgress",
    info: ProgressInfo;
}

export type MsgData = MsgOnImageLoad | MsgOnError | MsgOnStartLoading | MsgOnProgress;