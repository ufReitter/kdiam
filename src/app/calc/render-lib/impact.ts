import { Renderer } from '../attributes';
import { Prim } from './prim';
const attr = Renderer.ATTRIBUTES;
export class Impact extends Prim {
  operation: number;
  gauge: number;
  act: number;
  clearance: number;
  width: number;
  length: number;
  radiusA: number;
  radiusB: number;
  mass: number;
  temperature: number;
  stroke: number;
  maxStroke: number;
  force: number;
  stress: number;
  constructor(ptr) {
    super(ptr);
  }
  update(res) {
    this.operation = res[this.ptr];
    this.gauge = res[this.ptr + 1];
    this.act = res[this.ptr + 2];
    this.clearance = res[this.ptr + 3];
    this.width = res[this.ptr + 4];
    this.length = res[this.ptr + 5];
    this.radiusA = res[this.ptr + 6];
    this.radiusB = res[this.ptr + 7];
    this.mass = res[this.ptr + 8];
    this.temperature = res[this.ptr + 9];
    this.stroke = res[this.ptr + 10];
    this.maxStroke = res[this.ptr + 11];
    this.force = res[this.ptr + 12];
    this.stress = res[this.ptr + 13];
  }
  draw(ctx) {
    if (this.opacity === 0) return;

    ctx.strokeStyle = attr.act.dark.stroke;
    ctx.lineWidth = 2;
    ctx.beginPath();
    let x, y;
    switch (this.operation) {
      case 1:
        x = (this.width + this.clearance + this.radiusA) * ctx.s;
        y = (this.stroke + this.gauge + this.radiusA) * ctx.s;
        ctx.arc(
          x,
          y,
          this.radiusA * ctx.s - 1,
          1.5 * Math.PI,
          1 * Math.PI,
          true,
        );
        break;
      case 2:
        x = (this.width - this.radiusA) * ctx.s;
        y = (this.stroke - this.radiusA) * ctx.s;
        ctx.arc(
          x,
          y,
          this.radiusA * ctx.s - 1,
          0.5 * Math.PI,
          0 * Math.PI,
          true,
        );
        break;

      default:
        break;
    }
    ctx.stroke();
    // ctx.strokeStyle = 'grey';
    // ctx.lineWidth = 1;
    // ctx.beginPath();
    // ctx.moveTo(x - this.radiusA / 2, y);
    // ctx.lineTo(x + this.radiusA / 2, y);
    // ctx.stroke();
    // ctx.beginPath();
    // ctx.moveTo(x, y - this.radiusA / 2);
    // ctx.lineTo(x, y + this.radiusA / 2);
    // ctx.stroke();
  }
}
