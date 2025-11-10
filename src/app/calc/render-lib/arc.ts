import { Prim } from './prim';

export class Arc extends Prim {
  px: number;
  py: number;
  radius: number;
  begin: number;
  end: number;
  constructor(ptr) {
    super(ptr);
  }
  update(res) {
    this.px = res[this.ptr];
    this.py = res[this.ptr + 1];
    this.radius = res[this.ptr + 2];
    this.begin = res[this.ptr + 3];
    this.end = res[this.ptr + 4];
    this.opacity = res[this.ptr + 5];
  }
  draw(ctx) {
    if (this.opacity === 0) return;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(150, 150, 150, ' + this.opacity + ')';
    ctx.beginPath();
    ctx.arc(
      this.px * ctx.s,
      this.py * ctx.s,
      this.radius * ctx.s,
      this.begin,
      this.end,
      true,
    );
    ctx.stroke();
  }
}
