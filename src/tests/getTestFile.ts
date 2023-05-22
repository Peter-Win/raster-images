import fs from "node:fs";
import path from "node:path";
import { NodeJSFile } from "../stream/NodeJSFile";

const makeFullName = async (
  folderWithTests: string, // __dirname
  fileName: string
) => {
  const filesFolder = path.join(folderWithTests, "files");
  try {
    await fs.promises.access(filesFolder, fs.constants.F_OK);
  } catch (e) {
    await fs.promises.mkdir(filesFolder);
  }
  return path.join(filesFolder, fileName);
};

export const getTestFile = async (
  folderWithTests: string, // __dirname
  fileName: string,
  mode: "w" | "r" | "w+" | "r+"
): Promise<NodeJSFile> => {
  const fullName = await makeFullName(folderWithTests, fileName);
  return new NodeJSFile(fullName, mode);
};
