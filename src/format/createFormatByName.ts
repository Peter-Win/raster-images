import { ErrorRI } from "../utils";
import { RAStream } from "../stream";
import { BitmapFormat } from "./BitmapFormat";
import { driversList } from "./driversList";

export const createFormatByName = (stream: RAStream): Promise<BitmapFormat> => {
  const ext = (/\.([a-z\d]+)$/i.exec(stream.name)?.[1] || "").toLowerCase();
  const driver = driversList.find(({ extensions }) => extensions.includes(ext));
  if (!driver) {
    throw new ErrorRI("Driver not found for <name>", { name: stream.name });
  }
  return driver.createFormat(stream);
};
