import { globalState } from "src/globalState";
import { newDomItem } from "../newDomItem"
import { load } from "src/load";
import { BitmapFormat, BitmapFrame } from "raster-images/format";

export const drawLeftSide = (root: HTMLElement) => {
    const leftSide = newDomItem("aside", {parent: root, cls: "left-side"});
    globalState.leftSide = leftSide;
    drawLoadButton(leftSide);
    const {format} = globalState;
    if (format) {
        drawFormatInfo(leftSide, format);
        drawFramesList(leftSide, format);
    }
}

const drawLoadButton = (parent: HTMLElement) => {
    const form = newDomItem("form", {parent});
    const fileItem = newDomItem("input", {
        parent: form,
        type: "file",
    }) as HTMLInputElement;
    fileItem.addEventListener("input", (e: Event) => {
        const file = fileItem.files?.[0];
        if (file) {
            load(file);
        }
    })
}

const drawFormatInfo = (parent: HTMLElement, format: BitmapFormat) => {
    const box = newDomItem("div", {parent});
    const {stream} = format;
    newDomItem("div", {parent: box, text: `File name: ${stream.name}`});
    const szItem = newDomItem("div", {parent: box, text: "..."});
    stream.getSize().then(size => szItem.innerText = `Size: ${Math.round(size / 1024)} K`)
}

const drawFramesList = (parent: HTMLElement, format: BitmapFormat) => {
    const box = newDomItem("div", {parent, cls: "frames-info-box"});
    format.frames.forEach((frame, i) => {
        drawFrameInfo(box, frame, i);
    })
}

const drawFrameInfo = (parent: HTMLElement, frame: BitmapFrame, index: number) => {
    const box = newDomItem("div", {parent, cls: "frame-info"});
    const hdrText = `${index+1} / ${frame.format.frames.length}: ${frame.type}`
    const hdr = newDomItem("div", {parent: box, cls: "frame-info-header", text: hdrText});
    const inner = newDomItem("div", {parent: box});
    const {size, fmt, vars} = frame.info;
    newDomItem("div", {parent:inner, text: `Pixel size: ${size.x} x ${size.y}`});
    newDomItem("div", {parent:inner, text: `Color model: ${fmt.colorModel}`});
    newDomItem("div", {parent:inner, text: `Bits per pixel: ${fmt.depth}`});
    newDomItem("div", {parent:inner, text: `Samples: ${fmt.signature}`});
    if (vars) {
        Object.entries(vars).forEach(([key, value]) => {
            newDomItem("div", {parent: inner, text: `${key}: ${value}`});
        });
    }
}