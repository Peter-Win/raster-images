import { ErrorRI } from "../utils";
import { RAStream } from "../stream";

export const onInvalidVersion = (
  ver: string,
  fmtName: string,
  stream: RAStream
): never => {
  throw new ErrorRI("Not supported version <ver> for <fmt> format in <src>", {
    ver,
    fmt: fmtName,
    src: stream.name,
  });
};
