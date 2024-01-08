import { RAStream, streamLock } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { Variables } from "../../ImageInfo/Variables";
import { readTiffFileHeader } from "./TiffFileHeader";
import { FrameTiff } from "./FrameTiff";

export class FormatTiff implements BitmapFormat {
  static create(stream: RAStream): Promise<FormatTiff> {
    return streamLock(stream, async () => {
      await stream.seek(0);
      const { littleEndian, offset } = await readTiffFileHeader(stream);
      const inst = new FormatTiff(stream, littleEndian);
      let ifdOffset = offset;
      while (ifdOffset !== 0) {
        await stream.seek(ifdOffset);
        const { frame, nextOffset } = await FrameTiff.create(
          inst,
          littleEndian
        );
        inst.frames.push(frame);
        ifdOffset = nextOffset;
      }
      return inst;
    });
  }

  readonly vars: Variables = {};

  readonly frames: FrameTiff[] = [];

  protected constructor(
    public readonly stream: RAStream,
    public readonly littleEndian: boolean
  ) {}
}
