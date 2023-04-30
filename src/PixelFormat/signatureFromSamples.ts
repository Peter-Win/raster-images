import { Sample } from "../Sample";

export const signatureFromSamples = (samples: Sample[]): string => {
  const sorted = [...samples];
  sorted.sort((a, b) => a.shift - b.shift);
  return sorted.map(({ sign, length }) => `${sign}${length}`).join("");
};
