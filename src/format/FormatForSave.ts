import { ImageInfo } from "../ImageInfo";
import { Surface } from "../Surface";

export interface FrameForSave {
  info: ImageInfo;
  getImage(): Promise<Surface>;
}

/**
 FormatForSave

 Поддерживается два способа наполнения формата:
 1. Подключением независимых изображений.
	Это полезно для записи изображений, полученных в результате обработки.
	Осуществляется функцией addImage.
 2. Подключением другого формата.
	Позволяет наиболее эффективно перевести один формат в другой. Например, BMP -> PNG
	Осуществляется вызовом функции linkWith.
 В обоих случаях драйвер сможет записать занные в другом цветовом формате. 
 Например исходный фрейм в градациях серого, а файл будет записан как индексный с палитрой.
 */
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
