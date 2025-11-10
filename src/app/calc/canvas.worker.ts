/// <reference lib="webworker" />

import { Injectable } from '@angular/core';
import {
  Arc,
  Forming,
  Impact,
  Line,
  Phlx,
  Pt,
  ResultsConvention,
  Sheet,
} from './render-lib/module';

const rCon = new ResultsConvention();

@Injectable({
  providedIn: 'root',
})
export class CanvasWorker {
  cans = {};
  ctxs = {};
  prims = [];
  rCon: any;
  jobs: any = {};
  devicePixelRatio = 1;
  constructor() {
    this.rCon = rCon;
    self.addEventListener('message', async (event) => {
      // @ts-ignore
      if (!event.data) return;
      // @ts-ignore
      let msg = event.data;
      let tr0, tr1, tc0, tc1, tm0, arrPtr, dataRef;
      switch (msg.cmd) {
        case 'init':
          this.jobs[msg.eid] = {
            can: msg.canvas,
            ctx: msg.canvas.getContext('2d'),
          };
          this.jobs[msg.eid].ctx.scale(
            msg.devicePixelRatio,
            msg.devicePixelRatio,
          );
          this.devicePixelRatio = msg.devicePixelRatio;
          this.jobs[msg.eid].ctx.s = 1;
          this.jobs[msg.eid].ctx.devicePixelRatio = msg.devicePixelRatio || 1;
          const arr = new Float64Array(msg.results);

          if (msg.yup) {
            const orientation = arr[11];
            this.jobs[msg.eid].ctx.transform(1, 0, 0, -1, 768 / 2, 432 / 2);
            if (orientation === 0) {
              this.jobs[msg.eid].ctx.dw = this.jobs[msg.eid].ctx.canvas.width;
              this.jobs[msg.eid].ctx.dh = this.jobs[msg.eid].ctx.canvas.height;
            } else if (orientation === 1) {
            } else if (orientation === 2) {
            } else if (orientation === 3) {
              this.jobs[msg.eid].ctx.dw = this.jobs[msg.eid].ctx.canvas.height;
              this.jobs[msg.eid].ctx.dh = this.jobs[msg.eid].ctx.canvas.width;
            }
            this.jobs[msg.eid].ctx.yup = true;
            this.jobs[msg.eid].ctx.s = 1;

            this.autoFrame(this.jobs[msg.eid].ctx, arr);
          }
          if (msg.horizontal) {
            this.jobs[msg.eid].ctx.horizontal = true;
          }
          tr0 = performance.now();
          this.jobs[msg.eid].prims = this.initPrims(arr);
          this.drawPrims(this.jobs[msg.eid].ctx, arr, this.jobs[msg.eid].prims);
          tr1 = performance.now();
          postMessage({
            cmd: msg.cmd,
            eid: msg.eid,
            tr: tr1 - tr0,
          });
          break;
        case 'initcalc':
          const arr3 = new Float64Array(msg.results);

          const ctx = this.jobs[msg.eid].ctx;
          // ctx.width = ctx.canvas.width * msg.devicePixelRatio;
          // ctx.height = ctx.canvas.width * msg.devicePixelRatio;

          tr0 = performance.now();
          this.jobs[msg.eid].prims = this.initPrims(arr3);
          this.drawPrims(
            this.jobs[msg.eid].ctx,
            arr3,
            this.jobs[msg.eid].prims,
          );
          tr1 = performance.now();
          postMessage({
            cmd: msg.cmd,
            eid: msg.eid,
            tr: tr1 - tr0,
          });
          break;
        case 'resume':
          this.jobs[msg.eid].canvas = msg.canvas;
          this.jobs[msg.eid].ctx = msg.canvas.getContext('2d');
          this.jobs[msg.eid].ctx.scale(
            msg.devicePixelRatio,
            msg.devicePixelRatio,
          );
          if (msg.yup) {
            let orientation;
            if (msg.horizontal) {
              orientation = 3;
            } else {
              orientation = 0;
            }
            this.jobs[msg.eid].ctx.transform(1, 0, 0, -1, 768 / 2, 432 / 2);
            if (orientation === 0) {
              this.jobs[msg.eid].ctx.dw = this.jobs[msg.eid].ctx.canvas.width;
              this.jobs[msg.eid].ctx.dh = this.jobs[msg.eid].ctx.canvas.height;
            } else if (orientation === 1) {
            } else if (orientation === 2) {
            } else if (orientation === 3) {
              this.jobs[msg.eid].ctx.dw = this.jobs[msg.eid].ctx.canvas.height;
              this.jobs[msg.eid].ctx.dh = this.jobs[msg.eid].ctx.canvas.width;
              this.jobs[msg.eid].ctx.yup = true;
            }

            this.jobs[msg.eid].ctx.s = 1;
          }
          postMessage({
            cmd: msg.cmd,
            eid: msg.eid,
          });
          break;
        case 'do':
          const arr2 = new Float64Array(msg.results);
          tr0 = performance.now();
          this.drawPrims(
            this.jobs[msg.eid].ctx,
            arr2,
            this.jobs[msg.eid].prims,
          );
          tr1 = performance.now();
          postMessage({
            cmd: msg.cmd,
            tr: tr1 - tr0,
          });
          break;
        default:
          postMessage({ cmd: 'message', value: 'unknown command' });
      }
    });
  }
  initPrims(results) {
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
    return prims;
  }
  drawPrims(ctx, results, prims) {
    const orientation = results[11];
    if (!prims) return;
    if (ctx.yup) {
      ctx.clearRect(-ctx.dw / 4, -ctx.dh / 4, ctx.dw / 2, ctx.s * ctx.dh);
      this.autoFrame(ctx, results);
      if (results[rCon.header + 3]) {
        this.axes(ctx, results);
      }
      if (results[rCon.header + 4]) {
        this.grid(ctx, results);
      }
    } else {
      ctx.clearRect(
        0,
        0,
        ctx.canvas.width / ctx.devicePixelRatio,
        ctx.canvas.height / ctx.devicePixelRatio,
      );
    }
    // ctx.strokeStyle = 'grey';
    // ctx.lineWidth = 3;
    // ctx.beginPath();
    // ctx.rect(
    //   -ctx.canvas.width / 4,
    //   -ctx.canvas.height / 4,
    //   ctx.canvas.width / 2,
    //   ctx.s * ctx.canvas.height,
    // );
    // ctx.stroke();
    for (let i = 0; i < prims.length; i++) {
      const prim = prims[i];
      prim.update(results);
      if (prim instanceof Sheet) {
        if (results[rCon.header + 1] === 2) {
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
  axes(ctx, results) {
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
  grid(ctx, results) {
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
  autoFrame(ctx, results) {
    let w, h, cty, sw, sh;
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    const x1 = results[12];
    const y1 = results[13];
    const x2 = results[14];
    const y2 = results[15];
    const mx = results[19] - results[17];
    const my = results[18] - results[16];
    if (results[11] === 0) {
      w = x2 - x1;
      h = y2 - y1;
      cty = y2 - y1;
      sw = ctx.canvas.width / 2 / (w + (results[17] + results[18]) / 2);
      sh = ctx.canvas.height / 2 / (h + (results[16] + results[18]) / 2);
      ctx.s = Math.min(sw, sh);
      ctx.tx = ctx.canvas.width / 2 + mx;
      ctx.ty = ctx.canvas.height / 2 + cty * ctx.s - my;
      ctx.transform(
        this.devicePixelRatio,
        0,
        0,
        -this.devicePixelRatio,
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
      ctx.transform(
        this.devicePixelRatio,
        0,
        0,
        -this.devicePixelRatio,
        ctx.tx,
        ctx.ty,
      );
    }

    ctx.rotate((results[11] * Math.PI) / 2);

    // ctx.scale(this.devicePixelRatio, -this.devicePixelRatio);
    // ctx.translate(110, -300);
    //ctx.transform(1, 0, 0, 1, 768 / 2, -432 / 2);
  }
}
const service = new CanvasWorker();
