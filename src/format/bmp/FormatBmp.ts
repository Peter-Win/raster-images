import { Variables } from "../../ImageInfo/Variables";
import { RAStream } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { FrameBmp } from "./FrameBmp";

export class FormatBmp implements BitmapFormat {
  frames: FrameBmp[] = [];

  vars: Variables = {};

  protected constructor(readonly stream: RAStream) {}

  static async create(stream: RAStream): Promise<FormatBmp> {
    const inst = new FormatBmp(stream);
    const frame = await FrameBmp.create(inst);
    inst.frames = [frame];
    return inst;
  }
}
