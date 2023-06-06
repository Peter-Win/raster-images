import { drawMainFrame } from "./draw/drawMainFrame";
import "./style.css";

window.addEventListener('load', ():void => {
    const root: HTMLElement|null = document.querySelector('#root');
    if (!root) {
        throw new Error('#root element not found');
    }
    drawMainFrame(root);
});
