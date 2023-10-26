// cxDWord	bcSize;
const ofsSize = 0;
// cxWord	bcWidth;
const ofsWidth = ofsSize + 4;
// cxWord	bcHeight;
const ofsHeight = ofsWidth + 2;
// cxWord	bcPlanes;
const ofsPlanes = ofsHeight + 2;
// cxWord	bcBitCount;
const ofsBitCount = ofsPlanes + 2;

export const bmpCoreHeaderSize = ofsBitCount + 2;

export interface BmpCoreHeader {
  bcSize: number;
  bcWidth: number;
  bcHeight: number;
  bcPlanes: number;
  bcBitCount: number;
}

export const readBmpCoreHeader = (
  buffer: ArrayBuffer,
  offset: number
): BmpCoreHeader => {
  const dv = new DataView(buffer, offset);
  return {
    bcSize: dv.getUint32(ofsSize, true),
    bcWidth: dv.getUint16(ofsWidth, true),
    bcHeight: dv.getUint16(ofsHeight, true),
    bcPlanes: dv.getUint16(ofsPlanes, true),
    bcBitCount: dv.getUint16(ofsBitCount, true),
  };
};

export const writeBmpCoreHeader = (
  hd: BmpCoreHeader,
  buffer: ArrayBuffer,
  offset: number
): void => {
  const dv = new DataView(buffer, offset);
  dv.setUint32(ofsSize, hd.bcSize, true);
  dv.setUint16(ofsWidth, hd.bcWidth, true);
  dv.setUint16(ofsHeight, hd.bcHeight, true);
  dv.setUint16(ofsPlanes, hd.bcPlanes, true);
  dv.setUint16(ofsBitCount, hd.bcBitCount, true);
};
