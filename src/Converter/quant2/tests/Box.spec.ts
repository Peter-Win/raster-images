import { Box } from "../Box";
import { HistArray, calcHistOffsetFast, createHistArray } from "../HistArray";

describe("Box", () => {
  const hist: HistArray = createHistArray();
  const addColor = (h: HistArray, r: number, g: number, b: number) => {
    const pos = calcHistOffsetFast(b, g, r);
    // eslint-disable-next-line no-param-reassign
    h[pos]!++;
  };
  const colors: [number, number, number][] = [
    [55, 2, 3], // high red
    [15, 2, 3], // low red
    [1, 56, 3], // high green
    [1, 16, 3], // low green
    [1, 2, 57], // high blue
    [1, 2, 17], // low blue
  ];
  colors.forEach(([r, g, b]) => addColor(hist, r, g, b));

  it("update", () => {
    const box = Box.createMax();
    box.update(hist);
    expect(box.colorCount).toBe(6);
    expect(box.c0min).toBe(3);
    expect(box.c0max).toBe(57);
    expect(box.c1min).toBe(2);
    expect(box.c1max).toBe(56);
    expect(box.c2min).toBe(1);
    expect(box.c2max).toBe(55);
  });

  it("split", () => {
    const box0a = Box.createMax();
    box0a.update(hist);
    // Так как все 6 цветов расположены вдоль осей,
    // то разделив бокс по одной из осей получается 1 цвет в старшем боксе (b) и 5 в младшем (a).
    // В младший попадает темный вариант цвета для указанной оси и все цвета, которые не принадлежат оси.
    const box0b = box0a.split(0, hist);
    expect(box0a.colorCount).toBe(5);
    expect(box0b.colorCount).toBe(1);

    expect(box0a.c0min).toBe(3);
    expect(box0a.c0max).toBe(17); // low blue
    expect(box0b.c0min).toBe(57); // high blue
    expect(box0b.c0max).toBe(57); // equal to min because colorCount=1

    expect(box0b.c1min).toBe(box0a.c1min);
    expect(box0b.c1max).toBe(box0a.c1min); // max = min because colorCount=1
    expect(box0b.c2min).toBe(box0a.c2min);
    expect(box0b.c2max).toBe(box0a.c2min); // max = min

    const box1a = Box.createMax();
    box1a.update(hist);
    const box1b = box1a.split(1, hist);
    expect(box1a.colorCount).toBe(5);
    expect(box1b.colorCount).toBe(1);
    expect(box1a.c1min).toBe(2);
    expect(box1a.c1max).toBe(16);
    expect(box1b.c1min).toBe(56);
    expect(box1b.c1max).toBe(56);

    expect(box1b.c0min).toBe(box1a.c0min);
    expect(box1b.c0max).toBe(box1a.c0min); // max = min because colorCount=1
    expect(box1b.c2min).toBe(box1a.c2min);
    expect(box1b.c2max).toBe(box1a.c2min); // max = min
  });

  it("computeColor", () => {
    const box = Box.createMax();
    const locHist = createHistArray();
    addColor(locHist, 63, 63, 63);
    expect(box.computeColor(locHist)).toEqual([255, 255, 255, 255]);
    addColor(locHist, 0, 0, 0);
    expect(box.computeColor(locHist)).toEqual([128, 128, 128, 255]);
  });
});
