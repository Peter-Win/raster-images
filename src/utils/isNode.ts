export const isNode = (): boolean => {
  try {
    return process?.release?.name === "node";
  } catch (e) {
    return false;
  }
};
