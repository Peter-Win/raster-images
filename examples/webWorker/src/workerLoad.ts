import { PixelFormat } from "raster-images/PixelFormat";
import { loadImageByName } from "raster-images/loadImage";
import { createFileStream } from "raster-images/stream";
import { SurfaceStd } from "raster-images/Surface";
import { delayInterrupter } from "raster-images/interrupter";
import { ProgressInfo } from "raster-images/Converter/ProgressInfo";
import { MsgData } from "./types";

/* eslint "no-restricted-globals": "off" */

const sendMessage = (msg: MsgData) => {
  self.postMessage(msg);
};

const load = async (file: File) => {
  try {
    const stream = await createFileStream(file);
    const onProgress = async (info: ProgressInfo) => {
      sendMessage({ type: "onProgress", info });
    };
    // Interrupter allows you to send progress messages at 100ms intervals
    // to avoid sending unnecessary messages
    const progress = delayInterrupter(100, 0, onProgress);
    const image = await loadImageByName(stream, {
      target: PixelFormat.canvas,
      progress,
    });
    if (!(image instanceof SurfaceStd)) {
      throw Error("Uncompatible surface type");
    }
    sendMessage({ type: "onImageLoad", image: image.toParcel() });
  } catch (error) {
    sendMessage({ type: "onError", error });
  }
};

self.addEventListener("message", async ({ data }) => {
  if (typeof data === "object" && data?.type === "loadFile") {
    await load(data.file as File);
  }
});
