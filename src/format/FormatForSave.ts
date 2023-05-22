import { ImageInfo } from "../ImageInfo";
import { Surface } from "../Surface";

export interface FrameForSave {
  info: ImageInfo;
  getImage(): Promise<Surface>;
}

export interface FormatForSave {
  frames: FrameForSave[];
}

export const formatForSaveFromSurface = (surface: Surface): FormatForSave => ({
  frames: [
    {
      info: surface.info,
      getImage: async () => surface,
    },
  ],
});
