import { _isNumberValue } from '@angular/cdk/coercion';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CalcService } from 'src/app/calc/calc.service';
import { CalculationService } from 'src/app/services/calculation.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { Elm } from '../../engine/entity';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-elm',
  templateUrl: './elm.component.html',
  styleUrls: ['./elm.component.css'],
  //changeDetection: ChangeDetectionStrategy.Default,
})
export class ElmComponent implements OnInit, OnChanges, OnDestroy {
  project: boolean;
  defSubject: Subscription;
  selection: any;
  buttonWidth = 0;
  grids: any[];
  delay: any;
  @Input() grid: any;
  @Input() node: any;
  @Input() elm: Elm;
  @Input() set: any;
  @Input() parent: Elm;
  @Input() view: string;
  @Input() viewDepth: number;
  @ViewChild('wrapper', { static: false }) wrapper;
  wrapperElm: any;
  isFullscreen: boolean;

  quill: any;
  workerMesSub: Subscription;
  delayCd: any;
  latency = 150;
  constructor(
    public cd: ChangeDetectorRef,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
    public cS: CalcService,
    public cSold: CalculationService,
  ) {}
  ngOnInit() {
    this.viewDepth = this.viewDepth || 1;
  }
  ngOnChanges() {
    if (!this.node) {
      this.node = { elm: this.elm };
    } else {
      this.elm = this.node.elm;
      this.set = this.node.set;
    }
    if (this.node.elm !== this.elm) {
      this.node.elm = this.elm;
    }

    if (!this.set) {
      this.set = {};
    }
    if (!this.set.attrib) {
      this.set.attrib = {};
    }

    this.latency = this.elm.attrib.fps ? 750 : 100;

    this.init();

    this.parent = this.parent || this.dS.selVol;

    this.cd.detectChanges();
  }

  ngAfterViewInit() {
    this.wrapperElm = this.wrapper.nativeElement;
    // if (this.defSubject) {
    //   this.defSubject.unsubscribe();
    //   this.defSubject = null;
    // }
    this.defSubject = this.elm.defSubject.subscribe((def) => {
      if (def) {
        if (this.delay) clearTimeout(this.delay);
        this.delay = setTimeout(() => {
          this.init();
          this.cd.detectChanges();
        }, 400);
      }
    });
  }
  ngOnDestroy() {
    if (this.elm.job) {
      this.elm.job.worker.id = null;
    }
    if (this.workerMesSub) this.workerMesSub.unsubscribe();
    if (this.defSubject) this.defSubject.unsubscribe();
  }

  init() {
    let cS;
    if (this.elm.attrib.asc) {
      cS = this.cS;
    } else {
      cS = this.cSold;
    }
    if (this.elm.calc) {
      if (this.workerMesSub) {
        this.workerMesSub.unsubscribe();
        this.workerMesSub = null;
      }
      this.workerMesSub = cS.workerMesSub.subscribe((msg) => {
        if (msg) {
          if (!this.delayCd) {
            this.delayCd = setTimeout(() => {
              this.cd.detectChanges();
              clearTimeout(this.delayCd);
              this.delayCd = null;
            }, this.latency);
          }
        }
      });
    }
    if (this.elm.grids) {
      this.grids = this.elm.grids;
    } else if (this.elm.autoGrids) {
      this.grids = this.elm.autoGrids;
    } else {
      this.grids = null;
    }
    if (this.elm.dataselection && this.elm.dataselection.length) {
      if (!this.elm.val) {
        this.elm.val =
          this.elm.dataselection[0].element.datarow[this.elm._eid.str];
      }
      this.selection = this.elm.dataselection.find(
        (elem) => elem.element.datarow[this.elm._eid.str] === this.elm.val,
      );
      if (!this.selection) this.selection = this.elm.dataselection[0];
    }
    if (this.elm.datacols) {
      //   this.elm.datarows = this.dS.arr.filter(
      //     elm => elm.def.host_id === this.elm._eid.str
      //   );
      this.elm.datarows.sort((x, y) => {
        let a, b;
        if (x.home) {
          a = x.home.absnum;
        } else {
          a = x.datarow[this.elm.datacols[0].field] || 900000000000000;
        }
        if (y.home) {
          b = y.home.absnum;
        } else {
          b = y.datarow[this.elm.datacols[0].field] || 900000000000000;
        }
        if (x.datarow.design) {
          a = x.datarow.design[0];
        }
        if (y.datarow.design) {
          b = y.datarow.design[0];
        }
        if (_isNumberValue(a) && _isNumberValue(b)) {
          a = Number(a);
          b = Number(b);
        }
        if (a > b) return 1;
        if (a < b) return -1;
      });
    }
  }
  toggleFullScreen() {
    this.isFullscreen = !this.isFullscreen;
    this.vS.isFullscreen = this.isFullscreen;
    this.vS.onlyMain = this.isFullscreen;

    // if (this.isFullscreen) {
    //   if (screenfull.isEnabled) {
    //     screenfull.request();
    //   }
    // } else {
    //   if (screenfull.isEnabled) {
    //     screenfull.exit();
    //   }
    // }
  }

  sortDataHost(col) {
    console.log(this.elm, col);
    const key = col.field;
    this.elm.datarows.sort((x, y) => {
      let a, b;
      a = x.datarow[key];
      b = y.datarow[key];
      if (_isNumberValue(a) && _isNumberValue(b)) {
        a = Number(a);
        b = Number(b);
      }
      if (a > b) return 1;
      if (a < b) return -1;
    });
  }

  onSelectionChange(event) {
    this.elm.val = event.value.element.datarow[this.elm._eid.str];
    this.input();
  }
  onSelectionTap() {
    this.elm.val = this.selection.element.datarow[this.elm._eid.str];
    this.input();
  }

  clickViewPort() {
    if (this.elm.construct) {
      this.elm.construct.click();
    }
  }
  input() {
    this.elm.parent.onInputChange();
    this.dS.selectedProject.update({ input: this.elm });
  }
  edit(tab?) {
    if (tab) this.elm.selectedTab1 = tab;
    let elm = this.dS.obj[this.elm._eid.str];
    if (elm) {
      this.dS.subject.editElement.next({ elm: elm });
    } else {
      this.dS.subject.editElement.next({ elm: this.elm });
    }
  }
  editParent(tab?) {
    this.elm.parent.selectedTab1 = tab;
    this.dS.subject.editElement.next({ elm: this.elm.parent });
  }
}
