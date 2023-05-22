import { ImageInfo } from "./ImageInfo";

export const getSizeAndDepth = (info: ImageInfo) => ({
  width: info.size.x,
  height: info.size.y,
  depth: info.fmt.depth,
});
