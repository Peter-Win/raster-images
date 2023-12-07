import { PixelFormat } from "../../PixelFormat";
import { SurfaceStd } from "../../Surface";
import { dump } from "../../utils";
import { convertSurface } from "../convertSurface";

describe("convertSurface", () => {
  it(" to RGBA", async () => {
    const width = 4;
    const height = 3;
    const src = SurfaceStd.createSign(width, height, "R8G8B8");
    const srcRow = src.getRowBuffer(0);
    srcRow[0] = 1;
    srcRow[1] = 2;
    srcRow[2] = 3;
    const dst = await convertSurface(src, new PixelFormat("R8G8B8A8"));
    expect(dst.size.toString()).toBe(src.size.toString());
    expect(dst.info.fmt.signature).toBe("R8G8B8A8");
    expect(dump(dst.getRowBuffer(0), 0, 5)).toBe("01 02 03 FF 00");
  });
});
