export interface ConverterProps {
  dithering: boolean;
  prefer: "speed" | "quality";
}

export const defaultConverterProps: ConverterProps = {
  prefer: "quality",
  dithering: true,
};
