import { HttpClient } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'kd-translate',
  standalone: false,
  templateUrl: './translate.component.html',
  styleUrls: ['./translate.component.scss'],
})
export class TranslateComponent implements OnInit, OnChanges, OnDestroy {
  @Input() elm: Elm;
  rootElm: Elm;
  sets: any = [];
  elms: Elm[] = [];
  glossary: Elm;
  gl: any = [];
  glossaryItem: any;
  i18n: any;
  fromLocale = 'de';
  toLocale = 'en';
  from: any = {};
  to: any = {};
  index: number;
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
  warnSigns: boolean;
  showFrom: boolean;
  noViewElement = true;
  glossaryMode: string = 'gapi';
  signReplaces: any = [];
  glossarySubject: Subscription;
  slugNode: any;
  slug: any;
  readySlug: any;
  warnSlug: boolean;

  constructor(
    public router: Router,
    private http: HttpClient,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngOnInit(): void {
    this.glossary = this.dS.obj['6100264be682ad1b0457a727'];
    this.glossarySubject = this.glossary?.defSubject.subscribe((def) => {
      // this.gl = this.createGl();
    });
  }
  ngOnChanges(): void {
    this.setElm(this.elm);
    this.slugNode = this.dS.selVol.flatTree.find((nd) => nd.elm === this.elm);
    this.slug = this.slugNode?.slugs[this.toLocale] || '';
  }
  ngOnDestroy() {
    this.pS.pref.snav.translate = false;
    this.dS.subject.snav.next();
    if (this.elm !== this.dS.selectedEditElement) {
      this.dS.checkIn(this.elm);
    }

    this.dS.selectedTranElement = null;
    if (this.elm?.dirty) {
      this.elm.defSubject.next(this.elm.def);
      this.dS.save(this.elm);
    }
    if (this.glossarySubject) this.glossarySubject.unsubscribe();
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
    this.slug = this.dS.slugify(
      this.elm.i18n[this.toLocale].strs.lbl,
      this.dS.locale,
    );
    const valid = this.slugValidate(this.slug, this.dS.selVol, this.toLocale);
    this.warnSlug = !valid;
    if (valid) {
      this.readySlug = this.slug;
    } else {
      this.readySlug = '';
    }
  }

  slugChange() {
    const oldSlug = this.slugNode.slugs[this.toLocale] || '';
    if (this.dS.slug[this.toLocale][oldSlug]) {
      delete this.dS.slug[this.toLocale][oldSlug];
    }
    this.slugNode.slugs[this.toLocale] = this.readySlug;
    this.dS.slug[this.toLocale][this.readySlug] = this.elm;
    this.readySlug = '';
    this.dS.selVol.dirty = true;
    this.dS.save(this.dS.selVol);
    this.dS.navigate(this.elm, 'view');
  }
  viewElement(e) {
    if (e.altKey) {
      this.router.navigate([
        {
          outlets: {
            sidebar: ['edit', this.elm._eid.str],
          },
        },
      ]);
    } else {
      if (e.value) {
        this.noViewElement = true;
        this.router.navigate([this.dS.locale, e.value._id.str]);
      } else {
        this.router.navigate([this.dS.locale, this.elm._eid.str]);
      }
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
        e.i18n.en.lbl?.toLowerCase() !== e.i18n.en.gapi?.[0].toLowerCase(),
    )) {
      const gapi = elm.i18n.en.gapi?.map(
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
      for (const gl of it.gapi || []) {
        //str = str.replaceAll(gl, it.en);
        //str = str.replaceAll(gl.toLowerCase(), it.en.toLowerCase());
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
    for (const elm of this.dS.arr.filter((e) => e.i18n[this.toLocale]?.sign)) {
      signFrom = elm.sign || '';
      signTo = elm.i18n[this.toLocale].sign || '';
      mainFrom = signFrom.split('<')[0];
      mainTo = signTo.split('<')[0];
      subFrom = regexSub.exec(signFrom)?.[1];
      subTo = regexSub.exec(signTo)?.[1];
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
        if (
          Object.prototype.hasOwnProperty.call(this.to, key) &&
          typeof this.to[key] === 'string'
        ) {
          let str = this.to[key] || '',
            replaceFrom = signTo,
            replaceTo = signFrom;
          if (key === 'tex') {
            replaceFrom = mainTo + '_{' + subTo + '}';
            replaceTo = mainFrom + '_{' + subFrom + '}';
          }
          for (const s of searchesFrom) {
            if (str && str.includes(s)) {
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
            if (str && str.includes(s)) {
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
      for (const it of this.signReplaces) {
        if (it.warn) {
          this.warnSigns = false;
        } else {
          this.warnSigns = true;
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
    this.to.dirty = true;
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
            this.to.dirty = true;
          } else {
            this.to.dirty = false;
            console.log(body);
          }
        });
    }
  }

  updateTags(str) {
    const regex = new RegExp(
      '</span><sub class="kd-variable">(.*?)</sub>',
      'g',
    );
    const match = str.match(regex) || [];
    let matches,
      output = [];
    while ((matches = regex.exec(str))) {
      output.push(matches[1]);
    }
    for (const it of output) {
      str = str.replace(
        '</span><sub class="kd-variable">' + it + '</sub>',
        '<sub>' + it + '</sub></span>',
      );
    }
    return str;
  }
  next() {
    if (this.elm?.dirty) {
      this.elm.defSubject.next(this.elm.def);
      this.dS.save(this.elm);
    }
    if (this.index < this.elms.length - 1) {
      this.index++;
      this.setElm(this.elms[this.index]);
    }
  }
  prev() {
    if (this.elm?.dirty) {
      this.elm.defSubject.next(this.elm.def);
      this.dS.save(this.elm);
    }
    if (this.index > 0) {
      this.index--;
      this.setElm(this.elms[this.index]);
    }
  }
  setElm(elm) {
    this.sets = [];

    if (
      this.elm &&
      elm !== this.elm &&
      this.elm !== this.dS.selectedEditElement
    ) {
      this.dS.checkIn(this.elm);
    }
    this.dS.checkOut(elm, this.dS.locale);

    this.elm = this.dS.selectedTranElement = elm;

    this.i18n = elm.i18n.en;
    this.from = elm.i18n[this.fromLocale];
    this.to = elm.i18n[this.toLocale];
    this.ident =
      this.from.lbl ||
      this.from.bdy?.replace(/<(?:.|\n)*?>/gm, '').substring(0, 145) ||
      this.elm._eid.str;

    this.from.updated_at =
      this.from.updated_at || this.elm.updated_at.toISOString();
    if (this.to.updated_at > this.from.updated_at) {
      this.isCurrent = true;
    } else {
      this.isCurrent = false;
    }
    if (this.from.cpt) {
      this.from.cpt = this.updateTags(this.from.cpt || '');
    }
    if (this.from.bdy) {
      this.from.bdy = this.updateTags(this.from.bdy || '');
    }
    for (const pa of elm.usedBy) {
      // xxx
      const childs = pa.children.filter(
        (c) => c.id === elm._eid.str && c.set?.attrib[this.fromLocale],
      );

      const sets = [];

      for (const it of childs) {
        console.log(it);
        sets.push({ attrib: it.setDef.attrib, parent: pa });
      }

      this.sets = this.sets.concat(sets);
    }
    this.checkTex();
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
      // this.glossaryApi = this.glossaryItem.gapi[0] || '';
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
    if (this.glossaryPending) {
      return;
    }
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
    this.to.dirty = true;
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
        '<span class="kd-variable">(.*?)</span>',
        'g',
      );
      let matches,
        output = [];
      while ((matches = regexVars1.exec(text))) {
        output.push(matches[1]);
      }
      for (let i = 0; i < output.length; i++) {
        const it = output[i];
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
        'class="kd-reference" name="(.*?)</span>',
        'g',
      );
      const matchRef = text.match(regexRefs) || [];
      output = [];
      while ((matches = regexRefs.exec(text))) {
        output.push(matches[1]);
      }
      for (let i = 0; i < output.length; i++) {
        const ref = output[i];
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
      text = text.replace(
        /class\s=\s"kd-reference">\s/gm,
        'class="kd-reference">',
      );
      text = text.replace(/\s<span\sname\s=/gm, '<span name=');
      text = text.replace(/\s<sub>\s/gm, '<sub>');
      text = text.replace(/\s<\//gm, '</');
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
      text = text.replace(/<\s/gm, '<');

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

    if (key === 'lbl') {
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
    this.to.dirty = true;
    this.dS.save(this.elm);
  }
}

const capitalize = (str, lower = false) =>
  (lower ? str.toLowerCase() : str).replace(/(?:^|\s|["'([{])+\S/g, (match) =>
    match.toUpperCase(),
  );

function titleCase(str) {
  var splitStr = str.toLowerCase().split(' ');
  for (var i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ');
}
