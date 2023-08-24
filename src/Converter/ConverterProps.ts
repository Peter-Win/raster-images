export interface ConverterProps {
  prefer: "speed" | "quality";
}

export const defaultConverterProps: ConverterProps = {
  prefer: "quality",
};
