import { dump } from "../../../utils";
import { Cvt24to32 } from "../Cvt24to32";

test("Cvt24to32", () => {
  // ignor  <---    cvt    --->  ignor
  //   0  |   1  |   2  |   3  |   4
  // 0 1 2; 3 4 5; 6 7 8; 9 A B; C D E
  const totalLength = 5;
  const cvtStart = 1;
  const width = 3;
  const src = new Uint8Array(totalLength * 3);
  for (let i = 0; i < src.length; i++) src[i] = i;
  const dst = new ArrayBuffer(totalLength * 4);

  Cvt24to32.cvt(width, src.buffer, cvtStart * 3, dst, cvtStart * 4);
  expect(dump(new Uint8Array(dst))).toBe(
    // 0 (ignor)|     1     |     2     |     3     | 4 ignor
    "00 00 00 00 03 04 05 FF 06 07 08 FF 09 0A 0B FF 00 00 00 00"
  );
});
