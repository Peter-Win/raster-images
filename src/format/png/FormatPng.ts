import { ErrorRI } from "../../utils";
import { Variables } from "../../ImageInfo/Variables";
import { RAStream } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { FramePng } from "./FramePng";

export class FormatPng implements BitmapFormat {
  vars: Variables = {};

  frames: FramePng[] = [];

  protected constructor(readonly stream: RAStream) {}

  static async create(stream: RAStream): Promise<FormatPng> {
    const inst = new FormatPng(stream);
    const frame = await FramePng.create(inst);
    inst.frames = [frame];
    return inst;
  }

  get imageFrame(): FramePng {
    const fr = this.frames[0];
    if (!fr) throw new ErrorRI("Empty PNG image");
    return fr;
  }
}
