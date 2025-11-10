/**
 * @license
 * Copyright 4Ming e.K. All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * LICENSE file at https://kompendia.net/LICENSE.txt
 */
export module Prim {
  export class Prim {
    kind = 'Prim';
    order = 1;
    layer = 1;
    id: string;
    gdef: any = {};
    role: string;
    style: any;
    hidden: boolean;
    key: string;
    unit: string;
    pos: string;
    color: string;
    c: string;
    v: string;
    x: number;
    y: number;
    xy: number;
    r: number;
    r1: number;
    r2: number;
    zrot: number;
    phi: number;
    orient: number;
    turn: number;
    refs: any;
    p0: Pt;
    p1: Pt;
    p2: Pt;
    p3: Pt;
    p4: Pt;
    cPt: Pt;
    dims: Dim[];
    arg1: any;
    arg2: any;
    circle: Circle;
    path: Circle;
    length: number;
    width: number;
    height: number;
    s: number;
    sw: number;
    text: string;
    points: Pt[];
    qualities: any = {};
    featureIndex: number;
    render: any = {};
    transform: string;
    log: boolean;
    logs: any[];
    report: string;
    constructor() {}
    init(_) {}
    get def() {
      for (const key in this) {
        if (this.hasOwnProperty(key)) {
          this.gdef[key] = this[key];
        }
      }
      return this.gdef;
    }
    ref(ref) {
      if (!this.refs) {
        this.refs = [];
      }
      this.refs.push(ref);
      this[ref.key] = ref.ref.val;
      return this;
    }
    view(style, c?) {
      this.style = style;
      this.color = style;
      this.v = style;
      this.c = c;
      return this;
    }
    rep(str?) {
      this.report = str || 'console';
      return this;
    }
    feature(findex) {}
    quality(input?) {
      if (input) {
        for (const key in input) {
          if (input.hasOwnProperty(key)) {
            this.qualities[key] = input[key];
          }
        }
        // this.feature(null);
        return this;
      } else {
        // this.feature(null);
        return this.qualities;
      }
    }
    dim(args1?, args2?) {
      if (!this.dims) this.dims = [];
      const prim = { pr1: this, pr2: null };
      if (args1 && args1.kind) {
        prim.pr2 = args1;
      }
      this.dims.push(new Dim(prim, args2));
      return this;
    }
    hide(value) {
      this.hidden = value;
      if (this.dims && this.dims.length) {
        for (const iterator of this.dims) {
          iterator.hide(value);
        }
      }
    }
  }
  export class Input extends Prim {
    kind = 'Input';
    order = 0;
    id: string;
    operands: any[] = [];
    operators = '';
    report: string;
    neg: boolean;
    val: number;
    gdef: any;
    constructor(operands: any, operators?: string) {
      super();
      this.operators = operators || '';
      for (const it of operands) {
        let item;
        if (typeof it === 'number') {
          item = { val: it };
        } else {
          item = it;
        }
        this.operands.push(item);
      }
      this.feature(0);
    }
    get def() {
      this.gdef = {
        kind: this.kind,
        val: this.val,
        id: this.id,
      };
      return this.gdef;
    }
    feature(findex) {
      super.feature(findex);
      this.val = 0;

      for (let i = 0; i < this.operands.length; i++) {
        const it = this.operands[i];
        const o = this.operators.charAt(i) || '+';
        switch (o) {
          case '+':
            this.val = this.val + it.val;
            break;
          case '-':
            this.val = this.val - it.val;
            break;
          case '*':
            this.val = this.val * it.val;
            break;
          case '/':
            this.val = this.val / it.val;
            break;
          default:
            this.val = this.val;
            break;
        }
      }
      if (this.report === 'console') {
        console.log('Input feature: ', this.val);
      }
    }
  }
  export class Pt extends Prim {
    kind = 'Pt';
    order = 1;
    layer = 20;
    xref: number;
    yref: number;
    normal: Pt;
    pathtype: any;
    constructor(x?: any, y?: any) {
      super();
      this.xref = x;
      this.yref = y;
      this.x = x;
      this.y = y;
    }
    get def() {
      this.gdef = {
        kind: this.kind,
        id: this.id,
        style: this.style,
        x: this.x,
        y: this.y,
        report: this.report,
        qualities: this.qualities,
      };
      return this.gdef;
    }
    tangentV(rs: number, w: number, h: number) {
      let ms = new Pt(w, rs - h);
      let c =
        (ms.y * Math.sqrt(ms.x * ms.x + ms.y * ms.y - rs * rs) - ms.x * rs) /
        (ms.x * ms.x + ms.y * ms.y);
      return new Pt(rs * c + ms.x, -rs * Math.sqrt(1 - c * c) + ms.y);
    } // rs = Radiensumme, w = Zugweite, h = Zughöhe
    dist(p?: any) {
      if (!p) {
        p = { x: 0, y: 0 };
      }
      let a = this.x - p.x;
      let b = this.y - p.y;
      return Math.hypot(a, b);
    }
    angle(p?: any, form?: string) {
      // form: 'deg' oder 'rad' (default)
      if (!p) {
        p = { x: 0, y: 0 };
      }
      let y = this.y - p.y;
      let x = this.x - p.x;
      let angle = Math.atan2(y, x);
      if (angle < 0) {
        angle += 2 * Math.PI;
      }
      if (form === 'deg') {
        angle = (angle * 180) / Math.PI;
      }
      return angle;
    }
    move(p: any, res?: string) {
      let co = { x: 0, y: 0 };
      co.x = this.x + p.x;
      co.y = this.y + p.y;
      switch (res) {
        case 'co':
          return co;
          break;
        case 'cl':
          return new Pt(null).coord(co);
          break;
        case 'this':
          return this.coord(co);
          break;
        default:
          return this.coord(co);
          break;
      }
    }
    rot(angle, p?: any, res?: string) {
      let co = { x: 0, y: 0 };
      if (p) {
        let x1 = this.xref - p.x;
        let y1 = this.yref - Number(p.y);
        let x2 = x1 * Math.cos(angle) - y1 * Math.sin(angle);
        let y2 = x1 * Math.sin(angle) + y1 * Math.cos(angle);
        co.x = x2 + p.x;
        co.y = y2 + p.y;
      } else {
        let x = this.xref;
        let y = this.yref;
        co.x = x * Math.cos(angle) - y * Math.sin(angle);
        co.y = x * Math.sin(angle) + y * Math.cos(angle);
      }
      switch (res) {
        case 'co':
          return co;
          break;
        case 'cl':
          return new Pt(co.x, co.y);
          break;
        case 'this':
          return this.coord(co);
          break;

        default:
          return this.coord(co);
          break;
      }
    }
    scale(s, res?: string) {
      let co = { x: this.x * s, y: this.y * s };
      switch (res) {
        case 'co':
          return co;
          break;
        case 'cl':
          return new Pt(null).coord(co);
          break;
        case 'this':
          return this.coord(co);
          break;
        default:
          return this.coord(co);
          break;
      }
    }
    uv() {
      let d = this.dist();
      if (d === 0) d = 1;
      return { x: this.x / d, y: this.y / d };
    }
    trans(pt, res?: string) {
      let co = { x: this.x + pt.x, y: this.y + pt.y };
      if (res === 'co') {
        return co;
      }
      if (res === 'clone') {
        return new Pt(null).coord(co);
      }
      if (res === 'this') {
        return this.coord(co);
      }
      return this.coord(co);
    }
    mult(s) {
      return { x: this.x * s, y: this.y * s };
    }
    add(pt) {
      return { x: this.x + pt.x, y: this.y + pt.y };
    }
    sub(pt) {
      return { x: this.x - pt.x, y: this.y - pt.y };
    }
    scalarProduct(co) {
      return this.x * co.x + this.y * co.y;
    }
    transVL(vektor, length) {
      // Addition
      return vektor.n().mult(length);
    }
    equals(p) {
      return this.x === p.x && this.y === p.y;
    }
    mirrorX() {
      return { x: this.x, y: -this.y };
    }
    mirrorY() {
      return { x: -this.x, y: this.y };
    }
    determinant(p) {
      return this.x * p.y - p.x * this.y;
    }
    coord(co?) {
      if (co) {
        this.x = co.x;
        this.y = co.y;
        return this;
      }
      return { x: this.x, y: this.y };
    }
    ptype(type?: any) {
      if (type) {
        this.pathtype = type;
        return this;
      }
      return this.pathtype;
    }
  }
  export class Line extends Prim {
    kind = 'Line';
    arg2: any;
    p1p2: Pt;
    unitV: Pt;
    normal: Pt;
    chordCenter: Pt;
    tPt: Pt;
    theta = 0;
    length = 0;
    tangentRef: any;
    constructor(arg1?: any, arg2?: any) {
      super();
      this.arg2 = arg2;
      if (arg1.kind === 'Pt') {
        this.p1 = arg1;
      } else if (arg1.x && arg1.y) {
        this.p1 = new Pt(arg1.x, arg1.y);
      }
      if (typeof arg2 === 'object') {
        if (arg2.kind === 'Pt') {
          this.p2 = arg2;
        } else if (arg2.x && arg2.y) {
          this.p2 = new Pt(arg2.x, arg2.y);
        }
      } else if (typeof arg2 === 'number') {
        this.p2 = new Pt();
        this.p3 = new Pt(this.p1.x + 1, this.p1.y);
        this.p2.coord(this.p3.rot(this.arg2, this.p1, 'co'));
      }
      this.p1 = this.p1 || new Pt(0, 0);
      this.p2 = this.p2 || new Pt(100, 0);
      this.p1p2 = new Pt(1, 0);
      this.tPt = new Pt(1, 0);
      this.unitV = new Pt(1, 0);
      this.normal = new Pt(1, 0);
      this.chordCenter = new Pt(0, 0);
      // this.feature(0);
    }
    get def() {
      this.gdef = {
        kind: this.kind,
        id: this.id,
        style: this.style,
        v: this.v,
        c: this.c,
        x1: this.p1.x,
        y1: this.p1.y,
        x2: this.p2.x,
        y2: this.p2.y,
      };
      return this.gdef;
    }
    feature(index) {
      if (typeof this.arg2 === 'number') {
        // this.p2.coord(this.p1.rot(this.arg2, this.p1, 'co'));
      }
      if (this.tangentRef) {
        const coordArray = tangents(this.tangentRef.c1, this.tangentRef.c2);
        let tan = coordArray[this.tangentRef.sel];
        this.p1.coord(tan.co1);
        this.p2.coord(tan.co2);
      }
      this.p1p2.x = this.p2.x - this.p1.x;
      this.p1p2.y = this.p2.y - this.p1.y;
      let chordCenterP1P2 = this.p1p2.mult(0.5);
      this.chordCenter.x = chordCenterP1P2.x + this.p1.x;
      this.chordCenter.y = chordCenterP1P2.y + this.p1.y;
      this.tPt.x = this.chordCenter.x;
      this.tPt.y = this.chordCenter.y;
      this.theta = this.p1p2.angle();
      this.zrot = this.theta;
      this.length = this.p1p2.dist();
      if (this.length !== 0) {
        this.unitV.coord(this.p1p2.uv());
        this.normal.coord(this.unitV.rot(Math.PI / 2, null, 'co'));
      }
    }
    uv() {}
    totalLength() {
      return this.p1p2.dist();
    }
    getPointAtLength(l) {
      return this.p1.move(this.unitV.scale(l, 'co'), 'co');
    }
    setPoints(p1, p2) {
      this.p1 = p1;
      this.p2 = p2;
    }
    intersect(prim: any) {
      return intersectionLines(this, prim);
    }
    foot(positionVector) {
      // Ortsvektor zu w = ow
      this.feature(0);
      let w = positionVector.sub(this.p1); // Richtungsvektor von p1 zu w
      let t = this.unitV.scalarProduct(w);
      return this.p1.add(this.unitV.scale(t));
    }
    tangentTo(arg1: any, arg2: any, arg3?: any, arg4?: any) {
      this.tangentRef = { c1: arg1, c2: arg2, sel: arg3 };
      this.feature(null);
      return this;
    }
    toString() {
      return this.p1.toString() + this.p2.toString();
    }
  }
  export class Arc extends Line {
    // turn 0 links, 1 rechts
    kind = 'Arc';
    turn: number;
    sense: number;
    phi: number;
    constructor(
      style: string,
      p1?: Pt,
      p2?: Pt,
      r?: any,
      turn?: number,
      cPt?: Pt,
    ) {
      super(style);
      this.cPt = cPt;
      if (turn > 1) {
        this.p1 = new Pt(null);
        this.p2 = new Pt(null);
        if (r && r.val) {
          this.r = r.val;
          if (!this.refs) this.refs = [];
          this.refs.push({ key: 'r', ref: r });
        } else {
          this.r = r || 1;
        }
        if (turn === 2) this.sense = 1;
        if (turn === 4) this.sense = -1;
      } else {
        if (turn === 0) this.sense = -1;
        if (turn === 1) this.sense = 1;
        this.p1 = p1;
        this.p2 = p2;
        if (r.r1) {
          // Ellipse xxx
          this.r1 = r.r1;
          this.r2 = r.r2;
          this.r = Math.abs(r.r1 - r.r2);
        } else {
          // Kreis
          if (r && r.val) {
            this.r = r.val;
            if (!this.refs) this.refs = [];
            this.refs.push({ key: 'r', ref: r });
          } else {
            this.r = r || 1;
          }
          this.r1 = this.r2 = this.r;
          if (!this.cPt) {
            this.cPt = intersectionCircles(
              { x: this.p1.x, y: this.p1.y, r: this.r },
              { x: this.p2.x, y: this.p2.y, r: this.r },
            )[turn];
          }
        }
      }
      this.turn = turn;
      this.p1.normal = new Pt(0, 1);
      this.p2.normal = new Pt(0, 1);
      this.tPt = new Pt(1, 1);
    }
    feature(index) {
      super.feature(index);
      this.x = this.cPt.x;
      this.y = this.cPt.y;
      // this.r = this.cPt.r;
      if (this.turn === 2) {
        this.p1.x = this.cPt.x;
        this.p1.y = this.cPt.y + this.r;
        this.p2.x = this.cPt.x + this.r;
        this.p2.y = this.cPt.y;
      }
      if (this.turn === 4) {
        this.p1.x = this.cPt.x - this.r;
        this.p1.y = this.cPt.y;
        this.p2.x = this.cPt.x;
        this.p2.y = this.cPt.y - this.r;
      }
      if (this.r !== 0) {
        this.phi = 2 * Math.asin(this.p1p2.dist() / (2 * this.r));
      }
      this.p1.normal.rot(this.p1.angle(this.cPt));
      this.p2.normal.rot(this.p2.angle(this.cPt));
      const n1x = this.p1.x - this.cPt.x;
      const n1y = this.p1.y - this.cPt.y;
      const n2x = this.p2.x - this.cPt.x;
      const n2y = this.p2.y - this.cPt.y;
      const d1 = n1x * this.p1.x + n1y * this.p1.y;
      const d2 = n2x * this.p2.x + n2y * this.p2.y;
      const det = n1y * n2x - n1x * n2y;
      if (det === 0) {
        // The lines are parallel
      } else {
        this.tPt.x = (d2 * n1y - d1 * n2y) / det;
        this.tPt.y = (d1 * n2x - d2 * n1x) / det;
      }
    }
    totalLength() {
      return 2 * Math.PI * this.r * (this.phi / (2 * Math.PI));
    }
    getPointAtLength(l) {
      const phi = (l / this.totalLength()) * this.phi;
      return this.p1.rot(this.sense * phi, this.cPt, 'co');
    }
  }
  export class Circle extends Prim {
    kind = 'Circle';
    constructor(r: any, cPt?: Pt) {
      super();
      if (r && r.val) {
        this.r = r.val;
        if (!this.refs) this.refs = [];
        this.refs.push({ key: 'r', ref: r });
      } else {
        this.r = r || 1;
      }
      this.cPt = cPt || new Pt(0, 0);
    }
  }
  export class Path extends Prim {
    kind = 'Path';
    strokeWidth: number;
    segments: any = [];
    finitePoints: Pt[] = [];
    finiteCount: number;
    finiteRes: number;
    constructor(parts: any[]) {
      super();
      this.points = [];
      if (parts[0].kind === 'Line') {
        this.points.push(parts[0].p1.ptype('M'));
      }
      let c = 'M';
      for (const p of parts) {
        if (p.kind === 'Pt') {
          this.points.push(p);
        }
        if (p.kind === 'Line') {
          this.points.push(p.p2.ptype('L'));
        }
        if (p.kind === 'Arc') {
          this.points.push(p.p2.ptype(p));
        }
        this.segments.push({ ref: p, c: c, finitePoints: [] });
        c = 'L';
      }
    }
    init(_) {}
    feature(index) {}
    featureLate(index) {}
    finit(res) {
      this.finiteRes = res;
      return this;
    }

    get def() {
      let d = '';
      for (const it of this.segments) {
        d += it.c + it.ref.x + ' ' + it.ref.y + ' ';
      }
      d += 'Z';
      this.gdef = {
        kind: this.kind,
        id: this.id,
        style: this.style,
        d: d,
        report: this.report,
        qualities: this.qualities,
      };
      return this.gdef;
    }
  }
  export class Act extends Prim {
    kind = 'Act';
    order = 30;
    dpu: number;
    dc: number;
    offset: number;
    rpu: number;
    rma: number;
    dd = 0;
    st: number;
    cPt1: Pt;
    cPt2: Pt;
    c1: Circle;
    c2: Circle;
    pu: Circle;
    puq: number;
    ma: Circle;
    maq: number;
    status: any = {
      stop: false,
    };
    constructor(
      dpu: any, // punch diameter
      rpu: any, // punch radius
      rma: any, // ma radius
      st: any, // sheet thickness
      dc: any, // drawing clearance
      offset: any, // ma offset
      dd: any, // drawing depth
    ) {
      super();
      this.sw = 1;
      this.maq = 0;
      this.puq = 2;
      this.p1 = new Pt(0, 0);
      this.p2 = new Pt(1, 1);
      this.c1 = new Circle(this.rpu, this.p1);
      this.c2 = new Circle(this.rma, this.p2);
      this.p3 = new Pt();
      this.p4 = new Pt();
      this.dpu = dpu || 1;
      this.rpu = rpu || 1;
      this.rma = rma || 1;
      this.st = st || 1;
      this.dc = dc || 2;
      this.offset = offset || 1;
      this.dd = dd || 1;
    }
    feature(findex) {
      super.feature(findex);
      this.c1.r = this.rpu;
      this.c2.r = this.rma;
      this.c1.cPt.x = this.dpu / 2 - this.rpu;
      this.c1.cPt.y = this.dd - this.rpu + this.offset;
      this.c2.cPt.x = this.dpu / 2 + this.dc + this.rma + this.st;
      this.c2.cPt.y = this.rma + this.st + this.offset;
      const coordArray = tangents(this.c1, this.c2);
      let tan = coordArray[0];
      this.p3.coord(tan.co1);
      this.p4.coord(tan.co2);
      if (this.report === 'console') {
        console.log('Act feature: ', this.dd);
      }
      // console.log('act '+ this.dpu +' ' + this.c1.cPt.x)
    }
    get def() {
      this.gdef = {
        kind: this.kind,
        id: this.id,
        style: this.style,
        c1: {
          cx: this.c1.cPt.x,
          cy: this.c1.cPt.y,
          r: this.c1.r,
          q: this.maq,
        },
        c2: {
          cx: this.c2.cPt.x,
          cy: this.c2.cPt.y,
          r: this.c2.r,
          q: this.puq,
        },
        status: this.status,
        report: this.report,
        qualities: this.qualities,
      };
      return this.gdef;
    }
  }
  export class Die extends Prim {
    kind = 'Die';
    order = 20;
    dd: number;
    ddMax: number;
    acts: Act[];
    constructor(dd: number, acts: Act[]) {
      super();
      this.ddMax = dd || 1000;
      this.acts = acts;
      for (let i = 0; i < this.acts.length; i++) {
        const act = this.acts[i];
        act.dd = -act.offset;
      }
    }
    feature(findex) {
      super.feature(findex);
      if (this.report === 'console') {
        console.log('Act feature: ', this.dd);
      }
    }
    proceed(p) {
      this.dd = p * this.ddMax;
      for (let i = 0; i < this.acts.length; i++) {
        const act = this.acts[i];
        const next = this.acts[i + 1] || { offset: this.ddMax };
        let stop = next.offset;
        act.dd = -act.offset;
        act.dd = act.dd + this.dd;
        if (act.dd > stop) {
          act.status.stop = true;
          act.dd = stop;
        }
        // act.feature(99);
      }
      if (this.report === 'console') {
        console.log('Die proceed: ', this.dd);
      }
    }
    get def() {
      this.gdef = {
        kind: this.kind,
        id: this.id,
        style: this.style,
        report: this.report,
        qualities: this.qualities,
      };
      return this.gdef;
    }
  }
  export class Phalx extends Prim {
    constructor(dd: number, acts: Act[]) {
      super();
    }

    feature(fIndex) {}

    get def() {
      this.gdef = {
        kind: this.kind,
        id: this.id,
        style: this.style,
        report: this.report,
        qualities: this.qualities,
      };
      return this.gdef;
    }
  }
  export class Sheet extends Prim {
    kind = 'Sheet';
    sw: number;
    segments: any = [];
    finitePoints: Pt[] = [];
    finiteCount: number;
    finiteRes: number;
    constructor(parts: any[], sw?, res?) {
      super();
      this.points = [];
      if (sw && sw.val) {
        this.sw = sw.val;
        if (!this.refs) this.refs = [];
        this.refs.push({ key: 'sw', ref: sw });
      } else {
        this.sw = sw || 1;
      }
      if (parts[0].kind === 'Line') {
        this.points.push(parts[0].p1.ptype('M'));
      }
      for (const p of parts) {
        if (p.kind === 'Pt') {
          this.points.push(p);
        }
        if (p.kind === 'Line') {
          this.points.push(p.p2.ptype('L'));
        }
        if (p.kind === 'Act') {
        }
        if (p.kind === 'Arc') {
          this.points.push(p.p2.ptype(p));
        }
        this.segments.push({ ref: p, finitePoints: [] });
      }
      if (res) {
        const count = Math.ceil(res * 100 + 10);
        for (let i = 1; i <= count; i++) {
          const pt = new Pt(null);
          pt.normal = new Pt(null);
          this.finitePoints.push(pt);
        }
        this.finiteRes = res;
      }
    }
    init(_) {}
    feature(index) {
      // let x1 = 10000,
      //   y1 = -10000,
      //   x2 = -10000,
      //   y2 = 10000;
      // this.length = 0;
      // for (const seg of this.segments) {
      //   x1 = Math.min(x1, seg.ref.p1.x, seg.ref.p2.x);
      //   x2 = Math.max(x2, seg.ref.p1.x, seg.ref.p2.x);
      //   y1 = Math.max(y1, seg.ref.p1.y, seg.ref.p2.y);
      //   y2 = Math.min(y2, seg.ref.p1.y, seg.ref.p2.y);
      //   this.width = x2 - x1;
      //   this.height = y1 - y2;
      //   if (seg.ref.totalLength) {
      //     seg.length = seg.ref.totalLength();
      //     this.length += seg.length;
      //   }
      // }
    }
    featureLate(index) {}
    finit(res) {
      this.finiteRes = res;
      return this;
    }
    get def() {
      this.gdef = {
        kind: this.kind,
        id: this.id,
        style: this.style,
        report: this.report,
        qualities: this.qualities,
      };
      return this.gdef;
    }
  }
  export class Text {
    kind = 'Text';
    x: number;
    y: number;
    string: string;
    style: string;
    hidden: boolean;
    constructor(x: number, y: number, string: string, style?: string) {
      this.x = x || 0;
      this.y = y || 0;
      this.string = string;
      this.style = style || 'text1';
      this.feature();
    }
    feature() {}
  }
  export class Dim extends Prim {
    p4: Pt;
    p5: Pt;
    targ: any;
    defprim: any;
    args: any = {};
    dir: number;
    outside: boolean;
    constructor(d, args?: any) {
      super();
      this.defprim = d;
      if (args) this.args = args;
      if (d.pr1.kind === 'Arc' || d.pr1.kind === 'Circle') {
        this.p1 = d.pr1.cPt;
        this.p2 = new Pt(null);
      }
      if (d.pr1.kind === 'Pt') {
        this.p1 = d.pr1;
        this.p2 = d.pr2;
      }
      this.p3 = new Pt(null);
      this.p4 = new Pt(null);
      this.p5 = new Pt(null);
    }
    feature(fIndex) {}
  }
  export class Report extends Prim {
    kind = 'Report';
    targets: any[] = [];
    keypath: string;
    constructor(t: any, k: string, p?: any, u?: string) {
      super();
      this.style = 'fore';
      this.targets.push(t);
      if (p && p.kind === 'Pt') {
        this.p0 = p;
      }
      if (p && typeof p === 'string') {
        this.pos = p;
        this.p0 = new Pt(0, 0);
      }
      this.keypath = k;
      this.text = 'Report';
      this.unit = u || 'mm';
    }
    feature(fIndex, _?) {
      this.x = this.p0.x;
      this.y = this.p0.y;
      let t = '';
      for (const target of this.targets) {
        if (this.keypath) {
          // const val = Dexie.getByKeyPath(target, this.keypath);
          // t += val + '\n';
        } else {
          for (const key1 in target.qualities) {
            if (target.qualities.hasOwnProperty(key1)) {
              const element1 = target.qualities[key1];
              if (typeof element1 === 'number') {
                // let val = element1.round(3);
                // t += key1 + ': ' + val + '  \n';
              }
              /*
						for (const key2 in element1) {
							if (element1.hasOwnProperty(key2)) {
								const element2 = element1[key2];
								if(typeof element2 === 'number'){
								t += key2 + ': ' + element2.toString() + '\n';
								}
							}
						}
						*/
            }
          }
        }
      }
      this.text = t;
    }
    target(t?) {
      if (t) {
        this.targets.push(t);
        return this;
      }
      return this.targets;
    }
  }
  export class AreaMoment extends Prim {
    xy: number;
    p: number;
    mX: number;
    mY: number;
    mXY: number;
    mP: number;
    constructor(x?: number, y?: number, xy?: number) {
      super();
      this.x = x || 0;
      this.y = x || 0;
      this.xy = xy || 0;
      this.p = x + y;
    }
    feature() {}
    rot(phi: number) {
      this.phi = phi || 0;
      if (phi !== 0) {
        let ix = this.x;
        let iy = this.y;
        let ixy = this.xy;
        this.x =
          (ix + iy) / 2 +
          ((ix - iy) * Math.cos(2 * this.phi)) / 2 -
          ixy * Math.sin(2 * this.phi);
        this.y =
          (ix + iy) / 2 -
          ((ix - iy) * Math.cos(2 * this.phi)) / 2 +
          ixy * Math.sin(2 * this.phi);
        this.xy =
          ((ix - iy) * Math.sin(2 * this.phi)) / 2 +
          ixy * Math.cos(2 * this.phi);
        this.p = this.x + this.y;
      }
    }
    scale(s: number) {
      this.x = this.x * s;
      this.y = this.y * s;
      this.xy = this.xy * s;
    }
    add(prim) {
      this.x = this.x + prim.mirorPt.x * prim.mirorPt.x * prim.area;
      this.y = this.y + prim.mirorPt.y * prim.mirorPt.y * prim.area;
      this.xy = this.xy + prim.mirorPt.x * prim.mirorPt.y * prim.area;
    }
    mirrorY(mirorPtX: number, area: number) {
      this.x = this.x * 2;
      this.y = 2 * (this.y + mirorPtX * mirorPtX * area);
      this.xy = 0;
    }
  }
  export class Port {
    kind = 'Port';
    id: string;
    mode = 'auto';
    gdef: any;
    constructor(m: string) {
      this.mode = m || this.mode;
      this.feature(0);
    }
    get def() {
      this.gdef = {
        kind: this.kind,
        mode: this.mode,
        id: this.id,
      };
      return this.gdef;
    }
    feature(findex) {}
  }
  export class Constr extends Prim {
    kind = 'Constr';
    name = 'Constr';
    role: string;
    viewPort: any;
    viewBox: any = {
      x: 100,
      y: 100,
      w: 100,
      h: 100,
    };
    viewFrame: any = {
      p1: {},
      p2: {},
      mirror: 'none',
      step: false,
    };
    renderScale: number;
    ui: any[];
    prims: any[];
    toRef: any[] = [];
    toFeature: any[] = [];
    toFeatureLate: any[] = [];
    toLog: any[] = [];
    toRender: any[] = [];
    toReport: any[] = [];
    initialized: boolean;
    index = 0;
    constructor() {
      super();
      /*
		if (style) {
			this.id = new ObjectID();
			this.getSvg();
		}
		*/
      this.viewFrame.p1 = { x: -200, y: 200 };
      this.viewFrame.p2 = { x: 200, y: -200 };
      /*
    this.viewBox = {
      x: -0.5 * 200 / 1 + 100,
      y: -0.5 * 100 / 1 + 50,
      w: 100 / 1,
      h: 100 / 1
    }
    */
      /*
    this.viewFrame = {
      p1: new Pt(null,this.viewBox.w),
      p2: new Pt(null,this.viewBox.h),
      mirror: 'none',
      step: false
    };
    */
      this.qualities = {
        accus: {},
      };
    }
    init(_) {}
    feature(index, _?) {}
    click() {
      // console.log(this.qualities.accus);
    }
    accuQualities(_) {
      for (const key in _) {
        if (_.hasOwnProperty(key)) {
          const prim = _[key];
          if (prim.qualities && prim.qualities.accu) {
            let ident;
            if (prim.id) {
              ident = prim.id.str;
            } else {
              ident = this.index++;
            }
            this.qualities.accus[prim.kind + '-' + ident] = prim.qualities;
          }
        }
      }
    }
    refAll() {
      for (let prim of this.toRef) {
        for (let ref of prim.refs) {
          prim[ref.key] = ref.ref.value();
        }
      }
    }
    featureAll(index, _) {
      for (const iterator of this.toFeature) {
        iterator.feature(index, _);
      }
    }
    featureLateAll(index, _) {
      for (const iterator of this.toFeatureLate) {
        iterator.featureLate(index, _);
      }
    }
    logAll(index) {
      for (const iterator of this.toLog) {
        // iterator.logs[index] = Object.assign({}, iterator);
      }
    }
    renderAll(index, _) {
      for (const iterator of this.toRender) {
        if (iterator.kind === 'Pt' && !_.viewFeatures.includes('Pt')) {
          iterator.hidden = true;
        } else {
          iterator.hidden = false;
        }
        if (!_.viewFeatures.includes('Supplement')) {
          if (iterator.qualities.use === 'draw') {
            iterator.hide(true);
          }
        } else {
          if (iterator.qualities.use === 'draw') {
            iterator.hide(false);
          }
        }
        if (!iterator.hidden) {
          iterator.setSvg(index, _);
        } else {
          iterator.render.svg.setAttributeNS(null, 'opacity', 0);
        }
      }
    }
    renderReportAll(index, _) {
      for (const iterator of this.toReport) {
        if (_.viewFeatures.includes('Dim') && !iterator.hidden) {
          iterator.feature(index, _);
          iterator.setSvg(index, _);
        } else {
          iterator.render.svg.setAttributeNS(null, 'opacity', 0);
        }
      }
    }
  }
  function intersectionLines(line1: Line, line2: Line) {
    let o1 = { x: line1.p1.x, y: line1.p1.y };
    let r1 = line1.p2.sub(line1.p1);
    let o2 = { x: line2.p1.x, y: line2.p1.y };
    let r2 = line2.p2.sub(line2.p1);
    let dO = { x: o2.x - o1.x, y: o2.y - o1.y };
    let d = r1.x * -r2.y - -r2.x * r1.y;
    let d1 = dO.x * -r2.y - -r2.x * dO.y;
    let p;
    if (d !== 0) {
      p = new Pt(o1.x + (d1 * r1.x) / d, o1.y + (d1 * r1.y) / d);
    } else {
      p = null;
    }
    return p;
  }
  function intersectionCircles(c0: any, c1: any) {
    let x0 = c0.x,
      y0 = c0.y,
      r0 = c0.r;
    let x1 = c1.x,
      y1 = c1.y,
      r1 = c1.r;
    let a,
      dx,
      dy,
      d,
      h,
      rx,
      ry,
      result = [];
    let x2, y2;
    dx = x1 - x0;
    dy = y1 - y0;
    d = Math.sqrt(dy * dy + dx * dx);
    if (d > r0 + r1) {
      /* no solution. circles do not intersect. */
      return false;
    }
    if (d < Math.abs(r0 - r1)) {
      /* no solution. one circle is contained in the other */
      return false;
    }
    a = (r0 * r0 - r1 * r1 + d * d) / (2.0 * d);
    x2 = x0 + (dx * a) / d;
    y2 = y0 + (dy * a) / d;
    h = Math.sqrt(r0 * r0 - a * a);
    rx = -dy * (h / d);
    ry = dx * (h / d);
    let xi = x2 + rx;
    let xi_prime = x2 - rx;
    let yi = y2 + ry;
    let yi_prime = y2 - ry;
    result = [new Pt(xi_prime, yi_prime), new Pt(xi, yi)];
    return result;
  }
  function tangents(circle1: Circle, circle2: Circle, cw?: number) {
    const x1 = circle1.cPt.x;
    const y1 = circle1.cPt.y;
    const r1 = circle1.r + (cw || 0);
    const x2 = circle2.cPt.x;
    const y2 = circle2.cPt.y;
    const r2 = circle2.r + (cw || 0);
    const d_sq = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    if (d_sq <= (r1 - r2) * (r1 - r2)) {
      return false;
    }
    const d = Math.sqrt(d_sq);
    const vx = (x2 - x1) / d;
    const vy = (y2 - y1) / d;
    let res = [];
    let a = [1, 1, 1, 1];
    let i = 0;
    for (let sign1 = +1; sign1 >= -1; sign1 -= 2) {
      let c = (r1 - sign1 * r2) / d;
      if (c * c < 1.0) {
        let h = Math.sqrt(Math.max(0.0, 1.0 - c * c));
        for (let sign2 = +1; sign2 >= -1; sign2 -= 2) {
          const nx = vx * c - sign2 * h * vy;
          const ny = vy * c + sign2 * h * vx;
          res[i++] = {
            co1: {
              x: x1 + r1 * nx,
              y: y1 + r1 * ny,
            },
            co2: {
              x: x2 + sign1 * r2 * nx,
              y: y2 + sign1 * r2 * ny,
            },
          };
        }
      }
    }
    return res;
  }
  function booleanInterpolate(y1, y2, mu) {
    return y1 * (1 - mu) + y2 * mu;
  }
  function linearInterpolate(y1, y2, mu) {
    return y1 * (1 - mu) + y2 * mu;
  }
  function cosineInterpolate(y1, y2, mu) {
    const mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
    return y1 * (1 - mu2) + y2 * mu2;
  }

  export function knickDruck(E: number, lambda: number) {
    E = E * 1000;
    if (lambda <= 10) {
      return 2000;
    }
    if (lambda >= 30) {
      return ((E * Math.PI * Math.PI) / (3 * lambda * lambda)).runde(0);
    } else {
      return 2620 - 62 * lambda;
    }
  }
  export function knickDruck2(E: number, lambda: number) {
    E = E * 1000;
    if (lambda <= 10) {
      return 1800;
    }
    if (lambda >= 30) {
      return ((E * Math.PI * Math.PI) / (5 * lambda * lambda)).runde(0);
    } else {
      return 2480 - 68 * lambda;
    }
  }
  export function kf(C1: number, phi: number, n1: number) {
    return C1 * Math.pow(phi, n1);
  }
  export function kolbenFlaeche(dK: number, dS?: number) {
    if (!dS) return (dK * dK * Math.PI) / 400;
    return ((dK * dK - dS * dS) * Math.PI) / 400;
  }
  export function kf_Swift_MC(
    phiArray: number[],
    kfArray: number[],
    shots?: number,
  ) {
    var C_oben = 1700;
    var C_unten = 500;
    var phi_0_oben = 0.09;
    var phi_0_unten = 0.01;
    var n_oben = 0.7;
    var n_unten = 0.1;
    var res = 0;
    var res_plus = 0;
    var res_minus = 0;
    var diff = 0;
    if (!shots) shots = 1000;
    var C = 455;
    var phi_0 = 0.3;
    var n = 0.25;
    var vektor = new Array(C, phi_0, n, res_plus, res_minus);
    var vektorStern = new Array(C, phi_0, n, res_plus, res_minus);
    for (var j = 0; j < shots; ++j) {
      C = Math.random() * (C_oben - C_unten) + C_unten;
      phi_0 = Math.random() * (phi_0_oben - phi_0_unten) + phi_0_unten;
      n = Math.random() * (n_oben - n_unten) + n_unten;
      res_plus = 0;
      res_minus = 0;
      for (var i = 0; i < phiArray.length; ++i) {
        res =
          (kf(C, phi_0 + Number(phiArray[i]), n) / Number(kfArray[i]) - 1) *
          100;
        if (res > res_plus) res_plus = res;
        if (res < res_minus) res_minus = res;
      }
      diff = Math.max(Math.abs(res_plus), Math.abs(res_minus));
      if (
        j === 0 ||
        diff < Math.max(Math.abs(vektorStern[3]), Math.abs(vektorStern[4]))
      ) {
        vektorStern[0] = C;
        vektorStern[1] = phi_0;
        vektorStern[2] = n;
        vektorStern[3] = res_plus;
        vektorStern[4] = res_minus;
      }
    }
    return vektorStern;
  }
}

declare global {
  interface Number {
    runde(dez: number): number;
    round(places: number): number;
    rad(): number;
    grad(): number;
    sgn(): number;
  }
}

Number.prototype.rad = function () {
  return this * (Math.PI / 180);
};

Number.prototype.grad = function () {
  return (this * 180) / Math.PI;
};
Number.prototype.sgn = function () {
  if (this > 0) return 1;
  else if (this < 0) return -1;
  else return 0;
};
Number.prototype.runde = function (dez) {
  dez = Math.pow(10, dez);
  return Math.round(this * dez) / dez;
};

Number.prototype.round = function (places) {
  if (this < 0.0000001 && this > -0.0000001) {
    return 0;
  } else {
    let numStr = this + 'e+' + places;
    return Number(Math.round(Number(numStr)) + 'e-' + places);
  }
};

var ATTR = {
  min: {
    dark: {
      fill: '#11aa22',
      stroke: '#11dd33',
    },
    light: {
      fill: '#0000ff',
      stroke: '#0000ff',
    },
  },
  nrm: {
    dark: {
      fill: '#3355dd',
      stroke: '#335599',
    },
    light: {
      fill: '#00ff00',
      stroke: '#00ff00',
    },
  },
  max: {
    dark: {
      fill: '#dd1133',
      stroke: '#ff0000',
    },
    light: {
      fill: '#ff0000',
      stroke: '#ff0000',
    },
  },
  ntr: {
    dark: {
      fill: '#666677',
      stroke: '#ff0000',
    },
    light: {
      fill: '#ff0000',
      stroke: '#ff0000',
    },
  },
  dot: {
    dark: {
      fill: '#ff7373',
      stroke: '#ff7373',
    },
    light: {
      fill: '#cc1c1c',
      stroke: '#cc1c1c',
    },
    'stroke-width': '5',
    r: '6',
    'stroke-dasharray': 'none',
    opacity: '1.0',
  },
  edge: {
    dark: {
      fill: '#888',
      stroke: '#eee',
    },
    light: {
      fill: '#888',
      stroke: '#212121',
    },
    'stroke-width': '1.75',
    'stroke-linecap': 'round',
    'stroke-dasharray': 'none',
    opacity: '1.0',
  },
  cut: {
    dark: {
      fill: '#e25',
      stroke: '#e32',
    },
    light: {
      fill: '#888',
      stroke: '#212121',
    },
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
    'stroke-dasharray': 'none',
    opacity: '1.0',
  },
  steel: {
    dark: {
      fill: '#cde',
      stroke: '#3ae',
    },
    light: {
      fill: '#cde',
      stroke: '#29d',
    },
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
    'stroke-dasharray': 'none',
    opacity: '1.0',
  },
  subs: {
    dark: {
      fill: '#888',
      stroke: '#bbb',
    },
    light: {
      fill: '#888',
      stroke: '#444',
    },
    'stroke-width': '1',
    'stroke-linecap': 'round',
    'stroke-dasharray': 'none',
    opacity: '1.0',
  },
  din: {
    dark: {
      fill: '#bbb',
      stroke: '#bbb',
    },
    light: {
      fill: '#888',
      stroke: '#444',
    },
    'stroke-width': '1',
    'stroke-linecap': 'round',
    'stroke-dasharray': 'none',
    opacity: '1.0',
  },
  center: {
    dark: {
      fill: '#888',
      stroke: '#b9c',
    },
    light: {
      fill: '#888',
      stroke: '#98a',
    },
    'stroke-width': '1',
    'stroke-linecap': 'round',
    'stroke-dasharray': '18,8,4,8',
    opacity: '1.0',
  },
  indexCenter: {
    dark: {
      fill: 'none',
      stroke: '#b9c',
    },
    light: {
      fill: 'none',
      stroke: '#98a',
    },
    'stroke-width': '1',
    'stroke-linecap': 'round',
    'stroke-dasharray': '20,8,4,8,4,8',
    opacity: '1.0',
  },
  indexContur: {
    dark: {
      fill: 'none',
      stroke: '#bbb',
    },
    light: {
      fill: 'none',
      stroke: '#888',
    },
    'stroke-width': '1',
    'stroke-linecap': 'round',
    'stroke-dasharray': 'none',
    opacity: '1.0',
  },
  dimension: {
    dark: {
      fill: '#888',
      stroke: '#ccc',
    },
    light: {
      fill: '#888',
      stroke: '#444',
    },
    'stroke-width': '1',
    'stroke-linecap': 'round',
    'stroke-dasharray': 'none',
    opacity: '1.0',
  },
  invis: {
    dark: {
      fill: '#888',
      stroke: '#eee',
    },
    light: {
      fill: '#888',
      stroke: '#212121',
    },
    r: '0.1',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    opacity: '0',
  },
};
