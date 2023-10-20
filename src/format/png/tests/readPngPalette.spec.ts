import { FormatPng } from "../FormatPng";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { SurfaceStd } from "../../../Surface";
import { surfaceConverter } from "../../../Converter/surfaceConverter";
import { dumpA } from "../../../utils";

test("readPngPalette", async () => {
  await onStreamFromGallery("I8-PS.png", async (stream) => {
    const fmt = await FormatPng.create(stream);
    expect(fmt.frames.length).toBe(1);
    const frame = fmt.frames[0]!;
    const { info } = frame;
    expect(info.fmt.signature).toBe("I8");
    const { palette } = info.fmt;
    expect(dumpA(palette![0]!)).toBe("00 00 00 FF"); // black
    expect(dumpA(palette![1]!)).toBe("FF FF FF FF"); // white
    expect(dumpA(palette![2]!)).toBe("00 00 FF FF"); // red
    expect(dumpA(palette![3]!)).toBe("00 FF 00 FF"); // green
    expect(dumpA(palette![4]!)).toBe("FF 00 00 FF"); // blue
    expect(dumpA(palette![255]!)).toBe("FF FF FF 00");
    expect(info.vars?.transparency).toBe(255);
    const img = new SurfaceStd(info);
    await frame.read(surfaceConverter(img));
    const row0 = img.getRowBuffer(0);
    expect(dumpA(palette![row0[0]!]!)).toBe("C4 44 04 FF");
  });
});

// test("read PNG transparent palette", async () => {
//     await onStreamFromGallery("J8.png", async (stream) => {
//         const fmt = await FormatPng.create(stream);
//         const frame = fmt.frames[0]!;
//         expect(frame).toBeDefined();
//         const {info} = frame;
//         expect(info.fmt.signature).toBe("I8");
//         const palette = info.fmt.palette!;
//         expect(palette).toBeDefined();
//         palette.forEach((c, i) => {
//             if (c[3] < 255) console.log(c);
//         })

//         expect(palette.reduce((sum, color) => sum + (color[3] < 0xFF ? 1 : 0), 0)).toBe(-1)
//     })
// })
