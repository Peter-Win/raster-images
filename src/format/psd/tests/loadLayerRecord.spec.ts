import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { readPsdFileHeader } from "../PsdFileHeader";
import { readPsdSection } from "../psdSection";
import { loadLayerRecord } from "../psdLayerInfo";
import { readInt16BE } from "../../../stream";

describe("loadLayerRecord", () => {
  it("cmyk2.psd", async () => {
    await onStreamFromGallery("psd/cmyk2.psd", async (stream) => {
      await readPsdFileHeader(stream);
      await readPsdSection(stream, 0, async () => {});
      await readPsdSection(stream, 0, async () => {});
      await readPsdSection(stream, 0, async () => {
        await readPsdSection(stream, 0, async () => {
          const layersCount = await readInt16BE(stream);
          expect(layersCount).toBe(6);
          const rec1 = await loadLayerRecord(stream);
          expect(rec1).toEqual({
            top: 0,
            left: 0,
            bottom: 300,
            right: 400,
            channels: [
              { channelId: 0, dataSize: 3002 },
              { channelId: 1, dataSize: 3002 },
              { channelId: 2, dataSize: 3002 },
              { channelId: 3, dataSize: 3002 },
            ],
            blendMode: "norm",
            opacity: 255,
            clipping: 0,
            flags: 9,
            layerName: "Фон",
            vars: {
              clbl: 1,
              infx: 0,
              knko: 0,
              lclr: [0, 0],
              lspf: 5,
              lyid: 2,
            },
            extra: {
              clbl: {
                key: "clbl",
                offset: 576374,
                size: 4,
              },
              fxrp: {
                key: "fxrp",
                offset: 576542,
                size: 16,
              },
              infx: {
                key: "infx",
                offset: 576390,
                size: 4,
              },
              knko: {
                key: "knko",
                offset: 576406,
                size: 4,
              },
              lclr: {
                key: "lclr",
                offset: 576438,
                size: 8,
              },
              lspf: {
                key: "lspf",
                offset: 576422,
                size: 4,
              },
              luni: {
                key: "luni",
                offset: 576334,
                size: 12,
              },
              lyid: {
                key: "lyid",
                offset: 576358,
                size: 4,
              },
              shmd: {
                key: "shmd",
                offset: 576458,
                size: 72,
              },
            },
          });
          const rec2 = await loadLayerRecord(stream);
          expect(rec2).toEqual({
            top: 0,
            left: 0,
            bottom: 250,
            right: 100,
            channels: [
              { channelId: -1, dataSize: 1002 },
              { channelId: 0, dataSize: 17265 },
              { channelId: 1, dataSize: 1002 },
              { channelId: 2, dataSize: 14673 },
              { channelId: 3, dataSize: 1002 },
            ],
            blendMode: "norm",
            opacity: 255,
            clipping: 0,
            flags: 8,
            layerName: "cyan",
            vars: {
              clbl: 1,
              infx: 0,
              knko: 0,
              lclr: [0, 0],
              lspf: 0,
              lyid: 3,
            },
            extra: {
              clbl: { key: "clbl", offset: 576730, size: 4 },
              fxrp: { key: "fxrp", offset: 576898, size: 16 },
              infx: { key: "infx", offset: 576746, size: 4 },
              knko: { key: "knko", offset: 576762, size: 4 },
              lclr: { key: "lclr", offset: 576794, size: 8 },
              lspf: { key: "lspf", offset: 576778, size: 4 },
              luni: { key: "luni", offset: 576690, size: 12 },
              lyid: { key: "lyid", offset: 576714, size: 4 },
              shmd: { key: "shmd", offset: 576814, size: 72 },
            },
          });
        });
      });
    });
  });
});
