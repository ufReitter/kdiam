import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges } from '@angular/core';
import { timer } from 'rxjs';
import { CalcService } from 'src/app/calc/calc.service';
import { Elm } from 'src/app/engine/entity';
import { CalculationService } from 'src/app/services/calculation.service';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { ResultsConvention } from '../../calc/render-lib/module';

const rCon = new ResultsConvention();

declare const monaco: any;

@Component({
  selector: 'kd-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.css'],
})
export class CodeComponent implements OnChanges {
  @Input() elm: Elm;
  show = true;
  calc: any;
  srcs: any;
  srcsNew: any = [
    {
      name: 'init',
      body: '',
      ext: 'ts',
    },
    {
      name: 'changes',
      body: '',
      ext: 'ts',
    },
  ];
  selectedSrc: any;
  activeSrc: string = 'changes';
  source: string = '';
  typescriptDefaults: any;
  editName: boolean;
  funcName: string;
  warnName: boolean;
  codeDirty: boolean;
  codeError: boolean;
  codePending: boolean;
  codeErrors: any;
  editor: any;

  monaco: any;
  javascriptDefaults: any;

  constructor(
    private http: HttpClient,
    public pS: ProfileService,
    public vS: ViewService,
    public dS: DataService,
    public cSold: CalculationService,
    public cS: CalcService,
  ) {}

  ngOnChanges(): void {
    this.calc = this.elm.calc;
    if (this.elm.srcs && !this.elm.srcs.length) {
      this.elm.srcs = null;
    }
    if (this.elm.calc.srcs && !this.elm.calc.srcs.length) {
      this.elm.calc.srcs = null;
    }
    this.srcs = this.elm.calc.srcs || this.srcsNew;
    this.srcChange(
      this.pS.pref.edit[this.elm._eid.str]?.activeSrc || this.activeSrc,
    );
  }

  srcChange(e) {
    let src;
    src = this.srcs.find((s) => s.name === e);
    if (!src) {
      src = { name: e, body: '', ext: 'ts' };
      this.srcs.push(src);
    }

    this.pS.pref.save({ ['edit.' + this.elm._eid.str + '.activeSrc']: e });

    this.selectedSrc = src;
    this.activeSrc = src.name;
    this.source = this.selectedSrc.body;
    const init = this.srcs.find((s) => s.name === 'init');
    const initSrc = init?.body || '';

    if (
      (window as any).monaco &&
      monaco.languages.typescript.typescriptDefaults
    ) {
      var libUri =
        'ts:filename/' + this.elm._eid.str + this.activeSrc + '.d.ts';
      let lines = ['let pts = [];', 'let _ = {'];
      if (
        this.elm?.children &&
        (src.name === 'init' || src.name === 'changes')
      ) {
        for (const it of this.elm.children) {
          if (it.set && it.set.name) {
            lines.push(it.set.name + ': <Io>{},');
          }
        }
        lines.push('}');

        for (const it of this.elm.children) {
          if (it.set && it.set.name) {
            lines.push('let ' + it.set.name + ' = <Io>{};');
          }
        }
        if (this.activeSrc === 'changes') {
          const search = /const\s(.*?)\s=\snew\sIo/;
          const regex = new RegExp(search, 'g');
          let matches,
            output = [];
          while ((matches = regex.exec(initSrc))) {
            output.push(matches[1]);
          }
          for (const it of output) {
            // lines.push('let ' + it + ' = <Io>{};');
          }
        }

        monaco.languages.typescript.typescriptDefaults.addExtraLib(
          lines.join('\n'),
          libUri,
        );

        // console.log(lines.join('\n'));
      }
    }
    return src;
  }

  onInitMonaco(editor) {
    this.editor = editor;
    // compiler options

    // monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true,
    });
    // validation settings
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
    this.srcChange(
      this.pS.pref.edit[this.elm._eid.str]?.activeSrc || this.activeSrc,
    );
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
      this.elm.calc.srcs = this.srcs;
      this.elm.dirty = true;
      // this.dS.subject.elmDef.next(this.elm);
    }
  }

  applyCode() {
    this.selectedSrc.body = this.source;
    let del = true;
    for (const it of this.srcs) {
      if (it.body) del = false;
    }

    if (del) {
      delete this.elm.calc.srcs;
      delete this.elm.srcs;
      delete this.elm.view;
      this.elm.dirty = true;
      return;
    }
    // if (this.selectedSrc.body !== this.source) {
    //   this.elm.dirty = true;
    // }
    if (this.elm.attrib.asc) {
      this.codeDirty = false;
      this.codePending = true;
      const ios = ['displayProps'];
      for (const it of this.elm.children) {
        if (it.set.name) {
          ios.push(it.set.name);
        }
      }
      const body = {
        srcs: this.srcs,
        pts: this.elm.attrib.ptsCount || 0,
        lines: this.elm.attrib.linesCount || 0,
        ios: ios,
        rCon: rCon,
      };
      this.http
        .post('/api/calculations/wasm/' + this.elm._eid.str, body)
        .subscribe((res) => {
          let body: any = res;
          if (body.success) {
            this.calc.version++;
            this.elm.dirty = true;
            this.codeErrors = body.errors;
            this.codePending = false;
            if (!this.elm.children) this.elm.children = [];
            for (let i = 0; i < this.srcs.length; i++) {
              if (this.srcs[i].body !== body.srcs[i].body) {
                this.srcs[i].body = body.srcs[i].body;
              }
            }
            this.source = this.selectedSrc.body;
            this.elm.calc = this.elm.calc || { version: 1 };
            this.elm.calc.srcs = this.srcs;
            if (this.elm.dirty) {
              // this.dS.subject.elmDef.next(this.elm);
            }

            this.codeError = false;
            this.cS.compilerErrors = '';

            console.log('asc compiler stats', body.stats);
            if (this.elm.job) {
              this.cS.initCalcSubject(this.elm);
            }
          } else {
            // this.elm.dirty = false;
            this.codeError = true;

            this.cS.compilerErrors = body.error.replace(/\n/g, '<br>');
            console.log(body.error);
          }
        });
    } else {
      this.http
        .post('/api/calculations/lint/' + this.elm._eid.str, this.srcs)
        .subscribe((res) => {
          let body: any = res;
          console.log(body);
          if (body.success) {
            this.calc.version++;
            this.elm.dirty = true;
            this.codeErrors = body.errors;
            this.codeDirty = false;
            if (!this.elm.children) this.elm.children = [];
            if (!this.elm.job) {
              this.elm.job = this.cSold.getJob(this.elm);
            }
            for (let index = 0; index < this.srcs.length; index++) {
              this.srcs[index].body = body.srcs[index].body;
            }
            this.source = this.selectedSrc.body;
            this.elm.calc = this.elm.calc || { version: 1 };
            this.elm.calc.srcs = this.srcs;
            if (!body.errors.length) {
              this.cSold.applyCode(this.elm.job, this.srcs);

              let delay = timer(500).subscribe((t) => {
                this.cSold.doJob(this.elm.job);
              });
            }

            // this.dS.subject.elmDef.next(this.elm);
          } else {
            // this.elm.dirty = false;
            console.log(this.codeErrors);
          }
        });
    }
  }
  codeChange(name, event?) {
    if (!event) return false;
    if (this.source !== this.selectedSrc.body) {
      this.codeDirty = true;
    }
  }
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
