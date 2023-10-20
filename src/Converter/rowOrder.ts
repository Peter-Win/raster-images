export type FnRowOrder = (height: number) => Generator<number, void, unknown>;

export function* rowOrderForward(height: number) {
  for (let y = 0; y < height; y++) {
    yield y;
  }
}
export function* rowOrderBackward(height: number) {
  for (let y = height - 1; y >= 0; y--) {
    yield y;
  }
}
export const stdRowOrder = (dir: "forward" | "backward"): FnRowOrder =>
  dir === "forward" ? rowOrderForward : rowOrderBackward;
