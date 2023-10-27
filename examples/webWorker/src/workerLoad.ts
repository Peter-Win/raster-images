import { PixelFormat } from "raster-images/PixelFormat";
import { loadImageByName } from "raster-images/loadImage";
import { createFileStream } from "raster-images/stream";
import { SurfaceStd } from "raster-images/Surface";
import { delayInterrupter } from "raster-images/interrupter";
import { ProgressInfo } from "raster-images/Converter/ProgressInfo";
import { MsgData } from "./types";

const sendMessage = (msg: MsgData) => {
    self.postMessage(msg);
}

const load = async (file: File) => {
    try {
        const stream = await createFileStream(file);
        const onProgress = async (info: ProgressInfo) => {
            sendMessage({type: "onProgress", info})
        }
        const image = await loadImageByName(stream, {
            target: PixelFormat.canvas,
            // Прерыватель позволяет отправлять сообщения о ходе загрузки с интервалом в 100 мс,
            // чтобы избжать отправки лишних сообщений
            progress: delayInterrupter(100, 0, onProgress),
        });
        if (!(image instanceof SurfaceStd)) throw Error("Uncompatible surface type");
        sendMessage({type: "onImageLoad", image: image.toParcel()});
    } catch (error) {
        sendMessage({type: "onError", error})
    }
}

self.addEventListener("message", async ({data}) => {
    if (typeof data === "object" && data?.type ==="loadFile") {
        await load(data.file as File);
    }
})