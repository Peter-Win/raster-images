import { decodeQwords } from "../decodeQwords";

const createBuf = (src: number[], littleEndian: boolean) => {
  const bbuf = new Uint8Array(src.length * 8);
  const dv = new DataView(bbuf.buffer, bbuf.byteOffset);
  for (let i = 0; i < src.length; i++)
    dv.setFloat64(i * 8, src[i]!, littleEndian);
  const qbuf = new Float64Array(bbuf.buffer, bbuf.byteOffset);
  return { bbuf, qbuf };
};

describe("decodeQwords", () => {
  it("Qwords LE same", () => {
    const littleEndian = true;
    const src = [1, -0.25];
    const { bbuf, qbuf } = createBuf(src, littleEndian);
    decodeQwords(littleEndian, src.length, bbuf, 0, bbuf, 0);
    expect(Array.from(qbuf)).toEqual(src);
  });
  it("Qwords BE same", () => {
    const littleEndian = false;
    const src = [1, -0.25, 0, 55];
    const { bbuf, qbuf } = createBuf(src, littleEndian);
    decodeQwords(littleEndian, src.length, bbuf, 0, bbuf, 0);
    expect(Array.from(qbuf)).toEqual(src);
  });

  it("Qwords LE different", () => {
    // prepare
    const littleEndian = true;
    const srcPrefix = [55];
    const dstPrefix = [22, 23];
    const src = [4, 1, 0.75, 0, -0.25];
    const { bbuf: bsrc } = createBuf([...srcPrefix, ...src], littleEndian);

    const expectedArray = [...dstPrefix, ...src];
    const bdst = new Uint8Array(8 * expectedArray.length);
    const qdst = new Float64Array(bdst.buffer, bdst.byteOffset);
    dstPrefix.forEach((n, i) => {
      qdst[i] = n;
    });

    // test
    decodeQwords(
      littleEndian,
      src.length,
      bsrc,
      srcPrefix.length * 8,
      bdst,
      dstPrefix.length * 8
    );
    expect(Array.from(qdst)).toEqual(expectedArray);
  });

  it("Qwords BE different", () => {
    // prepare
    const littleEndian = false;
    const srcPrefix = [55];
    const dstPrefix = [22, 23];
    const src = [4, 1, 0.75, 0, -0.25];
    const { bbuf: bsrc } = createBuf([...srcPrefix, ...src], littleEndian);

    const expectedArray = [...dstPrefix, ...src];
    const bdst = new Uint8Array(8 * expectedArray.length);
    const qdst = new Float64Array(bdst.buffer, bdst.byteOffset);
    dstPrefix.forEach((n, i) => {
      qdst[i] = n;
    });

    // test
    decodeQwords(
      littleEndian,
      src.length,
      bsrc,
      srcPrefix.length * 8,
      bdst,
      dstPrefix.length * 8
    );
    expect(Array.from(qdst)).toEqual(expectedArray);
  });
});
