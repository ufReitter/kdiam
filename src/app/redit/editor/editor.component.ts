import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabNav } from '@angular/material/tabs';
import { ActivatedRoute, Router } from '@angular/router';
import Dexie from 'dexie';
import { Observable, timer } from 'rxjs';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { environment } from '../../../environments/environment';
import { Elm, ElmNode } from '../../engine/entity';
import { CalculationService } from '../../services/calculation.service';
import { DataService } from '../../services/data.service';
import { ReditService } from '../redit.service';
var deepClone = Dexie.deepClone;

@Component({
  selector: 'kd-editor',
  standalone: false,
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditorComponent implements OnInit, OnChanges, OnDestroy {
  oldstrs: any;
  savestatus: string;
  progressColor: ThemePalette = 'primary';
  progressMode: ProgressSpinnerMode = 'determinate';
  progressValue = 0;

  code = 'function x() {\nconsole.log("Hello world!");\n}';
  originalCode = 'function x() { // TODO }';
  calcMode = 'changes';
  myControlLbl = new UntypedFormControl();
  filteredOptionsLbl: Observable<string[]>;
  myControlLng = new UntypedFormControl();
  filteredOptionsLng: Observable<string[]>;
  myControlCpt = new UntypedFormControl();
  filteredOptionsCpt: Observable<string[]>;
  defJson = false;
  defJsonStr: string;
  localeSubject: any;
  editElementSubject: any;
  filterSelect = ['Key', 'Bild', 'Figur', 'Code', '**'];
  viewMode = 'store-root';
  selectedTab1 = 0;
  selectedTab2: number;
  routeParamsSub: any;
  localeSub: any;
  routeId: string;
  align = 'left';
  defArray: any = [];
  setArray: any = [];
  valArray: any = [];
  constructs: [];
  editName: boolean;
  funcName: string;
  warnFormat: boolean;
  warnKey: boolean;
  warnSlug: boolean;
  warnNum: boolean;
  warnName: boolean;
  readySlug: string;
  selectedGrid: any;
  selectedSrc: any;
  selectedConstruct: any;
  key: string;
  init: string;
  changes: string;
  functionBody: string;
  codeErrors: any = [];
  codeDirty: boolean;
  dataHostOption: any;
  figureOption: any;
  volumeOption: any;
  num: number[] = [];
  volTocEntries: any[];
  elmTocEntries: any[];
  selectedFile: any;
  latex: string;
  render: string;
  headingFormat = 3;
  codeFullView: boolean;
  srcs: any = [];

  delayCodeCheck: any;

  thumbImage: any;
  isImageLoading = true;

  multiSnack: MatSnackBar;

  codeMode: string;
  source: string;

  chldrView: string;

  editor: any;
  javascriptDefaults: any;
  typescriptDefaults: any;
  activeSrc: string;

  slug: string;
  volNode: ElmNode;
  volNodeParent: ElmNode;

  colFieldsIsClean = true;

  @Input() elm: Elm;
  @Input() elms: Elm[] = [];
  @Input() set: any;
  @Input() setDef: any;
  @Input() parent: Elm;
  view: string;
  @Input() tab: any;
  @Input() childrenView: any;

  @ViewChild(MatTabNav) matTabNav: MatTabNav;

  @ViewChild('metaAutoSize') metaAutoSize: CdkTextareaAutosize;
  @ViewChild('cptAutoSize')
  bdyAutoSize: CdkTextareaAutosize;
  @ViewChild('cmInit')
  cmInitEl: any;
  @ViewChild('cmChanges')
  cmChangesEl: any;

  cmInit: any;
  cmChanges: any;

  quill: any;

  animal: string;
  name: string;
  mml: any;

  isBrowser: boolean;
  paramsSubject: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public dialog: MatDialog,
    private snackbar: MatSnackBar,
    private cd: ChangeDetectorRef,
    public pS: ProfileService,
    public vS: ViewService,
    public dS: DataService,
    public rS: ReditService,
    public cS: CalculationService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
  ) {
    this.isBrowser = true;
    if (isPlatformBrowser(this.platformId)) {
      let parts;
      parts = this.dS.selVol.attrib.editorLocales?.replace(' ', '').split(',');
      if (parts && parts.length > 0 && parts[0].length > 1) {
        // this.dS.locales = parts;
      }
    }
  }

  ngOnInit() {
    if (!this.elm) {
      this.elm = this.dS.arr[0];
    }
    if (this.elm) {
      if (
        !this.elm.srcs &&
        !this.elm.i18n.de.strs?.lbl &&
        this.elm.i18n.de.strs?.bdy
      ) {
        this.elm.ident =
          this.elm.i18n.de.strs?.lbl ||
          this.elm.i18n.de.strs?.bdy
            .replace(/<(?:.|\n)*?>/gm, '')
            .substring(0, 56);
      }

      if (this.parent) {
        this.set =
          this.set ||
          this.elm.sets.find(
            (set) => set.parent && set.parent._eid.str === this.parent._eid.str,
          ) ||
          this.elm.sets[0];
      }
    }

    this.makeTocEntries();
    this.localeSubject = this.dS.subject.locale.subscribe((locale) => {
      this.oldstrs = { ...(this.elm.i18n[this.dS.locale]?.strs || {}) };
      let delay = timer(200).subscribe((t) => {
        this.slug = this.volNode?.slugs[this.dS.locale] || '';
      });
    });
  }

  ngOnChanges() {
    this.dataHostOption = null;
    this.figureOption = null;
    this.parent = null;
    this.volNode = this.dS.selVol.flatTree.find(
      (nd) => nd.id === this.elm._eid.str,
    );
    if (this.volNode) {
      this.volNodeParent = this.volNode.parents?.at(-1);
    }
    this.slug = this.volNode?.slugs[this.dS.locale] || '';
    this.latex = this.elm.equ?.tex;
    if (this.elm.dataHost) {
      this.dataHostOption = this.elm.dataHost;
    }
    if (this.elm.datacols) {
      this.dataHostOption = 'isHost';
    }
    if (this.elm.table) {
      this.dataHostOption = 'isTable';
    }
    if (this.elm.figure) {
      if (this.elm.figure.ext === 'jpg' || this.elm.figure.ext === 'png') {
        this.figureOption = 'image';
      }
      if (this.elm.figure.ext === 'svg') {
        this.figureOption = 'svg';
      }
      if (this.elm.figure.ext === 'flac' || this.elm.figure.ext === 'm4a') {
        this.figureOption = 'sound';
      }
      if (this.elm.figure.ext === 'mp4' || this.elm.figure.ext === 'mov') {
        this.figureOption = 'video';
      }
    }
    if (this.elm.parent) {
      this.parent = this.elm.parent;
    }
    this.oldstrs = { ...(this.elm.i18n[this.dS.locale]?.strs || {}) };
  }

  ngOnDestroy() {
    if (this.editElementSubject) this.editElementSubject.unsubscribe();
    if (this.localeSubject) this.localeSubject.unsubscribe();
    if (this.paramsSubject) this.paramsSubject.unsubscribe();
  }

  async focusout(event, key?) {
    let value = event.target.value;
    if (!key) {
      key = event.target.name;
    } else {
      value = this.elm.txts[key];
    }

    if (value === this.oldstrs[key]) {
      return;
    }
    this.oldstrs[key] = value;
    await this.rS.save(this.elm, key, value, this.dS.locale);
  }

  async save(keypath, index?) {
    const object = Dexie.getByKeyPath(this.elm.def, keypath);
    let value;
    if (index || index === 0) {
      value = object[index];
    }
    this.dS.subject.elmMod.next(this.elm);
    await this.rS.save(this.elm, keypath, value);
  }

  addChanges() {
    if (!this.elm.txts.changes || !this.elm.txts.changes.length) {
      this.elm.txts.changes = [{ date: new Date().toISOString(), txt: '' }];
    } else {
      this.elm.txts.changes.push({ date: new Date().toISOString(), txt: '' });
    }
  }

  onCalcMode(e) {
    this.calcMode = e.source.value;

    switch (e.source.value) {
      case 'calc':
        if (!this.elm.code) this.elm.code = { init: '', changes: '' };
        this.code = this.elm.code.changes;
        this.elm.undos = [];
        break;
      case 'func':
        if (!this.elm.func) {
          this.elm.func = { fname: '', args: [{ key: 'a', default: '0' }] };
        }
        break;
      default:
        break;
    }
  }

  multiEdit(key) {
    let warning = 'Edit ' + this.dS.checked.length + ' Elements?';
    let action = 'Edit';
    const snack = this.snackbar.open(warning, action, {
      duration: 6000,
    });
    snack.onAction().subscribe(() => {
      for (const iterator of this.dS.checked) {
        if (key === 'attributes') {
          iterator.attrib = deepClone(this.elm.attrib);
        } else {
          iterator.txts[key] = this.elm.txts[key];
        }
        this.dS.subject.elmDef.next(iterator);
      }
    });
  }
  saveData() {
    let str = '';
    for (const iterator of this.elm.datarows) {
      if (iterator.datarow && iterator.datarow.artist) {
        str += iterator.datarow.artist + '\t';
      }
      if (iterator.datarow && iterator.datarow.title) {
        str += iterator.datarow.title + '\n';
      }
    }
  }
  ipsum() {
    if (!this.elm.i18n[this.dS.locale].strs.bdy) {
      this.elm.i18n[this.dS.locale].strs.bdy = '';
    }
    let html = this.elm.i18n[this.dS.locale].strs.bdy;
    let ipsum = this.dS.system.txts.IPSUM;

    html = html.concat('<p>' + ipsum + '</p>');
    this.elm.i18n[this.dS.locale].strs.bdy = html;
    this.elm.dirty = true;
  }

  importBdy() {
    if (!this.elm.i18n[this.dS.locale].strs.bdy) {
      this.elm.i18n[this.dS.locale].strs.bdy = '';
    }

    let text = this.elm.txts.bdy.replace(/<(?:.|\n)*?>/gm, '');

    this.elm.i18n[this.dS.locale].strs.mdes = text;
    this.elm.dirty = true;
  }
  onJsonSelected(event) {
    const input = event.target;
    let reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      let def = JSON.parse(String(text));

      let elms = [];

      let elm = this.dS.obj[def.elm._eid];

      if (elm) {
        elm.def = def.elm;
      } else {
        elm = new Elm(def);
        this.dS.obj[elm._eid.str] = elm;
        this.dS.arr.push(elm);
      }
      elms.push(elm);

      if (def.children && def.children.length) {
        for (const iterator of def.children) {
          let child = this.dS.obj[iterator._eid];

          if (child) {
            child.def = iterator;
          } else {
            child = new Elm(iterator);
            this.dS.obj[child._eid.str] = child;
            this.dS.arr.push(child);
          }

          elms.push(child);
        }
      }

      this.dS.populate(elms);

      for (const iterator of elms) {
        iterator.dirty = true;
        this.dS.save(iterator);
      }
    };
    reader.readAsText(input.files[0]);
  }

  saveElement() {
    let def: any = { elm: this.elm.def, children: [] };
    let children = this.dS.allDesc(this.elm);
    let chdef = [];

    if (this.elm.refs) {
      for (const it of this.elm.refs) {
        chdef.push(it.def);
      }
    }
    if (children) {
      for (const it of children) {
        chdef.push(it.def);
      }
    }

    for (const it of chdef) {
      def.children.pushUnique(it);
    }

    this.dS.saveToFileSystem(def, this.elm._eid.str);
  }

  svgChange() {
    this.elm.defSubject.next(this.elm.def);
    this.elm.dirty = true;
  }
  figSizeChange(event) {
    this.elm.figure.size = event.value;
    ++this.elm.figure.version;
    this.elm.dirty = true;
    //this.elm.defSubject.next(this.elm.def);
  }

  onFileSelected(event) {
    this.selectedFile = event.target.files[0];
    this.onUpload();
  }
  async onUpload() {
    const fd = new FormData();

    fd.append('file', this.selectedFile);

    let uuid = '';
    for (let i = 0; i < 32; i++) {
      uuid += Math.floor(Math.random() * 16).toString(16);
    }

    // this.elm.figure = null;

    this.http
      .post(
        '/upload/figure/' + this.elm._eid.str + '?X-Progress-ID=' + uuid,
        fd,
        {
          reportProgress: true,
          observe: 'events',
        },
      )
      .subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progressValue = (100 * event.loaded) / event.total;
        } else if (event.type === HttpEventType.Response) {
          this.progressValue = 0;
          let body: any = event.body;

          if (body.element) {
            body.element.figure.borderless =
              this.elm.figure?.borderless || false;
            body.element.figure.themed = this.elm.figure?.themed || false;
            body.element.figure.size = this.elm.figure?.size || 3;
            body.element.figure.version = this.elm.figure?.version || 0;
            body.element.figure.version++;

            this.elm.figure = body.element.figure;
            this.elm.dirty = true;

            this.elm.task = this.elm.getTask();
            this.dS.table.elms.put(this.elm.def).catch(function (e) {
              // console.error('DatabaseClosed error: ' + e.message);
            });
          }
        }
      });

    if (environment.production) {
      let headers: HttpHeaders = new HttpHeaders();
      headers = headers.append('X-Progress-ID', uuid);

      const time = timer(1000, 1000);
      this.progressValue = 0.0000001;

      const subscribe = time.subscribe((val) => {
        this.http
          .get('/progress', { headers: headers })
          .subscribe((data: any) => {
            if (data.state === 'done') {
              this.progressValue = 0;
              subscribe.unsubscribe();
            }
            if (data.state === 'uploading') {
              this.progressValue = (100 * data.received) / data.size;
            }
          });
      });
    }
  }
  saveImage() {}
  changeToc(vIndex, event) {
    let vol = this.dS.vols[vIndex];
    let entry = this.elmTocEntries[vIndex];
    // console.log(vol,vol.def,entry,this.elmTocEntries)
    if (event.value === 'append') {
      let num = [...vol.children[vol.children.length - 1].num];

      num[num.length - 1] = num[num.length - 1] + 1;

      vol.children.push({ id: this.elm._eid.str, elm: this.elm, num: num });
    } else {
      let toc = this.volTocEntries[vIndex];
      let iSrc = toc.findIndex((entry) => entry.elm === this.elm);
      let iTar = toc.findIndex((entry) => entry.elm === event.value.elm);

      let entrySrc;
      let entryTar = toc[iTar];
      if (iSrc !== -1) {
        entrySrc = toc[iSrc];
      } else {
        entrySrc = {
          elm: this.elm,
          num: [],
        };

        vol.children.push({
          id: this.elm._eid.str,
          elm: this.elm,
          num: entrySrc.num,
        });
      }

      for (let i = 0; i < entryTar.num.length; i++) {
        entrySrc.num[i] = entryTar.num[i];
      }

      entryTar.num[entryTar.num.length - 1] =
        entryTar.num[entryTar.num.length - 1] + 1;

      let delay = timer(500).subscribe((t) => {
        this.elmTocEntries[vIndex] = entrySrc;
      });
    }
    this.dS.subject.volume.next(vol);
    this.makeTocEntries();
    vol.dirty = true;
  }

  clearToc(vIndex) {
    let vol = this.dS.vols[vIndex];
    let entry = this.elmTocEntries[vIndex];

    for (let index = 0; index < vol.children.length; index++) {
      const element = vol.children[index];
      if (element.id === this.elm._eid.str) {
        vol.children.splice(index, 1);
      }
    }
    for (let index = 0; index < this.volTocEntries[vIndex].length; index++) {
      const element = this.volTocEntries[vIndex][index];
      if (element.elm._eid.str === this.elm._eid.str) {
        this.volTocEntries[vIndex].splice(index, 1);
      }
    }
    vol.dirty = true;

    this.elmTocEntries[vIndex] = false;
    if (vol._eid.str === this.dS.selVol._eid.str) {
      this.dS.subject.volume.next(this.dS.selVol);
    }
  }

  tocAction() {}

  navigateToc(vIndex, entry) {
    let vol = this.dS.vols[vIndex];
    this.dS.subject.volume.next(vol);
    this.dS.navigate(this.elm);
  }
  getAbsNum(num) {
    let absnum = '';
    for (let index = 0; index <= 3; index++) {
      absnum += (10000 + (num[index] || 0)).toString();
    }
    return parseInt(absnum);
  }

  makeTocEntries() {
    this.volTocEntries = [];
    for (const vol of this.dS.vols) {
      let entries = vol.children.map((entry) => {
        let numParts = entry.num || [99];
        let newEntry = {
          numeration: numParts.join('.'),
          num: entry.num,
          absnum: this.getAbsNum(numParts),
          elm: this.dS.obj[entry.elm.id],
        };
        return newEntry;
      });

      entries.sort(function (x, y) {
        let a, b;
        a = x.absnum;
        b = y.absnum;
        if (a > b) return 1;
        if (a < b) return -1;
      });

      this.volTocEntries.push(entries);
    }
  }
  dropChildren(event: CdkDragDrop<string[]>) {
    if (event.isPointerOverContainer) {
      moveItemInArray(
        this.elm.children,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      this.elm.children.splice(event.previousIndex, 1);
    }
    this.elm.fillGrids();
    this.dS.setVarKeys(this.elm);
    this.rS.save(this.elm, 'table.children');
  }
  dropDataCols(event: CdkDragDrop<string[]>) {
    if (event.isPointerOverContainer) {
      moveItemInArray(
        this.elm.datacols,
        event.previousIndex,
        event.currentIndex,
      );
    } else {
      this.elm.datacols.splice(event.previousIndex, 1);
    }
    this.rS.save(this.elm, 'table.datacols');
  }
  setToScale() {
    let xDimMax = 0;
    for (const it of this.elm.children) {
      xDimMax = Math.max(xDimMax, it.elm.figure?.dimx);
    }
    if (xDimMax > 0) {
      for (const it of this.elm.children) {
        if (it.elm.figure?.dimx) {
          if (it.elm.figure?.dimx === xDimMax) {
            it.set.figure.magnification = 1;
            it.setDef.figure.magnification = 1;
          } else {
            const s = it.elm.figure.dimx / xDimMax;

            it.set.figure.magnification = s;
            it.setDef.figure.magnification = s;
          }
        }
      }
    }

    console.log(xDimMax);
  }
  addToTable() {
    if (this.dS.checked.length) {
      for (const elm of this.dS.checked) {
        const row = this.elm.table.data.find((r) => r._eid === elm._eid.str);
        if (!row) {
          this.elm.table.data.push({ _eid: elm._eid.str, elm: elm });
        }
      }
      this.dS.clearSelection();
    } else {
      this.elm.table.data.push({});
    }
    this.elm.dirty = true;
  }
  cleanData() {
    for (const col of this.elm.table.cols) {
      delete col.headers;
      delete col.mult;

      for (const row of this.elm.table.data) {
        if (!row[col.field]) {
          if (col.text) {
            row[col.field] = '';
          } else {
            row[col.field] = null;
          }
        }
      }
    }
    for (const it of this.elm.table.data) {
      const toDelete = [];
      for (const key in it) {
        if (Object.prototype.hasOwnProperty.call(it, key)) {
          const element = it[key];
          if (
            !this.elm.table.cols.find((col) => col.field === key) &&
            key !== '_eid' &&
            key !== 'elm'
          ) {
            toDelete.push(key);
          }
        }
      }

      for (const key of toDelete) {
        delete it[key];
      }
      this.elm.dirty = true;
    }
  }
  addToChildren() {
    if (this.dS.checked.length) {
      for (const it of this.dS.checked) {
        if (!it.parent) {
          it.parent = this.elm;
        }
        if (!this.elm.children) {
          this.elm.children = [];
        }

        this.elm.children.push({
          id: it._eid.str,
          elm: it,
          set: {
            state: {},
            figure: {},
            attrib: {},
            parent: this.elm,
          },
          setDef: { state: {}, figure: {}, attrib: {} },
        });
        if (it.sign && this.elm.attrib.examples?.length) {
          for (const ex of this.elm.attrib.examples) {
            let entry = ex.state.find((entry) => entry.id === it._eid.str);
            if (!entry) {
              ex.state.push({
                id: it._eid.str,
                state: it.state || it.set?.state || {},
              });
              this.rS.save(this.elm, 'attrib.examples');
            }
          }
        }
      }

      this.dS.setVarKeys(this.elm);

      this.dS.clearSelection();
    } else {
      let elm = this.dS.addElement('ipsum');
      if (!this.elm.children) {
        this.elm.children = [];
      }
      elm.parent = this.elm;
      this.elm.children.push({ id: elm._eid.str, elm: elm });
      this.rS.save(this.elm, 'attrib.children');
    }

    if (this.elm.view) {
      if (!this.elm.grids) {
        this.elm.setGrids(this.elm.view);
      }
      this.elm.fillGrids();
    }
    this.rS.save(this.elm, 'attrib.children');
  }

  removeChild(index) {
    this.elm.children.splice(index, 1);
    this.rS.save(this.elm, 'attrib.children');
  }

  setChldrView(e) {
    if (e.value === 'calc') {
      if (!this.elm.calc) {
        this.elm.calc = {
          srcs: [],
          version: 1,
        };
      }
      let found = this.elm.calc.srcs.find((src) => src.name === 'changes');
      if (!found) {
        let src = {
          name: 'changes',
          body: '',
        };
        this.elm.calc.srcs.push(src);
        this.srcs.sort(sortSrcs);
      }

      this.rS.save(this.elm, 'calc');
    }
    this.elm.setGrids(e.value);
    this.elm.fillGrids();
    this.rS.save(this.elm, 'view');
  }

  deleteGrids() {
    this.elm.grids = null;

    if (this.elm.children && this.elm.code && !this.elm.grids) {
      this.elm.autoGrids = [
        {
          cols: 1,
          rowHeight: 28,
          name: 'grid1',
          lblWidth: 0,
          signWidth: 0,
          unitWidth: 0,
          buttonWidth: 0,
        },
      ];
    }

    this.elm.dirty = true;
  }
  addGrid() {
    this.elm.grids.push({
      cols: 1,
      rowHeight: 28,
      name: 'grid1',
      lblWidth: 0,
      signWidth: 0,
      unitWidth: 0,
      buttonWidth: 0,
    });

    this.elm.dirty = true;
  }
  removeGrid() {
    if (this.elm.grids.length > 1) {
      this.elm.grids.splice(this.elm.grids.length - 1, 1);
    } else {
      this.deleteGrids();
    }

    this.elm.dirty = true;
  }

  gridChange(grid) {
    // this.elm.fillGrids();
    let def = this.elm.def;

    for (const iterator of this.selectedGrid.children) {
      let child = def.children.find((elm) => iterator.elm._eid.str === elm.id);
      let figureSet;
      if (child.set && child.set.figure) {
        figureSet = child.set.figure;
      } else {
        figureSet = {};
      }
      if (
        iterator.elm.figure &&
        iterator.elm.figure.size &&
        iterator.elm.figure.ext !== 'tex'
      ) {
        this.selectedGrid.rowHeight = Math.max(
          this.selectedGrid.rowHeight,
          this.dS.style.sizes[figureSet.size || iterator.elm.figure.size]
            .width / iterator.elm.figure.ratio,
        );
      }
    }
    this.elm.dirty = true;
  }

  slugValidate(slug, vol, lang) {
    var SLUG_REGEXP = /^([a-z0-9\-]{5,})$/;
    let valid = SLUG_REGEXP.test(slug);
    if (!valid) {
      return false;
    }
    let exists = false;
    for (const snd of vol.flatTree) {
      if (snd.slugs[lang] === slug) {
        exists = true;
      }
    }
    if (!exists) {
      this.readySlug = slug;
      this.warnSlug = false;
    } else {
      this.readySlug = '';
      this.warnSlug = true;
    }

    return !exists;
  }

  slugSuggest() {
    this.slug = this.dS.slugify(this.elm.txts.lbl, this.dS.locale);
    const valid = this.slugValidate(this.slug, this.dS.selVol, this.dS.locale);
    this.warnSlug = !valid;
    if (valid) {
      this.readySlug = this.slug;
    } else {
      this.readySlug = '';
    }
  }

  slugChange() {
    const oldSlug = this.volNode.slugs[this.dS.locale] || '';
    if (this.dS.slug[this.dS.locale][oldSlug]) {
      delete this.dS.slug[this.dS.locale][oldSlug];
    }
    this.volNode.slugs[this.dS.locale] = this.readySlug;
    this.dS.slug[this.dS.locale][this.readySlug] = this.elm;
    this.elm.i18n[this.dS.locale].strs.slug = this.readySlug;
    this.elm.i18n[this.dS.locale].strs.dirty = true;
    this.readySlug = '';
    this.dS.selVol.dirty = true;
    this.dS.save(this.dS.selVol);
    this.dS.navigate(this.elm, 'view');
  }

  defChange(query) {
    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        let value = query[key];
        if (key === 'unit' && value) {
          value = value.replace(/\s\/\s/g, '&#8239;/&#8239;');
        }
        this.elm.state[key] = value;
      }
    }
    this.elm.dirty = true;
  }
  formatChange(target, format) {
    let numberFormatRegex = /^(\d+)?\.((\d+)(-(\d+))?)?$/;
    this.warnFormat = false;
    var parts = format.match(numberFormatRegex);
    if (parts === null) {
      this.warnFormat = true;
    } else {
      if (parts[3] && parts[5] && parts[3] > parts[5]) {
        this.warnFormat = true;
      }
    }
    if (!format) {
      this.warnFormat = false;
    }
    if (!this.warnFormat) {
      if (target === 'set') {
        this.set.state.format = format;
        this.setDef.state.format = format;
        let parent = this.set.parent;
        if (parent) {
          parent.dirty = true;
          console.log(this.elm.dirty);
        }
      }
      if (target === 'elm') {
        this.elm.state.format = format;
        this.elm.dirty = true;
      }
    }
  }

  keyValidate(event) {
    let found = this.dS.arr.find((elm) => elm.key === event);
    if (found) {
      this.warnKey = true;
    } else {
      this.warnKey = false;
    }
    if (event === this.elm.key) {
      this.warnKey = false;
      this.elm.misc.key = null;
      this.elm.dirty = true;
    } else {
      if (!this.warnKey) {
        this.elm.key = this.key;
        this.elm.dirty = true;
      }
    }
  }
  keyChange(event) {
    let found;

    if (!this.warnKey && !found) {
      this.elm.misc.key = this.key;
      this.elm.dirty = true;
    }
  }

  srcChange(e) {
    let src;
    if (e.value) {
      src = this.srcs.find((s) => s.name === e.value);
      if (!src) {
        src = { name: e.value, body: '' };
        this.srcs.push(src);
      }
    } else {
      src = e;
    }
    this.selectedSrc = src;
    this.activeSrc = src.name;
    this.source = this.selectedSrc.body;

    let lines = [];

    if (this.typescriptDefaults) {
      lines = ['let _ = {'];
      if (src.name === 'init' || src.name === 'changes') {
        for (const it of this.elm.children) {
          if (it.set && it.set.name) {
            lines.push(it.set.name + ': <State>{},');
          }
        }
        lines.push('}');

        this.typescriptDefaults.addExtraLib(
          lines.join('\n'),
          'ts:filename/locs.d.ts',
        );
      }
    }
    return src;
  }

  addFunc() {
    let design = this.dS.system.txts.NEW_FUNCTION;
    let test = design;
    let suffix = 0;
    let exists = true;
    while (exists) {
      let found = this.srcs.find((it) => it.name === test);
      if (found) {
        suffix = ++suffix;
        test = design + '-' + suffix;
        exists = true;
      } else {
        exists = false;
        design = test;
      }
    }
    let entry = { name: design, body: '' };
    this.srcs.push(entry);
    this.srcChange(entry);
    this.srcs.sort(sortSrcs);
    this.elm.srcs = this.srcs;
    this.elm.dirty = true;
  }
  removeFunc() {
    let arr;

    arr = this.srcs;

    let index = arr.findIndex((it) => it === this.selectedSrc);

    arr.splice(index, 1);

    if (index > arr.length - 1) {
      index = arr.length - 1;
    }

    if (!arr.length) {
      if (this.srcs.length) {
        this.srcChange(this.srcs[this.srcs.length - 1]);
      }
      if (!this.elm.project.data.length) {
        this.selectedSrc = null;
      }
    } else {
      this.srcChange(arr[index] || arr[0]);
    }

    this.elm.srcs = this.srcs;
    this.elm.dirty = true;
  }
  editFuncName() {
    this.funcName = this.selectedSrc.name;
    this.editName = true;
  }

  validateName(e) {
    this.warnName = false;
    for (const it of this.srcs) {
      if (it.name === e && it !== this.selectedSrc) {
        this.warnName = true;
      }
    }
  }
  changeName(e) {
    this.editName = false;
    if (!this.warnName) {
      this.editName = false;
      this.selectedSrc.name = this.funcName;
      this.srcs.sort(sortSrcs);
      this.elm.srcs = this.srcs;
      this.elm.dirty = true;
    }
  }
  onInitMonaco(editor) {
    this.editor = editor;
  }

  codeChange(name, event?) {
    if (!event) return false;
    if (this.source !== this.selectedSrc.body) {
      this.codeDirty = true;
    }
  }
  applyCode() {
    if (this.delayCodeCheck) clearTimeout(this.delayCodeCheck);
    this.selectedSrc.body = this.source;
    this.http
      .post('/api/calculations/lint/' + this.elm._eid.str, this.srcs)
      .subscribe((res) => {
        let body: any = res;
        console.log(body);
        if (body.success) {
          this.codeErrors = body.errors;
          this.codeDirty = false;
          if (!this.elm.children) this.elm.children = [];
          if (!this.elm.job) {
            this.elm.job = this.cS.getJob(this.elm);
          }
          for (let index = 0; index < this.srcs.length; index++) {
            this.srcs[index].body = body.srcs[index].body;
          }
          this.source = this.selectedSrc.body;
          this.elm.srcs = this.srcs;
          if (!body.errors.length) {
            this.cS.applyCode(this.elm.job, this.srcs);

            let delay = timer(500).subscribe((t) => {
              this.cS.doJob(this.elm.job);
            });
          }

          this.elm.dirty = true;
        } else {
          console.log(this.codeErrors);
        }
      });
  }

  isNumber(val) {
    return typeof val === 'number';
  }

  navigateDataHost() {
    if (this.dataHostOption === 'isHost') {
      this.dS.navigate(this.elm);
    } else {
      this.dS.navigate(this.dataHostOption);
    }
  }
  setToView() {
    this.router.navigate([{ outlets: { sidebar: null } }]);
  }
  viewElement(event, element) {
    if (event.cntrKey) {
      this.checkElement(element);
      return true;
    }
    if (event.altKey && element.home) {
      this.dS.navigate(element.home);
    } else {
      if (!element.toc) {
        this.dS.navigate(element);
      }
    }
  }
  edit(element, tab?) {
    element.selectedTab1 = tab;
    this.dS.subject.editElement.next({ elm: element });
  }
  checkElement(elm) {
    elm.checked = !elm.checked;
    if (elm.checked) {
      this.dS.checked.pushUnique(elm);
    } else {
      const index = this.dS.checked.findIndex((e) => e._eid.equals(elm._eid));
      if (index !== -1) {
        this.dS.checked.splice(index, 1);
      }
    }
    this.dS.subject.checked.next(this.dS.checked);
  }
  filter(query?) {
    this.dS.filter(query);
  }
  onPublishedChange(event) {
    switch (event.value) {
      case 'user':
        this.elm.attrib.published = event.value;

        break;

      default:
        this.elm.attrib.published = event.value;
        break;
    }
    this.elm.dirty = true;
    this.elm.getTask();
  }
  onLocalesChange(event) {
    let pParts = this.elm.attrib.publicLocales?.replace(' ', '').split(',');
    let eParts = this.elm.attrib.editorLocales?.replace(' ', '').split(',');

    this.elm.dirty = true;
  }
  onRoleChange(event) {
    switch (event.value) {
      case 'none':
        delete this.elm.attrib.role;

        break;
      case 'volume':
        this.elm.attrib.role = event.value;
        this.elm.tree = this.elm.tree || [];

        break;

      default:
        this.elm.attrib.role = event.value;
        break;
    }

    this.elm.dirty = true;
    this.elm.getTask();
  }
  onFigureOptionChange(event) {
    this.figureOption = event.value;
    this.elm.figure = null;
    let datarow = null;
    switch (event.value) {
      case 'none':
        this.elm.figure = null;
        break;
      case 'image':
        // this.elm.figure = { ext: 'png', size: 3, version: 0 };
        break;
      case 'video':
        this.elm.figure = {};
        break;
      case 'sound':
        this.elm.figure = { ext: 'm4a' };
        break;
      case 'svg':
        this.elm.figure = { ext: 'svg', rot: 0, size: 6 };

        break;
      case 'latex':
        if (!this.elm.figure) {
          this.elm.figure = { ext: 'tex', size: 3, ratio: 1 };
        }
        if (!this.elm.datarow) {
          this.elm.datarow = datarow;
        }
        this.latex = 'E=mc^2';
        this.latexChange();
        break;
      case 'isHost':
        if (!this.elm.datacols) {
          this.elm.datacols = [
            {
              field: 'field0',
            },
            {
              field: 'field1',
            },
          ];
        }
        break;
    }
    this.elm.task = this.elm.getTask();
    this.elm.dirty = true;
  }

  latexChange(event?) {
    if (!this.latex) {
      delete this.elm.equ;
    } else {
      if (!this.elm.equ) {
        this.elm.equ = {};
      }
      if (this.latex !== this.elm.equ.tex) {
        let body = { latex: this.latex, mml: this.mml };

        this.http
          .post('/api/typeset/' + this.elm._eid.str, body)
          .subscribe((res) => {
            let body: any = res;
            if (body.success) {
              this.elm.equ = body.equ;
              this.elm.equ.tex = this.latex;
              this.elm.dirty = true;
            } else {
              this.elm.dirty = false;
              console.log(body);
            }
          });
      }
    }
  }
  changeColMult(e, col) {
    if (e) {
      col.headers = [{ val: 1 }, { val: 1 }, { val: 1 }];
    }
    col.mult = e;
    this.elm.dirty = true;
  }
  changeTable(e, target) {
    if (e < 1) {
      return;
    }
    let arr = this.elm.table[target];
    if (e > arr.length) {
      arr.length = e;
      for (let i = 1; i < arr.length; i++) {
        let it = arr[i];
        let last = arr[i - 1];
        if (!it) {
          arr[i] = it = deepClone(last);
        }
        if (target === 'cols') {
          it.field = (i + 1).toString();
        }
      }
    }
    if (e < arr.length) {
      arr.length = e;
    }
    this.elm.dirty = true;
  }
  changeRows(e) {
    if (e < 1) {
      return;
    }

    let rs = this.elm.table.data;
    // this.elm.dirty = true;
  }
  onDatahostChange(event) {
    switch (event.value) {
      case 'none':
        this.elm['host_id'] = null;
        this.elm.datacols = null;
        this.elm.datarow = null;
        this.elm.table = null;
        break;
      case 'isTable':
        if (!this.elm.table) {
          this.elm.table = {
            cols: [
              {
                header: 'Wert 1',
                field: 'field1',
              },
              {
                header: 'Wert 2',
                field: 'field2',
              },
              {
                header: 'Wert 3',
                field: 'field3',
              },
            ],
            data: [
              {
                field1: 0,
                field2: 0,
                field3: 0,
                name: 'Wert A',
                id: 1,
                order: 1,
              },
              {
                field1: 0,
                field2: 0,
                field3: 0,
                name: 'Wert B',
                id: 2,
                order: 2,
              },
            ],
          };
        }
        break;
      case 'isHost':
        if (!this.elm.datacols) {
          this.elm.datacols = [
            {
              field: 'field0',
            },
            {
              field: 'field1',
            },
          ];
        }
        break;
      default:
        this.elm['host_id'] = event.value._eid.str;
        if (!this.elm.datarow) {
          this.elm.datarow = {};
        }
        for (const iterator of event.value.datacols) {
          this.elm.datarow[iterator.field] = null;
        }
        if (this.elm.datarow.designs === null) {
          this.elm.datarow.designs = [];
        }
        this.elm.dataHost = event.value;
        this.elm.dataHost.datarows.push(this.elm);
        this.elm.dataHost.defSubject.next(this.elm.dataHost.def);
        this.elm.task = this.elm.getTask();
        break;
    }
    this.elm.task = this.elm.getTask();
    this.elm.dirty = true;
  }
  colWidthChange(col, event) {
    col.width = event;
    this.elm.dirty = true;
  }
  colFieldChange(col, event) {
    if (!this.elm.datarows || !this.elm.datarows.length) {
      col.field = event;
      this.elm.dirty = true;
    }
  }
  onTabChange(e) {
    const keyPath = 'edit.' + this.elm._eid.str + '.tab';
    this.pS.pref.save({ [keyPath]: e });
  }
  onTabChangeDone() {
    this.cd.detectChanges();

    if (this.editor) {
      this.editor.layout();
    }
  }
  onSetMode(event) {
    const keyPath = 'edit.' + this.elm._eid.str + '.setMode';
    this.pS.pref.save({ [keyPath]: event.value });
  }
  onQuillEditorCreated(e) {}
  onQuillContentChanged(e) {
    if (e.source === 'newref') {
      // this.openElementDialog({ model: 'Reference', id: 'new' })
    }
    if (e.source === 'user') {
      // this.isDirty = true;
    }
  }
  onQuillSelectionChanged(e) {}
}

function sortSrcs(x, y) {
  let a, b;
  if (x.name === 'init') {
    a = 'aaaa';
  } else if (x.name === 'changes') {
    a = 'aaab';
  } else {
    a = x.name.toLowerCase();
  }
  if (y.name === 'init') {
    b = 'aaaa';
  } else if (x.name === 'changes') {
    b = 'aaab';
  } else {
    b = x.name.toLowerCase();
  }
  b = y.name.toLowerCase();
  if (a > b) return 1;
  if (a < b) return -1;
}
