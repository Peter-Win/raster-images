export type SampleSign =
  | "R"
  | "G"
  | "B"
  | "A"
  | "X"
  | "I"
  | "J"
  | "C"
  | "M"
  | "Y"
  | "K";

export interface Sample {
  shift: number;
  length: number;
  sign: SampleSign;
}

export const equalSamples = (s1: Sample, s2: Sample): boolean =>
  s1.shift === s2.shift && s1.length === s2.length && s1.sign === s2.sign;

export const sampleSignChars: Record<SampleSign, boolean> = {
  R: true,
  G: true,
  B: true,
  A: true,
  X: true,
  I: true,
  J: true,
  C: true,
  M: true,
  Y: true,
  K: true,
};

export const equalSamplesList = (a: Sample[], b: Sample[]): boolean =>
  a.length === b.length &&
  a.reduce((acc, left, i) => equalSamples(left, b[i]!), true);
