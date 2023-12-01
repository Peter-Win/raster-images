import { RAStream, readDwordBE } from "../../stream";

type ParamsSection = {
  size: number;
  startPos: number;
  endPos: number;
};

export const readPsdSection = async <Res = void>(
  stream: RAStream,
  align: number,
  fn: (params: ParamsSection) => Promise<Res>
): Promise<Res> => {
  const size = await readDwordBE(stream);
  const startPos = await stream.getPos();
  // const nextPosNA = startPos + size;
  // const endPos =
  //   align > 1 ? Math.floor((nextPosNA + align - 1) / align) * align : nextPosNA;
  const alignSize =
    align > 1 ? Math.floor((size + align - 1) / align) * align : size;
  const endPos = startPos + alignSize;
  const res = await fn({ size, startPos, endPos });
  await stream.seek(endPos);
  return res;
};
