export class Rational {
  constructor(public num: number, public denom: number) {}

  isZero() {
    return this.num === 0;
  }

  toString() {
    return `${this.num}/${this.denom}`;
  }
}
