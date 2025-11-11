import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { ReditService } from '../redit.service';

@Component({
  selector: 'kd-history',
  standalone: false,
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
})
export class HistoryComponent implements OnChanges, OnDestroy {
  @Input() elm: Elm;
  selected: any;
  maxCount = 99;
  table = {
    full: true,
    rowclick: true,
    cols: [
      {
        field: 'date',
        header: 'DATE',
        mode: 'date',
        text: true,
        sortable: true,
      },
      {
        field: 'user',
        header: 'USER',
        mode: 'user',
        text: true,
        sortable: true,
      },
      {
        field: '_out',
        header: 'OUTDATED',
        align: 'center',
        mode: 'check',
        text: true,
        sortable: true,
      },
      {
        field: '_del',
        header: 'DELETED',
        align: 'center',
        mode: 'check',
        text: true,
        sortable: true,
      },
      {
        field: 'test',
        header: 'Test',
        align: 'center',
        mode: 'radio',
        text: true,
      },
    ],
    data: [],
  };
  tableRefresh: string;
  tableSelect = 0;
  rootElm: Elm;
  sets: any = [];
  glossary: Elm;
  gl: any = [];
  glossaryItem: any;
  i18n: any;
  fromLocale = 'de';
  toLocale = 'en';
  from: any = {};
  to: any = {};
  vars = [];
  refs = [];
  ident = '';
  translationPending: string;
  glossaryPending: boolean;
  isCurrent: boolean;
  glossaryFrom: string;
  glossaryTo: string;
  glossaryApi: string;
  warnGlossary: boolean;
  warnElmsLength: boolean;
  showFrom: boolean;
  noViewElement = true;
  glossaryMode: string = 'direct';
  signReplaces: any = [];
  dimSubject: any;

  wrapperElm: any;

  kind = 'de';

  editElement: Subscription;

  constructor(
    private http: HttpClient,
    public router: Router,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
    public rS: ReditService,
  ) {}

  ngOnInit() {}

  async ngOnChanges() {
    this.elm = this.elm || this.dS.selElm;
    // console.log('ngOnChanges', this.elm._eid.str);
    await this.rS.getHistory(this.elm, this.kind);
    this.editElement = this.dS.subject.editElement.subscribe((elm) => {
      if (elm && elm !== this.elm) {
        // console.log('editElement', sub.elm._eid.str);
        this.elm = elm;
        this.rS.getHistory(this.elm, this.kind);
      }
    });
  }

  ngOnDestroy() {
    if (this.editElement) this.editElement.unsubscribe();
    // this.pS.pref.snav.history = false;
    // this.dS.subject.snav.next(this.pS.pref.snav);
    // if (this.elm?.dirty) {
    //   this.elm.defSubject.next(this.elm.def);
    //   this.dS.save(this.elm);
    // }
  }

  async changeKind(kind) {
    this.kind = kind;
    await this.rS.getHistory(this.elm, this.kind);
  }

  selectEntry(elm) {
    this.elm.history.index = this.elm.history.entries.findIndex(
      (ent) => ent.elm === elm,
    );
    this.elm.history.active = this.elm.history.entries[this.elm.history.index];
  }
  rowclick(e) {
    console.log(e);
    this.elm.history.index = this.elm.history.entries.findIndex(
      (ent) => ent.elm._eid.str === e.id,
    );
    this.elm.history.active = this.elm.history.entries[this.elm.history.index];
  }
  setRootElm(elm) {
    this.ident =
      elm.txts.lbl ||
      elm.txts.bdy?.replace(/<(?:.|\n)*?>/gm, '').substring(0, 145) ||
      elm._eid.str;

    this.elm = elm;
    this.elm.history = {};
    this.elm.history = {
      active: { elm: elm },
      index: 0,
      entries: [{ elm: elm }],
    };

    this.table.data = [
      {
        id: this.elm._eid.str,
        date: this.elm.updated_at,
        user: this.elm.updated_id,
      },
    ];
  }
  next() {
    if (this.elm.history.active?.dirty) {
      this.elm.history.active.defSubject.next(this.elm.history.active.def);
      this.dS.save(this.elm.history.active);
    }
    if (this.elm.history.index < this.elm.history.entries.length - 1) {
      this.elm.history.index++;
    }
    this.elm.history.active = this.elm.history.entries[this.elm.history.index];

    this.tableRefresh = this.elm.history.active.elm._eid.str;
  }
  prev() {
    if (this.elm.history.active?.dirty) {
      this.elm.history.active.defSubject.next(this.elm.history.active.def);
      this.dS.save(this.elm.history.active);
    }
    if (this.elm.history.index > 0) {
      this.elm.history.index--;
    }
    this.elm.history.active = this.elm.history.entries[this.elm.history.index];
    this.tableRefresh = this.elm.history.active.elm._eid.str;
  }
  setOutdate(e) {}
  setDelete(e) {}

  onCount(e) {
    this.maxCount = e;
  }
  viewElement(e) {
    if (e.altKey) {
      this.router.navigate([
        {
          outlets: {
            sidebar: ['edit', this.rootElm._eid.str],
          },
        },
      ]);
    } else {
      this.router.navigate([this.dS.locale, this.rootElm._eid.str]);
    }
  }
  createGl() {
    let gl = [];

    for (const it of this.glossary.def.table.data) {
      const gapi = it.gapi.map(
        (item) => item.charAt(0).toUpperCase() + item.slice(1),
      );
      gl.push({
        en: it.en.charAt(0).toUpperCase() + it.en.slice(1),
        gapi: gapi,
      });
    }

    for (const elm of this.dS.arr.filter(
      (e) =>
        e.attrib.glossary &&
        e.i18n.en.lbl.toLowerCase() !== e.i18n.en.gapi[0].toLowerCase(),
    )) {
      const gapi = elm.i18n.en.gapi.map(
        (item) => item.charAt(0).toUpperCase() + item.slice(1),
      );
      gl.push({
        en: elm.i18n.en.lbl.charAt(0).toUpperCase() + elm.i18n.en.lbl.slice(1),
        gapi: gapi,
      });
    }

    return gl;
  }
  replaceGlossary(str) {
    for (const it of this.gl) {
      for (const gl of it.gapi) {
        str = str.replaceAll(gl, it.en);
        str = str.replaceAll(gl.toLowerCase(), it.en.toLowerCase());
      }
    }
    return str;
  }
  getTex() {
    this.to.tex = this.elm.equ.tex;
    this.checkTex();
  }
  checkTex() {
    if (this.elm.equ?.tex && !this.to.tex) {
      this.getTex();
    } else {
      this.findSigns();
    }
  }
  findSigns() {
    let mainFrom, mainTo, subFrom, subTo, signFrom, signTo;
    const regexSub = new RegExp('<sub>(.*?)</sub>');
    this.signReplaces = [];
    for (const elm of this.dS.arr.filter((e) => e.i18n[this.toLocale].sign)) {
      signFrom = elm.sign;
      signTo = elm.i18n[this.toLocale].sign;
      mainFrom = signFrom.split('<')[0];
      mainTo = signTo.split('<')[0];
      subFrom = regexSub.exec(signFrom)[1];
      subTo = regexSub.exec(signTo)[1];
      const searchesFrom = [
        signFrom,
        mainFrom + '_' + subFrom,
        mainFrom + '_{' + subFrom + '}',
      ];
      const searchesTo = [
        signTo,
        mainTo + '_' + subTo,
        mainTo + '_{' + subTo + '}',
      ];
      for (const key in this.to) {
        if (Object.prototype.hasOwnProperty.call(this.to, key)) {
          let str = this.to[key],
            replaceFrom = signTo,
            replaceTo = signFrom;
          if (key === 'tex') {
            replaceFrom = mainTo + '_{' + subTo + '}';
            replaceTo = mainFrom + '_{' + subFrom + '}';
          }
          for (const s of searchesFrom) {
            if (str.includes(s)) {
              this.signReplaces.push({
                key: key,
                search: s,
                from: s,
                to: replaceFrom,
                warn: false,
              });
            }
          }
          for (const s of searchesTo) {
            if (str.includes(s)) {
              this.signReplaces.push({
                key: key,
                search: s,
                from: s,
                to: replaceTo,
                warn: true,
              });
            }
          }
        }
      }
    }
  }
  replaceSign(rep) {
    if (rep.key === 'sign') {
      this.to[rep.key] = '';
    } else {
      this.to[rep.key] = this.to[rep.key].replaceAll(rep.from, rep.to);
    }
    const index = this.signReplaces.findIndex((r) => r === rep);
    this.signReplaces.splice(index, 1);
    this.elm.dirty = true;
    this.checkTex();
    if (rep.key === 'tex') {
      let body = { latex: this.to[rep.key] };

      this.http
        .post('/api/typeset/' + this.elm._eid.str, body)
        .subscribe((res) => {
          let body: any = res;
          if (body.success) {
            // this.elm.equ = body.equ;
            this.to.svg = body.equ.svg;
            this.elm.dirty = true;
          } else {
            this.elm.dirty = false;
            console.log(body);
          }
        });
    }
  }

  updateTags(str) {
    const regex = new RegExp(
      '(?<=</span><sub class="kd-variable">)(.*?)(?=</sub>)',
      'g',
    );
    const match = str.match(regex) || [];
    for (const it of match) {
      str = str.replace(
        '</span><sub class="kd-variable">' + it + '</sub>',
        '<sub>' + it + '</sub></span>',
      );
    }
    return str;
  }
  setDate() {
    if (this.isCurrent) {
      this.to.updated_at = new Date().toISOString();
    } else {
      delete this.to.updated_at;
    }
  }
  findGlossary() {
    const data = this.glossary.table.data;
    this.glossaryItem = data.find(
      (it) => it.de.toLowerCase() === this.glossaryFrom.toLowerCase(),
    );
    if (this.glossaryItem) {
      this.glossaryTo = this.glossaryItem.en || '';
      this.glossaryApi = this.glossaryItem.gapi[0] || '';
      this.warnGlossary = true;
    } else {
      this.warnGlossary = false;
    }
    if (!this.glossaryFrom) {
      this.glossaryApi = '';
    }
  }
  setGlossary() {
    const data = this.glossary.table.data;
    const index = data.findIndex(
      (it) => it.de.toLowerCase() === this.glossaryFrom.toLowerCase(),
    );
    console.log(index);
    this.glossaryApi =
      this.glossaryApi.charAt(0).toUpperCase() + this.glossaryApi.slice(1);
    if (!this.glossaryApi) {
      this.translateApi('ggapi');
      return;
    }

    if (index === -1) {
      data.push({
        de: this.glossaryFrom,
        en: this.glossaryTo,
        gapi: [this.glossaryApi],
      });
    } else {
      const gl = data[index];
      gl.en = this.glossaryTo;
      gl.gapi.push(this.glossaryApi);
    }
    this.glossaryFrom = '';
    this.glossaryTo = '';
    this.glossaryApi = '';

    this.glossary.dirty = true;
    this.dS.save(this.glossary);
    // this.glossary.defSubject.next(this.glossary.def);
  }
  replaceGapiGlossary() {
    const body = {
      cmd: 'cmd',
    };
    let subs: any;
    this.glossaryPending = true;

    subs = this.dS.serverApi('/gapi/glossary', body);

    subs.subscribe(
      (body) => this.replaceGapiGlossaryAction(body),
      (error) => (this.dS.errorMessage = <any>error),
    );
  }
  replaceGapiGlossaryAction(body) {
    this.glossaryPending = false;
    console.log(body);
  }
  deleteTo() {
    this.to.lbl = '';
    this.to.lng = '';
    this.to.cpt = '';
    this.to.bdy = '';
    this.glossaryFrom = '';
    this.glossaryTo = '';
    this.glossaryApi = '';
    this.findSigns();
    this.elm.dirty = true;
  }
  translateApi(key, set?) {
    this.translationPending = key;
    let index = 0;
    const vars1 = [],
      vars2 = [];
    let text = this.from[key] || this.glossaryFrom || '';
    console.log(text);
    if (key === 'gapi') {
      text = this.from.lbl || '';
    }
    if (key === 'ggapi') {
      text = this.glossaryFrom || '';
    }
    if (key === 'locallabel') {
      text = set.attrib[this.fromLocale] || '';
    }
    if (key === 'localgapi') {
      text = set.attrib[this.fromLocale] || '';
    }
    let mimeType,
      glossary = '';
    if (key === 'cpt' || key === 'bdy') {
      mimeType = 'text/html';
      this.vars = [];
      this.refs = [];
      const regexVars1 = new RegExp(
        '(?<=<span class="kd-variable">)(.*?)(?=</span>)',
        'g',
      );
      const matchVar1 = text.match(regexVars1) || [];
      for (let i = 0; i < matchVar1.length; i++) {
        const it = matchVar1[i];
        this.vars.push({
          tag: '<span class="kd-variable">' + it + '</span>',
          repl: 'VAR' + index,
        });
        index++;
      }
      for (const it of this.vars) {
        text = text.replace(it.tag, it.repl);
      }

      const regexRefs = new RegExp(
        '(?<=class="kd-reference" name=")(.*?)(?=</span>)',
        'g',
      );
      const matchRef = text.match(regexRefs) || [];
      for (let i = 0; i < matchRef.length; i++) {
        const ref = matchRef[i];
        this.refs.push({
          tag: '<span class="kd-reference" name="' + ref + '</span>',
          repl: 'REF' + i,
        });
      }
      for (const it of this.refs) {
        text = text.replace(it.tag, ' ' + it.repl);
      }
    } else {
      mimeType = 'text/plain';
    }

    if (this.glossaryMode === 'gapi') {
      glossary = 'deep-drawing';
    } else {
      glossary = '';
    }

    if (key === 'glossary' || key === 'localgapi') {
      glossary = '';
    }

    const body = {
      text: text,
      glossaryId: glossary,
      mimeType: mimeType,
    };

    let subs: any;

    if (text) {
      subs = this.dS.serverApi('/gapi/translate', body);
      subs.subscribe(
        (body) => this.translateAction(key, body, set),
        (error) => (this.dS.errorMessage = <any>error),
      );
    }
  }
  translateAction(key, body, set?) {
    if (body.success) {
    }
    let text = body.translation;

    if (
      this.glossaryMode === 'direct' &&
      key !== 'gapi' &&
      key !== 'ggapi' &&
      key !== 'localgapi'
    ) {
      text = this.replaceGlossary(text);
    }

    if (key === 'cpt') {
      text = text.replaceAll(
        '<div class = "kd-caption-a"> ',
        '<div class= "kd-caption-a">',
      );
      text = text.replaceAll(
        '<div class = "kd-caption-b"> ',
        '<div class= "kd-caption-b">',
      );
    }

    if (key === 'cpt' || key === 'bdy') {
      text = text.replace(/<\sp>/gm, '<p>');
      text = text.replace(/<p>\s/gm, '<p>');
      text = text.replace(/\s<\/p>/gm, '</p>');
      text = text.replace(/<\/\sdiv>/gm, '</div>');
      text = text.replace(/<\/\sspan>/gm, '</span>');
      text = text.replace(/<h3>\s/gm, '<h3>');
      text = text.replace(/<h4>\s/gm, '<h4>');
      text = text.replace(/<h5>\s/gm, '<h5>');
      text = text.replace(/\s<\/h3>/gm, '</h3>');
      text = text.replace(/\s<\/h4>/gm, '</h4>');
      text = text.replace(/\s<\/h5>/gm, '</h5>');
      text = text.replace(/<em>\s/gm, '<em>');
      text = text.replace(/<span>\s/gm, '<span>');
      text = text.replace(/>\s</gm, '><');

      text = text.replace(/\s&\snbsp\s;\s/gm, '&nbsp;');

      text = text.replace(/&\sNbsp;/gm, '&nbsp;');
      text = text.replace(/&\snbsp;/gm, '&nbsp;');
      text = text.replace(/<strong>\s/gm, '<strong>');
      text = text.replace(/\s<\/strong>/gm, '</strong>');
      text = text.replace(/\s&nbsp;\s/gm, '&nbsp;');
      text = text.replace(/&\sgt;\s/gm, '&gt;');
      text = text.replace(/\s&\s#\s8239;\s/gm, '&#8239;');
      text = text.replace(/&nbsp;#\s8239;\s/gm, '&#8239;');

      text = text.replace(/<\/p>\s<p>/gm, '</p><p>');

      console.log(text);

      for (const it of this.vars) {
        text = text.replace(it.repl, it.tag);
      }

      for (const it of this.refs) {
        text = text.replace(' ' + it.repl, it.tag);
      }
    }

    if (key === 'lblxxx') {
      text = capitalize(text);
    }

    if (key === 'glossary') {
      this.glossaryTo = this.glossaryApi = text;
    } else if (key === 'localgapi') {
      set.gapi = text;
    } else if (key === 'locallabel') {
      set.attrib[this.toLocale] = text;
    } else if (key === 'ggapi') {
      this.glossaryApi = text;
    } else {
      this.to[key] = text;
    }

    this.checkTex();

    this.translationPending = '';
    this.elm.dirty = true;
  }
}

const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
    match.toUpperCase(),
  );
