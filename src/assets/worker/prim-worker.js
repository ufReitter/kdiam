/**
 * @license
 * Copyright 4Ming e.K. All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * LICENSE file at https://kompendia.net/LICENSE.txt
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var CALC = {};
var Calc = /** @class */ (function () {
    function Calc(def) {
        this.id = def.id;
        this.create(def.code);
    }
    Calc.prototype.create = function (code) {
        for (var key in code) {
            this[key] = new Function('_', code[key]);
        }
    };
    Calc.prototype.getNeeded = function (code) {
        var matches = Array.from(new Set(code.match(/(?<!\.)(\b\_\.)(\w+)/g)));
        for (var _i = 0, matches_1 = matches; _i < matches_1.length; _i++) {
            var iterator = matches_1[_i];
            console.log(iterator);
            //const parts = iterator.split('.')
        }
        var needed = [];
    };
    return Calc;
}());
self.onmessage = function (e) {
    var msg = e.data;
    switch (msg.cmd) {
        case 'stop':
            self.close(); // Terminates the worker.
            break;
        case 'start':
            firstProgress = true;
            t0 = Date.now();
            self.postMessage({ cmd: 'progress', value: 0 });
            break;
        case 'import':
            self.importScripts(msg.uri);
            self.postMessage({ progress: 1 });
            break;
        case 'load':
            CALC[msg.id] = new Calc(msg);
            self.postMessage({ progress: 1 });
            break;
        case 'do':
            CALC[msg.id]["do"](msg);
            if (CALC[msg.cID]) {
                self.postMessage({ progress: 1 });
            }
            else {
                self.postMessage({ need: 'code' });
            }
            break;
        default:
            var cmd = msg.cmd;
            var job = msg.job;
            var state = msg.state;
            self.postMessage({ cmd: 'message', value: 'unknown command' });
    }
};
var firstProgress = true;
var t0 = 0;
function postProgress(rel) {
    var t1 = Date.now();
    var tD = t1 - t0;
    if (firstProgress || tD > 1000) {
        self.postMessage({ cmd: 'progress', value: rel });
        t0 = Date.now();
    }
    firstProgress = false;
}
var i;
var Prim = /** @class */ (function () {
    function Prim(style) {
        this.kind = 'Prim';
        this.render = {};
        this.style = style;
        this.qualities = {};
    }
    Prim.prototype.init = function (_) { };
    Prim.prototype.click = function () {
        console.log(this.qualities);
    };
    Prim.prototype.view = function (style) {
        this.style = style;
        return this;
    };
    Prim.prototype.feature = function (index) { };
    Prim.prototype.quality = function (input) {
        if (input) {
            for (var key in input) {
                this.qualities[key] = input[key];
            }
            //this.feature(null);
            return this;
        }
        else {
            //this.feature(null);
            return this.qualities;
        }
    };
    Prim.prototype.dim = function (args1, args2) {
        if (!this.dims)
            this.dims = [];
        var prim = { pr1: this, pr2: null };
        if (args1 && args1.kind) {
            prim.pr2 = args1;
        }
        this.dims.push(new Dim('din', prim, args2));
        return this;
    };
    Prim.prototype.hide = function (value) {
        this.hidden = value;
        if (this.dims && this.dims.length) {
            for (var _i = 0, _a = this.dims; _i < _a.length; _i++) {
                var iterator = _a[_i];
                iterator.hide(value);
            }
        }
    };
    return Prim;
}());
var Constr = /** @class */ (function (_super) {
    __extends(Constr, _super);
    function Constr(style) {
        var _this = _super.call(this, style) || this;
        _this.kind = 'Constr';
        _this.name = 'Constr';
        _this.viewBox = {
            x: 100,
            y: 100,
            w: 100,
            h: 100
        };
        _this.viewFrame = {
            p1: {},
            p2: {},
            mirror: 'none',
            step: false
        };
        _this.toRef = [];
        _this.toFeature = [];
        _this.toFeatureLate = [];
        _this.toLog = [];
        _this.toRender = [];
        _this.toReport = [];
        /*
            if (style) {
                this.id = new ObjectID();
                this.getSvg();
            }
            */
        _this.viewFrame.p1 = { x: -200, y: 200 };
        _this.viewFrame.p2 = { x: 200, y: -200 };
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
        _this.qualities = {
            accus: {}
        };
        return _this;
    }
    Constr.prototype.init = function (_) { };
    Constr.prototype.feature = function (index, _) { };
    Constr.prototype.click = function () {
        //console.log(this.qualities.accus);
    };
    Constr.prototype.accuQualities = function (_) {
        for (var key in _) {
            var prim = _[key];
            if (prim.qualities && prim.qualities.accu) {
                var ident = void 0;
                if (prim.id) {
                    ident = prim.id.str;
                }
                else {
                    ident = i++;
                }
                this.qualities.accus[prim.kind + '-' + ident] = prim.qualities;
            }
        }
    };
    Constr.prototype.refAll = function () {
        for (var _i = 0, _a = this.toRef; _i < _a.length; _i++) {
            var prim = _a[_i];
            for (var _b = 0, _c = prim.refs; _b < _c.length; _b++) {
                var ref = _c[_b];
                prim[ref.key] = ref.ref.value();
            }
        }
    };
    Constr.prototype.featureAll = function (index, _) {
        for (var _i = 0, _a = this.toFeature; _i < _a.length; _i++) {
            var iterator = _a[_i];
            iterator.feature(index, _);
        }
    };
    Constr.prototype.featureLateAll = function (index, _) {
        for (var _i = 0, _a = this.toFeatureLate; _i < _a.length; _i++) {
            var iterator = _a[_i];
            iterator.featureLate(index, _);
        }
    };
    Constr.prototype.logAll = function (index) {
        for (var _i = 0, _a = this.toLog; _i < _a.length; _i++) {
            var iterator = _a[_i];
            //iterator.logs[index] = Object.assign({}, iterator);
        }
    };
    Constr.prototype.renderAll = function (index, _) {
        for (var _i = 0, _a = this.toRender; _i < _a.length; _i++) {
            var iterator = _a[_i];
            if (iterator.kind === 'Pt' && !_.viewFeatures.includes('Pt')) {
                iterator.hidden = true;
            }
            else {
                iterator.hidden = false;
            }
            if (!_.viewFeatures.includes('Supplement')) {
                if (iterator.qualities.use === 'draw') {
                    iterator.hide(true);
                }
            }
            else {
                if (iterator.qualities.use === 'draw') {
                    iterator.hide(false);
                }
            }
            if (!iterator.hidden) {
                iterator.setSvg(index, _);
            }
            else {
                iterator.render.svg.setAttributeNS(null, 'opacity', 0);
            }
        }
    };
    Constr.prototype.renderReportAll = function (index, _) {
        for (var _i = 0, _a = this.toReport; _i < _a.length; _i++) {
            var iterator = _a[_i];
            if (_.viewFeatures.includes('Dim') && !iterator.hidden) {
                iterator.feature(index, _);
                iterator.setSvg(index, _);
            }
            else {
                iterator.render.svg.setAttributeNS(null, 'opacity', 0);
            }
        }
    };
    return Constr;
}(Prim));
var Ui = /** @class */ (function () {
    function Ui(ref, key, def, s, t) {
        this.kind = 'Ui';
        this.uis = [];
        if (ref && ref._id) {
            this.ref = ref;
        }
        else {
            this.ref = {};
        }
        this.key = key;
        this.def = def;
        this.s = s || 1;
        this.t = t || 0;
    }
    Ui.prototype.getRef = function (tree, elementTree) {
        if (!this.ref && typeof this.ref === 'string') {
            for (var key in tree) {
                if (key === this.ref) {
                    this.ref = tree[this.ref];
                }
            }
        }
    };
    Ui.prototype.add = function (addend) {
        this.uis.push({ op: 'add', ui: addend });
        return this;
    };
    Ui.prototype.sub = function (addend) {
        this.uis.push({ op: 'sub', ui: addend });
        return this;
    };
    Ui.prototype.mult = function (addend) {
        this.uis.push({ op: 'mult', ui: addend });
        return this;
    };
    Ui.prototype.value = function (change) {
        if (change) {
            this.ref[this.key] = change;
        }
        var val;
        if (typeof this.ref[this.key] === 'undefined') {
            val = this.def;
        }
        else {
            val = this.ref[this.key];
        }
        var result = val * this.s + this.t;
        for (var _i = 0, _a = this.uis; _i < _a.length; _i++) {
            var iterator = _a[_i];
            switch (iterator.op) {
                case 'add':
                    result = result + iterator.ui.value();
                    break;
                case 'sub':
                    result = result - iterator.ui.value();
                    break;
                case 'mult':
                    result = result * iterator.ui.value();
                    break;
                default:
                    break;
            }
        }
        return result;
    };
    return Ui;
}());
var Dim = /** @class */ (function (_super) {
    __extends(Dim, _super);
    function Dim(style, d, args) {
        var _this = _super.call(this, style) || this;
        _this.args = {};
        _this.defprim = d;
        if (args)
            _this.args = args;
        if (d.pr1.kind === 'Arc' || d.pr1.kind === 'Circle') {
            _this.p1 = d.pr1.cPt;
            _this.p2 = new Pt(null);
        }
        if (d.pr1.kind === 'Pt') {
            _this.p1 = d.pr1;
            _this.p2 = d.pr2;
        }
        _this.p3 = new Pt(null);
        _this.p4 = new Pt(null);
        _this.p5 = new Pt(null);
        return _this;
    }
    Dim.prototype.feature = function (fIndex) { };
    return Dim;
}(Prim));
var Report = /** @class */ (function (_super) {
    __extends(Report, _super);
    function Report(style, t, k, p, u) {
        var _this = _super.call(this, style) || this;
        _this.kind = 'Report';
        _this.targets = [];
        _this.targets.push(t);
        if (p && p.kind === 'Pt') {
            _this.p0 = p;
        }
        if (p && typeof p === 'string') {
            _this.pos = p;
            _this.p0 = new Pt(null, 0, 0);
        }
        _this.keypath = k;
        _this.text = 'Report';
        _this.unit = u || 'mm';
        return _this;
    }
    Report.prototype.feature = function (fIndex, _) {
        this.x = this.p0.x;
        this.y = this.p0.y;
        var t = '';
        for (var _i = 0, _a = this.targets; _i < _a.length; _i++) {
            var target = _a[_i];
            if (this.keypath) {
                //const val = Dexie.getByKeyPath(target, this.keypath);
                //t += val + '\n';
            }
            else {
                for (var key1 in target.qualities) {
                    if (target.qualities.hasOwnProperty(key1)) {
                        var element1 = target.qualities[key1];
                        if (typeof element1 === 'number') {
                            //let val = element1.round(3);
                            //t += key1 + ': ' + val + '  \n';
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
    };
    Report.prototype.target = function (t) {
        if (t) {
            this.targets.push(t);
            return this;
        }
        return this.targets;
    };
    return Report;
}(Prim));
var Pt = /** @class */ (function (_super) {
    __extends(Pt, _super);
    function Pt(style, x, y) {
        var _this = _super.call(this, style) || this;
        _this.kind = 'Pt';
        if (x && x.x) {
            x = x.x || 0;
            y = x.y || 0;
        }
        x = x || 0;
        y = y || 0;
        if (x.value) {
            _this.x = x.value();
            if (!_this.refs)
                _this.refs = [];
            _this.refs.push({ key: 'x', ref: x });
        }
        else {
            _this.x = x || 0;
        }
        if (y.value) {
            _this.y = y.value();
            if (!_this.refs)
                _this.refs = [];
            _this.refs.push({ key: 'y', ref: y });
        }
        else {
            _this.y = y || 0;
        }
        return _this;
    }
    Pt.prototype.tangentV = function (rs, w, h) {
        var ms = new Pt(null, w, rs - h);
        var c = (ms.y * Math.sqrt(ms.x * ms.x + ms.y * ms.y - rs * rs) - ms.x * rs) / (ms.x * ms.x + ms.y * ms.y);
        return new Pt(null, rs * c + ms.x, -rs * Math.sqrt(1 - c * c) + ms.y);
    }; // rs = Radiensumme, w = Zugweite, h = Zughöhe
    Pt.prototype.dist = function (p) {
        if (!p) {
            p = { x: 0, y: 0 };
        }
        var a = this.x - p.x;
        var b = this.y - p.y;
        return Math.hypot(a, b);
    };
    Pt.prototype.angle = function (p, form) {
        // form: 'deg' oder 'rad' (default)
        if (!p) {
            p = { x: 0, y: 0 };
        }
        var y = this.y - p.y;
        var x = this.x - p.x;
        var angle = Math.atan2(y, x);
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        if (form === 'deg') {
            angle = (angle * 180) / Math.PI;
        }
        return angle;
    };
    // p: Pt oder Coord res: Ergebnistyp 'co', 'clone', 'this'
    Pt.prototype.rotate = function (angle, p, res) {
        var co = { x: 0, y: 0 };
        if (p) {
            var x1 = this.x - p.x;
            var y1 = this.y - Number(p.y);
            var x2 = x1 * Math.cos(angle) - y1 * Math.sin(angle);
            var y2 = x1 * Math.sin(angle) + y1 * Math.cos(angle);
            co.x = x2 + p.x;
            co.y = y2 + p.y;
        }
        else {
            var x = this.x;
            var y = this.y;
            co.x = x * Math.cos(angle) - y * Math.sin(angle);
            co.y = x * Math.sin(angle) + y * Math.cos(angle);
        }
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
    };
    Pt.prototype.move = function (p, res) {
        var co = { x: 0, y: 0 };
        co.x = this.x + p.x;
        co.y = this.y + p.y;
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
    };
    Pt.prototype.uv = function () {
        var d = this.dist();
        if (d === 0)
            d = 1;
        return { x: this.x / d, y: this.y / d };
    };
    Pt.prototype.scale = function (s, res) {
        var co = { x: this.x * s, y: this.y * s };
        if (!res) {
            return this.coord(co);
        }
        if (res === 'co') {
            return co;
        }
        if (res === 'clone') {
            return new Pt(null).coord(co);
        }
        if (res === 'this') {
            return this.coord(co);
        }
    };
    Pt.prototype.trans = function (pt, res) {
        var co = { x: this.x + pt.x, y: this.y + pt.y };
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
    };
    Pt.prototype.mult = function (s) {
        return { x: this.x * s, y: this.y * s };
    };
    Pt.prototype.add = function (pt) {
        return { x: this.x + pt.x, y: this.y + pt.y };
    };
    Pt.prototype.sub = function (pt) {
        return { x: this.x - pt.x, y: this.y - pt.y };
    };
    Pt.prototype.scalarProduct = function (co) {
        return this.x * co.x + this.y * co.y;
    };
    Pt.prototype.transVL = function (vektor, length) {
        // Addition
        return vektor.n().mult(length);
    };
    Pt.prototype.equals = function (p) {
        return this.x === p.x && this.y === p.y;
    };
    Pt.prototype.mirrorX = function () {
        return { x: this.x, y: -this.y };
    };
    Pt.prototype.mirrorY = function () {
        return { x: -this.x, y: this.y };
    };
    Pt.prototype.determinant = function (p) {
        return this.x * p.y - p.x * this.y;
    };
    Pt.prototype.coord = function (co) {
        if (co) {
            this.x = co.x;
            this.y = co.y;
            return this;
        }
        return { x: this.x, y: this.y };
    };
    Pt.prototype.ptype = function (type) {
        if (type) {
            this.pathtype = type;
            return this;
        }
        return this.pathtype;
    };
    return Pt;
}(Prim));
var PtZero = /** @class */ (function (_super) {
    __extends(PtZero, _super);
    function PtZero(style, x, y) {
        var _this = _super.call(this, style, x, y) || this;
        _this.x = 0;
        _this.y = 0;
        return _this;
    }
    return PtZero;
}(Pt));
var PtUx = /** @class */ (function (_super) {
    __extends(PtUx, _super);
    function PtUx(style, x, y) {
        var _this = _super.call(this, style, x, y) || this;
        _this.x = 1;
        _this.y = 0;
        return _this;
    }
    return PtUx;
}(Pt));
var PtUy = /** @class */ (function (_super) {
    __extends(PtUy, _super);
    function PtUy(style, x, y) {
        var _this = _super.call(this, style, x, y) || this;
        _this.x = 0;
        _this.y = 1;
        return _this;
    }
    return PtUy;
}(Pt));
var Line = /** @class */ (function (_super) {
    __extends(Line, _super);
    function Line(style, p1, p2) {
        var _this = _super.call(this, style) || this;
        _this.kind = 'Line';
        _this.theta = 0;
        _this.length = 0;
        _this.style = style || 'edge';
        _this.p1 = p1 || new Pt(null, 0, 0);
        _this.p2 = p2 || new Pt(null, 1, 0);
        _this.p1p2 = new Pt(null, 1, 0);
        _this.tPt = new Pt(null, 1, 0);
        _this.unitV = new Pt(null, 1, 0);
        _this.normal = new Pt(null, 1, 0);
        _this.chordCenter = new Pt(null, 0, 0);
        return _this;
        //this.feature(0);
    }
    Line.prototype.feature = function (index) {
        if (this.tangentRef) {
            var coordArray = tangents(this.tangentRef.c1, this.tangentRef.c2);
            var tan = coordArray[this.tangentRef.sel];
            this.p1.coord(tan.co1);
            this.p2.coord(tan.co2);
        }
        this.p1p2.x = this.p2.x - this.p1.x;
        this.p1p2.y = this.p2.y - this.p1.y;
        var chordCenterP1P2 = this.p1p2.mult(0.5);
        this.chordCenter.x = chordCenterP1P2.x + this.p1.x;
        this.chordCenter.y = chordCenterP1P2.y + this.p1.y;
        this.tPt.x = this.chordCenter.x;
        this.tPt.y = this.chordCenter.y;
        this.theta = this.p1p2.angle();
        this.zrot = this.theta;
        this.length = this.p1p2.dist();
        if (this.length !== 0) {
            this.unitV.coord(this.p1p2.uv());
            this.normal.coord(this.unitV.rotate(Math.PI / 2, null, 'co'));
        }
    };
    Line.prototype.uv = function () { };
    Line.prototype.totalLength = function () {
        return this.p1p2.dist();
    };
    Line.prototype.getPointAtLength = function (l) {
        return this.p1.move(this.unitV.scale(l, 'co'), 'co');
    };
    Line.prototype.setPoints = function (p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    };
    Line.prototype.intersect = function (prim) { };
    Line.prototype.foot = function (positionVector) {
        // Ortsvektor zu w = ow
        this.feature(0);
        var w = positionVector.sub(this.p1); // Richtungsvektor von p1 zu w
        var t = this.unitV.scalarProduct(w);
        return this.p1.add(this.unitV.scale(t));
    };
    Line.prototype.tangentTo = function (arg1, arg2, arg3, arg4) {
        this.tangentRef = { c1: arg1, c2: arg2, sel: arg3 };
        this.feature(null);
        return this;
    };
    Line.prototype.toString = function () {
        return this.p1.toString() + this.p2.toString();
    };
    return Line;
}(Prim));
var Arc = /** @class */ (function (_super) {
    __extends(Arc, _super);
    function Arc(style, p1, p2, r, turn, cPt) {
        var _this = _super.call(this, style) || this;
        // turn 0 links, 1 rechts
        _this.kind = 'Arc';
        _this.cPt = cPt;
        if (turn > 1) {
            _this.p1 = new Pt(null);
            _this.p2 = new Pt(null);
            if (r.value) {
                _this.r = r.value();
                if (!_this.refs)
                    _this.refs = [];
                _this.refs.push({ key: 'r', ref: r });
            }
            else {
                _this.r = r;
            }
            if (turn === 2)
                _this.sense = 1;
            if (turn === 4)
                _this.sense = -1;
        }
        else {
            if (turn === 0)
                _this.sense = -1;
            if (turn === 1)
                _this.sense = 1;
            _this.p1 = p1;
            _this.p2 = p2;
            if (r.r1) {
                // Ellipse xxx
                _this.r1 = r.r1;
                _this.r2 = r.r2;
                _this.r = Math.abs(r.r1 - r.r2);
            }
            else {
                // Kreis
                if (r.value) {
                    _this.r = r.value();
                    if (!_this.refs)
                        _this.refs = [];
                    _this.refs.push({ key: 'r', ref: r });
                }
                else {
                    _this.r = r;
                }
                _this.r1 = _this.r2 = _this.r;
                if (!_this.cPt) {
                    _this.cPt = intersectionCircles({ x: _this.p1.x, y: _this.p1.y, r: _this.r }, { x: _this.p2.x, y: _this.p2.y, r: _this.r })[turn];
                }
            }
        }
        _this.turn = turn;
        _this.p1.normal = new Pt(null, 0, 1);
        _this.p2.normal = new Pt(null, 0, 1);
        _this.tPt = new Pt(null, 1, 1);
        return _this;
    }
    Arc.prototype.feature = function (index) {
        _super.prototype.feature.call(this, index);
        this.x = this.cPt.x;
        this.y = this.cPt.y;
        //this.r = this.cPt.r;
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
        if (this.r !== 0)
            this.phi = 2 * Math.asin(this.p1p2.dist() / (2 * this.r));
        this.p1.normal.rotate(this.p1.angle(this.cPt));
        this.p2.normal.rotate(this.p2.angle(this.cPt));
        var n1x = this.p1.x - this.cPt.x;
        var n1y = this.p1.y - this.cPt.y;
        var n2x = this.p2.x - this.cPt.x;
        var n2y = this.p2.y - this.cPt.y;
        var d1 = n1x * this.p1.x + n1y * this.p1.y;
        var d2 = n2x * this.p2.x + n2y * this.p2.y;
        var det = n1y * n2x - n1x * n2y;
        if (det === 0) {
            // The lines are parallel
        }
        else {
            this.tPt.x = (d2 * n1y - d1 * n2y) / det;
            this.tPt.y = (d1 * n2x - d2 * n1x) / det;
        }
    };
    Arc.prototype.totalLength = function () {
        return 2 * Math.PI * this.r * (this.phi / (2 * Math.PI));
    };
    Arc.prototype.getPointAtLength = function (l) {
        var phi = (l / this.totalLength()) * this.phi;
        return this.p1.rotate(this.sense * phi, this.cPt, 'co');
    };
    return Arc;
}(Line));
var Path = /** @class */ (function (_super) {
    __extends(Path, _super);
    function Path(style, parts, sw, res) {
        var _this = _super.call(this, style) || this;
        _this.kind = 'Path';
        _this.segments = [];
        _this.finitePoints = [];
        _this.points = [];
        if (sw.value) {
            _this.strokeWidth = sw.value();
            if (!_this.refs)
                _this.refs = [];
            _this.refs.push({ key: 'strokeWidth', ref: sw });
        }
        else {
            _this.strokeWidth = sw;
        }
        if (parts[0].kind === 'Line') {
            _this.points.push(parts[0].p1.ptype('M'));
        }
        for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
            var p = parts_1[_i];
            if (p.kind === 'Pt') {
                _this.points.push(p);
            }
            if (p.kind === 'Line') {
                _this.points.push(p.p2.ptype('L'));
            }
            if (p.kind === 'Arc') {
                _this.points.push(p.p2.ptype(p));
            }
            _this.segments.push({ ref: p, finitePoints: [] });
        }
        if (res) {
            var count = Math.ceil(res * 100 + 10);
            for (var index = 1; index <= count; index++) {
                var pt = new Pt(null);
                pt.normal = new Pt(null);
                /*
                        pt.render.svg = document.createElementNS(svgNS, 'polygon');
                        pt.render.svg.setAttributeNS(null, "id", 'pt-' + index);
                        pt.render.svg.setAttributeNS(null, "stroke", 'none');
                        */
                _this.finitePoints.push(pt);
            }
            _this.finiteRes = res;
        }
        return _this;
    }
    Path.prototype.init = function (_) { };
    Path.prototype.feature = function (index) {
        var x1 = 10000, y1 = -10000, x2 = -10000, y2 = 10000;
        this.length = 0;
        for (var _i = 0, _a = this.segments; _i < _a.length; _i++) {
            var seg = _a[_i];
            x1 = Math.min(x1, seg.ref.p1.x, seg.ref.p2.x);
            x2 = Math.max(x2, seg.ref.p1.x, seg.ref.p2.x);
            y1 = Math.max(y1, seg.ref.p1.y, seg.ref.p2.y);
            y2 = Math.min(y2, seg.ref.p1.y, seg.ref.p2.y);
            this.width = x2 - x1;
            this.height = y1 - y2;
            if (seg.ref.totalLength) {
                seg.length = seg.ref.totalLength();
                this.length += seg.length;
            }
        }
    };
    Path.prototype.featureLate = function (index) { };
    Path.prototype.finit = function (res) {
        this.finiteRes = res;
        return this;
    };
    return Path;
}(Prim));
var Circle = /** @class */ (function (_super) {
    __extends(Circle, _super);
    function Circle(style, r, cPt) {
        var _this = _super.call(this, style) || this;
        _this.kind = 'Circle';
        if (r.value) {
            _this.r = r.value();
            if (!_this.refs)
                _this.refs = [];
            _this.refs.push({ key: 'r', ref: r });
        }
        else {
            _this.r = r;
        }
        _this.cPt = cPt || new Pt(null, 0, 0);
        return _this;
    }
    return Circle;
}(Prim));
var Textxxx = /** @class */ (function () {
    function Textxxx(x, y, string, style) {
        this.kind = 'Text';
        this.x = x || 0;
        this.y = y || 0;
        this.string = string;
        this.style = style || 'text1';
        this.feature();
    }
    Textxxx.prototype.feature = function () { };
    return Textxxx;
}());
var AreaMoment = /** @class */ (function (_super) {
    __extends(AreaMoment, _super);
    function AreaMoment(style, x, y, xy) {
        var _this = _super.call(this, style) || this;
        _this.x = x || 0;
        _this.y = x || 0;
        _this.xy = xy || 0;
        _this.p = x + y;
        return _this;
    }
    AreaMoment.prototype.feature = function () { };
    AreaMoment.prototype.rotate = function (phi) {
        this.phi = phi || 0;
        if (phi !== 0) {
            var ix = this.x;
            var iy = this.y;
            var ixy = this.xy;
            this.x = (ix + iy) / 2 + ((ix - iy) * Math.cos(2 * this.phi)) / 2 - ixy * Math.sin(2 * this.phi);
            this.y = (ix + iy) / 2 - ((ix - iy) * Math.cos(2 * this.phi)) / 2 + ixy * Math.sin(2 * this.phi);
            this.xy = ((ix - iy) * Math.sin(2 * this.phi)) / 2 + ixy * Math.cos(2 * this.phi);
            this.p = this.x + this.y;
        }
    };
    AreaMoment.prototype.scale = function (s) {
        this.x = this.x * s;
        this.y = this.y * s;
        this.xy = this.xy * s;
    };
    AreaMoment.prototype.add = function (prim) {
        this.x = this.x + prim.mirorPt.x * prim.mirorPt.x * prim.area;
        this.y = this.y + prim.mirorPt.y * prim.mirorPt.y * prim.area;
        this.xy = this.xy + prim.mirorPt.x * prim.mirorPt.y * prim.area;
    };
    AreaMoment.prototype.mirrorY = function (mirorPtX, area) {
        this.x = this.x * 2;
        this.y = 2 * (this.y + mirorPtX * mirorPtX * area);
        this.xy = 0;
    };
    return AreaMoment;
}(Prim));
function intersectionLines(line1, line2) {
    var o1 = { x: line1.p1.x, y: line1.p1.y };
    var r1 = line1.p2.sub(line1.p1);
    var o2 = { x: line2.p1.x, y: line2.p1.y };
    var r2 = line2.p2.sub(line2.p1);
    var dO = { x: o2.x - o1.x, y: o2.y - o1.y };
    var d = r1.x * -r2.y - -r2.x * r1.y;
    var d1 = dO.x * -r2.y - -r2.x * dO.y;
    var p;
    if (d !== 0) {
        p = new Pt(null, o1.x + (d1 * r1.x) / d, o1.y + (d1 * r1.y) / d);
    }
    else {
        p = null;
    }
    return p;
}
function intersectionCircles(c0, c1) {
    var x0 = c0.x, y0 = c0.y, r0 = c0.r;
    var x1 = c1.x, y1 = c1.y, r1 = c1.r;
    var a, dx, dy, d, h, rx, ry, result = [];
    var x2, y2;
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
    var xi = x2 + rx;
    var xi_prime = x2 - rx;
    var yi = y2 + ry;
    var yi_prime = y2 - ry;
    result = [new Pt(null, xi_prime, yi_prime), new Pt(null, xi, yi)];
    return result;
}
function tangents(circle1, circle2) {
    var x1 = circle1.cPt.x;
    var y1 = circle1.cPt.y;
    var r1 = circle1.r;
    var x2 = circle2.cPt.x;
    var y2 = circle2.cPt.y;
    var r2 = circle2.r;
    var d_sq = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    if (d_sq <= (r1 - r2) * (r1 - r2)) {
        return false;
    }
    var d = Math.sqrt(d_sq);
    var vx = (x2 - x1) / d;
    var vy = (y2 - y1) / d;
    var res = [];
    var a = [1, 1, 1, 1];
    var i = 0;
    for (var sign1 = +1; sign1 >= -1; sign1 -= 2) {
        var c = (r1 - sign1 * r2) / d;
        if (c * c < 1.0) {
            var h = Math.sqrt(Math.max(0.0, 1.0 - c * c));
            for (var sign2 = +1; sign2 >= -1; sign2 -= 2) {
                var nx = vx * c - sign2 * h * vy;
                var ny = vy * c + sign2 * h * vx;
                res[i++] = {
                    co1: {
                        x: x1 + r1 * nx,
                        y: y1 + r1 * ny
                    },
                    co2: {
                        x: x2 + sign1 * r2 * nx,
                        y: y2 + sign1 * r2 * ny
                    }
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
    var mu2 = (1 - Math.cos(mu * Math.PI)) / 2;
    return y1 * (1 - mu2) + y2 * mu2;
}
function colorFromValue(value, mode, min, nrm, max) {
    var theme = CONSTRUCT.theme.isDark ? 'dark' : 'light';
    var delta, mu, cRes, cDo0, cDo1;
    switch (mode) {
        case 'min':
            if (value >= max) {
                return ATTR.ntr[theme].fill;
            }
            if (value <= min) {
                return ATTR.min[theme].fill;
            }
            delta = max - min;
            mu = value - min;
            cDo0 = hexToRgb(ATTR.ntr[theme].fill);
            cDo1 = hexToRgb(ATTR.min[theme].fill);
            value = mu / delta;
            value = Math.pow(value, 1);
            break;
        case 'max':
            if (value >= max) {
                return ATTR.max[theme].fill;
            }
            if (value <= min) {
                return ATTR.ntr[theme].fill;
            }
            delta = max - min;
            mu = max - value;
            cDo0 = hexToRgb(ATTR.ntr[theme].fill);
            cDo1 = hexToRgb(ATTR.max[theme].fill);
            value = mu / delta;
            value = Math.pow(value, 1);
            break;
        default:
            if (value >= max) {
                return ATTR.max[theme].fill;
            }
            if (value <= min) {
                return ATTR.min[theme].fill;
            }
            if (value === nrm) {
                return ATTR.nrm[theme].fill;
            }
            if (value > nrm) {
                delta = max - nrm;
                mu = value - nrm;
                cDo0 = hexToRgb(ATTR.max[theme].fill);
            }
            if (value < nrm) {
                delta = nrm - min;
                mu = nrm - value;
                cDo0 = hexToRgb(ATTR.min[theme].fill);
            }
            cDo1 = hexToRgb(ATTR.nrm[theme].fill);
            value = mu / delta;
            value = Math.pow(value, 1);
            break;
    }
    //console.log(value)
    cRes = {
        r: cDo0.r * value + cDo1.r * (1 - value),
        g: cDo0.g * value + cDo1.g * (1 - value),
        b: cDo0.b * value + cDo1.b * (1 - value)
    };
    return rgbToHex(cRes.r, cRes.g, cRes.b);
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16) / 255,
            g: parseInt(result[2], 16) / 255,
            b: parseInt(result[3], 16) / 255
        }
        : null;
}
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
}
function rgbToHex(r, g, b) {
    return ('#' +
        componentToHex(Math.floor(r * 255)) +
        componentToHex(Math.floor(g * 255)) +
        componentToHex(Math.floor(b * 255)));
}
self.postMessage({ ready: true });
