/**
 * @see https://www.w3.org/TR/2003/REC-PNG-20031110/#D-CRCAppendix
 * Using:
 *   let value = beginCrc; // start of crc calculation
 *   value = updateCrc(value, data); // several blocks of data for which the crc is calculated
 *   ...
 *   value = endCrc(value); // finish
 */

let crcTable: Uint32Array | undefined;

const makeCrcTable = (): Uint32Array => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
        table[n]! >>>= 1;
        table[n]! ^= 0xedb88320;
      } else c >>>= 1;
    }
    table[n] = c;
  }
  return table;
};

export const beginCrc = 0xffffffff;

export const updateCrc = (
  prevCrc: number,
  buf: Uint8Array,
  begin?: number,
  end?: number
): number => {
  if (!crcTable) crcTable = makeCrcTable();

  const len = end ?? buf.length;
  let crc = prevCrc;
  for (let n = begin ?? 0; n < len; n++) {
    crc = crcTable[(crc ^ buf[n]!) & 0xff]! ^ (crc >>> 8);
  }
  return crc;
};

export const endCrc = (prevCrc: number): number => prevCrc ^ 0xffffffff;
