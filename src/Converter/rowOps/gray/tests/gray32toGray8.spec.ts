import { dump } from "../../../../utils";
import { gray32toGray8 } from "../gray32";

test("gray32toGray8", () => {
  const fsrc = new Float32Array([0, 0.25, 0.5, 0.75, 1]);
  const bsrc = new Uint8Array(fsrc.buffer, fsrc.byteOffset);
  const dst = new Uint8Array(fsrc.length);
  gray32toGray8(fsrc.length, bsrc, dst);
  expect(dump(dst)).toBe("00 3F 7F BF FF");
});
