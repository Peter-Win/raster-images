import { RAStream } from "../../stream";
import { Variables } from "../../ImageInfo/Variables";
import { BitmapFormat, BitmapFrame } from "../BitmapFormat";

export class FormatPng implements BitmapFormat {
  vars: Variables = {};

  frames: BitmapFrame[] = [];

  protected constructor(readonly stream: RAStream) {}

  static async create(stream: RAStream): Promise<FormatPng> {
    const inst = new FormatPng(stream);
    return inst;
  }
}
