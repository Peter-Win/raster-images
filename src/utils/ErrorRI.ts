export type ErrParamValue = number | string;
export type ErrParams = Record<string, ErrParamValue>;

export class ErrorRI extends Error {
  readonly msgId: string;

  readonly params?: ErrParams;

  constructor(msgId: string, params?: ErrParams) {
    super(ErrorRI.makeMessage(msgId, params));
    this.msgId = msgId;
    this.params = params;
  }

  static makeMessage(msgId: string, params?: ErrParams): string {
    return msgId.replace(/<([A-Za-z\d]+)>/g, (_, si) => params?.[si] ?? si);
  }
}
