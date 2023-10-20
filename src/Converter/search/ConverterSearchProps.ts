export interface ConverterSearchProps {
  dithering: boolean;
  prefer: "speed" | "quality";
}

export const defaultConverterSearchProps: Readonly<ConverterSearchProps> = {
  prefer: "quality",
  dithering: true,
};
