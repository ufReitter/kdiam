import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Dexie from 'dexie';
import { Subscription } from 'rxjs';
import { CalcService } from 'src/app/calc/calc.service';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import {
  Arc,
  Forming,
  Impact,
  Io,
  Line,
  Phlx,
  Pt,
  ResultsConvention,
  Sheet,
} from '../../calc/render-lib/module';

const rCon = new ResultsConvention();

var getByKeyPath = Dexie.getByKeyPath;
var setByKeyPath = Dexie.setByKeyPath;
var deepClone = Dexie.deepClone;

@Component({
  selector: 'kd-debug',
  standalone: false,
  templateUrl: './debug.component.html',
  styleUrls: ['./debug.component.scss'],
})
export class DebugComponent implements OnInit, OnChanges, OnDestroy {
  elm: Elm;
  obj: any;
  view: boolean;
  edit: boolean;
  editPath = '';
  defaultPaths = ['dS.debug', 'dS.selElm.def'];
  paths: any = [];

  editArrayIndex = -1;
  debugObj: any;
  props = [];
  @Input() keyPath = 'dS.debug';
  parts: any;
  timer: any;
  prefSub: Subscription;
  workerMesSub: Subscription;
  eid = 'xxx';
  jobs: {};
  class: any;
  className = 'io';
  classes = [];
  classIndex = 0;
  selIndex = 0;
  primIndex = 0;
  prims = [];
  prim: any = new Pt(0);
  arr: any = [];
  arrHeader = [];
  delayPc: any;
  delayCd: any;
  latency = 100;
  latencyMax = 750;
  constructor(
    public router: Router,
    public pS: ProfileService,
    public vS: ViewService,
    public dS: DataService,
    public cS: CalcService,
  ) {}

  ngOnInit(): void {
    if (this.keyPath) {
      //this.props = this.getProps(this.keyPath);
    }
    this.prefSub = this.pS.prefSub.subscribe((pref) => {
      if (pref?.debug?.show) {
        this.paths = this.defaultPaths.concat(pref.debug.paths);
        this.keyPath = this.paths[pref.debug.index];
        this.props = this.getProps(this.keyPath, this.prim);
        // this.timer = timer(1000, 1000).subscribe(() => {
        //   this.updateValues(this.props, this.obj);
        // });
      }
    });
  }
  ngAfterViewInit(): void {
    this.workerMesSub = this.cS.workerMesSub.subscribe((msg) => {
      if (msg && msg.results?.byteLength !== 0) {
        if (msg.cmd === 'init') {
          this.initDebug(msg);
        }
        if (msg.cmd === 'initcalc') {
          if (!this.class) {
            this.initDebug(msg);
          } else {
            const arr = new Float64Array(msg.results);
            this.arr = Array.from(arr);
            this.prim.update(this.arr);
            this.nil(this.props);
            if (!this.delayCd) {
              this.delayCd = setTimeout(() => {
                this.updateValues(this.props, this.prim);
                clearTimeout(this.delayCd);
                this.delayCd = null;
                this.latency = this.latencyMax;
              }, this.latency);
            }
          }
        }
        if (msg.cmd === 'do') {
          if (!this.class) {
            this.initDebug(msg);
          } else {
            const arr = new Float64Array(msg.results);
            this.arr = Array.from(arr);
            this.prim.update(this.arr);
            if (!this.delayCd) {
              this.delayCd = setTimeout(() => {
                this.updateValues(this.props, this.prim);
                clearTimeout(this.delayCd);
                this.delayCd = null;
                this.latency = this.latencyMax;
              }, this.latency);
            }
          }
        }
      }
    });
  }
  ngOnChanges(): void {
    if (this.keyPath) {
      //this.props = this.getProps(this.keyPath);
    }
  }
  ngOnDestroy() {
    if (this.timer) this.timer.unsubscribe();

    if (this.prefSub) this.prefSub.unsubscribe();
    if (this.workerMesSub) this.workerMesSub.unsubscribe();
  }

  initDebug(msg) {
    this.elm = this.dS.obj[msg.eid];
    this.latencyMax = this.elm.attrib.autoStart ? 750 : 0;
    const arr = new Float64Array(msg.results);
    this.arr = Array.from(arr);
    this.arrHeader = this.arr.slice(0, rCon.header);
    let i = -1;
    this.classes = [];
    for (const key in rCon) {
      if (Object.prototype.hasOwnProperty.call(rCon, key)) {
        if (key !== 'header' && key !== 'sheetPt' && this.arrHeader[i]) {
          let s = this.arrHeader[i] > 1 ? 's' : '';
          this.classes.push({
            name: key + s,
            length: this.arrHeader[i],
            index: i,
          });
        }
        i++;
      }
    }
    this.eid = msg.eid;
    // this.class = this.pS.pref.debug[this.eid]?.class || 'io';
    const index = this.pS.pref.debug[this.eid]?.index || 0;
    this.class = this.classes[index];
    this.classIndex = this.class.index;
    this.className = this.class.name;
    this.primIndex = this.pS.pref.debug[this.eid]?.primIndex || 0;
    this.prims = [];
    for (let i = 0; i < this.class.length; i++) {
      this.prims.push(i);
    }
    this.createPrim(this.classIndex, this.primIndex);
    this.prim.update(this.arr);
    this.props = this.getProps(this.keyPath, this.prim);
    this.updateValues(this.props, this.prim);
    console.log('debug results array', this.arr);
  }

  createPrim(ic, ip) {
    switch (ic) {
      case 0:
        this.prim = new Io(rCon.header + ip * rCon.io);
        break;
      case 1:
        this.prim = new Pt(
          rCon.header + this.arrHeader[0] * rCon.io + ip * rCon.pt,
        );
        break;
      case 2:
        this.prim = new Line(
          rCon.header +
            this.arrHeader[0] * rCon.io +
            this.arrHeader[1] * rCon.pt +
            ip * rCon.line,
        );
        break;
      case 3:
        this.prim = new Arc(
          rCon.header +
            this.arrHeader[0] * rCon.io +
            this.arrHeader[1] * rCon.pt +
            this.arrHeader[2] * rCon.line +
            ip * rCon.arc,
        );
        break;
      case 4:
        this.prim = new Forming(
          rCon.header +
            this.arrHeader[0] * rCon.io +
            this.arrHeader[1] * rCon.pt +
            this.arrHeader[2] * rCon.line +
            this.arrHeader[3] * rCon.arc +
            ip * rCon.forming,
        );
        break;
      case 5:
        this.prim = new Sheet(
          rCon.header +
            this.arrHeader[0] * rCon.io +
            this.arrHeader[1] * rCon.pt +
            this.arrHeader[2] * rCon.line +
            this.arrHeader[3] * rCon.arc +
            this.arrHeader[4] * rCon.forming +
            ip * rCon.sheet,
        );
        break;
      case 6:
        this.prim = new Impact(
          rCon.header +
            this.arrHeader[0] * rCon.io +
            this.arrHeader[1] * rCon.pt +
            this.arrHeader[2] * rCon.line +
            this.arrHeader[3] * rCon.arc +
            this.arrHeader[4] * rCon.forming +
            this.arrHeader[5] * rCon.sheet +
            ip * rCon.impact,
        );
        break;
      case 7:
        this.prim = new Phlx(
          rCon.header +
            this.arrHeader[0] * rCon.io +
            this.arrHeader[1] * rCon.pt +
            this.arrHeader[2] * rCon.line +
            this.arrHeader[3] * rCon.arc +
            this.arrHeader[4] * rCon.forming +
            this.arrHeader[5] * rCon.sheet +
            this.arrHeader[6] * rCon.impact +
            ip * rCon.phlx,
        );
        break;

      default:
        break;
    }
  }

  changeClass(index) {
    this.latency = 0;
    this.prims = [];
    for (let i = 0; i < this.arrHeader[index]; i++) {
      this.prims.push(i);
    }
    this.class = this.classes[index];
    this.classIndex = this.class.index;
    this.className = this.class.name;
    this.prims = [];
    for (let i = 0; i < this.class.length; i++) {
      this.prims.push(i);
    }
    this.primIndex = 0;
    this.createPrim(this.classIndex, this.primIndex);
    this.prim.update(this.arr);
    this.props = this.getProps(this.keyPath, this.prim);
    this.updateValues(this.props, this.prim);
    let keyPath = 'debug.' + this.eid + '.index';
    this.pS.pref.save({ [keyPath]: index });
    keyPath = 'debug.' + this.eid + '.primIndex';
    this.pS.pref.save({ [keyPath]: this.primIndex });
  }
  changeIndex() {
    this.latency = 0;
    this.createPrim(this.classIndex, this.primIndex);
    this.prim.update(this.arr);
    this.props = this.getProps(this.keyPath, this.prim);
    this.updateValues(this.props, this.prim);
    const keyPath = 'debug.' + this.eid + '.primIndex';
    this.pS.pref.save({ [keyPath]: this.primIndex });
  }

  onDragEnded(e) {
    let element = e.source.getRootElement();
    let boundingClientRect = element.getBoundingClientRect();
    let parentPosition = this.getPosition(element);

    this.pS.pref.save({
      'debug.position': {
        x: boundingClientRect.x - parentPosition.x,
        y: boundingClientRect.y - parentPosition.y,
      },
    });
  }

  getPosition(el) {
    let x = 0;
    let y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
      x += el.offsetLeft - el.scrollLeft;
      y += el.offsetTop - el.scrollTop;
      el = el.offsetParent;
    }
    return { y: y, x: x };
  }
  editArrayItem(e, index) {
    this.editPath = this.paths[index];
    this.keyPath = this.editPath;
    this.editArrayIndex = index;
    this.parts = this.keyPath.split('.');
    this.props = this.getProps(this.keyPath);
    this.pS.pref.save({ 'debug.index': index });
  }

  onEditArrayItem(e, index) {
    // this.pS.pref.debug.paths[index] = e;
  }
  enterEditArrayItem(e, index) {
    this.editPath = e?.target?.value;
    if (this.editPath === '' && index !== -1) {
      this.pS.pref.debug.paths.splice(index, 1);
    }
    if (this.editPath && index === -1) {
      this.pS.pref.debug.paths.push(this.editPath);
    }
    this.pS.pref.save({ debug: this.pS.pref.debug });
    // if (row.elm) {
    //   setByKeyPath(row.elm, col.keyPath, [...arr]);
    //   row.elm.dirty = true;
    //   this.dS.save(row.elm);
    // } else {
    //   this.elm.dirty = true;
    //   this.dS.save(this.elm);
    // }
    this.editPath = '';
    this.editArrayIndex = -1;
    this.pS.pref.save({ 'debug.paths': this.pS.pref.debug.paths });
  }

  show() {
    if (this.edit) {
      this.edit = false;
    } else {
      if (this.view) {
        this.edit = true;
      } else {
        this.view = true;
      }
      if (this.view) {
        this.keyPath = this.keyPath || this.pS.pref.debug.paths[0];

        this.parts = this.keyPath.split('.');
        this.props = this.getProps(this.keyPath, this.prim);
      } else {
        if (this.timer) {
          this.timer.unsubscribe();
        }
      }
    }
  }

  nil(props) {
    for (const prop of props) {
      prop.value = 0;
    }
  }

  updateValues(props, obj) {
    for (const prop of props) {
      const newValue = getByKeyPath(obj, prop.path);
      if (prop.value !== newValue) {
        if (this.delayPc) clearTimeout(this.delayPc);
        prop.changed = true;
        this.delayPc = setTimeout(() => {
          for (const prop of props) {
            prop.changed = false;
          }
        }, 500);
      }
      prop.value = newValue;
    }
  }

  getProps(path, obj?) {
    const result = [];
    if (!obj) {
      this.keyPath = path;
      this.parts = this.keyPath.split('.');
      const parts = this.parts;
      if (this.timer) {
        this.timer.unsubscribe();
      }

      let base = this;
      switch (parts.length) {
        case 1:
          this.obj = base[parts[0]];
          break;
        case 2:
          this.obj = base[parts[0]]?.[parts[1]];
          break;
        case 3:
          this.obj = base[parts[0]]?.[parts[1]]?.[parts[2]];
          break;
        case 4:
          this.obj = base[parts[0]]?.[parts[1]]?.[parts[2]]?.[parts[3]];
          break;
        case 5:
          this.obj =
            base[parts[0]]?.[parts[1]]?.[parts[2]]?.[parts[3]]?.[parts[4]];
          break;

        default:
          break;
      }
    } else {
      this.obj = obj;
    }
    if (this.obj) {
      const paths = propertiesToArray(this.obj);

      for (const path of paths) {
        let value;
        let item;

        value = getByKeyPath(this.obj, path);

        if (Array.isArray(value)) {
          if (
            (typeof value[0] === 'string' ||
              typeof value[0] === 'number' ||
              value.length === 0) &&
            value.length < 6
          ) {
            item = { path: path, value: value, isArray: true, showArray: true };
          } else {
            item = { path: path, value: value, isArray: true };
          }
        } else {
          item = { path: path, value: value };
        }

        result.push(item);
      }

      for (const it of result) {
        if (it.array) {
          for (const item of it.array) {
            it.props = propertiesToArray(item);
          }
        }
      }

      for (const it of result) {
        if (it.value === 'null') {
          it.value = null;
        }
        if (it.isArray || typeof it.value == 'boolean') {
          it.class = 'kd-sel';
        } else if (typeof it.value == 'string') {
          it.class = 'kd-amber';
        } else if (typeof it.value == 'number') {
          it.class = 'kd-warn';
        } else if (it.value === 'null') {
          it.class = 'kd-error';
        } else if (it.value === null) {
          it.class = 'kd-error';
        }
        it.class = 'kd-warn';
      }
      // result.sort(function (x, y) {
      //   let a, b;
      //   a = x.path;
      //   b = y.path;
      //   if (a > b) return 1;
      //   if (a < b) return -1;
      // });
    }

    return result;
  }
}

function propertiesToArray(obj: any) {
  const isObject = (val) => typeof val === 'object' && !Array.isArray(val);

  const addDelimiter = (a, b) => (a ? `${a}.${b}` : b);
  const paths = (obj = {}, head = '') => {
    let res = [],
      kill = false;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const element = obj[key];
        res.push(key);
        if (
          element !== 0 &&
          element !== '' &&
          element !== false &&
          (element === null || !element)
        ) {
          obj[key] = 'null';
        } else if (element === '') {
          obj[key] = "''";
        }
        if (key === 'idb') {
          kill = true;
        }
      }
    }
    if (kill) {
      return [];
    }
    return Object.entries(obj).reduce((product, [key, value]) => {
      let fullPath = addDelimiter(head, key);
      return isObject(value)
        ? product.concat(paths(value, fullPath))
        : product.concat(fullPath);
    }, []);
  };

  return paths(obj);
}
