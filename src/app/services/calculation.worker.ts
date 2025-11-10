/// <reference lib="webworker" />
/**
 * @license
 * Copyright 4Ming e.K. All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * LICENSE file at https://kompendia.net/LICENSE.txt
 */

import { Prim } from '../engine/prim-worker';

var canvas;
var ctx;

var Calc = {};
var Func = {};
var w_id;

var test = 12345;

class Calculation {
  id: string;
  init: Function;
  changes: Function;
  timeInit: number;
  timeChanges: number;
  state: any;
  prim: any = {};
  prims: any[] = [];
  defs: any[] = [];
  jobs: any = {};
  needed: string[];
  tree: any;
  findex = 0;
  constructor(def: any) {
    this.id = def.id;
    this.jobs[def.id] = def;
    this.state = {};

    for (const it of def.change) {
      this.state[it.name] = it.state;
    }
    for (const it of def.srcs) {
      if (it.args) {
        let str = it.args.replace(/\s/g, '');
        let args = it.args.split(',');
        args.push(it.body);
        this[it.name] = new Function(...args);
        Func[it.name] = this[it.name];
      } else {
        this[it.name] = new Function('_', '__', 'Prim', 'Func', it.body);
      }
    }
    if (!this.changes) {
      this.changes = new Function('_', '__', 'Prim', 'Func', '');
    }
    if (this.init) {
      const t0 = performance.now();
      this.init(this.state, this.prim, Prim, Func);
      this.prims = [];
      for (const key in this.prim) {
        if (this.prim.hasOwnProperty(key)) {
          const p = this.prim[key];
          p.id = key;
          this.prims.push(p);
          if (p.style || p.report) {
            this.defs.push(p.def);
          }
        }
      }
      this.prims.sort(function (x, y) {
        let a, b;
        a = x.order;
        b = y.order;
        if (a > b) return 1;
        if (a < b) return -1;
      });
      for (const it of this.prims) {
        it.feature(this.findex);
      }
      const t1 = performance.now();
      this.timeInit = t1 - t0;
    }
    if (!this.state.progress) {
      this.state.progress = 1;
    }
  }
  doChanges(change) {
    this.findex++;
    for (const it of change) {
      if (it.name) {
        for (const key in it.state) {
          if (it.state.hasOwnProperty(key)) {
            this.state[it.name][key] = it.state[key];
          }
        }
      }
    }
    this.findex++;
    const t0 = performance.now();
    for (const it of this.prims) {
      for (const it of this.prims) {
        it.feature(this.findex);
      }

      if (it.refs) {
        for (const ref of it.refs) {
          it[ref.key] = ref.ref.val;
        }
      }
    }

    for (const it of this.prims) {
      it.feature(this.findex);
    }

    this.changes(this.state, this.prim, Prim);

    for (const it of this.prims) {
      it.feature(this.findex);
    }
    // this.prims = [];
    this.defs = [];
    for (const it of this.prims) {
      if (it.style || it.report) {
        this.defs.push(it.def);
      }
    }
    this.defs.sort(function (x, y) {
      let a, b;
      a = x.layer;
      b = y.layer;
      if (a > b) return 1;
      if (a < b) return -1;
    });
    // for (const key in this.prim) {
    //   if (this.prim.hasOwnProperty(key)) {
    //     const p = this.prim[key];
    //     this.prims.push(p);
    //     if (p.style || p.report) {
    //       this.defs.push(p.def);
    //     }
    //   }
    // }
    const t1 = performance.now();
    this.timeChanges = t1 - t0;
  }

  create(code) {
    for (const key in code) {
      if (code.hasOwnProperty(key)) {
        this[key] = new Function('_', code[key]);
      }
    }
    if (this.init) {
    }
  }
}
function debug(msg) {
  postMessage({ cmd: 'debug', msg: msg });
}

addEventListener('message', (event) => {
  let msg = event.data;

  switch (msg.cmd) {
    case 'init':
      w_id = msg.w_id;
      postMessage({ cmd: msg.cmd, w_id: w_id, ready: true });
      break;
    case 'stop':
      close(); // Terminates the worker.
      break;
    case 'start':
      firstProgress = true;
      t0 = Date.now();
      postMessage({ cmd: 'progress', value: 0 });
      break;
    case 'import':
      importScripts(msg.uri);
      postMessage({ progress: 1 });
      break;
    case 'load':
      let ab = msg.ab;
      Calc[msg._id] = new Calculation(msg);
      postMessage(
        {
          cmd: 'load',
          id: msg.id,
          progress: 1,
          time: Calc[msg._id].timeInit,
          state: Calc[msg._id].state,
          defs: Calc[msg._id].defs,
          // ab: msg.ab
        },
        // [msg.ab]
      );
      break;
    case 'do':
      Calc[msg._id].doChanges(msg.change);
      postMessage({
        cmd: 'do',
        id: msg.id,
        progress: 1,
        time: Calc[msg._id].timeChanges,
        state: Calc[msg._id].state,
        defs: Calc[msg._id].defs,
      });

      break;
    case 'doFunc':
      let result = Func[msg.func](...msg.parms);
      postMessage({
        cmd: 'doFunc',
        id: msg.id,
        func: msg.func,
        progress: 1,
        result: result,
      });

      break;
    default:
      const cmd = msg.cmd;
      const job = msg.job;
      const state = msg.state;

      postMessage({ cmd: 'message', value: 'unknown command' });
  }
});

var firstProgress = true;
var t0 = 0;
function postProgress(rel) {
  var t1 = Date.now();
  var tD = t1 - t0;
  if (firstProgress || tD > 1000) {
    // postMessage({ cmd: "progress", value: rel });
    t0 = Date.now();
  }
  firstProgress = false;
}
