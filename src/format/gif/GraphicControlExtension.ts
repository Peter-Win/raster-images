import { RAStream, readByte } from "../../stream";
import { skipGifData } from "./skipGifData";

//  Disposal Method - Indicates the way in which the graphic is to be treated after being displayed.
export enum DisposalMethod {
  // 0 - No disposal specified. The decoder is not required to take any action.
  notUsed = 0,
  // 1 - Do not dispose. The graphic is to be left in place.
  notDispose = 1,
  // 2 - Restore to background color. The area used by the graphic must be restored to the background color.
  bgColor = 2,
  // 3 - Restore to previous. The decoder is required to restore the area overwritten by the graphic with
  //     what was there prior to rendering the graphic.
  previous = 3,
}

export interface GraphicControlExtension {
  disposalMethod: DisposalMethod;
  userInput: boolean;

  // If not 0, this field specifies the number ofhundredths (1/100) of a second to wait before continuing with the
  // processing of the Data Stream. The clock starts ticking immediately after the graphic is rendered.
  delayTime: number;

  transparentColorIndex?: number;
}

export const readGraphicControlExtension = async (
  stream: RAStream
): Promise<GraphicControlExtension | undefined> => {
  const size: number = await readByte(stream);
  if (size !== 4) {
    await stream.skip(-1);
    await skipGifData(stream);
    return undefined;
  }

  const buf = await stream.read(5);
  const flags: number = buf[0]!;
  const disposalMethod = (flags >> 2) & 7;

  return {
    disposalMethod,
    userInput: (flags & 2) === 2,
    delayTime: buf[1]! + (buf[2]! << 8),
    transparentColorIndex: (flags & 1) === 1 ? buf[3]! : undefined,
  };
};
