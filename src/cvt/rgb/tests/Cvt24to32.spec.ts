import { Cvt24to32 } from "../Cvt24to32";

test("Cvt24to32", () => {
  const src = new Uint8Array([1, 2, 3, 4, 5, 6]);
  const dst = new ArrayBuffer(8);
  Cvt24to32.cvt(2, src, 0, dst, 0);
  expect(new Uint8Array(dst).join(",")).toBe("1,2,3,255,4,5,6,255");
});
