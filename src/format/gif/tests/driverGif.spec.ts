import { onStreamFromGallery } from "../../../tests/streamFromGallery";
import { driverGif } from "../driverGif";

describe("driverGif", () => {
  it("detect positive", async () => {
    const res: boolean = await onStreamFromGallery("I8.gif", (stream) =>
      driverGif.detect(stream)
    );
    expect(res).toBe(true);
  });

  it("detect negative", async () => {
    const res: boolean = await onStreamFromGallery("BGRA.bmp", (stream) =>
      driverGif.detect(stream)
    );
    expect(res).toBe(false);
  });
});
