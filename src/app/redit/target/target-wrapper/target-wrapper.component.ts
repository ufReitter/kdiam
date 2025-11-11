import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'kd-target-wrapper',
  standalone: false,
  templateUrl: './target-wrapper.component.html',
  styleUrls: ['./target-wrapper.component.scss'],
})
export class TargetWrapperComponent implements OnInit {
  @Input() elm: Elm;
  @Input() node: any;
  @Input() target = 'en';
  elms: Elm[] = [];
  outdatedElms: Elm[] = [];
  origin = 'de';
  fromStr = '';
  fromStrNetto = '';
  fromElm = document.createElement('div');
  toElm = document.createElement('div');
  slugNode: any;
  slug: any;
  readySlug: any;
  warnSlug: boolean;
  glossaryPending: boolean;
  i18nDefSubject: any;

  constructor(
    private http: HttpClient,
    public router: Router,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngOnInit(): void {
    this.i18nDefSubject = this.dS.subject.i18nDef.subscribe((def) => {
      if (def && def.lang === 'de') {
        this.analyzeElms();
      }
    });

    // cron-job every da at 3:00
    // https://cron-job.org/en/members/jobs/
  }
  ngOnChanges(): void {
    this.analyzeElms();
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    if (this.i18nDefSubject) this.i18nDefSubject.unsubscribe();
  }

  analyzeElms() {
    this.elms = [this.elm];
    this.elms = this.elms.concat(this.dS.allDesc(this.elm));
    this.outdatedElms = [];
    for (const it of this.elms) {
      if (!it.i18n[this.target]?.strs) {
        it.i18n[this.target] = it.i18n[this.target] || {};
        it.i18n[this.target].strs = {};
      }
      if (it.i18n[this.origin].updated_at > it.i18n[this.target].updated_at) {
        this.outdatedElms.pushUnique(it);
        it.i18n[this.target].hasWarning = true;
      }
      const fromStrs = it.i18n[this.origin].strs;
      const toStrs = it.i18n[this.target].strs;
      for (const key in fromStrs) {
        if (Object.prototype.hasOwnProperty.call(fromStrs, key)) {
          const fromStr = fromStrs[key];
          const toStr = toStrs[key];
          if (toStr === 'New Element') {
            this.outdatedElms.pushUnique(it);
            it.i18n[this.target].hasWarning = true;
          }
          if (fromStr && !toStr) {
            if (
              key === 'lbl' ||
              key === 'lng' ||
              key === 'bdy' ||
              key === 'cpt'
            ) {
              this.outdatedElms.pushUnique(it);
              it.i18n[this.target].hasWarning = true;
            }
          }
        }
      }
    }

    this.fromStr = this.getFromStr(false);
    this.fromStrNetto = this.fromStr.replace(/(<([^>]+)>)/gi, '');
    this.slugNode = this.dS.selVol.flatTree.find((nd) => nd.elm === this.elm);
    this.slug = this.slugNode?.slugs[this.target] || '';
  }

  getFromStr(altKey) {
    this.fromElm.innerHTML = '';
    this.toElm.innerHTML = '';
    this.fromStrNetto = '';
    for (const it of this.elms) {
      const out = it.i18n[this.target].hasWarning || altKey ? true : false;
      const strs = it.i18n[this.origin].strs || {};
      if (strs.lbl) {
        const el: HTMLElement = document.createElement('div');
        el.innerHTML = strs.lbl;
        if (out) {
          el.setAttribute('id', 'lbl_' + it._eid.str);
        }

        this.fromElm.appendChild(el);
      }
      if (strs.lng) {
        const el: HTMLElement = document.createElement('div');
        el.innerHTML = strs.lng;
        if (out) {
          el.setAttribute('id', 'lng_' + it._eid.str);
        }

        this.fromElm.appendChild(el);
      }
      if (strs.bdy) {
        const el: HTMLElement = document.createElement('div');
        el.innerHTML = strs.bdy;
        if (out) {
          el.setAttribute('id', 'bdy_' + it._eid.str);
        }

        this.fromElm.appendChild(el);
      }
      if (strs.cpt) {
        const el: HTMLElement = document.createElement('div');
        el.innerHTML = strs.cpt;

        if (out) {
          el.setAttribute('id', 'cpt_' + it._eid.str);
        }

        this.fromElm.appendChild(el);
      }
    }

    return this.fromElm.innerHTML;
  }

  async openai(event) {
    const body = {
      role: 'system',
      content: 'Du bist ein hilfreicher Assistent.',
    };
    let data$: any = this.http.post<any>(`/api/gapi/openai`, body);
    const result: any = await lastValueFrom(data$);

    console.log(result.completion.choices[0]);

    return result;
  }

  translate(event): void {
    // this.fromElm.innerHTML = '';
    // this.toElm.innerHTML = '';
    // for (const it of this.elms) {
    //   const out =
    //     it.i18n[this.target].hasWarning || event.altKey ? true : false;
    //   const strs = it.i18n[this.origin].strs || {};
    //   if (strs.lbl) {
    //     const el: HTMLElement = document.createElement('div');
    //     el.innerHTML = strs.lbl;
    //     if (out) {
    //       el.setAttribute('id', 'lbl_' + it._eid.str);
    //     }

    //     this.fromElm.appendChild(el);
    //   }
    //   if (strs.lng) {
    //     const el: HTMLElement = document.createElement('div');
    //     el.innerHTML = strs.lng;
    //     if (out) {
    //       el.setAttribute('id', 'lng_' + it._eid.str);
    //     }

    //     this.fromElm.appendChild(el);
    //   }
    //   if (strs.bdy) {
    //     const el: HTMLElement = document.createElement('div');
    //     el.innerHTML = strs.bdy;
    //     if (out) {
    //       el.setAttribute('id', 'bdy_' + it._eid.str);
    //     }

    //     this.fromElm.appendChild(el);
    //   }
    //   if (strs.cpt) {
    //     const el: HTMLElement = document.createElement('div');
    //     el.innerHTML = strs.cpt;

    //     if (out) {
    //       el.setAttribute('id', 'cpt_' + it._eid.str);
    //     }

    //     this.fromElm.appendChild(el);
    //   }
    // }

    const text = this.getFromStr(event.altKey);
    this.fromStrNetto = this.fromStr.replace(/(<([^>]+)>)/gi, '');

    const body = {
      text: text,
      glossaryId: 'deep-drawing',
      mimeType: 'text/html',
    };

    console.log(this.fromElm, text.length);
    let subs = this.dS.serverApi('/gapi/translate', body);
    subs.subscribe(
      (body) => this.translateAction(body),
      (error) => (this.dS.errorMessage = <any>error),
    );
  }

  translateAction(body) {
    let text = body.translation;
    // text = text.replace(
    //   /class\s=\s"kd-reference">\s/gm,
    //   'class="kd-reference">',
    // );
    // text = text.replace(
    //   /class\s=\s"kd-reference">\s/gm,
    //   'class="kd-reference">',
    // );
    // text = text.replace(/\s<span\sname\s=/gm, '<span name=');
    // text = text.replace(/\s<sub>\s/gm, '<sub>');
    // text = text.replace(/\s<\//gm, '</');
    // text = text.replace(/\s<\/p>/gm, '</p>');
    // text = text.replace(/<\/\sdiv>/gm, '</div>');
    // text = text.replace(/<\/\sspan>/gm, '</span>');
    // text = text.replace(/<\sp>/gm, '<p>');
    // text = text.replace(/<p>\s/gm, '<p>');
    // text = text.replace(/<h3>\s/gm, '<h3>');
    // text = text.replace(/<h4>\s/gm, '<h4>');
    // text = text.replace(/<h5>\s/gm, '<h5>');
    // text = text.replace(/\s<\/h3>/gm, '</h3>');
    // text = text.replace(/\s<\/h4>/gm, '</h4>');
    // text = text.replace(/\s<\/h5>/gm, '</h5>');
    // text = text.replace(/<em>\s/gm, '<em>');
    // text = text.replace(/<span>\s/gm, '<span>');
    // text = text.replace(/>\s</gm, '><');
    // text = text.replace(/<\s/gm, '<');

    // text = text.replace(/\s&\snbsp\s;\s/gm, '&nbsp;');

    // text = text.replace(/&\sNbsp;/gm, '&nbsp;');
    // text = text.replace(/&\snbsp;/gm, '&nbsp;');
    // text = text.replace(/<strong>\s/gm, '<strong>');
    // text = text.replace(/\s<\/strong>/gm, '</strong>');
    // text = text.replace(/\s&nbsp;\s/gm, '&nbsp;');
    // text = text.replace(/&\sgt;\s/gm, '&gt;');
    // text = text.replace(/\s&\s#\s8239;\s/gm, '&#8239;');
    // text = text.replace(/&nbsp;#\s8239;\s/gm, '&#8239;');

    // text = text.replace(/<\/p>\s<p>/gm, '</p><p>');

    // text = text.replace(/">\s/gm, '">');
    // text = text.replace(
    //   /referrno\stargeter="no.referrno\stargeter"\s="_blank"/gm,
    //   'rel="noopener noreferrer" target="_blank"',
    // );

    // text = text.replace(/\s">/gm, '">');
    // text = text.replace(/\s<sub>/gm, '<sub>');
    // text = text.replace(/<div>\s/gm, '<div>');
    // text = text.replace(
    //   /\s<span\sclass="kd-reference"/gm,
    //   '<span class="kd-reference"',
    // );
    text = text
      .replaceAll('"> ', '">')
      .replaceAll('<p> ', '<p>')
      .replaceAll('<h3> ', '<h3>')
      .replaceAll('<h4> ', '<h4>')
      .replaceAll('<h5> ', '<h5>')
      .replaceAll('<h6> ', '<h6>')
      .replaceAll('<nb> ', '<nb>')
      .replaceAll(' <sub>', '<sub>')
      .replaceAll(' <sup>', '<sup>')
      .replaceAll(' <span class="kd-reference"', '<span class="kd-reference"')
      .replaceAll(
        '<span class="kd-variable"><sub>s0</sub></span>',
        '<span class="kd-variable">s<sub>0</sub></span>',
      )
      .replaceAll(
        '<span class="kd-variable"><sub>Re</sub></span>',
        '<span class="kd-variable">R<sub>e</sub></span>',
      )
      .replaceAll(' .', '.')
      .replaceAll('span> <span', 'span>&nbsp;<span')
      .replaceAll('① ', '①&nbsp;')
      .replaceAll('② ', '②&nbsp;')
      .replaceAll('③ ', '③&nbsp;')
      .replaceAll('④ ', '④&nbsp;')
      .replaceAll('⑤ ', '⑤&nbsp;')
      .replaceAll('⑥ ', '⑥&nbsp;')
      .replaceAll('⑦ ', '⑦&nbsp;')
      .replaceAll('⑧ ', '⑧&nbsp;')
      .replaceAll('⑨ ', '⑨&nbsp;')
      .replaceAll('⑩ ', '⑩&nbsp;')
      .replaceAll(' = ', '&nbsp;=&nbsp;')
      .replaceAll(' < ', '&nbsp;<&nbsp;')
      .replaceAll(' > ', '&nbsp;>&nbsp;')
      .replaceAll(' &lt; ', '&nbsp;&lt;&nbsp;')
      .replaceAll(' &gt; ', '&nbsp;&gt;&nbsp;')
      .replaceAll(' &lt;= ', '&nbsp;&lt;=&nbsp;')
      .replaceAll(' &gt;= ', '&nbsp;&gt;=&nbsp;')
      .replaceAll(' ≤ ', '&nbsp;≤&nbsp;')
      .replaceAll(' ≥ ', '&nbsp;≥&nbsp;')
      .replaceAll(' ・ ', '&nbsp;・&nbsp;')
      .replaceAll(' / ', '&nbsp;/&nbsp;')
      .replaceAll(' … ', '&nbsp;…&nbsp;')
      .replaceAll('u<sub>e.g</sub>', 'u<sub>z</sub>');

    // var re = /((^|\.)|(\.(?:\s+|&nbsp;(?:\s+))|<br>))[a-z]/g;

    // text.replace(re, function (match) {
    //   var space = '&nbsp;';
    //   return match.indexOf(space) > -1
    //     ? match.slice(0, match.indexOf(';')) +
    //         match.slice(match.indexOf(';') + 1).toUpperCase()
    //     : match.toUpperCase();
    // });

    this.toElm.innerHTML = text;
    let elms = this.toElm.getElementsByClassName('kd-caption-b');
    for (let i = 0; i < elms.length; i++) {
      const elm = elms[i];
      elm.innerHTML = elm.innerHTML
        .replaceAll(' ', '&nbsp;')
        .replaceAll('span&nbsp;class="kd-variable"', 'span class="kd-variable"')
        .replaceAll('&nbsp;<span class=', ' <span class=')
        .replaceAll('&nbsp;①', ' ①')
        .replaceAll('&nbsp;②', ' ②')
        .replaceAll('&nbsp;③', ' ③')
        .replaceAll('&nbsp;④', ' ④')
        .replaceAll('&nbsp;⑤', ' ⑤')
        .replaceAll('&nbsp;⑥', ' ⑥')
        .replaceAll('&nbsp;⑦', ' ⑦')
        .replaceAll('&nbsp;⑧', ' ⑧')
        .replaceAll('&nbsp;⑨', ' ⑨')
        .replaceAll('&nbsp;⑩', ' ⑩');
    }

    elms = this.toElm.getElementsByClassName('kd-reference');
    for (let i = 0; i < elms.length; i++) {
      const elm = elms[i];
      let id = elm.getAttribute('name');
      if (this.dS.obj[id]) {
        let seNo = this.dS.obj[id].seNo;
        elm.innerHTML = seNo || '*';
      } else {
        elm.innerHTML = '*';
      }
    }

    // get all child elements
    const childNodes = this.toElm.childNodes;

    // loop over all child elements
    for (let i = 0; i < childNodes.length; i++) {
      const node: any = childNodes[i];
      if (node.id) {
        // get the id of html node
        const id = node.id;
        const eid = id.split('_')[1];
        let str1 = node.innerHTML;

        if (str1.charAt(0) !== str1.charAt(0).toUpperCase()) {
          // make str first character uppercase
          str1 = str1.charAt(0).toUpperCase() + str1.slice(1);
        }
        const regex = /(<([^>]+)>)(\s?)([a-z,A-Z])/;
        const found = regex.exec(str1);
        //console.log('str', str1);
        //console.log('found', found);
        if (found && found.length && str1.charAt(0) === '<') {
          let str = found[0];
          //console.log('str', str);
          if (
            !str.includes('kd-variable') &&
            str.charAt(str.length - 1) !==
              str.charAt(str.length - 1).toUpperCase()
          ) {
            // make str last character uppercase
            str = str.slice(0, -1) + str.charAt(str.length - 1).toUpperCase();
            //console.log('str', str);
            str1 = str1.replace(found[0], str);
          }
        }
        node.innerHTML = str1;
      }
    }

    const elmsToSave = [];
    for (let i = 0; i < this.toElm.children.length; i++) {
      const element = this.toElm.children[i];
      let key, eid, elm;
      if (element.id) {
        const parts = element.id.split('_');
        key = parts[0];
        eid = parts[1];
        elm = this.dS.obj[eid];
        if (!elm) {
          console.log(elm, eid);
          return;
        }
        if (key === 'bdy' || key === 'cpt') {
          elm.i18n[this.target].strs[key] = element.innerHTML;
        } else {
          element.textContent =
            element.textContent.charAt(0).toUpperCase() +
            element.textContent.slice(1);
          elm.i18n[this.target].strs[key] = element.textContent;
        }
        delete elm.i18n[this.target].hasWarning;
        elm.i18n[this.target].strs.dirty = true;
        elmsToSave.pushUnique(elm);
      }
    }
    for (const elm of elmsToSave) {
      this.dS.save(elm);
    }
    this.outdatedElms = [];
    console.log(this.toElm);
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
      this.elm.i18n[this.target].strs.lbl,
      this.target,
    );
    const valid = this.slugValidate(this.slug, this.dS.selVol, this.target);
    this.warnSlug = !valid;
    if (valid) {
      this.readySlug = this.slug;
    } else {
      this.readySlug = '';
    }
  }

  slugChange() {
    const oldSlug = this.slugNode.slugs[this.target] || '';
    if (this.dS.slug[this.target][oldSlug]) {
      delete this.dS.slug[this.target][oldSlug];
    }
    this.slugNode.slugs[this.target] = this.readySlug;
    this.dS.slug[this.target][this.readySlug] = this.elm;
    this.readySlug = '';
    this.dS.selVol.dirty = true;
    this.dS.save(this.dS.selVol);
    this.dS.navigate(this.elm, 'view');
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

  viewGlossary() {
    this.pS.pref.filter = ['ver'];
    this.pS.pref.sorting.direction = 'asc';
    this.pS.pref.sorting.active = 'ident';
    this.dS.filter();
    this.dS.sort();
    this.router.navigate([
      {
        outlets: {
          primary: 'de/store/6100264be682ad1b0457a727',
          right: ['redit', 'storage', '6100264be682ad1b0457a727', 'null'],
        },
      },
    ]);
  }
  openGlossaryTab() {
    window
      .open(this.dS.origin + '/de/store/6100264be682ad1b0457a727', '_blank')
      .focus();
  }
}
