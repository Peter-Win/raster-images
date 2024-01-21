import { TiffFillOrder } from "../../../tags/TiffFillOrder";
import { BitReader } from "../BitReader";

test("BitReader", () => {
  const data = new Uint8Array([0b01011100, 0b10101110, 0b11010111]);
  const reader = new BitReader(data, TiffFillOrder.lowColInHiBit);
  expect(reader.getStrBit()).toBe("0");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("0");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("0");
  expect(reader.getStrBit()).toBe("0");

  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("0");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("0");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("0");

  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("0");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("0");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("1");
  expect(reader.getStrBit()).toBe("1");
});
