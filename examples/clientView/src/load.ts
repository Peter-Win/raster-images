import { globalState } from "./globalState";
import { BufferStream } from "raster-images/stream";
import {createFormatByName} from "raster-images/format";
import { createImageReader } from "raster-images/transfer/createImageReader";
import { SurfaceImageData } from "raster-images/Surface/SurfaceImageData";

export const load = (file: File) => {
    globalState.formatStatus = "loading";
    globalState.format = null;
    globalState.file = file;
    globalState.format = null;
    globalState.errorMessage = "";
    globalState.currentFrame = 0;
    const reader = new FileReader();
    const onError = (e: Error) => {
        globalState.formatStatus = "error";
        globalState.errorMessage = e.message;
        globalState.redraw();
    }
    reader.onload = async () => {
        try {
            if (reader.result instanceof ArrayBuffer) {
                const stream = new BufferStream(new Uint8Array(reader.result, 0), {name: file.name});
                globalState.format = await createFormatByName(stream);
            } else {
                throw Error("Invalid result of FileReader");
            }
            globalState.formatStatus = "ready";
            globalState.redraw();
            loadFrame(0);
        } catch (e) {
            onError(e);
        }
    }
    reader.onerror = () => {
        onError(Error(`Can't open file ${file.name}`));
    };
    reader.readAsArrayBuffer(file);
    globalState.redraw();
}

export const loadFrame = async (frameIndex: number) => {
    globalState.currentFrame = frameIndex;
    globalState.frameStatus = "loading";
    globalState.redrawFrame();
    try {
        const {format, canvasCtx} = globalState;
        const frame = format?.frames[frameIndex]!;
        const {x: width, y:height} = frame.info.size;
        const imageData = canvasCtx!.createImageData(width, height);
        const surface = new SurfaceImageData(imageData);
        const reader = createImageReader(frame.info.fmt, surface);
        await frame.read(reader);
        canvasCtx!.putImageData(imageData, 0, 0);
        globalState.frameStatus = "ready";
    } catch (e) {
        globalState.frameStatus = "error";
        globalState.errorMessage = e.message;
    }
    globalState.redrawFrame();
}