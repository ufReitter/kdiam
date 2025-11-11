import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  ViewChild,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { CalcService } from 'src/app/calc/calc.service';
import { CalculationService } from 'src/app/services/calculation.service';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-viewport',
  standalone: false,
  templateUrl: './viewport.component.html',
  styleUrls: ['./viewport.component.scss'],
})
export class ViewportComponent implements OnChanges, AfterViewInit, OnDestroy {
  msg: any;
  ti = 0;
  tr = 0;
  tlast = 0;
  fps = 0;
  width = 768;
  height = 400;
  rotation: number;
  timeInit: number;
  timeChanges: number;
  timeInitGrafik: number;
  timeChangesGrafik: number;
  report: any = [];
  scale = 1;
  theme = 'dark';
  x = 0;
  y = 0;
  w = 0;
  h = 0;
  port: any;
  svgc: any[] = [];
  origin: any;
  arrowx: any;
  arrowy: any;
  apath: any;
  dot: any;
  cross: any;
  symm: any;
  xaxis: any;
  yaxis: any;
  test: any;
  wm: any;
  prims: any[] = [];
  prim: any = {};
  viewOptions: any = {
    strain: true,
    dimensionsA: true,
    dimensionsB: false,
    fulScreen: false,
    showAxes: true,
    showGrid: true,
    grid: 10,
  };
  themeSubject: Subscription;
  primInitSubject: Subscription;
  primChangesSubject: Subscription;
  prefSubject: Subscription;
  view: Subscription;

  defSubject: Subscription;
  calcSubject: Subscription;

  ctx0: any;

  svgns = 'http://www.w3.org/2000/svg';

  svgC: any;
  svg: any;

  features: string[] = ['Pt', 'Supplement', 'Dim'];
  mode = 'definition';
  gradientIndex = 0;
  gradients: string[] = ['minmax', 'min', 'max'];
  gradient = 'minmax';

  wasModeClick: boolean;

  nativeElements: boolean;

  grids = [5, 10, 25, 50, 100];
  gridsIndex = 1;
  txts: any;

  @Input() elm: any;
  @Output() fullscreen = new EventEmitter<any>();
  @ViewChild('can0', { static: false }) can0El;
  @ViewChild('svgC', { static: false }) svgCEl;
  @ViewChild('svg0', { static: false }) svg0El;
  @ViewChild('svg1', { static: false }) svg1El;
  @ViewChild('svg2', { static: false }) svg2El;
  @ViewChild('origin', { static: false }) originEl;
  @ViewChild('arrowx', { static: false }) arrowxEl;
  @ViewChild('arrowy', { static: false }) arrowyEl;
  @ViewChild('apath', { static: false }) apathEl;
  @ViewChild('dot', { static: false }) dotEl;
  @ViewChild('cross', { static: false }) crossEl;
  @ViewChild('watermark', { static: false }) wmEl;
  renderTimer: Subscription;
  workerMesSubj: Subscription;
  devicePixelRatio: number;

  constructor(
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
    public cSOld: CalculationService,
    public cS: CalcService,
  ) {
    this.devicePixelRatio = window.devicePixelRatio || 1;
  }

  ngOnChanges(): void {
    if (this.vS.isFullscreen) {
      this.fullscreen.emit();
      setTimeout(() => {
        let can = this.can0El.nativeElement;
        var rect = can.getBoundingClientRect();
        can.width = rect.width * this.devicePixelRatio;
        can.height = rect.height * this.devicePixelRatio;
        this.elm.job.worker.postMessage({
          cmd: 'initcalc',
          eid: this.elm._eid.str,
          vpw: rect.width,
          vph: rect.height,
          inputs: this.cS.getInputs(this.elm),
          fps: this.elm.attrib.fps || 0,
          autoStart: this.elm.attrib.autoStart,
          yup: this.elm.attrib.yup,
          version: this.elm.calc.version,
        });
      }, 500);
    }
  }

  async ngAfterViewInit() {
    this.rotation = this.elm.figure?.rot || 0;
    let can = this.can0El.nativeElement;
    var rect = can.getBoundingClientRect();
    can.width = 768 * this.devicePixelRatio;
    can.height = 432 * this.devicePixelRatio;
    let canvas;
    if (this.dS.deviceInfo.browser === 'Chromexxx') {
      canvas = this.can0El.nativeElement.transferControlToOffscreen();
    } else {
      canvas = this.can0El.nativeElement;
    }
    //this.ctx0 = this.can0El.nativeElement.getContext('2d');
    this.svgC = this.svgCEl.nativeElement;
    this.svgc[0] = this.svg0El.nativeElement;
    this.svgc[1] = this.svg1El.nativeElement;
    this.svgc[2] = this.svg1El.nativeElement;
    this.origin = this.originEl.nativeElement;
    this.arrowx = this.arrowxEl.nativeElement;
    this.arrowy = this.arrowyEl.nativeElement;
    this.apath = this.apathEl.nativeElement;
    this.dot = this.dotEl.nativeElement;
    this.cross = this.crossEl.nativeElement;
    this.wm = this.wmEl.nativeElement;

    this.nativeElements = true;

    this.svg = document.createElementNS(this.svgns, 'g');
    this.symm = document.createElementNS(this.svgns, 'line');
    this.xaxis = document.createElementNS(this.svgns, 'line');
    this.yaxis = document.createElementNS(this.svgns, 'line');
    this.test = document.createElementNS(this.svgns, 'line');

    //this.jobSubjects();

    this.themeSubject = this.dS.subject.theme.subscribe((theme) => {
      if (theme) {
        this.theme = theme.isDark ? 'dark' : 'light';
        const foreg = theme.isDark ? '#e8e8e8' : '#222';
        const backg = theme.isDark ? '#161616' : '#fff';
        this.svg.setAttribute('background-color', backg);
        this.arrowx.setAttribute('fill', foreg);
        this.arrowy.setAttribute('fill', foreg);
        this.xaxis.setAttribute('stroke', foreg);
        this.yaxis.setAttribute('stroke', foreg);
        this.origin.setAttribute('stroke', foreg);
        this.dot.setAttribute('stroke', foreg);
        this.cross.setAttribute('stroke', foreg);
        this.origin.setAttribute('fill', foreg);
        this.origin.children[0].setAttribute('fill', foreg);
        this.origin.children[1].setAttribute('fill', backg);
        this.origin.children[2].setAttribute('fill', foreg);
        this.origin.children[3].setAttribute('fill', backg);

        this.crossEl.nativeElement.setAttribute('fill', foreg);

        this.symm.setAttributeNS(null, 'stroke', foreg);

        for (const key in this.prim) {
          if (this.prim.hasOwnProperty(key)) {
            const element = this.prim[key];
            element.attributes(this.theme);
          }
        }
      }
    });
    // this.view = this.vS.sizeSub.subscribe((fs) => {
    //   let delay = timer(10).subscribe((t) => {
    //     this.setViewBox(this.prim);
    //   });
    // });

    if (this.elm.attrib.asc) {
      if (!this.elm.job) {
        this.elm.job = await this.cS.getJob(this.elm, canvas);
        if (this.elm.job.ready) {
          this.elm.job.canvas = canvas;
          this.elm.job.worker.postMessage({
            cmd: 'init',
            eid: this.elm._eid.str,
            vpw: 768,
            vph: 432,
            inputs: this.cS.getInputs(this.elm),
            fps: this.elm.attrib.fps || 0,
            autoStart: this.elm.attrib.autoStart,
          });
          if (this.dS.deviceInfo.browser === 'Chromexxx') {
            // this.elm.job.canvasWorker.postMessage(
            //   {
            //     cmd: 'resume',
            //     eid: this.elm.job.elm._eid.str,
            //     canvas: canvas,
            //     devicePixelRatio: this.devicePixelRatio,
            //     yup: this.elm.attrib.yup,
            //     horizontal: this.elm.attrib.horizontal,
            //   },
            //   [canvas],
            // );
          } else {
            this.elm.job.canvas = canvas;
          }
        }
      } else {
        this.elm.job.canvas = canvas;
        this.cS.initJob(this.elm.job);
      }
      this.workerMesSubj = this.elm.job.workerMesSubj.subscribe((msg) => {
        if (msg) {
          if (this.elm.attrib.autoStart) {
            const t0 = performance.now();
            this.fps = 1 / ((t0 - this.tlast) / 1000);
            this.tlast = t0;
            this.msg = msg;
            switch (msg.cmd) {
              case 'init':
                this.ti = msg.ti;
                break;
              case 'do':
                break;
              default:
                break;
            }
          } else {
            this.fps = 0;
            this.msg = msg;
            switch (msg.cmd) {
              case 'init':
                this.ti = msg.ti;
                break;
              case 'do':
                break;
              default:
                break;
            }
          }
        }
      });
    }

    this.prefSubject = this.pS.prefSub.subscribe((pref) => {
      if (pref) {
        if (!this.pS.pref.display[this.elm._eid.str]) {
          this.pS.pref.display[this.elm._eid.str] = {
            strain: true,
            dimensionsA: true,
            dimensionsB: false,
            fulScreen: false,
            showAxes: true,
            showGrid: true,
            grid: 10,
            analyse: false,
          };
        }
        this.viewOptions = this.pS.pref.display[this.elm._eid.str];
      }
    });

    // this.defSubject = this.cS.getCalcSubject(this.elm).subscribe((msg) => {
    //   if (msg) {
    //     const t0 = performance.now();
    //     this.fps = 1 / ((t0 - this.tlast) / 1000);
    //     this.tlast = t0;
    //     this.msg = msg;
    //     if (msg.cmd === 'init') {
    //       this.ti = msg.ti;
    //       // this.renderTimer = timer(0, 5000).subscribe(() => {
    //       //   this.cS.doCalcSubject(this.elm);
    //       // });
    //     }
    //   }
    // });
  }
  ngOnDestroy(): void {
    this.cS.stop(this.elm.job);
    if (this.prefSubject) this.prefSubject.unsubscribe();
    if (this.workerMesSubj) this.workerMesSubj.unsubscribe();
    if (this.renderTimer) this.renderTimer.unsubscribe();
    if (this.defSubject) this.defSubject.unsubscribe();
    if (this.calcSubject) this.calcSubject.unsubscribe();
    if (this.themeSubject) this.themeSubject.unsubscribe();
    if (this.primInitSubject) this.primInitSubject.unsubscribe();
    if (this.primChangesSubject) this.primChangesSubject.unsubscribe();
    if (this.view) this.view.unsubscribe();
  }

  recompile() {}

  toggleFullScreen() {
    this.fullscreen.emit();
    this.viewOptions.fulScreen = this.vS.isFullscreen;
    this.pS.pref.save({ ['display.' + this.elm._eid.str]: this.viewOptions });
    setTimeout(() => {
      let can = this.can0El.nativeElement;
      var rect = can.getBoundingClientRect();
      can.width = rect.width * this.devicePixelRatio;
      can.height = rect.height * this.devicePixelRatio;
      this.elm.job.worker.postMessage({
        cmd: 'initcalc',
        eid: this.elm._eid.str,
        vpw: rect.width,
        vph: rect.height,
        inputs: this.cS.getInputs(this.elm),
        fps: this.elm.attrib.fps || 0,
        autoStart: this.elm.attrib.autoStart,
        yup: this.elm.attrib.yup,
        version: this.elm.calc.version,
      });
    }, 0);
  }

  doViewOptions(opt) {
    this.pS.pref.display[this.elm._eid.str] =
      this.pS.pref.display[this.elm._eid.str] || {};
    if (this.pS.pref.display[this.elm._eid.str].analyse !== opt.analyse) {
      let delay = timer(100).subscribe((t) => {
        this.cS.initCalcOnInitSubject(this.elm);
      });
    }
    this.pS.pref.display[this.elm._eid.str].dimensionsA = opt.dimensionsA;
    this.pS.pref.display[this.elm._eid.str].analyse = opt.analyse;
    this.pS.pref.display[this.elm._eid.str].showAxes = opt.showAxes;
    this.pS.pref.display[this.elm._eid.str].showGrid = opt.showGrid;
    this.cS.initCalcSubject(this.elm);
    this.pS.pref.save({ ['display.' + this.elm._eid.str]: opt });
  }

  setGridSpacing(e, dir) {
    e.stopPropagation();
    this.pS.pref.display[this.elm._eid.str].showGrid =
      this.viewOptions.showGrid = true;
    this.gridsIndex += dir;
    this.gridsIndex = Math.min(this.gridsIndex, this.grids.length - 1);
    this.gridsIndex = Math.max(this.gridsIndex, 0);
    this.pS.pref.display[this.elm._eid.str].grid = this.grids[this.gridsIndex];
    this.cS.doJob(this.elm.job);

    this.pS.pref.save({
      ['display.' + this.elm._eid.str + '.showGrid']: this.viewOptions.showGrid,
    });
    this.pS.pref.save({
      ['display.' + this.elm._eid.str + '.grid']: this.grids[this.gridsIndex],
    });
  }

  onFeatures(event) {
    // this.elm.tree.viewFeatures = this.features = event.value;
    // this.elm.construct.prepareTree(this.elm.tree);
    this.elm.onInputChange();
    // const keypath = 'tree.' + this.elm._eid.str + '.viewFeatures';
    // this.dS.selectedProject.update({ [keypath]: this.features });
  }

  onMode(event) {
    this.wasModeClick = true;
    this.elm.tree.viewMode = this.mode = event.value;
    const keypath = 'tree.' + this.elm._eid.str + '.viewMode';
    this.dS.selectedProject.update({ [keypath]: this.mode });
  }

  modeClick() {
    if (
      !this.wasModeClick &&
      this.mode !== 'definition' &&
      this.mode !== 'thickness'
    ) {
      let i = this.gradients.indexOf(this.gradient);
      i++;
      if (i > this.gradients.length - 1) {
        i = 0;
      }
      this.gradient = this.gradients[i];
      this.elm.tree.viewGradient = this.gradient || 'real';
      const keypath = 'tree.' + this.elm._eid.str + '.viewGradient';
      this.dS.selectedProject.update({ [keypath]: this.gradient });
    }
    this.wasModeClick = false;
    this.elm.onInputChange();
  }
}
