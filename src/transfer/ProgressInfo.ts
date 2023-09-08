export interface ProgressInfo {
  step: string;
  value: number; // [0..maxValue]
  maxValue: number;
  start?: boolean;
}

export type OnProgressInfo = (info: ProgressInfo) => Promise<void>;
