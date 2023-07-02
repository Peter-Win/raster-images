/* eslint "import/no-import-module-exports": "off" */
import path from "node:path";
import { streamLock } from "../stream";
import { NodeJSFile } from "../stream/NodeJSFile";

export const streamFromGallery = (shortName: string): NodeJSFile => {
  const fullName = path.normalize(
    path.join(module.path, "..", "..", "gallery", shortName)
  );
  return new NodeJSFile(fullName, "r");
};

/**
 * Basic pattern for gallery files using
 * @param shortName
 * @param onFile
 */
export const onStreamFromGallery = <TRes = void>(
  shortName: string,
  onFile: (stream: NodeJSFile) => Promise<TRes>
): Promise<TRes> => {
  const stream = streamFromGallery(shortName);
  return streamLock(stream, () => onFile(stream));
};
