import { dump } from "../../../../utils";
import { swapRedBlue24, swapRedBlue32 } from "../swapRedBlue";

test("swapRedBlue24", async () => {
  const src = new Uint8Array([1, 2, 3, 4, 5, 6]);
  const dst = new Uint8Array(6);
  swapRedBlue24(2, src, dst);
  expect(dump(dst)).toBe("03 02 01 06 05 04");
});

test("swapRedBlue32", async () => {
  const src = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const dst = new Uint8Array(8);
  swapRedBlue32(2, src, dst);
  expect(dump(dst)).toBe("03 02 01 04 07 06 05 08");
});
