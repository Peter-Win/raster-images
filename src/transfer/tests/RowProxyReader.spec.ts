import { SurfaceStd } from "../../Surface";
import { FnCvt } from "../../cvt/FnCvt";
import { dump } from "../../utils";
import { ImageReader } from "../ImageReader";
import { RowProxyReader } from "../RowProxyReader";
import { SurfaceReader } from "../SurfaceReader";

describe("RowProxyReader", () => {
  it("Gray8 to RGB", async () => {
    // FF 7F 3F
    // 1F 0F 07
    // const srcFmt = new PixelFormat(8, "Gray");
    const dstImage = SurfaceStd.create(3, 2, 24);
    const cvt: FnCvt = (width, srcBuf, srcOffs, dstBuf, dstOffs) => {
      const src = new Uint8Array(srcBuf, srcOffs);
      const dst = new Uint8Array(dstBuf, dstOffs);
      for (let x = 0, p = 0; x < width; x++) {
        const g = src[x]!;
        dst[p++] = g;
        dst[p++] = g;
        dst[p++] = g;
      }
    };
    const testSrc = new Uint8Array([1, 2, 3]);
    const testDst = new Uint8Array(9);
    cvt(
      3,
      testSrc.buffer,
      testSrc.byteOffset,
      testDst.buffer,
      testDst.byteOffset
    );
    expect(dump(testDst)).toBe("01 01 01 02 02 02 03 03 03");

    const dstReader: ImageReader = new SurfaceReader(dstImage);
    const proxyReader: ImageReader = new RowProxyReader(
      cvt,
      dstImage.info.fmt,
      dstReader
    );
    let srcValue = 0xff;
    await proxyReader.onStart(dstImage.info);
    for (let y = 0; y < 2; y++) {
      const buf = await proxyReader.getRowBuffer(y);
      for (let x = 0; x < 3; x++) {
        buf[x] = srcValue;
        srcValue >>= 1;
      }
      await proxyReader.finishRow(y);
    }
    if (proxyReader.onFinish) await proxyReader.onFinish();
    expect(dump(dstImage.data)).toBe(
      "FF FF FF 7F 7F 7F 3F 3F 3F 1F 1F 1F 0F 0F 0F 07 07 07"
    );
  });
  it("2 step RowProxyReader", async () => {
    // reader generate Gray8 image 3x3 = [1,2,3][4,5,6][7,6,9]
    // first converter use *2 => [2,4,6][8,10,12][14,16,18]
    // second converter use +0x80 => [82,84,86][88,8A,8C][8E,90,92]
    const dstImage = SurfaceStd.create(3, 3, 8, { colorModel: "Gray" });
    expect(dstImage.rowSize).toBe(3);
    const { fmt } = dstImage.info;
    const cvt1: FnCvt = (width, srcBuf, srcOffset, dstBuf, dstOffset) => {
      const src = new Uint8Array(srcBuf, srcOffset);
      const dst = new Uint8Array(dstBuf, dstOffset);
      for (let x = 0; x < width; x++) {
        dst[x] = src[x]! * 2;
      }
    };
    const cvt2: FnCvt = (width, srcBuf, srcOffset, dstBuf, dstOffset) => {
      const src = new Uint8Array(srcBuf, srcOffset);
      const dst = new Uint8Array(dstBuf, dstOffset);
      for (let x = 0; x < width; x++) {
        dst[x] = src[x]! + 0x80;
      }
    };
    const dstReader: ImageReader = new SurfaceReader(dstImage);
    const reader2: ImageReader = new RowProxyReader(cvt2, fmt, dstReader);
    const reader1: ImageReader = new RowProxyReader(cvt1, fmt, reader2);
    let srcValue = 1;
    await reader1.onStart(dstImage.info);
    for (let y = 0; y < 3; y++) {
      const buf = await reader1.getRowBuffer(y);
      for (let x = 0; x < 3; x++) buf[x] = srcValue++;
      await reader1.finishRow(y);
    }
    if (reader1.onFinish) await reader1.onFinish();
    expect(dump(dstImage.data)).toBe("82 84 86 88 8A 8C 8E 90 92");
  });
});
