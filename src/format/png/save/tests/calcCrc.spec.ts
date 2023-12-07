import { readDwordBE } from "../../../../stream";
import { onStreamFromGallery } from "../../../../tests/streamFromGallery";
import { FormatPng } from "../../FormatPng";
import { FramePng } from "../../FramePng";
import { beginCrc, updateCrc, endCrc } from "../calcCrc";

describe("calcCrc", () => {
  it("real file", async () => {
    await onStreamFromGallery("R8G8B8A8.png", async (stream) => {
      const fmt = await FormatPng.create(stream);
      const fr: FramePng = fmt.frames[0]!;
      for (const { dataPosition, length } of fr.chunks) {
        await stream.seek(dataPosition - 8);
        // because type is a part of chunk header, but CRC must be calculated with it.
        const header = await stream.read(8);
        const data = await stream.read(length);
        const crcInFile = await readDwordBE(stream);
        let crcFromCalc = beginCrc;
        crcFromCalc = updateCrc(crcFromCalc, header, 4, 8);
        crcFromCalc = updateCrc(crcFromCalc, data);
        crcFromCalc = endCrc(crcFromCalc);
        expect(crcFromCalc.toString(16)).toBe(crcInFile.toString(16));
      }
    });
  });
});
