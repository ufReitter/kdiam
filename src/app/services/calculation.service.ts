import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';
import { Project } from '../engine/entity';

@Injectable({
  providedIn: 'root',
})
export class CalculationService {
  workers: any = [];
  jobs: any = [];
  doFuncs: any = [];

  jobID = 0;

  projectSubject: BehaviorSubject<Project>;
  workerMesSub = new BehaviorSubject<any>(null);
  selectedProject: Project;

  jobsSubject: BehaviorSubject<any>;

  id: string;
  artId: number;
  idStr: string;
  worker: Worker;
  progress: any;
  remaining: any;
  status: any;
  result: any;
  t0: number;
  ab = new ArrayBuffer(1024 * 1024);
  view: Float64Array;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  init(count) {
    count = 1;
    this.view = new Float64Array(this.ab);

    this.jobsSubject = new BehaviorSubject<any>(this.jobs);
    this.jobID = 0;
    this.projectSubject.subscribe((project) => {
      if (project) {
        this.selectedProject = project;
      }
    });
    // console.time('worker all')
    for (let index = 0; index < count; index++) {
      if (isPlatformBrowser(this.platformId)) {
        const entry = {
          index: index,
          ready: false,
          worker: new Worker(new URL('./calculation.worker', import.meta.url), {
            type: 'module',
          }),
        };
        this.workers[index] = entry;

        entry.worker.onmessage = (e) => {
          const msg = e.data;
          this.workers[index].msg = e.data;
          const job = this.jobs[msg.id];
          this.workerMesSub.next(msg);
          switch (msg.cmd) {
            case 'debug':
              console.log(msg.msg);
              break;
            case 'init':
              this.workers[index].ready = true;
              break;
            case 'loadFunc':
              this.workers[index].ready = true;
              break;
            case 'load':
              job.progress = msg.progress;
              if (job.progress === 1) {
                job.stateSubject.next(msg.state);
                job.primInitSubject.next({ defs: msg.defs, time: msg.time });
                this.workers[index].ready = true;
                let delay = timer(5000).subscribe((t) => {
                  job.progress = 0;
                });
              }
              break;
            case 'do':
              job.progress = msg.progress;
              if (job.progress === 1) {
                job.stateSubject.next(msg.state);
                job.primChangesSubject.next({ defs: msg.defs, time: msg.time });
                this.workers[index].ready = true;
                if (job.project) {
                  this.saveJob(job);
                }
                let delay = timer(5000).subscribe((t) => {
                  job.progress = 0;
                });
              }
              break;
            case 'doFunc':
              job.progress = msg.progress;
              console.log('res', msg.result, msg);
              if (job.progress === 1) {
                job.resultSubject.next(msg.result);

                this.workers[index].ready = true;
                let delay = timer(500).subscribe((t) => {
                  job.progress = 0;
                });
              }
              break;
            default:
              break;
          }
        };
        entry.worker.postMessage({
          cmd: 'init',
          w_id: index,
        });
      }
    }
  }
  loadFunc(elms) {
    let srcs = this.getFuncs(elms);
  }
  getFuncs(elms) {
    let srcs = [];
    for (const elm of elms) {
      for (const src of elm.srcs) {
        if (src.args) {
          srcs.push(src);
        }
      }
    }
    return srcs;
  }

  saveJob(job) {
    if (job.saveDelay) job.saveDelay.unsubscribe();
    job.saveDelay = timer(100).subscribe((t) => {
      const changed = job.elm.children
        .filter((child) => child.elm.sign)
        .map((child) => {
          // this.selectedProject.update({ elm: child.elm, state: child.set.state });
          return child.set.state;
        });
    });
  }

  applyCode(job, srcs) {
    for (let index = 0; index < this.workers.length; index++) {
      const entry = this.workers[index];
      if (job.health === 0) {
        entry.worker.postMessage({
          cmd: 'load',
          id: job.id,
          _id: job.elm._eid.str,
          change: job.change,
          srcs: srcs,
        });
      }
    }
  }

  getJob(elm, idPath?, func?, offscreen?) {
    let job = this.jobs.find((job) => job.elm._eid.str === elm._eid.str);
    if (!job) {
      // this.jobID = ++this.jobID;
      let jobID = this.jobs.length;
      // const offscreen = document.querySelector('canvas').transferControlToOffscreen();
      job = {
        id: jobID,
        elm: elm,
        func: func,
        state: {},
        canvas: offscreen,
        change: elm.children
          .filter((child) => child.elm.sign)
          .map((obj) => {
            let set = obj.set;
            var rObj = {
              key: obj.elm.key,
              state: set.state,
              name: set.name,
            };
            return rObj;
          }),
        health: 0,
        progress: 0,
        project: true,
        resultSubject: new BehaviorSubject<any>(false),
        stateSubject: new BehaviorSubject<any>(false),
        primInitSubject: new BehaviorSubject<any>(false),
        primChangesSubject: new BehaviorSubject<any>(false),
        doSubject: new BehaviorSubject<any>(false),
        undoSubject: new BehaviorSubject<any>(false),
      };
      this.jobs.push(job);
    }

    // console.log(job.change)

    this.prepareCode(elm);

    if (isPlatformBrowser(this.platformId)) {
      const entry = this.workers[0];
      entry.worker.postMessage(
        {
          cmd: 'load',
          id: job.id,
          _id: elm._eid.str,
          change: job.change,
          srcs: elm.calc.srcs,
          canvas: job.canvas,
          // ab: this.ab
        },
        // [this.ab]
      );

      entry.id = job.id;
      job.worker = entry;
    }

    // for (let index = 0; index < this.workers.length; index++) {
    //   const entry = this.workers[index];
    //   if (!entry.id && !job.worker && job.health === 0) {

    //     entry.worker.postMessage(
    //       {
    //         cmd: 'load',
    //         id: job.id,
    //         _id: elm._eid.str,
    //         change: job.change,
    //         srcs: elm.srcs,
    //         canvas: job.canvas,
    //       },
    //       [this.intbuffer, this.floatbuffer]
    //     );

    //     entry.id = job.id;
    //     job.worker = entry;
    //   }
    // }

    return job;
  }

  doJob(job, stateChild?) {
    if (!stateChild) {
      job.change = job.elm.children
        .filter((child) => child.elm.sign)
        .map((obj) => {
          var rObj = {
            key: obj.elm.key,
            name: obj.set.name,
            state: obj.set.state,
          };
          return rObj;
        });
    } else {
      job.change = [
        {
          key: stateChild.elm.key,
          name: stateChild.name,
          state: stateChild.state,
        },
      ];
    }
    /*
    for (let index = 0; index < this.workers.length; index++) {
      const entry = this.workers[index];
      if (entry.ready) {
        if (CONSTRUCT.timer) console.time("worker do " + index + " " + job.id);
        entry.worker.postMessage({
          cmd: "do",
          id: job.id,
          _id: job.elm._eid.str,
          change: job.change
        });
        index = this.workers.length;
      }
    }
    */
    if (isPlatformBrowser(this.platformId) && job.worker.ready) {
      job.worker.worker.postMessage({
        cmd: 'do',
        id: job.id,
        _id: job.elm._eid.str,
        change: job.change,
      });
    }
  }

  doFunc(job, parms) {
    for (let index = 0; index < this.workers.length; index++) {
      const entry = this.workers[index];
      if (entry.ready) {
        entry.worker.postMessage({
          cmd: 'doFunc',
          id: job.id,
          _id: job.elm._eid.str,
          func: job.func,
          parms: parms,
        });
        break;
      }
    }
  }

  prepareCode(elm) {
    if (elm._eid.str === '5d0949f7e37e491e8a1a2675') {
      // elm.code["init"] = 'console.log("invalid code")';
      // elm.code["changes"] = 'console.log("invalid code")';
      // elm.srcs = null;
    }
    if (elm._eid.str === '5d0949f7e37e491e8a1a2676') {
      elm.srcs = null;
    }
    if (elm._eid.str === '5d0949f7e37e491e8a1a266d') {
      elm.srcs = null;
    }
    if (elm._eid.str === '5d0949f7e37e491e8a1a2677') {
      elm.srcs = null;
    }
    if (elm._eid.str === '5d0949f7e37e491e8a1a266a') {
      elm.srcs = null;
    }
    if (elm._eid.str === '5d0949f7e37e491e8a1a2674') {
      elm.srcs = null;
    }
    for (const it of elm.srcs) {
      let body = it.body;
      body = body.replace('new PRIM.I(', 'new Prim.AreaMoment(null,');
      body = body.replace(/PRIM.Pt\(/g, 'Prim.Pt(null,');
      body = body.replace(/FUNC./g, 'Prim.');
      if (body.includes('new PRIM.Tria')) {
        body = 'console.log("invalid code")';
      }
      if (body.includes('new PRIM.SegmentOfCircle')) {
        elm.srcs = null;
      }
      it.body = body;
    }
  }
}
