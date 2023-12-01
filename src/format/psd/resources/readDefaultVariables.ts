import { Variables } from "../../../ImageInfo/Variables";
import { RAStream } from "../../../stream";
import { PsdResId } from "./PsdResId";
import { PsdResources } from "./PsdResources";
import { loadResolutionInfo, getResolutionVars } from "./ResolutionInfo";

export const readDefaultVariables = async (
  stream: RAStream,
  resources: PsdResources
): Promise<Variables> => {
  const vars: Variables = {};
  const defResolution = resources[PsdResId.resolutionInfo];
  if (defResolution) {
    try {
      const resInfo = await loadResolutionInfo(stream, defResolution);
      Object.assign(vars, getResolutionVars(resInfo));
    } catch (e) {
      // eslint-disable-next-line no-empty
    }
  }
  return vars;
};
