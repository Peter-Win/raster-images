import { OnProgressInfo, ProgressInfo } from "../Converter/ProgressInfo";

export const testProgress =
  (log: ProgressInfo[]): OnProgressInfo =>
  async (info: ProgressInfo) => {
    log.push({ ...info });
  };
