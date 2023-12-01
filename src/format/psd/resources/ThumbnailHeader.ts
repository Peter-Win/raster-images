/**
 * Thumbnail resource header
 * @see https://www.adobe.com/devnet-apps/photoshop/fileformatashtml/#50577409_74450
 * 4    Format. 1 = kJpegRGB . Also supports kRawRGB (0).
 * 4    Width of thumbnail in pixels.
 * 4    Height of thumbnail in pixels.
 * 4    Widthbytes: Padded row bytes = (width * bits per pixel + 31) / 32 * 4.
 * 4    Total size = widthbytes * height * planes
 * 4    Size after compression. Used for consistency check.
 * 2    Bits per pixel. = 24
 * 2    Number of planes. = 1
 */
import { RAStream } from "../../../stream";
import {
  FieldsBlock,
  fieldDword,
  fieldWord,
  fieldsBlockSize,
  readFieldsBlock,
} from "../../FieldsBlock";
import { PsdResourceDef } from "./PsdResources";

export interface ThumbnailHeader {
  format: number;
  width: number;
  height: number;
  widthbytes: number;
  totalSize: number;
  compressedSize: number;
  bitsPerPixel: number;
  numberOfPlanes: number;
}

export interface ThumbnailInfo {
  header: ThumbnailHeader;
  imgSize: number;
  imgOffset: number;
}

const descrThumbnailHeader: FieldsBlock<ThumbnailHeader> = {
  littleEndian: false,
  fields: [
    fieldDword("format"),
    fieldDword("width"),
    fieldDword("height"),
    fieldDword("widthbytes"),
    fieldDword("totalSize"),
    fieldDword("compressedSize"),
    fieldWord("bitsPerPixel"),
    fieldWord("numberOfPlanes"),
  ],
};

const headerSize = fieldsBlockSize(descrThumbnailHeader);

export const getThumbnailInfo = async (
  stream: RAStream,
  { offset, size }: PsdResourceDef
): Promise<ThumbnailInfo> => {
  await stream.seek(offset);
  const header = await readFieldsBlock(stream, descrThumbnailHeader);
  return {
    header,
    imgSize: size - headerSize,
    imgOffset: offset + headerSize,
  };
};
