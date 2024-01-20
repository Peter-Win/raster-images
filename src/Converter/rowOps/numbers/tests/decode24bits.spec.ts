import { dump } from "../../../../utils";
import { isLittleEndian } from "../../../../utils/isLittleEndian";
import { decode24bits } from "../decode24bits";

test("decode24bits", () => {
  const src = new Uint8Array([1, 2, 3, 4, 5, 6]);
  const dst = new Uint8Array(src.length);
  // little endian
  decode24bits(true, 2, src, 0, dst, 0);
  if (isLittleEndian()) {
    expect(dump(dst)).toBe("01 02 03 04 05 06");
  } else {
    expect(dump(dst)).toBe("03 02 01 06 05 04");
  }
  // big endian
  decode24bits(false, 2, src, 0, dst, 0);
  if (isLittleEndian()) {
    expect(dump(dst)).toBe("03 02 01 06 05 04");
  } else {
    expect(dump(dst)).toBe("01 02 03 04 05 06");
  }
});
