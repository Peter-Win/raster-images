type ParamsNewDomItem = {
    text?: string;
    cls?: string | string[];
    parent?: HTMLElement;
} | Record<string, string>;

export const newDomItem = (tagName: keyof HTMLElementTagNameMap, params: ParamsNewDomItem): HTMLElement => {
    const item: HTMLElement = document.createElement(tagName);
    const {parent, text, cls, ...attrs} = params;
    Object.entries(attrs).forEach(([key, value]) => {
        item.setAttribute(key, value);
    })
    if (cls) {
        const className = Array.isArray(cls) ? cls.join(" ") : cls;
        item.setAttribute("class", className);
    }
    if (text) {
        item.innerText = text;
    }
    if (parent instanceof Node) {
        parent.appendChild(item);
    }
    return item;
}