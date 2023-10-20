import { dumpA } from "../../../../utils";
import { copyWordsFromBigEndian } from "../copyWordsFromBigEndian";

test("copyWordsFromBigEndian", () => {
  const beData = new Uint8Array([0xaa, 0xba, 0xad, 0xf0, 0x0d]);
  const dst = new Uint16Array(4);
  dst.fill(0x5555);
  copyWordsFromBigEndian(
    2,
    beData.buffer,
    beData.byteOffset + 1,
    dst.buffer,
    dst.byteOffset + 2
  );
  expect(dumpA(Array.from(dst))).toBe("5555 BAAD F00D 5555");
});
