import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject } from 'rxjs';
import { ProfileService } from '../services/profile.service';
import { Line, Pt, ResultsConvention } from './render-lib/module';
import { autoFrame, drawPrims, initPrims } from './render-lib/utils';

const rCon = new ResultsConvention();

@Injectable({
  providedIn: 'root',
})
export class CalcService {
  jobs = {};
  elms: any = {};
  arr: any;
  calcWorker: Worker;
  canvasWorker: Worker;
  workerMesSub = new BehaviorSubject<any>(null);
  t0: number;
  t1: number;
  tr: number;
  devicePixelRatio: number;
  browser: string;
  noOffscreenCanvas: boolean;
  compilerErrors = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public _http: HttpClient,
    private deviceService: DeviceDetectorService,

    public pS: ProfileService,
  ) {
    this.noOffscreenCanvas =
      this.deviceService.getDeviceInfo().browser === 'Chromexxx' ? false : true;
    this.calcWorker = new Worker(new URL('./calc.worker', import.meta.url), {
      type: 'module',
    });
    if (!this.noOffscreenCanvas) {
      this.canvasWorker = new Worker(
        new URL('./canvas.worker', import.meta.url),
        {
          type: 'module',
        },
      );
    }
    this.devicePixelRatio = window.devicePixelRatio || 1;
    if (isPlatformBrowser(this.platformId)) {
      this.calcWorker.onmessage = (e) => {
        this.t1 = performance.now();
        const msg = e.data;
        msg.tw = this.t1 - this.t0;
        msg.tm = Date.now() - msg.tm0;
        msg.tr = this.tr;
        const job = this.jobs[msg.eid];
        job.workerMesSubj.next(msg);
        this.workerMesSub.next(msg);
        switch (msg.cmd) {
          case 'init':
            this.arr = new Float64Array(msg.results);
            job.inputArr = this.getInputs(job.elm);
            this.setInputs(job.elm, this.arr);
            if (this.noOffscreenCanvas) {
              // this.initDrawing(job, this.arr);
              job.txts = [];
              job.ctx = job.canvas.getContext('2d');
              job.ctx.devicePixelRatio = this.devicePixelRatio;
              if (job.elm.attrib.yup) {
                const orientation = this.arr[11];
                job.ctx.transform(1, 0, 0, -1, 768 / 2, 432 / 2);
                if (orientation === 0) {
                  job.ctx.dw = job.ctx.canvas.width;
                  job.ctx.dh = job.ctx.canvas.height;
                } else if (orientation === 1) {
                } else if (orientation === 2) {
                } else if (orientation === 3) {
                  job.ctx.dw = job.ctx.canvas.height;
                  job.ctx.dh = job.ctx.canvas.width;
                }
                job.ctx.yup = true;

                autoFrame(job.ctx, this.arr);
              }
              job.ctx.s = 1;
              if (msg.horizontal) {
                job.ctx.horizontal = true;
              }
              job.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
              job.ctx.s = 1;
              if (job.yup) {
                job.ctx.setTransform(1, 0, 0, 1, 768 / 2, -432 / 2);
              }
              job.ctx.es = job.ctx.dw > 2000 ? 2 : 1;
              job.prims = initPrims(this.arr, job);
              drawPrims(job.ctx, this.arr, job.prims);
            } else {
              // if (!job.ready) {
              job.canvasWorker.postMessage(
                {
                  cmd: 'init',
                  eid: job.elm._eid.str,
                  canvas: job.canvas,
                  results: msg.results,
                  devicePixelRatio: this.devicePixelRatio,
                  yup: job.elm.attrib.yup,
                  horizontal: job.elm.attrib.horizontal,
                },
                [job.canvas, msg.results],
              );
              // }
              job.ready = true;
            }
            break;
          case 'initcalc':
            this.arr = new Float64Array(msg.results);
            job.inputArr = this.getInputs(job.elm);
            this.setInputs(job.elm, this.arr);
            if (this.noOffscreenCanvas) {
              // this.initDrawing(job, this.arr);
              job.txts = [];
              job.ctx = job.canvas.getContext('2d');
              if (job.elm.attrib.yup) {
                const orientation = this.arr[11];
                if (orientation === 0) {
                  job.ctx.dw = job.ctx.canvas.width;
                  job.ctx.dh = job.ctx.canvas.height;
                } else if (orientation === 1) {
                } else if (orientation === 2) {
                } else if (orientation === 3) {
                  job.ctx.dw = job.ctx.canvas.height;
                  job.ctx.dh = job.ctx.canvas.width;
                }
              }
              job.ctx.s = 1;
              if (job.yup) {
                job.ctx.transform(1, 0, 0, 1, 768 / 2, -432 / 2);
              } else {
                job.ctx.setTransform(2, 0, 0, 2, 0, 0);
              }
              job.ctx.es = job.ctx.dw > 2000 ? 2 : 1;
              job.prims = initPrims(this.arr, job);
              drawPrims(job.ctx, this.arr, job.prims);
            } else {
              // if (!job.ready) {
              job.canvasWorker.postMessage(
                {
                  cmd: 'initcalc',
                  eid: job.elm._eid.str,
                  results: msg.results,
                  devicePixelRatio: this.devicePixelRatio,
                  yup: job.elm.attrib.yup,
                  horizontal: job.elm.attrib.horizontal,
                },
                [msg.results],
              );
              // }
              job.ready = true;
            }
            break;
          case 'do':
            this.arr = new Float64Array(msg.results);
            job.invalid = !!this.arr[24];
            if (!job.invalid) {
              this.setInputs(job.elm, this.arr);
              drawPrims(job.ctx, this.arr, job.prims);
            }
            break;
          default:
            break;
        }
      };

      if (!this.noOffscreenCanvas) {
        this.canvasWorker.onmessage = (e) => {
          this.tr = e.data.tr || 0;
        };
      }
    }
  }
  getJob(elm, canvas?) {
    const prom = new Promise((resolve) => {
      if (!elm.job) {
        setTimeout(() => {
          if (isPlatformBrowser(this.platformId)) {
            this.calcWorker.postMessage({
              cmd: 'init',
              eid: elm._eid.str,
              vpw: 768,
              vph: 432,
              inputs: this.getInputs(elm),
              fps: elm.attrib.fps || 0,
              autoStart: elm.attrib.autoStart,
              version: elm.calc.version,
            });
          }
          this.jobs[elm._eid.str] = elm.job;
          resolve(elm.job);
        }, 100);
      } else {
        resolve(elm.job);
      }
    });
    if (!elm.job) {
      elm.job = {
        elm: elm,
        yup: elm.attrib.yup,
        health: 0,
        progress: 0,
        project: true,
        worker: this.calcWorker,
        canvasWorker: this.canvasWorker,
        canvas: canvas,
        ready: false,
        invalid: false,
        inputArr: [],
        workerMesSubj: new BehaviorSubject<any>(null),
        resultSubject: new BehaviorSubject<any>(false),
        stateSubject: new BehaviorSubject<any>(false),
        primInitSubject: new BehaviorSubject<any>(false),
        primChangesSubject: new BehaviorSubject<any>(false),
        doSubject: new BehaviorSubject<any>(false),
        undoSubject: new BehaviorSubject<any>(false),
      };
    }
    return prom;
  }
  initJob(job) {
    if (isPlatformBrowser(this.platformId)) {
      job.worker.postMessage({
        cmd: 'init',
        eid: job.elm._eid.str,
        vpw: 768,
        vph: 432,
        inputs: this.getInputs(job.elm),
        fps: job.elm.attrib.fps || 0,
        autoStart: job.elm.attrib.autoStart,
        version: job.elm.calc.version,
      });
    }
  }
  doJob(job) {
    if (isPlatformBrowser(this.platformId)) {
      job.worker.postMessage({
        cmd: 'do',
        eid: job.elm._eid.str,
        inputs: this.getInputs(job.elm),
        fps: job.elm.attrib.fps || 0,
        autoStart: job.elm.attrib.autoStart,
      });
    }
  }
  inputJob(job) {
    if (isPlatformBrowser(this.platformId)) {
      if (job.elm.attrib.autoStart) {
        job.worker.postMessage({
          cmd: 'input',
          eid: job.elm._eid.str,
          inputs: this.getInputs(job.elm),
        });
      } else {
        job.worker.postMessage({
          cmd: 'do',
          eid: job.elm._eid.str,
          inputs: this.getInputs(job.elm),
          fps: job.elm.attrib.fps || 0,
          autoStart: job.elm.attrib.autoStart,
        });
      }
    }
  }
  play(job) {
    if (isPlatformBrowser(this.platformId)) {
      job.worker.postMessage({
        cmd: 'play',
        eid: job.elm._eid.str,
        inputs: this.getInputs(job.elm),
        fps: job.elm.attrib.fps || 0,
        autoStart: job.elm.attrib.autoStart,
      });
    }
  }
  pause(job) {
    if (isPlatformBrowser(this.platformId)) {
      job.worker.postMessage({
        cmd: 'pause',
        eid: job.elm._eid.str,
        inputs: this.getInputs(job.elm),
      });
    }
  }
  stop(job) {
    if (isPlatformBrowser(this.platformId)) {
      job.worker.postMessage({
        cmd: 'stop',
        eid: job.elm._eid.str,
      });
    }
  }
  getCalcSubject(elm) {
    if (!elm.calcSubject) {
      elm.calcSubject = new BehaviorSubject<any>(null);
      this.t0 = performance.now();
      this.calcWorker.postMessage({
        cmd: 'init',
        eid: elm._eid.str,
        vpw: 720,
        vph: 720 / (elm.attrib.ratio || 1.62),
        inputs: this.getInputs(elm),
        version: elm.calc.version,
      });
      this.elms[elm._eid.str] = elm;
      return elm.calcSubject;
    } else {
      return elm.calcSubject;
    }
  }
  initCalcSubject(elm) {
    this.t0 = performance.now();
    this.calcWorker.postMessage({
      cmd: 'initcalc',
      eid: elm._eid.str,
      vpw: 720,
      vph: 720 / (elm.attrib.ratio || 1.62),
      inputs: this.getInputs(elm),
      fps: elm.attrib.fps || 0,
      autoStart: elm.attrib.autoStart,
      yup: elm.attrib.yup,
      version: elm.calc.version,
    });
  }
  initCalcOnInitSubject(elm) {
    this.t0 = performance.now();
    this.calcWorker.postMessage({
      cmd: 'init',
      eid: elm._eid.str,
      vpw: 720,
      vph: 720 / (elm.attrib.ratio || 1.62),
      inputs: this.getInputs(elm),
      fps: elm.attrib.fps || 0,
      autoStart: elm.attrib.autoStart,
      yup: elm.attrib.yup,
      version: elm.calc.version,
    });
  }
  getInputs(elm) {
    const arr = elm.job?.inputArr || [];
    arr[0] = this.pS.pref.display[elm._eid.str]?.dimensionsA ? 1 : 0;
    arr[1] = this.pS.pref.display[elm._eid.str]?.analyse ? 2 : 1;
    arr[2] = this.pS.pref.display[elm._eid.str]?.colors || 1;
    arr[3] = this.pS.pref.display[elm._eid.str]?.showAxes ? 1 : 0;
    arr[4] = this.pS.pref.display[elm._eid.str]?.showGrid ? 1 : 0;
    arr[5] = this.pS.pref.display[elm._eid.str]?.grid || 25;
    let ii = 1;
    for (let i = 0; i < elm.children.length; i++) {
      if (elm.children[i].set.name) {
        const state = elm.children[i].set.state;
        arr[ii * rCon.io + 0] = state.min || 0;
        arr[ii * rCon.io + 1] = state.max || 0;
        arr[ii * rCon.io + 2] = state.step || 0;
        state.maxValid = state.val <= state.maxValid ? 0 : state.maxValid;
        if (state.maxValid && state.val >= state.maxValid) {
          state.val = state.maxValid;
        }
        arr[ii * rCon.io + 3] = state.val;
        arr[ii * rCon.io + 4] = state.maxValid || 0;
        arr[ii * rCon.io + 5] = state.checked ? 1 : 0;
        arr[ii * rCon.io + 6] = state.pressed ? 1 : 0;
        ii++;
        if (state.pressed) {
          state.pressed = false;
        }
      }
    }
    return arr;
  }
  setInputs(elm, results) {
    let ii = 1;
    for (let i = 0; i < elm.children.length; i++) {
      if (elm.children[i].set.name) {
        const state = elm.children[i].set.state;
        state.min = results[rCon.header + ii * rCon.io + 0];
        state.max = results[rCon.header + ii * rCon.io + 1];
        state.step = results[rCon.header + ii * rCon.io + 2];
        if (state.input) {
          const newVal = results[rCon.header + ii * rCon.io + 3];
          const maxValid = results[rCon.header + ii * rCon.io + 4];
          state.maxValid = maxValid;
          if (newVal != state.val && state.val <= maxValid) {
            state.val = newVal;
          }
          if (!maxValid) {
            // state.val = newVal;
            state.warn = false;
          }
          if (maxValid && state.val >= maxValid) {
            state.val = maxValid;
            state.warn = true;
          }
        } else {
          state.val = results[rCon.header + ii * rCon.io + 3];
        }
        //state.checked = results[rCon.header + ii * rCon.io + 4];
        //state.pressed = results[rCon.header + ii * rCon.io + 5];
        ii++;
      }
    }
  }
  initDrawing(job, results) {
    job.ctx = job.canvas.getContext('2d');
    job.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    job.ctx.s = 1;
    if (job.yup) {
      job.ctx.transform(1, 0, 0, 1, 768 / 2, -432 / 2);
    }
    job.prims = [];
    for (let i = 0; i < results[2]; i++) {
      job.prims.push(
        new Line(
          rCon.header +
            results[0] * rCon.io +
            results[1] * rCon.pt +
            i * rCon.line,
        ),
      );
    }
    for (let i = 0; i < results[1]; i++) {
      job.prims.push(new Pt(rCon.header + results[0] * rCon.io + i * rCon.pt));
    }
  }
  doDrawing(job, results) {
    const ctx = job.ctx;

    const t0 = performance.now();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (!job.prims) return;
    for (let i = 0; i < job.prims.length; i++) {
      const prim = job.prims[i];
      prim.update(results);
      prim.draw(ctx);
    }
    const t1 = performance.now();

    this.tr = t1 - t0;
  }
  resumeDrawing(job) {
    job.ctx = job.canvas.getContext('2d');
    job.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
    job.ctx.s = 1;
    if (job.yup) {
      job.ctx.transform(1, 0, 0, 1, 768 / 2, -432 / 2);
    }
  }
}
