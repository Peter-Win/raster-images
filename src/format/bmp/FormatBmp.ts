import { RAStream } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { FrameBmp } from "./FrameBmp";

export class FormatBmp implements BitmapFormat {
  frames: FrameBmp[] = [];

  protected constructor() {}

  static async create(stream: RAStream): Promise<FormatBmp> {
    const inst = new FormatBmp();
    const frame = await FrameBmp.create(inst, stream);
    inst.frames = [frame];
    return inst;
  }
}
