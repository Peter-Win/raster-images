import { Variables } from "../../ImageInfo/Variables";
import { RAStream } from "../../stream";
import { BitmapFormat } from "../BitmapFormat";
import { FrameTarga } from "./FrameTarga";

export class FormatTarga implements BitmapFormat {
  vars: Variables = {};

  frames: FrameTarga[] = [];

  protected constructor(readonly stream: RAStream) {}

  static async create(stream: RAStream): Promise<FormatTarga> {
    const inst = new FormatTarga(stream);
    const frame = await FrameTarga.create(inst);
    inst.frames = [frame];
    return inst;
  }
}
