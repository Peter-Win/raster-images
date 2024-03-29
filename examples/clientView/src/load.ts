import { BufferStream } from "raster-images/stream";
import { createFormatByName } from "raster-images/format";
import { SurfaceImageData } from "raster-images/Surface/SurfaceImageData";
import { delayInterrupter } from "raster-images/interrupter/delayInterrupter";
import { ProgressInfo } from "raster-images/Converter/ProgressInfo";
import { createConverterForRead } from "raster-images/Converter/createConverter";
import { globalState } from "./globalState";

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
  };
  reader.onload = async () => {
    try {
      if (reader.result instanceof ArrayBuffer) {
        const stream = new BufferStream(new Uint8Array(reader.result, 0), {
          name: file.name,
        });
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
  };
  reader.onerror = () => {
    onError(Error(`Can't open file ${file.name}`));
  };
  reader.readAsArrayBuffer(file);
  globalState.redraw();
};

export const loadFrame = async (frameIndex: number) => {
  globalState.currentFrame = frameIndex;
  globalState.frameStatus = "loading";
  globalState.redrawFrame();
  showActiveFrame(frameIndex);
  try {
    const { format, canvasCtx } = globalState;
    const frame = format?.frames[frameIndex]!;
    const { x: width, y: height } = frame.info.size;
    const imageData = canvasCtx!.createImageData(width, height);
    const surface = new SurfaceImageData(imageData);
    // Загрузка графики - тяжелая операция. Она может нарушить нормальную работу браузера.
    // Существует два способа решения этой проблемы.
    // 1. Рекомендуется использовать WebWorker. (see examples/webWorker).
    // 2. Вариант попроще - использовать прерыватель. Это несколько увеличивает время загрузки. Зато очень просто в реализации.
    const progress = delayInterrupter(100, 10, async (info: ProgressInfo) => {
      canvasCtx!.putImageData(imageData, 0, 0);
      const lp = document.getElementById("loadProgress");
      if (lp) {
        lp.innerText = `${info.value} / ${info.maxValue}`;
      }
    });
    const converter = createConverterForRead(frame.info.fmt, surface, {
      progress,
    });
    await frame.read(converter);
    canvasCtx!.putImageData(imageData, 0, 0);
    globalState.frameStatus = "ready";
  } catch (e) {
    globalState.frameStatus = "error";
    globalState.errorMessage = e.message;
  }
  globalState.redrawFrame();
};

const showActiveFrame = (frameIndex: number) => {
  const allFrameHeaders = document.querySelectorAll(".frame-info-header");
  Array.from(allFrameHeaders).forEach((div) => div.classList.remove("active"));
  allFrameHeaders[frameIndex]?.classList.add("active");
};
