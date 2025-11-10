import { Prim } from './prim';

export class Phlx extends Prim {
  gauge: number;
  stroke: number;
  eMax: number;
  iX: number;
  iY: number;
  iXY: number;
  constructor(ptr) {
    super(ptr);
  }
  update(res) {
    this.gauge = res[this.ptr];
    this.stroke = res[this.ptr + 1];
    this.eMax = res[this.ptr + 2];
    this.iX = res[this.ptr + 3];
    this.iY = res[this.ptr + 4];
    this.iXY = res[this.ptr + 5];
  }
  draw(ctx) {
    if (this.opacity === 0) return;
  }
}
