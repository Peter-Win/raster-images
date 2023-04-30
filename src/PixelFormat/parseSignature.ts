import { Sample, SampleSign, sampleSignChars } from "../Sample";

export const parseSignature = (signature: string): Sample[] => {
  if (!/^([A-Z]\d+)+$/.test(signature))
    throw Error(`Invalid pixel format signature [${signature}]`);
  const chunks = signature.replace(/(\d)([A-Z])/g, "$1,$2").split(",");
  if (chunks.length > 5) throw Error(`Too many samples in [${signature}]`);
  let shift = 0;
  return chunks.map((chunk) => {
    const sign = chunk[0] as SampleSign;
    const length = +chunk.slice(1);
    if (!sampleSignChars[sign])
      throw Error(`Unknown sample letter [${sign}] in [${signature}]`);
    if (!length || length > 32)
      throw Error(`Invalid sample size ${length} in [${signature}]`);
    const s: Sample = {
      shift,
      length,
      sign,
    };
    shift += length;
    return s;
  });
};
