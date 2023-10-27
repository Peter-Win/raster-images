import { SurfaceImageData } from "raster-images/Surface";
import { MsgData, MsgOnImageLoad } from "./types";
import "./style.css";

window.addEventListener('load', ():void => {
    const workerLoad = new Worker('workerLoad.js');
    const buttonLoad = document.getElementById("buttonLoad") as HTMLInputElement;
    if (!buttonLoad) {
        throw new Error('#buttonLoad element not found');
    }
    buttonLoad.addEventListener("change", (e) => {
        const {files} = e.target as HTMLInputElement;
        if (files?.length === 1) {
            onMessage({type: "onStart"});
            const file = files[0];
            workerLoad.postMessage({type: "loadFile", file});
        }
    });
    workerLoad.addEventListener("message", ({data}) => {
        if (typeof data === "object" && data?.type) {
            onMessage(data);
        }
    });
});

const onMessage = (msg: MsgData) => {
    console.log("onMessage", msg)
    const resultBox = document.getElementById("resultBox");
    if (!resultBox) return;
    const {type} = msg;
    if (type === "onProgress") {
        const progressInfo = document.getElementById("progressInfo");
        if (progressInfo) {
            const {value, maxValue, step} = msg.info;
            const percent = maxValue ? Math.round(value * 100 / maxValue) : 0;
            progressInfo.innerText = `${msg.info.step} ${percent} %`;
        }
        return;
    }
    resultBox.innerHTML = "";
    if (type === "onImageLoad") {
        drawImage(msg, resultBox);
    } else if (type === "onError") {
        const div = document.createElement("div");
        div.classList.add("error");
        div.innerText = msg.error.message;
        resultBox.appendChild(div);
    } else if (type === "onStart") {
        const div = document.createElement("div");
        div.classList.add("progress-box");
        div.innerText = "Wait...";
        resultBox.appendChild(div);
        const progressInfo = document.createElement("span");
        progressInfo.id = "progressInfo";
        resultBox.appendChild(progressInfo);
    }
}

const drawImage = (msg: MsgOnImageLoad, resultBox: HTMLElement) => {
    try {
        const image = SurfaceImageData.fromParcel(msg.image);
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        resultBox.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw Error("Canvas don't supported");
        } else {
            ctx.rect(0, 0, image.width, image.height);
            ctx.fill();
            ctx.putImageData(image.imageData, 0, 0);
        }
    } catch (error) {
        onMessage({type: "onError", error})
    }
}