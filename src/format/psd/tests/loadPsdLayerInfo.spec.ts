import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { readPsdFileHeader } from "../PsdFileHeader";
import { readPsdSection } from "../psdSection";
import { loadPsdLayerInfo } from "../psdLayerInfo";

describe("loadPsdLayerInfo", () => {
  it("CMYK.psd", async () => {
    await onStreamFromGallery("psd/CMYK.psd", async (stream) => {
      await readPsdFileHeader(stream);
      await readPsdSection(stream, 0, async () => {}); // color
      await readPsdSection(stream, 0, async () => {}); // resources
      await readPsdSection(stream, 0, async () => {
        await readPsdSection(stream, 0, async () => {
          const layers = await loadPsdLayerInfo(stream);
          expect(layers).toEqual([
            {
              blendMode: "mul ",
              bottom: 64,
              channels: [
                { channelId: -1, dataSize: 258 },
                { channelId: 0, dataSize: 326 },
                { channelId: 1, dataSize: 318 },
                { channelId: 2, dataSize: 326 },
                { channelId: 3, dataSize: 318 },
              ],
              clipping: 0,
              flags: 8,
              layerName: "Layer 1",
              compression: "RLE",
              left: 0,
              opacity: 255,
              right: 64,
              top: 0,
              offset: 575410,
              size: 1546,
              vars: {
                clbl: 1,
                infx: 0,
                knko: 0,
                lclr: [0, 0],
                lspf: 0,
                lyid: 2,
              },
              extra: {
                clbl: {
                  key: "clbl",
                  offset: 575226,
                  size: 4,
                },
                fxrp: {
                  key: "fxrp",
                  offset: 575394,
                  size: 16,
                },
                infx: {
                  key: "infx",
                  offset: 575242,
                  size: 4,
                },
                knko: {
                  key: "knko",
                  offset: 575258,
                  size: 4,
                },
                lclr: {
                  key: "lclr",
                  offset: 575290,
                  size: 8,
                },
                lnsr: {
                  key: "lnsr",
                  offset: 575194,
                  size: 4,
                },
                lspf: {
                  key: "lspf",
                  offset: 575274,
                  size: 4,
                },
                luni: {
                  key: "luni",
                  offset: 575162,
                  size: 20,
                },
                lyid: {
                  key: "lyid",
                  offset: 575210,
                  size: 4,
                },
                shmd: {
                  key: "shmd",
                  offset: 575310,
                  size: 72,
                },
              },
            },
          ]);
        });
      });
    });
  });
});
