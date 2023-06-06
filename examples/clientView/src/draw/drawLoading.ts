import { globalState } from "src/globalState"
import { newDomItem } from "./newDomItem"

export const drawLoading = (root: HTMLElement) => {
    const box = newDomItem("div", {
        parent: root,
        cls: "loader-box",
    })
    const {file} = globalState;
    if (file) {
        newDomItem("div", {parent: box, text: file.name})
    }
    newDomItem("div", {parent: box, text: "Loading..."})
}