import { Elm } from 'src/app/engine/entity';
import { Renderer } from '../attributes';
import { Line } from './line';
import { Prim } from './prim';
import { Pt } from './pt';
const attr = Renderer.ATTRIBUTES;
const PI2 = Math.PI * 2;
const PI05 = Math.PI / 2;
const foreGround = '#eee';

export class Dim extends Prim {
  kind: number;
  posX: number;
  posY: number;
  ioIndex: number;
  p0x: number;
  p0y: number;
  p1x: number;
  p1y: number;
  p2x: number;
  p2y: number;
  p0: Pt = new Pt();
  p1: Pt = new Pt();
  p2: Pt = new Pt();
  l0: Line = new Line();
  l1: Line = new Line();
  l2: Line = new Line();
  elm: Elm;
  io: Elm;
  txt: any = {};
  txts: any;
  constructor(ptr, job) {
    super(ptr);
    this.elm = job.elm;
    this.txts = job.txts;
  }
  update(res) {
    this.kind = res[this.ptr];
    this.posX = res[this.ptr + 1];
    this.posY = res[this.ptr + 2];
    this.ioIndex = res[this.ptr + 3];

    this.p0.x = res[this.ptr + 4];
    this.p0.y = res[this.ptr + 5];
    this.p1.x = res[this.ptr + 6];
    this.p1.y = res[this.ptr + 7];
    this.p2.x = res[this.ptr + 8];
    this.p2.y = res[this.ptr + 9];

    if (this.ioIndex && !this.txt.elm) {
      if (this.ioIndex < 1000) {
        this.txt.elm = this.elm.children[this.ioIndex - 1].elm;
        this.txt.set = this.elm.children[this.ioIndex - 1].set;
        this.txt.kind = this.kind;
        this.txt.x = 100;
        this.txt.y = 100;
        this.txt.rotate = 0;
      } else {
        this.txt = this.getTxt(String.fromCharCode(this.ioIndex - 1000));
      }
      this.txts.push(this.txt);
      switch (this.kind) {
        case 1:
          this.l0.p1 = this.p0;
          this.l0.p0 = this.p1;
          this.l0.style = 15;
          break;
        case 2:
          this.l1.p1 = this.p0;
          this.l1.p0 = this.p1;
          this.l0.style = 13;
          break;
        case 3:
          this.l1.p1 = this.p0;
          this.l1.p0 = this.p1;
          this.l0.style = 13;
          break;
        default:
          break;
      }
    }
  }
  getTxt(str) {
    if (str === 'e') {
      str = 'ε<sub>s</sub>';
    }
    return {
      elm: {
        sign: str,
      },
      set: {
        state: {},
      },
      kind: this.kind,
      x: 100,
      y: 100,
      rotate: 0,
    };
  }
  draw(ctx) {
    ctx.fillStyle = foreGround;
    ctx.strokeStyle = 'rgba(150, 150, 150, ' + this.opacity + ')';
    ctx.fillStyle = 'rgba(150, 150, 150, ' + this.opacity + ')';
    ctx.lineWidth = 1;
    this.txt.rotate = -Math.atan2(this.p0.y - this.p1.y, this.p0.x - this.p1.x);
    let radians = 0;
    switch (this.kind) {
      case 1:
        this.txt.rotate = 0;
        this.l0.setDirection();
        this.p2.x = this.p0.x + this.l0.direction.x * (-10 / ctx.s);
        this.p2.y = this.p0.y + this.l0.direction.y * (-20 / ctx.s);
        this.txt.x = ctx.tx / ctx.devicePixelRatio + this.p2.x * ctx.s;
        this.txt.y = ctx.ty / ctx.devicePixelRatio + -this.p2.y * ctx.s;
        this.l0.dot(ctx, this.l0.p1.x, this.l0.p1.y);
        break;
      case 2:
        this.txt.rotate =
          -Math.atan2(this.p0y - this.p1y, this.p0x - this.p1x) || -PI05;
        radians = -this.txt.rotate + Math.PI / 2;
        this.p2.x = -50 / ctx.s;
        this.p2.y = this.p0.y / 2;
        this.txt.x = ctx.tx / ctx.devicePixelRatio + this.p2.x * ctx.s;
        this.txt.y = ctx.ty / ctx.devicePixelRatio + -this.p2.y * ctx.s;

        this.l0.p0.x = this.p2.x;
        this.l0.p0.y = this.p0.y;
        this.l0.p1.x = this.p2.x;
        this.l0.p1.y = this.p1.y;
        if (this.p0.y - this.p1.y >= 24 / ctx.s) {
          this.l0.style = 13;
        } else {
          this.txt.y =
            ctx.ty / ctx.devicePixelRatio + (this.p1.y + 25 / ctx.s) * ctx.s;
          this.l0.style = 14;
        }
        this.l0.draw(ctx);
        break;

      case 3:
        this.txt.rotate = 0;
        radians = -this.txt.rotate + Math.PI / 2;
        this.p2.x = this.p0.x + (this.p1.x - this.p0.x) / 2;
        this.p2.y = -50 / ctx.s;
        this.txt.x = ctx.tx / ctx.devicePixelRatio + this.p2.x * ctx.s;
        this.txt.y = ctx.ty / ctx.devicePixelRatio + -this.p2.y * ctx.s;

        this.l0.p1.x = this.p0.x;
        this.l0.p1.y = this.p2.y;
        this.l0.p0.x = this.p1.x;
        this.l0.p0.y = this.p2.y;

        this.l1.p0.x = this.l0.p1.x;
        this.l1.p0.y = this.l0.p1.y;
        this.l1.p1.x = this.p0.x;
        this.l1.p1.y = this.p0.y;
        if (this.p1.x - this.p0.x >= 12) {
          //this.l0.style = 13;
        } else {
          //this.txt.x = ctx.tx / ctx.devicePixelRatio + (this.p1.x + 25 / ctx.s) * ctx.s;
          //this.l0.style = 14;
        }

        if (this.txt.elm?.txt.sign !== 'u') {
          this.l1.lengthen(1, -14 / ctx.s);
        } else {
          this.l1.lengthen(1, -4 / ctx.s);
        }

        this.l1.lengthen(0, 7 / ctx.s);

        this.l0.draw(ctx);
        this.l1.draw(ctx);
        break;
      case 4:
        this.l0.p0.x = -this.p0.x;
        this.l0.p0.y = this.p0.y;
        this.l0.p1.x = -this.p1.x;
        this.l0.p1.y = this.p1.y;
        const length = this.p0.dist(this.p1);
        this.l0.style = 16;
        this.txt.rotate = 0;
        if (length > 30 / ctx.s) {
          this.txt.x = ctx.tx / ctx.devicePixelRatio + -this.p1.x * ctx.s - 10;
          this.txt.y = ctx.ty / ctx.devicePixelRatio + -this.p1.y * ctx.s - 8;
          this.l0.lengthen(1, -15 / ctx.s);
        } else {
          if (this.p0.y < this.p1.y) {
            this.txt.x =
              ctx.tx / ctx.devicePixelRatio + -this.p1.x * ctx.s - 22;
            this.txt.y =
              ctx.ty / ctx.devicePixelRatio + -this.p1.y * ctx.s - 18;
          } else {
            this.txt.x = ctx.tx / ctx.devicePixelRatio + -this.p1.x * ctx.s + 0;
            this.txt.y = ctx.ty / ctx.devicePixelRatio + -this.p1.y * ctx.s + 0;
          }
        }
        this.l0.draw(ctx);
        break;
      default:
        break;
    }
  }
  arrowhead(ctx, x, y, radians) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x * ctx.s, y * ctx.s);
    ctx.rotate(radians);
    ctx.moveTo(0, 0);
    ctx.lineTo(3 * ctx.es, 12 * ctx.es);
    ctx.lineTo(-3 * ctx.es, 12 * ctx.es);
    ctx.closePath();
    ctx.restore();
    ctx.fill();
  }
}
