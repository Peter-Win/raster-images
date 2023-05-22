import { ErrorRI } from "../utils";

export const onInvalidFormat = (
  formatName: string,
  fileName: string
): never => {
  throw new ErrorRI("Invalid format <fmt> in <src>", {
    fmt: formatName,
    src: fileName,
  });
};
