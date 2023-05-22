import { ErrorRI } from "../ErrorRI";

describe("ErrorRI", () => {
  it("makeMessage", () => {
    expect(ErrorRI.makeMessage("From <A> to <B>", { A: "Src", B: 22 })).toBe(
      "From Src to 22"
    );
  });
});
