import path from "node:path";
import fs from "node:fs";
import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { targaDetect } from "../targaDetect";

test("targaDetect", async () => {
  const galleryPath = path.normalize(
    path.join(__dirname, "..", "..", "..", "..", "gallery")
  );
  const list = await fs.promises.readdir(galleryPath);
  for (const name of list) {
    await onStreamFromGallery(name, async (stream) => {
      const res = await targaDetect(stream);
      const ext = path.extname(name).toLowerCase();
      expect(`${name} = ${res}`).toBe(`${name} = ${ext === ".tga"}`);
    });
  }
});
