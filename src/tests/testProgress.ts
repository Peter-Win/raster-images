import { OnProgressInfo, ProgressInfo } from "../transfer/ProgressInfo";

export const testProgress =
  (log: ProgressInfo[]): OnProgressInfo =>
  async (info: ProgressInfo) => {
    log.push({ ...info });
  };
