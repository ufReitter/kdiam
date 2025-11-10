import { Renderer } from '../attributes';
import { Prim } from './prim';
const attr = Renderer.ATTRIBUTES;
const PI2 = Math.PI * 2;
const foreGround = '#eee';

export class Pt extends Prim {
  x: number;
  y: number;
  h: number;
  s: number;
  l: number;
  size: number;
  constructor(x?, y?) {
    super(x);
    if (y) {
      this.x = x;
      this.y = y;
    }
  }
  update(res) {
    this.x = res[this.ptr];
    this.y = res[this.ptr + 1];
    this.size = res[this.ptr + 2];
    this.h = res[this.ptr + 3];
    this.s = res[this.ptr + 4];
    this.l = res[this.ptr + 5];
  }

  dist(p: Pt) {
    return Math.hypot(this.x - p.x, this.y - p.y);
  }

  angle(p) {
    return Math.atan2(this.y - p.y, this.x - p.x);
  }

  move(x, y, res?): Pt {
    if (res == 1) {
      return new Pt(this.x + x, this.y + y);
    }
    this.x = this.x + x;
    this.y = this.y + y;
    return this;
  }

  draw(ctx) {
    const x = this.x * ctx.s;
    const y = this.y * ctx.s;
    if (this.size > 0) {
      ctx.fillStyle = 'hsl(' + this.h + ',100%,50%)';
      ctx.beginPath();
      ctx.arc(x, y, this.size, 0, PI2, true);
      ctx.fill();
    }
    if (this.size === -2) {
      ctx.fillStyle = attr.fore.light.fill;
      ctx.strokeStyle = attr.fore.light.stroke;
      ctx.lineWidth = 1;
      const s = 6 * ctx.es;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y - s);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, s, 0.5 * Math.PI, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - s, y);
      ctx.lineTo(x, y + s);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, s, 1.5 * Math.PI, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = attr.fore.dark.fill;
      ctx.strokeStyle = attr.fore.dark.stroke;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + s);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, s, 0, 0.5 * Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - s, y);
      ctx.lineTo(x, y - s);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, s, Math.PI, 1.5 * Math.PI);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, s, 0, PI2, true);
      ctx.stroke();
    }
    if (this.size === -3) {
      ctx.fillStyle = foreGround;
      ctx.strokeStyle = 'rgba(150, 150, 150, ' + this.opacity + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 10 * ctx.es, y);
      ctx.lineTo(x + 10 * ctx.es, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - 10 * ctx.es);
      ctx.lineTo(x, y + 10 * ctx.es);
      ctx.stroke();
    }
  }
}
