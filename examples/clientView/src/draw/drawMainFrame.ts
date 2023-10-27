import { globalState } from "src/globalState";
import { drawLeftSide } from "./drawLeftSide";
import { drawLoading } from "./drawLoading";
import { drawCenterPart } from "./drawCenterPart";

export const drawMainFrame = (root: HTMLElement) => {
  root.innerHTML = "";
  const { formatStatus: loaderStatus } = globalState;
  globalState.redraw = () => drawMainFrame(root);
  globalState.leftSide = null;
  if (loaderStatus === "loading") {
    drawLoading(root);
  } else {
    drawLeftSide(root);
    drawCenterPart(root);
  }
};
