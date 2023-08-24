import { Variables } from "../../ImageInfo/Variables";
import { RAStream } from "../../stream";
import { BitmapFormat, BitmapFrame } from "../BitmapFormat";
import { FramePnm } from "./FramePnm";

export class FormatPnm implements BitmapFormat {
  vars: Variables = {};

  frames: BitmapFrame[] = [];

  protected constructor(readonly stream: RAStream) {}

  static async create(stream: RAStream): Promise<FormatPnm> {
    const inst = new FormatPnm(stream);
    const frame = await FramePnm.create(inst);
    inst.frames = [frame];
    return inst;
  }
}
