import { ParcelImageInfo } from "../ImageInfo";
/**
 * Объекты типа Surface невозможно передать между разными процессами через message.
 * Поэтому необходима возможность сериализовать/десериализовать изображение.
 * Данный интерфейс поддерживается в SurfaceStd.
 * По предварительным оценкам, это не должно значительно ухудшить производительность.
 */
export interface ParcelSurface {
  info: ParcelImageInfo;
  data: Uint8Array;
}
