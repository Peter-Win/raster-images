import { textFromBuffer } from "../../utils/textFromBuffer";
import { Variables } from "../../ImageInfo/Variables";
import { RAStream, readByte, streamLock } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { onInvalidFormat } from "../onInvalidFormat";
import { onInvalidVersion } from "../onInvalidVersion";
import { GifLogicalScreen } from "./GifLogicalScreen";
import { Palette } from "../../Palette";
import { readPalette } from "../../Palette/readPalette";
import { readGifDataAsText, skipGifData } from "./skipGifData";
import { FrameGif } from "./FrameGif";
import {
  GraphicControlExtension,
  readGraphicControlExtension,
} from "./GraphicControlExtension";

/**
 * https://www.w3.org/Graphics/GIF/spec-gif89a.txt
 */

export enum ChunkCode {
  beginOfImage = 0x2c,
  endOfStream = 0x3b,
  extensionIntroducer = 0x21,
}

export enum ExtLabel {
  graphicControl = 0xf9,
  comment = 0xfe,
  application = 0xff,
}

export class FormatGif implements BitmapFormat {
  frames: FrameGif[] = [];

  vars: Variables = {};

  screen: GifLogicalScreen;

  palette?: Palette;

  protected constructor(readonly stream: RAStream) {
    this.screen = new GifLogicalScreen();
  }

  static create(stream: RAStream): Promise<FormatGif> {
    return streamLock<FormatGif>(stream, async () => {
      const inst = new FormatGif(stream);

      await stream.seek(0);
      const chunk1 = await stream.read(3);
      if (textFromBuffer(chunk1) !== "GIF") onInvalidFormat("GIF", stream.name);
      const ver = textFromBuffer(await stream.read(3));
      if (ver !== "87a" && ver !== "89a") {
        onInvalidVersion(ver, "GIF", stream);
      }
      // Logical Screen Descriptor
      inst.screen = await GifLogicalScreen.read(stream);

      // Global Color Table
      if (inst.screen.isGlobalTable) {
        const { tableSize } = inst.screen;
        inst.palette = await readPalette(stream, tableSize, { rgb: true });
      }

      const streamSize = await stream.getSize();
      let graphicControlExtension: GraphicControlExtension | undefined;
      let comment: string | undefined;
      for (;;) {
        const curPos = await stream.getPos();
        if (curPos >= streamSize) break;
        const code = await readByte(stream);
        if (code === ChunkCode.endOfStream) {
          break;
        }
        if (code === ChunkCode.beginOfImage) {
          const frame = await FrameGif.create(inst, graphicControlExtension);
          inst.frames.push(frame);
          graphicControlExtension = undefined;
        } else if (code === ChunkCode.extensionIntroducer) {
          const label = await readByte(stream);
          if (label === ExtLabel.graphicControl) {
            graphicControlExtension = await readGraphicControlExtension(stream);
          } else if (label === ExtLabel.comment) {
            const text: string = await readGifDataAsText(stream);
            comment = comment || text;
          } else {
            await skipGifData(stream);
          }
        } else {
          // skip a label
          await stream.skip(1);
          await skipGifData(stream);
        }
      }
      if (comment && inst.frames[0]?.info.vars) {
        inst.frames[0].info.vars.comment = comment;
      }

      return inst;
    });
  }
}
