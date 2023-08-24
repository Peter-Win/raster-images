import { PnmReader } from "../PnmReader";
import { RAStream, readByte } from "../../../stream";
import { TextReadStream } from "../../../stream/TextReadStream";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";

const readChar = async (stream: RAStream): Promise<string> => {
  const b: number = await readByte(stream);
  return String.fromCharCode(b);
};

describe("PnmReader", () => {
  it("skipSpaces", async () => {
    const text = "0  1\t2\r\n3";
    const stream = new TextReadStream(text);
    const rd = new PnmReader(stream);
    // 0
    await rd.skipSpaces();
    expect(await readChar(stream)).toBe("0");
    // 1
    await rd.skipSpaces();
    expect(await readChar(stream)).toBe("1");
    // 2
    await rd.skipSpaces();
    expect(await readChar(stream)).toBe("2");
    // 3
    await rd.skipSpaces();
    expect(await readChar(stream)).toBe("3");
  });

  it("readString", async () => {
    const text =
      "begin\tend\r\nsecond line\n# main comment 1\n# main comment 2\ncommented # local comment\r\nfinish";
    const stream = new TextReadStream(text);
    const rd = new PnmReader(stream);
    expect(await rd.readString()).toBe("begin");
    expect(await rd.readString()).toBe("end");
    expect(await rd.readString()).toBe("second");
    expect(await rd.readString()).toBe("line");
    expect(await rd.readString()).toBe("commented");
    expect(await rd.readString()).toBe("finish");
  });

  it("plain.pgm", async () => {
    onStreamFromGallery("plain.pgm", async (stream) => {
      const rd = new PnmReader(stream);
      expect(await rd.readString()).toBe("P2"); // signature
      expect(await rd.readString()).toBe("24"); // width
      expect(await rd.readString()).toBe("7"); // height
      expect(await rd.readString()).toBe("15"); // max value
      expect(await rd.readString()).toBe("0"); // first pixel
      expect(await rd.readString()).toBe("0"); // second pixel
    });
  });
});
