import { globalState } from "src/globalState";
import { newDomItem } from "../newDomItem";

export const drawCenterPart = (root: HTMLElement) => {
    const imageFrame = newDomItem("div", {parent: root, cls: "image-frame"});
    const {formatStatus} = globalState;
    switch (formatStatus) {
        case "error":
            drawError(imageFrame);
            break;
        case "ready":
            drawImage(imageFrame);
    }
}

const drawError = (parent: HTMLElement) => {
    const {errorMessage} = globalState;
    newDomItem("div", {parent, cls: "error-info", text: errorMessage || "Error"});
}

const drawImage = (parent: HTMLElement) => {
    let loaderBox: HTMLElement | null = null;
    let canvas: HTMLCanvasElement | null = null;
    const update = () => {
        const {frameStatus, errorMessage, format, currentFrame} = globalState;
        if (loaderBox) {
            loaderBox.remove();
            loaderBox = null;
        }
        const frame = format?.frames[currentFrame];
        if (!frame) return;
        const width = frame.info.size.x;
        const height = frame.info.size.y;
        switch (frameStatus) {
            case "loading":
                parent.innerHTML = "";
                loaderBox = newDomItem("div", {parent, text: `Loading...`});
                canvas = newDomItem("canvas", {parent}) as HTMLCanvasElement;
                canvas.width = width;
                canvas.height = height;
                globalState.canvasCtx = canvas.getContext('2d');
                break;
            case "error":
                canvas?.remove();
                newDomItem("div", {parent, cls: "error-info", text: errorMessage });
                break;
        }
    }
    globalState.redrawFrame = update;

}