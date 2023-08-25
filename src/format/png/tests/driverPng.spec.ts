import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { driverPng } from "../driverPng";

describe("driverPng", () => {
  it("detect positive", async () => {
    await onStreamFromGallery("R8G8B8.png", async (stream) => {
      expect(await driverPng.detect(stream)).toBe(true);
    });
  });
  it("detect negative", async () => {
    await onStreamFromGallery("plain.ppm", async (stream) => {
      expect(await driverPng.detect(stream)).toBe(false);
    });
  });
});
