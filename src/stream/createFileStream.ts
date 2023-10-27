import { ErrorRI } from "../utils";
import { BufferStream } from "./BufferStream";

/**
 * Creating a stream from a standard browser File object.
 * @param file
 * @returns
 */
export const createFileStream = (file: File): Promise<BufferStream> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onerror = () =>
      reject(new ErrorRI(`Can't open file ${file.name}`));
    fileReader.onload = () => {
      const { result } = fileReader;
      if (result instanceof ArrayBuffer) {
        resolve(
          new BufferStream(new Uint8Array(result, 0), { name: file.name })
        );
      } else {
        reject(Error("Invalid result of FileReader"));
      }
    };
    fileReader.readAsArrayBuffer(file);
  });
