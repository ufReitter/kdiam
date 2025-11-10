import { Dim } from './dim';
import {
  Arc,
  Forming,
  Impact,
  Line,
  Phlx,
  Pt,
  ResultsConvention,
  Sheet,
} from './module';

const rCon = new ResultsConvention();
export function axes(ctx, results) {
  const x1 = -ctx.tx;
  const y1 = ctx.ty;
  const x2 = ctx.tx;
  const y2 = -ctx.ty;
  ctx.strokeStyle = 'rgba(128,128,128,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ctx.s * x1, 0);
  ctx.lineTo(ctx.s * x2, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, ctx.s * y1);
  ctx.lineTo(0, ctx.s * y2);
  ctx.stroke();
}
export function grid(ctx, results) {
  const s = results[rCon.header + 5];
  const x1 = -ctx.tx;
  const y1 = ctx.ty;
  const x2 = ctx.tx;
  const y2 = -ctx.ty;
  ctx.lineWidth = 1;
  let tx, ty;

  if (results[11] === 0) {
    tx = ctx.tx;
    ty = ctx.ty;
  } else {
    tx = ctx.tx;
    ty = ctx.ty;
  }

  const start = results[rCon.header + 3];
  ctx.strokeStyle = 'rgba(128,128,128,0.25)';
  for (let i = 1; i < Math.ceil(tx / s); i++) {
    ctx.beginPath();
    ctx.moveTo(ctx.s * s * i, y1);
    ctx.lineTo(ctx.s * s * i, y2);
    ctx.stroke();
  }
  for (let i = 0 + start; i < Math.ceil(tx / s); i++) {
    ctx.beginPath();
    ctx.moveTo(ctx.s * -s * i, y1);
    ctx.lineTo(ctx.s * -s * i, y2);
    ctx.stroke();
  }
  for (let i = 1; i < Math.ceil(ty / s); i++) {
    ctx.beginPath();
    ctx.moveTo(x1, ctx.s * s * i);
    ctx.lineTo(x2, ctx.s * s * i);
    ctx.stroke();
  }
  for (let i = 0 + start; i < Math.ceil(ty / s); i++) {
    ctx.beginPath();
    ctx.moveTo(x1, ctx.s * -s * i);
    ctx.lineTo(x2, ctx.s * -s * i);
    ctx.stroke();
  }
}

export function initPrims(results, elm) {
  const prims = [];
  for (let i = 0; i < results[2]; i++) {
    prims.push(
      new Line(
        rCon.header +
          results[0] * rCon.io +
          results[1] * rCon.pt +
          i * rCon.line,
      ),
    );
  }
  for (let i = 0; i < results[4]; i++) {
    prims.push(
      new Forming(
        rCon.header +
          results[0] * rCon.io +
          results[1] * rCon.pt +
          results[2] * rCon.line +
          results[3] * rCon.arc +
          i * rCon.forming,
      ),
    );
  }
  for (let i = 0; i < results[6]; i++) {
    prims.push(
      new Impact(
        rCon.header +
          results[0] * rCon.io +
          results[1] * rCon.pt +
          results[2] * rCon.line +
          results[3] * rCon.arc +
          results[4] * rCon.forming +
          results[5] * rCon.sheet +
          i * rCon.impact,
      ),
    );
  }
  for (let i = 0; i < results[3]; i++) {
    prims.push(
      new Arc(
        rCon.header +
          results[0] * rCon.io +
          results[1] * rCon.pt +
          results[2] * rCon.line +
          i * rCon.arc,
      ),
    );
  }
  for (let i = 0; i < results[5]; i++) {
    prims.push(
      new Sheet(
        rCon.header +
          results[0] * rCon.io +
          results[1] * rCon.pt +
          results[2] * rCon.line +
          results[3] * rCon.arc +
          results[4] * rCon.forming +
          i * rCon.sheet,
      ),
    );
  }
  for (let i = 0; i < results[1]; i++) {
    prims.push(new Pt(rCon.header + results[0] * rCon.io + i * rCon.pt));
  }
  for (let i = 0; i < results[7]; i++) {
    prims.push(
      new Phlx(
        rCon.header +
          results[0] * rCon.io +
          results[1] * rCon.pt +
          results[2] * rCon.line +
          results[3] * rCon.arc +
          results[4] * rCon.forming +
          results[5] * rCon.sheet +
          results[6] * rCon.impact +
          i * rCon.phlx,
      ),
    );
  }
  for (let i = 0; i < results[9]; i++) {
    prims.push(
      new Dim(
        rCon.header +
          results[0] * rCon.io +
          results[1] * rCon.pt +
          results[2] * rCon.line +
          results[3] * rCon.arc +
          results[4] * rCon.forming +
          results[5] * rCon.sheet +
          results[6] * rCon.impact +
          results[7] * rCon.phlx +
          results[8] * rCon.sheetPt +
          i * rCon.dim,
        elm,
      ),
    );
  }
  return prims;
}

export function drawPrims(ctx, results, prims) {
  const orientation = results[11];
  if (!prims) return;
  if (ctx.yup) {
    autoFrame(ctx, results);
    ctx.clearRect(
      -ctx.dw / (ctx.devicePixelRatio * 2),
      -ctx.dh / (ctx.devicePixelRatio * 2),
      ctx.dw / ctx.devicePixelRatio,
      ctx.s * ctx.dh,
    );
    if (results[rCon.header + 3]) {
      axes(ctx, results);
    }
    if (results[rCon.header + 4]) {
      grid(ctx, results);
    }
  } else {
    ctx.clearRect(
      0,
      0,
      ctx.canvas.width / ctx.devicePixelRatio,
      ctx.canvas.height / ctx.devicePixelRatio,
    );
  }
  for (let i = 0; i < prims.length; i++) {
    const prim = prims[i];
    prim.update(results);
    if (prim instanceof Sheet) {
      if (results[rCon.header + 1] === 1) {
        prim.draw(ctx, results);
      }
    } else {
      prim.draw(ctx);
    }
    if (
      prim instanceof Sheet ||
      prim instanceof Impact ||
      prim instanceof Phlx
    ) {
      ctx.scale(-1, 1);
      if (prim instanceof Sheet) {
        prim.draw(ctx, results);
      } else {
        prim.draw(ctx);
      }
      ctx.scale(-1, 1);
    }
  }
}
export function autoFrame(ctx, results) {
  let w, h, cty, sw, sh;
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const x1 = results[12];
  const y1 = results[13];
  const x2 = results[14];
  const y2 = results[15];
  const m = results[16];
  const tx = results[17];
  const ty = results[18];
  const ml = results[19];
  const mx = results[19] - results[17];
  const my = results[18] - results[16];
  if (results[11] === 0) {
    w = (x2 - x1) / (2 / ctx.devicePixelRatio);
    h = (y2 + y1) / (2 / ctx.devicePixelRatio);
    cty = (y2 + y1) / (2 / ctx.devicePixelRatio);
    sw = ctx.canvas.width / 2 / w;
    sh = ctx.canvas.height / 2 / h;
    ctx.s = Math.min(sw, sh);
    ctx.s -= ctx.s * m;
    ctx.tx = ctx.canvas.width * tx;
    ctx.ty = ctx.canvas.height * ty + cty * ctx.s;
    ctx.setTransform(
      ctx.devicePixelRatio,
      0,
      0,
      -ctx.devicePixelRatio,
      ctx.tx,
      ctx.ty,
    );
  } else {
    w = y2 - y1;
    h = x2 - x1;
    cty = x2 - x1;
    sw = ctx.canvas.width / 2 / (w + (results[17] + results[19]) / 2);
    sh = ctx.canvas.height / 2 / (h + (results[16] + results[18]) / 2);
    ctx.s = Math.min(sw, sh);
    ctx.tx = ctx.canvas.width / 2 - cty * ctx.s - my;
    ctx.ty = ctx.canvas.height / 2 + mx;
    ctx.setTransform(
      ctx.devicePixelRatio,
      0,
      0,
      -ctx.devicePixelRatio,
      ctx.tx,
      ctx.ty,
    );
  }

  ctx.rotate((results[11] * Math.PI) / 2);

  // ctx.scale(this.devicePixelRatio, -this.devicePixelRatio);
  // ctx.translate(110, -300);
  //ctx.transform(1, 0, 0, 1, 768 / 2, -432 / 2);
}
