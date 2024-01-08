import { ErrorRI } from "../../../utils";
import { RAStream, readDword, readWord } from "../../../stream";
import { getTiffTagName } from "../getTiffTagName";
import {
  IfdEntry,
  getIfdNumbers,
  getIfdSingleNumber,
  loadIfdEntry,
} from "./IfdEntry";

export type IfdEntries = Record<number, IfdEntry>;

export class Ifd {
  entries: IfdEntries = {};

  constructor(public readonly littleEndian: boolean) {}

  /**
   * file pointer must be set on begin of IFD - first word = count of entries
   * @return offset of next IFD. or zero, if finish
   */
  async load(stream: RAStream): Promise<number> {
    const { littleEndian } = this;
    const entriesCount = await readWord(stream, littleEndian);
    for (let i = 0; i < entriesCount; i++) {
      const entry = await loadIfdEntry(stream, littleEndian);
      this.entries[entry.tagId] = entry;
    }
    return readDword(stream, littleEndian);
  }

  getEntry(tagId: number): IfdEntry {
    const e = this.entries[tagId];
    if (!e) {
      const tagName = getTiffTagName(tagId);
      throw new ErrorRI("Expected tag <tagName>", { tagName });
    }
    return e;
  }

  async getSingleNumber<T extends number = number>(
    tagId: number,
    stream: RAStream,
    defaultValue?: T
  ): Promise<T> {
    let entry: IfdEntry;
    if (defaultValue === undefined) {
      entry = this.getEntry(tagId);
    } else {
      const optEntry = this.entries[tagId];
      if (!optEntry) return defaultValue;
      entry = optEntry;
    }
    return (await getIfdSingleNumber(entry, stream, this.littleEndian)) as T;
  }

  async getNumbers(tagId: number, stream: RAStream): Promise<number[]> {
    return getIfdNumbers(this.getEntry(tagId), stream, this.littleEndian);
  }
}
