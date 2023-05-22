import { dump, dumpA } from "../dump";

test("dump", () => {
  const buf = new Uint8Array(18);
  for (let i = 0; i < buf.byteLength; i++) buf[i] = i;
  expect(dump(buf)).toBe(
    "00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F 10 11"
  );
  expect(dump(buf, 10)).toBe("0A 0B 0C 0D 0E 0F 10 11");
  expect(dump(buf, 10, 16)).toBe("0A 0B 0C 0D 0E 0F");
});

test("dumpA", () => {
  expect(dumpA([0xa, 0xb0, 0xc00])).toBe("0A B0 0C00");
});
