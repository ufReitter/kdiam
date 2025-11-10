import { Prim } from './prim';

export class Io extends Prim {
  min: number;
  max: number;
  step: number;
  val: number;
  checked: number;
  pressed: number;
  constructor(ptr) {
    super(ptr);
  }
  update(res) {
    this.min = res[this.ptr + 0];
    this.max = res[this.ptr + 1];
    this.step = res[this.ptr + 2];
    this.val = res[this.ptr + 3];
    this.checked = res[this.ptr + 4];
    this.pressed = res[this.ptr + 5];
  }
}
