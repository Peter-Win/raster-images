import { OnProgressInfo, ProgressInfo } from "../Converter/ProgressInfo";
import { delay } from "../utils";

export const delayInterrupter = (
  workMS: number,
  delayMS: number,
  progress?: OnProgressInfo
): OnProgressInfo => {
  let workStart = new Date().getTime();
  return async (info: ProgressInfo) => {
    const workDelta = new Date().getTime() - workStart;
    if (workDelta > workMS) {
      if (progress) {
        await progress(info);
      }
      await delay(delayMS);
      workStart = new Date().getTime();
    }
  };
};
