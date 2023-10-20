import { dump } from "../../../../utils";
import { copyWordsToBigEndian } from "../copyWordsToBigEndian";

test("copyWordsToEndian", () => {
  //   const beData = new Uint8Array([0xaa, 0xba, 0xad, 0xf0, 0x0d]);
  const src = new Uint16Array([0xaaaa, 0xbaad, 0xf00d, 0xaaaa]);
  const dst = new Uint8Array(6);
  dst.fill(0x55);
  copyWordsToBigEndian(
    2,
    src.buffer,
    src.byteOffset + 2,
    dst.buffer,
    dst.byteOffset + 1
  );
  expect(dump(dst)).toBe("55 BA AD F0 0D 55");
});
