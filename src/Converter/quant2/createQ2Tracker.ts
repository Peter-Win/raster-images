import { OnProgressInfo } from "../ProgressInfo";
// TODO: использовать createProgressTracker
export const createQ2Tracker =
  (progress: OnProgressInfo | undefined, maxValue: number) =>
  async (value: number, y: number, init?: boolean) => {
    if (progress) await progress({ step: "quant2", maxValue, value, y, init });
  };
