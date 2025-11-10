import { Renderer } from '../attributes';
import { Prim } from './prim';
const attr = Renderer.ATTRIBUTES;
export class Forming extends Prim {
  gauge: number;
  width: number;
  depth: number;
  height0: number;
  height1: number;
  mass: number;
  temperature: number;
  stroke: number;
  maxStroke: number;
  constructor(ptr) {
    super(ptr);
  }
  update(res) {
    this.gauge = res[this.ptr];
    this.width = res[this.ptr + 1];
    this.depth = res[this.ptr + 2];
    this.height0 = res[this.ptr + 3];
    this.height1 = res[this.ptr + 4];
    this.mass = res[this.ptr + 5];
    this.temperature = res[this.ptr + 6];
    this.stroke = res[this.ptr + 7];
    this.maxStroke = res[this.ptr + 8];
  }
  draw(ctx) {
    if (this.opacity === 0) return;
    // ctx.beginPath();
    // ctx.strokeStyle = attr.center.dark.stroke;
    // ctx.lineWidth = attr.center.lineWidth;
    // ctx.setLineDash([18, 8, 4, 8]);
    // ctx.moveTo(0, -25);
    // ctx.lineTo(0, (this.stroke + this.gauge / 2 + 15) * ctx.s);
    // ctx.stroke();
    // ctx.setLineDash([]);
  }
}
