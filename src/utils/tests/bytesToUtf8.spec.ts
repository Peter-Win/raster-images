import { bytesToUtf8 } from "../utf8";

test("bytesToUtf8", () => {
  const buf = new Uint8Array([
    0xd0, 0x9f, 0xd1, 0x80, 0xd0, 0xb8, 0xd0, 0xb2, 0xd0, 0xb5, 0xd1, 0x82,
    0x21,
  ]);
  const text = bytesToUtf8(buf);
  expect(text).toBe("Привет!");
});
