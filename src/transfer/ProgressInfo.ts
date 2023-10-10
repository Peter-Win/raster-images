export interface ProgressInfo {
  step: string;
  value: number; // [0..maxValue]
  maxValue: number;
  init?: boolean;
}

export type OnProgressInfo = (info: ProgressInfo) => Promise<void>;

export const createProgressTracker =
  (progress: OnProgressInfo | undefined, step: string, maxValue: number) =>
  async (value: number, init?: boolean) => {
    if (progress) await progress({ step, maxValue, value, init });
  };
