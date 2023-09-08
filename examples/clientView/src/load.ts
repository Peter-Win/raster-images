import { globalState } from "./globalState";
import { BufferStream } from "raster-images/stream";
import { createFormatByName } from "raster-images/format";
import { createImageReader } from "raster-images/transfer/createImageReader";
import { SurfaceImageData } from "raster-images/Surface/SurfaceImageData";
import { delayInterrupter } from "raster-images/interrupter/delayInterrupter";
import { ProgressInfo } from "raster-images/transfer/ProgressInfo";

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
        // Загрузка графики - тяжелая операция. Она может нарушить нормальную работу браузера.
        // Существует два способа решения этой проблемы.
        // 1. Рекомендуется использовать WebWorker. Но это усложнит структуру приложения.
        // 2. Вариант попроще - использовать прерыватель. Это несколько увеличивает время загрузки. Зато очень просто в реализации.
        const progress = delayInterrupter(100, 10, async (info: ProgressInfo) => {
            canvasCtx!.putImageData(imageData, 0, 0);
            const lp = document.getElementById("loadProgress");
            if (lp) {
                lp.innerText = `${info.value} / ${info.maxValue}`;
            }
        });
        const reader = createImageReader(frame.info.fmt, surface, {progress});
        await frame.read(reader);
        if (frame.info.fmt.alpha) {
            for (let j=0; j<height; j++) {
                const row = surface.getRowBuffer(j);
                for (let i=0; i<width; i++) {
                    row[i*4+3] = 0xFF;
                }
            }
        }
        canvasCtx!.putImageData(imageData, 0, 0);
        globalState.frameStatus = "ready";
    } catch (e) {
        globalState.frameStatus = "error";
        globalState.errorMessage = e.message;
    }
    globalState.redrawFrame();
}