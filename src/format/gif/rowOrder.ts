export type FnRowOrder = (height: number) => Generator<number, void, unknown>;

export function* rowOrderNonInterlaced(height: number) {
  for (let y = 0; y < height; y++) {
    yield y;
  }
}

const passes = [
  { start: 0, step: 8 },
  { start: 4, step: 8 },
  { start: 2, step: 4 },
  { start: 1, step: 2 },
];

export function* rowOrderInterlaced(height: number) {
  for (const { start, step } of passes) {
    for (let y = start; y < height; y += step) {
      yield y;
    }
  }
}
