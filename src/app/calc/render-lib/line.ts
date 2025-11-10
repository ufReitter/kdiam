import { Prim } from './prim';
import { Pt } from './pt';
const PI2 = Math.PI * 2;
const PI05 = Math.PI / 2;

export class Line extends Prim {
  p0x: number;
  p0y: number;
  p1x: number;
  p1y: number;
  p0: Pt = new Pt();
  p1: Pt = new Pt();
  style = 0;
  angle = 0;
  direction: Pt = new Pt();
  constructor(ptr?) {
    super(ptr);
  }
  update(res) {
    this.p0.x = res[this.ptr];
    this.p0.y = res[this.ptr + 1];
    this.p1.x = res[this.ptr + 2];
    this.p1.y = res[this.ptr + 3];
    this.opacity = res[this.ptr + 4];
  }
  draw(ctx) {
    if (this.opacity === 0) return;
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(150, 150, 150, ' + this.opacity + ')';
    ctx.beginPath();
    ctx.moveTo(this.p0.x * ctx.s, this.p0.y * ctx.s);
    ctx.lineTo(this.p1.x * ctx.s, this.p1.y * ctx.s);
    ctx.stroke();
    const phi = this.setAngle();
    if (this.style === 15) {
      this.dot(ctx, this.p1.x, this.p1.y);
    }
    if (this.style === 16) {
      this.arrowhead(ctx, this.p0.x, this.p0.y, -phi + Math.PI);
      ctx.beginPath();
      ctx.moveTo(this.p0.x * ctx.s, this.p0.y * ctx.s);
      ctx.lineTo(this.p1.x * ctx.s, this.p1.y * ctx.s);
      ctx.stroke();
    }
    if (this.style === 13) {
      if (phi === 0) {
        this.arrowhead(ctx, this.p0.x, this.p0.y, phi + Math.PI);
        this.arrowhead(ctx, this.p1.x, this.p1.y, phi);
      } else {
        this.arrowhead(ctx, this.p0.x, this.p0.y, phi);
        this.arrowhead(ctx, this.p1.x, this.p1.y, phi + Math.PI);
      }
    }
    if (this.style === 14) {
      if (phi === 0) {
        this.arrowhead(ctx, this.p0.x, this.p0.y, PI05);
        this.arrowhead(ctx, this.p1.x, this.p1.y, -PI05);
        ctx.beginPath();
        ctx.moveTo(this.p0.x * ctx.s, this.p1.y * ctx.s);
        ctx.lineTo(this.p1.x * ctx.s, (this.p1.y - 20) * ctx.s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.p0.x * ctx.s, this.p0.y * ctx.s);
        ctx.lineTo(this.p1.x * ctx.s, (this.p0.y + 20) * ctx.s);
        ctx.stroke();
      } else if (phi < 0) {
        this.arrowhead(ctx, this.p0.x, this.p0.y, phi + Math.PI);
        this.arrowhead(ctx, this.p1.x, this.p1.y, phi);
        ctx.beginPath();
        ctx.moveTo(this.p0.x * ctx.s, this.p1.y * ctx.s);
        ctx.lineTo(this.p1.x * ctx.s, (this.p1.y - 40 / ctx.s) * ctx.s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.p0.x * ctx.s, this.p0.y * ctx.s);
        ctx.lineTo(this.p1.x * ctx.s, (this.p0.y + 40 / ctx.s) * ctx.s);
        ctx.stroke();
      } else if (phi === -0) {
        this.arrowhead(ctx, this.p0.x, this.p0.y, PI05);
        this.arrowhead(ctx, this.p1.x, this.p1.y, -PI05);
        ctx.beginPath();
        ctx.moveTo(this.p0.x * ctx.s, this.p1.y * ctx.s);
        ctx.lineTo(this.p1.x * ctx.s, (this.p1.y - 20) * ctx.s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.p0.x * ctx.s, this.p0.y * ctx.s);
        ctx.lineTo(this.p1.x * ctx.s, (this.p0.y + 20) * ctx.s);
        ctx.stroke();
      }
    }
  }

  lengthen(p, d) {
    this.setDirection();
    if (p) {
      this.p1.x = this.p1.x + this.direction.x * d;
      this.p1.y = this.p1.y + this.direction.y * d;
    } else {
      this.p0.x = this.p0.x + this.direction.x * d;
      this.p0.y = this.p0.y - this.direction.y * d;
    }
  }

  setAngle() {
    this.angle = this.p1.angle(this.p0);
    return this.angle;
  }

  setDirection() {
    const phi = this.setAngle();
    this.direction.x = Math.cos(phi);
    this.direction.y = Math.sin(phi);
    return this.direction;
  }

  dot(ctx, x, y) {
    ctx.strokeStyle = 'white';
    ctx.beginPath();
    ctx.arc(x * ctx.s, y * ctx.s, 3 * ctx.es, 0, PI2, true);
    ctx.fill();
  }

  arrowhead(ctx, x, y, radians) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x * ctx.s, y * ctx.s);
    ctx.rotate(-radians + PI05);
    ctx.moveTo(0, 0);
    ctx.lineTo(3 * ctx.es, 12 * ctx.es);
    ctx.lineTo(-3 * ctx.es, 12 * ctx.es);
    ctx.closePath();
    ctx.restore();
    ctx.fill();
  }
}
