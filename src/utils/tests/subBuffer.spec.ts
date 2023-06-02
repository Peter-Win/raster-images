import { dump } from "../dump";
import { subBuffer } from "../subBuffer";

test("subBuffer", () => {
  const src = new Uint8Array(10);
  for (let i = 0; i < src.length; i++) src[i] = i;

  const buf1 = subBuffer(src, 7);
  expect(dump(buf1)).toBe("07 08 09");
  buf1[2] = 16;
  expect(src[9]).toBe(16);

  const buf2 = subBuffer(src, 2, 3);
  expect(dump(buf2)).toBe("02 03 04");
  buf2[1] = 33;
  expect(src[3]).toBe(33);
});
