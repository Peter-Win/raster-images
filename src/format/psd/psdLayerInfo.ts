import { Variables } from "../../ImageInfo/Variables";
import {
  RAStream,
  readDwordArray,
  readDwordBE,
  readInt16BE,
  readWordBE,
} from "../../stream";
import {
  FieldsBlock,
  fieldByte,
  fieldDword,
  fieldFourCC,
  readFieldsBlock,
} from "../FieldsBlock";
import { PsdCompression, psdCompressionName } from "./PsdCompression";
import {
  getFourCC,
  readBool4,
  readFourCC,
  readPascalString,
  readUnicodeStringLimited,
} from "./psdDataUtils";
import { readPsdSection } from "./psdSection";

export interface ChannelInfo {
  channelId: number;
  dataSize: number;
}

export interface LayerMask {
  top: number;
  left: number;
  bottom: number;
  right: number;
  defaultColor: number;
  flags: number; // TODO
}

const descrLayerMask: FieldsBlock<LayerMask> = {
  littleEndian: false,
  fields: [
    fieldDword("top"),
    fieldDword("left"),
    fieldDword("bottom"),
    fieldDword("right"),
    fieldByte("defaultColor"),
    fieldByte("flags"),
  ],
};

export interface ExtraFieldPos {
  key: string;
  size: number;
  offset: number;
}

interface NativeLayerRecord {
  top: number;
  left: number;
  bottom: number;
  right: number;
  channels: ChannelInfo[];
  blendMode: string;
  opacity: number;
  clipping: number;
  flags: number;
  maskData?: LayerMask;
  layerName: string;
  vars: Variables;
  extra: Record<string, ExtraFieldPos>;
}

export interface LayerRecord extends NativeLayerRecord {
  offset: number;
  size: number;
  compression: string | string[];
}

interface LayerFieldPrefix {
  bim: "8BIM";
  key: string;
  size: number;
}

const descrLayerExt: FieldsBlock<LayerFieldPrefix> = {
  littleEndian: false,
  fields: [fieldFourCC("bim"), fieldFourCC("key"), fieldDword("size")],
};

/* eslint no-param-reassign: "off" */

const loadExtendedLayerFields = async (
  stream: RAStream,
  endPos: number,
  record: NativeLayerRecord
) => {
  while (endPos - (await stream.getPos()) >= 12) {
    const { bim, key, size } = await readFieldsBlock(stream, descrLayerExt);
    if (bim !== "8BIM") break;
    record.extra[key] = {
      key,
      size,
      offset: await stream.getPos(),
    };
    switch (key) {
      case "luni":
        record.layerName = await readUnicodeStringLimited(stream, size);
        break;
      case "lyid": // layer id
      case "lspf": // Protection flags: bits 0 - 2 are used for Photoshop 6.0. Transparency, composite and position respectively.
        record.vars[key] = await readDwordBE(stream);
        break;
      case "clbl": // Blend clipped elements
      case "infx": // Blend interior elements
      case "knko": // Knockout setting
        record.vars[key] = await readBool4(stream);
        break;
      case "lclr": // Sheet color setting
        record.vars[key] = await readDwordArray(stream, 2, false);
        break;
      default:
        await stream.skip(size);
    }
  }
};

export const loadLayerRecord = async (
  stream: RAStream
): Promise<NativeLayerRecord> => {
  const buf1 = await stream.read(18);
  const dv1 = new DataView(buf1.buffer, buf1.byteOffset);
  const nChannels = dv1.getUint16(16, false);
  const szChannels = nChannels * 6;
  const channels: ChannelInfo[] = [];
  const buf2 = await stream.read(szChannels + 12);
  const dv2 = new DataView(buf2.buffer, buf2.byteOffset);
  for (let i = 0; i < nChannels; i++) {
    channels[i] = {
      channelId: dv2.getInt16(i * 6, false),
      dataSize: dv2.getUint32(i * 6 + 2, false),
    };
  }

  const result: NativeLayerRecord = {
    top: dv1.getInt32(0, false),
    left: dv1.getInt32(4, false),
    bottom: dv1.getInt32(8, false),
    right: dv1.getInt32(12, false),
    channels,
    blendMode: getFourCC(buf2, szChannels + 4),
    opacity: buf2[szChannels + 8]!,
    clipping: buf2[szChannels + 9]!,
    flags: buf2[szChannels + 10]!,
    layerName: "",
    vars: {},
    extra: {},
  };

  await readPsdSection(stream, 0, async ({ endPos }) => {
    // Layer mask / adjustment layer data
    await readPsdSection(stream, 0, async ({ size }) => {
      if (size > 0) {
        result.maskData = await readFieldsBlock(stream, descrLayerMask);
        // Там есть ещё поля, которые присутствуют в зависимости от размера блока
        // но пока что такое впечатление, что они не особо нужны
      }
    });
    // Layer blending ranges data
    await readPsdSection(stream, 0, async () => {
      // Пока не понятно, зачем оно нужно
    });
    result.layerName = await readPascalString(stream, 4);
    await loadExtendedLayerFields(stream, endPos, result);
  });
  return result;
};

export const loadPsdLayerInfo = async (stream: RAStream) => {
  // Layer count. If it is a negative number, its absolute value is the number of layers and the first alpha channel contains the transparency data for the merged result.
  let layersCount = await readInt16BE(stream);
  if (layersCount < 0) {
    layersCount = -layersCount;
  }
  const srcLayers: NativeLayerRecord[] = [];
  // Information about each layer.
  for (let i = 0; i < layersCount; i++) {
    srcLayers[i] = await loadLayerRecord(stream);
  }
  let offset = await stream.getPos();
  const dstLayers: LayerRecord[] = [];
  // Channel image data.
  for (const layer of srcLayers) {
    let size = 0;
    const compressionsSet = new Set<PsdCompression>();
    const compressionsList: string[] = [];
    for (const channel of layer.channels) {
      await stream.seek(offset + size);
      const compressionId = (await readWordBE(stream)) as PsdCompression;
      compressionsSet.add(compressionId);
      compressionsList.push(
        psdCompressionName[compressionId] ?? String(compressionId)
      );
      size += channel.dataSize;
    }
    const compression =
      compressionsSet.size === 1 ? compressionsList[0]! : compressionsList;
    dstLayers.push({ ...layer, offset, size, compression });
    offset += size;
  }
  return dstLayers;
};

export const loadAdditionalLayerInfo = async (
  stream: RAStream,
  endPos: number,
  layers: LayerRecord[]
): Promise<LayerRecord[]> => {
  let result = layers;
  for (;;) {
    const pos = await stream.getPos();
    if (pos >= endPos) break;
    const sig = await readFourCC(stream);
    // integrity check
    if (sig !== "8BIM") break;
    const key = await readFourCC(stream);
    // eslint-disable-next-line no-loop-func
    await readPsdSection(stream, 4, async () => {
      if (key === "Layr" || key === "Lr16" || key === "Lr32") {
        const newLayers = await loadPsdLayerInfo(stream);
        result = [...result, ...newLayers];
      }
      // Другие виды ресурсов пока не поддерживаются
      // В имеющихся файлах галереи есть: Patt Pat2 Pat3 FMsk Txt2
    });
  }
  return result;
};

export const readPsdLayersSection = (
  stream: RAStream
): Promise<LayerRecord[]> =>
  readPsdSection(stream, 0, async ({ endPos }) => {
    // 4.1. Layer info
    const layers = await readPsdSection(stream, 0, () =>
      loadPsdLayerInfo(stream)
    );
    // 4.2. Mask info
    await readPsdSection(stream, 0, async () => {});
    return loadAdditionalLayerInfo(stream, endPos, layers);
  });
