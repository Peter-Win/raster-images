import { Surface } from "../Surface";
import { loadImageByName } from "../loadImage";
import { dump, dumpW, dumpFloat32 } from "../utils";
import { onStreamFromGallery } from "./streamFromGallery";

type OptCompareImages = {
  epsiolon?: number;
};

/**
 * Compare two images.
 * Images can have different pixel formats,
 * but the number of bits per ыфьзду must be a multiple of 8.
 * @param testImg
 * @param cmpFileName name from gallery
 * @param check example: (fact, need) => expect(fact).toBe(need)
 */
export const compareImages = async (
  testImg: Surface,
  cmpFileName: string,
  check: (received: string, expected: string) => void,
  options?: OptCompareImages
) => {
  const { epsiolon = 1 } = options ?? {};
  const cmpImg = await onStreamFromGallery(cmpFileName, async (stream) =>
    loadImageByName(stream)
  );
  const { size } = cmpImg.info;
  check(size.toString(), testImg.info.size.toString());
  const nSamples = testImg.info.fmt.samples.length;
  check(
    `Samples count ${nSamples}`,
    `Samples count ${cmpImg.info.fmt.samples.length}`
  );
  const testBits = testImg.info.fmt.maxSampleDepth;
  const cmpBits = cmpImg.info.fmt.maxSampleDepth;
  type Array = Uint8Array | Uint16Array | Float32Array;
  const cmp = <TRowCmp extends Array, TRowTest extends Array>(
    getCmpRow: (img: Surface, y: number) => TRowCmp,
    getTestRow: (img: Surface, y: number) => TRowTest,
    isEquals: (cmpVal: number, tstVal: number) => boolean,
    cmpDump: (row: TRowCmp, start: number, stop: number) => string,
    testDump: (row: TRowTest, start: number, stop: number) => string
  ) => {
    for (let y = 0; y < size.y; y++) {
      const cmpRow = getCmpRow(cmpImg, y);
      const testRow = getTestRow(testImg, y);
      let pCmp = 0;
      let pTest = 0;
      for (let x = 0; x < size.x; x++) {
        for (let i = 0; i < nSamples; i++) {
          const cmpVal = cmpRow[pCmp++]!;
          const testVal = testRow[pTest++]!;
          if (!isEquals(cmpVal, testVal)) {
            check(
              `y=${y}, x=${x}, ${cmpDump(
                cmpRow,
                x * nSamples,
                (x + 1) * nSamples
              )}`,
              `y=${y}, x=${x}, ${testDump(
                testRow,
                x * nSamples,
                (x + 1) * nSamples
              )}`
            );
          }
        }
      }
    }
  };
  if (cmpBits === 8 && testBits === 8) {
    cmp(getRow8, getRow8, (a, b) => a === b, getDump8, getDump8);
  } else if (cmpBits === 8 && testBits === 16) {
    cmp(
      getRow8,
      getRow16,
      (a, b) => Math.abs(a - (b >> 8)) <= epsiolon,
      getDump8,
      getDump16
    );
  } else if (cmpBits === 8 && testBits === 32) {
    cmp(
      getRow8,
      getRow32,
      (a, b) => Math.abs(a - b * 255) <= epsiolon,
      getDump8,
      getDump32
    );
  } else if (cmpBits === 32 && testBits === 32) {
    cmp(
      getRow32,
      getRow32,
      (a, b) => Math.abs(a * 255 - b * 255) <= epsiolon,
      getDump32,
      getDump32
    );
  } else
    throw Error(`Cant compare images ${cmpBits} and ${testBits} bits/sample`);
};

const getRow8 = (img: Surface, y: number): Uint8Array => img.getRowBuffer(y);
const getRow16 = (img: Surface, y: number): Uint16Array =>
  img.getRowBuffer16(y);
const getRow32 = (img: Surface, y: number): Float32Array =>
  img.getRowBuffer32(y);
const getDump8 = (row: Uint8Array, start: number, stop: number) =>
  dump(row, start, stop);
const getDump16 = (row: Uint16Array, start: number, stop: number) =>
  dumpW(row, start, stop);
const getDump32 = (row: Float32Array, start: number, stop: number) =>
  dumpFloat32(row, 3, start, stop);
