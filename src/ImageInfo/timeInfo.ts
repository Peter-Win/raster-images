import { ErrorRI } from "../utils";

export const timeToString = (date: Date): string => {
  const Y = date.getFullYear();
  const M = String(date.getMonth() + 1).padStart(2, "0");
  const D = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
};

/**
 *
 * @param strTime "YYYY-MM-DD" or "YYYY-MM-DD hh:mm" or "YYYY-MM-DD hh:mm:ss"
 */
export const parseStrTime = (strTime: string): Date => {
  const [ds, ts = ""] = strTime.split(" ");
  const [Y, M, D] = ds!.split("-");
  const [h, m, s] = ts.split(":");
  if (!Y || !M || !D) throw new ErrorRI("Invalid time [<t>]", { t: strTime });
  return new Date(+Y, +M - 1, +D, h ? +h : 0, m ? +m : 0, s ? +s : 0);
};
