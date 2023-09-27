export interface DitherCtx {
  startLine: () => void;
  getX: () => number;
  getNew: (sampleIndex: number, sampleValue: number) => number;
  // error = newValue - correctedValue. For B&W correctedValue = 0 or 255, if converted from Gray8
  setError: (sampleIndex: number, errorValue: number) => void;
  nextPixel: () => void;
}
