import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import Dexie from 'dexie';
import { BehaviorSubject, lastValueFrom, ReplaySubject } from 'rxjs';
import { Elm, ElmNode, I18n } from 'src/app/engine/entity';
import { DexieService } from 'src/app/services/dexie.service';

@Injectable({ providedIn: 'root' })
export class ContentManager {
  locales: string[] = ['de', 'en'];

  status: any = {
    usersActiveCount: 0,
    usersActive: [],
    editions: [],
    lastElm: '',
    lastI18n: '',
    lastProject: '',
    interval: 600000,
    notify: false,
    syncable: false,
    dbversion: 0,
  };

  metaName: string;

  searchTerm = '';

  hasIdb = true;
  hasLoadedIdb = false;

  defaultVolId: string = '5c81b1cc8df0b13e5a079cd5';
  rS: any = {};
  obj: any = {};

  arr: Elm[] = [];

  vols: Elm[] = [];
  datahosts: Elm[] = [];
  checkouts: Elm[] = [];

  selVol: Elm;
  selElm: Elm;

  system: Elm;
  page404: any;
  locale: string;
  volumeSubject: BehaviorSubject<Elm>;
  localeSubject: BehaviorSubject<string>;
  loadedSubject: BehaviorSubject<boolean>;

  mdes = {
    de: ['', 'Online Berechnung zum Tiefziehen mit Formeln und Gleichungen.'],
    en: ['', 'Online calculation on deep-drawing with formulae and equations.'],
  };
  elmsTable: any;
  i18nsTable: any;
  imgsTable: any;
  wasmsTable: any;

  domain: string = 'http://localhost:4200';
  trouble: any;
  slug: any = { de: {}, en: {} };
  statusAt: Date;
  insertedSubject: BehaviorSubject<boolean>;
  loaded: boolean;
  viewElementSubject: BehaviorSubject<Elm>;

  constructor(
    public router: Router,

    public http: HttpClient,

    public meta: Meta,
    public titleService: Title,

    public dexieService: DexieService,
  ) {
    this.viewElementSubject = new BehaviorSubject<Elm>(null);
    this.volumeSubject = new BehaviorSubject<Elm>(null);
    this.localeSubject = new BehaviorSubject<string>('');
    this.loadedSubject = new BehaviorSubject<boolean>(false);
    this.insertedSubject = new BehaviorSubject<boolean>(false);

    this.elmsTable = this.dexieService.table('elms');
    this.i18nsTable = this.dexieService.table('i18ns');
    this.imgsTable = this.dexieService.table('imgs');
    this.wasmsTable = this.dexieService.table('wasms');

    this.init();
  }

  async init() {
    this.loadedSubject.subscribe(async (loaded) => {
      if (loaded && !this.loaded) {
        this.loaded = loaded;
        this.volumeSubject.next(this.obj[this.defaultVolId]);
      }
    });

    this.viewElementSubject.subscribe((elm) => {
      if (elm) {
        this.selElm = elm;
      }
    });

    this.volumeSubject.subscribe(async (vol) => {
      if (vol) {
        switch (vol._eid.str) {
          case '5c40af3f4f5eb4199613c5e1':
            this.metaName = 'kompendia';
            break;
          case '5c81b1cc8df0b13e5a079cd5':
            this.metaName = 'forming';
            break;
          default:
            this.metaName = 'forming';
            break;
        }
        this.selVol = this.obj[this.defaultVolId];
      }
    });

    this.localeSubject.subscribe((lang) => {
      console.log('locale change', lang);
      if (lang) {
        for (let i = 0; i < this.arr.length; i++) {
          const elm = this.arr[i];
          elm.txts = elm.i18n[lang]?.strs || {};
        }
        for (let i = 0; i < this.selVol.flatTree.length; i++) {
          const node = this.selVol.flatTree[i];

          console.log('set path for', node);
          node.path = node.getPath(lang);
        }
        for (let i = 0; i < this.selVol.children.length; i++) {
          const node = this.selVol.children[i];
          // node.path = this.getPath(node, lang);
        }
        this.locale = lang;
      }
    });
  }

  navigate(elm, target?) {
    if (!elm) {
      return null;
    }
    const segments = [];
    let id = '';
    if (this.locale) segments.push(this.locale);

    if (typeof elm === 'string') {
      elm = this.obj[elm];
      id = elm._eid.str;
    } else {
      id = elm._eid.str;
    }

    const node =
      this.selVol.flatTree.find((nd) => nd.id === id) ||
      this.selVol.children.find((nd) => nd.id === id);

    if (node) {
      return this.router.navigate([node.path]);
    }

    segments.push('store');

    segments.push(id);

    this.router.navigate(segments);
  }

  getNode(urlSegments) {
    const subject = new ReplaySubject<ElmNode>();
    const obs = subject.asObservable();
    this.resolveNode(urlSegments, subject);
    return obs;
  }

  getElmNode(urlSegments) {
    const lang = urlSegments[0];
    if (urlSegments[1] === 'store') {
      const id = urlSegments[2];
      return { id: id, elm: this.obj[id] || this.page404 };
    }

    const vol = this.rS.selVol || this.selVol;

    const path = '/' + urlSegments.join('/');
    let node = vol.flatTree.find((x) => x.path === path);
    if (node) {
      return node;
    }

    node = vol.children.find((x) => x.path === path);
    if (node) {
      return node;
    }

    return { elm: this.page404 };
  }

  async resolveNode(urlSegments, subject) {
    let lang = urlSegments[0];
    if (!this.locales.includes(lang)) {
      lang = this.locales[0];
      return this.router.navigate([lang]);
    }

    if (this.hasIdb && !this.hasLoadedIdb) {
      await this.loadIdb();
      this.hasLoadedIdb = true;
    }

    if (!this.obj[this.defaultVolId]) {
      await this.loadHttp(lang, this.defaultVolId, false, false, true);
    }

    if (!this.selVol) {
      this.volumeSubject.next(this.obj[this.defaultVolId]);
    }

    if (this.locale !== lang) {
      this.localeSubject.next(lang);
    }

    const node = this.getElmNode(urlSegments);

    if (!node) {
      return this.router.navigate([lang]);
    }

    subject.next(node);
    subject.complete();

    this.updateMetaTags(node.elm);
    this.loadedSubject.next(true);
  }

  async loadIdb() {
    if (!this.hasIdb) {
      return null;
    }
    const defs: any = {};
    defs.elms = await this.elmsTable
      .toArray()
      .catch(Dexie.InvalidStateError, (e) => {
        this.hasIdb = false;
      })
      .catch(Dexie.DatabaseClosedError, (e) => {
        this.hasIdb = false;
      });
    defs.i18ns = await this.i18nsTable
      .toArray()
      .catch(Dexie.InvalidStateError, (e) => {
        this.hasIdb = false;
      })
      .catch(Dexie.DatabaseClosedError, (e) => {
        this.hasIdb = false;
      });

    const success = this.insert(defs);
  }

  async loadHttp(lang, eid, noe, noi, full) {
    eid = '60a0102c1d78a6394c237f0b';
    let options = `?lang=${lang}`;
    if (eid === 'leichtbau-durch-sicken-fachbuch') {
      options += `&lds=true`;
    }
    if (full) {
      options += `&full=true`;
    }
    if (noe) {
      options += `&noe=true`;
    }
    if (noi) {
      options += `&noi=true`;
    }
    if (!this.system || !this.system.i18n[lang]) {
      options += `&system=true`;
    }
    if (!this.obj[this.defaultVolId]) {
      options += '&volume=' + this.defaultVolId;
    }
    const data$: any = this.http.get<any>(
      `${this.domain}/api/elements/${eid}${options}`,
    );
    const defs: any = await lastValueFrom(data$).catch((e) => {});
    if (this.hasIdb && full) {
      const putElms = await this.elmsTable
        .bulkPut(defs?.elms || [])
        .catch(function (e) {
          console.error('Database error: ' + e.message);
        });
      const putI18ns = await this.i18nsTable
        .bulkPut(defs?.i18ns || [])
        .catch(function (e) {
          console.error('Database error: ' + e.message);
        });
    }
    this.insert(defs, lang);
  }

  insert(defs, lang?) {
    lang = lang || this.locale;
    if (!defs.elms) {
      defs = { elms: defs, i18ns: [] };
    }
    let success = true;
    let popElms = [];
    const updatedAts = [];
    let chdr;
    for (const def of defs.elms) {
      this.status.lastElm =
        def.updated_at > this.status.lastElm
          ? def.updated_at
          : this.status.lastElm;
      let elm = this.obj[def._eid];
      if (!elm) {
        elm = new Elm(def);

        this.obj[elm._eid.str] = elm;
        this.arr.push(elm);
        if (def.attrib?.role === 'volume') {
          this.vols.push(elm);
        }
        popElms.push(elm);
        if (def.checkout_id) {
          this.checkouts.pushUnique(elm);
        }
      } else {
        if (def.updated_at > elm.updated_at.toISOString()) {
          console.log('double elm update', def._eid);
          elm.def = def;
          success = this.populate([elm]);
          elm.defSubject.next(def);
        }
      }

      if (elm['datacols']) {
        this.datahosts.pushUnique(elm);
      }

      this.scanForTrouble(elm);
      updatedAts.push(elm.updated_at);
    }

    for (const def of defs.i18ns) {
      this.status.lastI18n =
        def.updated_at > this.status.lastI18n
          ? def.updated_at
          : this.status.lastI18n;
      if (!def.strs) {
        def.strs = {};
      }
      if (this.obj[def._eid]) {
        const elm = this.obj[def._eid];
        if (elm.attrib.role === 'volume') {
          this.obj[def.strs.slug] = elm;
          this.slug[def.lang][def.strs.slug] = def._eid;
        }

        if (!elm.i18n[def.lang]) {
          //elm.i18n[def.lang] = def;
          elm.i18n[def.lang] = new I18n(def);
        } else {
          if (def.updated_at > elm.updated_at.toISOString()) {
            // console.log('double i18n update', def._eid, def.lang);
            //elm.i18n[def.lang] = def;

            elm.i18n[def.lang] = new I18n(def);
          }
        }
        if (def.checkout_id) {
          this.checkouts.pushUnique(elm);
        }
      }
    }

    // for (let i = 0; i < popElms.length; i++) {
    //   const element = popElms[i];
    //   for (const lang of this.locales) {
    //     if (!element.i18n[lang]) {
    //       element.i18n[lang] = null;
    //     }
    //   }
    // }

    this.statusAt = new Date(); //new Date(Math.max(...updatedAts));
    success = this.populate(popElms);
    //this.slugElms(aliasElms);

    // this.setUsedBy();

    this.insertedSubject.next(defs.elms);
    return success;
  }

  populate(elms) {
    let success = true;

    for (const elm of elms) {
      if (elm.toc && !elm.children) {
        elm.children = elm.toc;
      }

      if (elm.table) {
        for (const col of elm.table.cols) {
          if (this.obj[col.field]) {
            col.elm = this.obj[col.field];
          }
        }
        for (const row of elm.table.data) {
          if (row._eid) {
            row.elm = this.obj[row._eid];
          }
        }
      }
      if (elm.children) {
        for (let index = 0; index < elm.children.length; index++) {
          const child = elm.children[index];

          if (this.obj[child.id]) {
            child.elm = this.obj[child.id];
            if (child.tableId && this.obj[child.tableId]) {
              child.tableElm = this.obj[child.tableId];
            }
            child.set.parent = elm;
          } else {
            success = false;
            console.log('invalid child ' + child.id + ' at ' + elm._eid.str);
            elm.log('warning', 'invalid child', child.id);
          }
        }
        if (elm.view) {
          elm.fillGrids();
        }
      }

      for (const node of elm.flatTree || []) {
        if (!node.elm) {
          node.elm = this.obj[node.id] || this.page404;
        }
      }
      for (const node of elm.refs || []) {
        if (!node.elm) {
          node.elm = this.obj[node.id] || this.page404;
        }
      }
    }
    for (const elm of elms) {
      if (elm._eid.str === '61eb0c7edc95266531a1e8e8') {
        this.system = elm;
        this.page404 = this.system.roleElm.page404.elm;
        this.system.i18n['de'].strs.NEW = 'neu';
        this.system.i18n['en'].strs.NEW = 'new';
        this.system.i18n['de'].strs.ARTIKEL = 'Artikel';
        this.system.i18n['en'].strs.ARTIKEL = 'Article';
        this.system.i18n['de'].strs.UPDATED = 'aktualisiert';
        this.system.i18n['en'].strs.UPDATED = 'updated';
      }

      if (elm.host_id) {
        elm.dataHost = this.obj[elm.host_id];
      }

      if (elm.datacols) {
        elm.datarows = this.arr.filter((it) => it.def.host_id === elm._eid.str);

        for (const it of elm.datacols) {
          if (it.isId) {
            if (!it.targetElement) {
              it.targetElement = this.obj[it.field];
              it.targetElement.vals = [];

              for (const row of elm.datarows) {
                for (const des of row.datarow.designs) {
                  if (des && row.datarow[it.field]) {
                    it.targetElement.vals.push({
                      name: des,
                      value: row.datarow[it.field],
                    });
                  }
                }
              }

              it.targetElement.vals.sort(function (x, y) {
                let a, b;
                a = x.name.toLowerCase();
                b = y.name.toLowerCase();
                if (a > b) return 1;
                if (a < b) return -1;
              });
            }
          }
        }
      }
    }

    for (let i = 0; i < elms.length; i++) {
      const elm = elms[i];
      if (elm.srcs?.length && !elm.calc) {
        elm.calc = {
          srcs: elm.srcs,
          version: 1,
        };
      }
      if (elm.calc && !elm.calc.version) {
        elm.calc.version = 1;
      }
      if (elm.flatTree) {
        // elm.distSlugs(); // xxx
      }
    }

    return success;
  }

  updateMetaTags(elm) {
    if (elm) {
      let title, description;

      title = elm.txts.lbl;
      description =
        elm.txts.mdes || elm.txts.lng || this.selVol?.txts.mdes || '';
      this.titleService.setTitle(title);

      this.meta.updateTag(
        {
          name: 'title',
          content: title,
        },
        `name='title'`,
      );

      if (!elm.txts.mdes && elm.description === 1) {
        description = this.mdes[this.locale][elm.description];
      }

      const and = this.locale === 'de' ? 'und' : 'and';
      description = description.replace(/&/g, and);

      let keywords = elm.txts.mkeys || this.selVol?.txts.mkeys || '';
      this.meta.updateTag(
        {
          name: 'description',
          content: description,
        },
        `name='description'`,
      );
      this.meta.updateTag(
        {
          name: 'keywords',
          content: keywords,
        },
        `name='keywords'`,
      );
      this.meta.updateTag(
        {
          property: 'og:description',
          content: description,
        },
        `property='og:description'`,
      );
      this.meta.updateTag(
        {
          property: 'twitter:description',
          content: description,
        },
        `property='twitter:description'`,
      );
      this.meta.updateTag(
        {
          property: 'og:image',
          content: 'assets/icons/' + this.metaName + '-og.png',
        },
        `property='og:image'`,
      );
      this.meta.updateTag(
        {
          property: 'twitter:image',
          content: 'assets/icons/' + this.metaName + '-twitter.png',
        },
        `property='twitter:image'`,
      );
    }
  }
  scanForTrouble(elm) {
    elm.trouble = 0;
    if (elm.attrib.examples?.length) {
      if (elm.attrib.examples[0].state) {
        elm.trouble = 2;
        if (!this.trouble) this.trouble = 1;
      }
      for (const ex of elm.attrib.examples) {
        if (ex.state?.input) {
          const index = elm.children.findIndex(
            (it) => it.id === ex.id && it.set?.state?.input,
          );
          if (index === -1) {
            elm.trouble = 3;
            this.trouble = 2;
            break;
          }
        }
      }
      for (const child of elm.children) {
        if (child.set?.state?.input) {
          const index = elm.attrib.examples[0].state?.findIndex(
            (it) => it.id === child.id && it.state?.input,
          );
          if (index === -1) {
            elm.trouble = 3;
            this.trouble = 2;
            break;
          }
        }
      }
    }
    if (elm.i18n.en) {
      if (elm.i18n.en.updated_at < elm.i18n.de?.updated_at) {
        if (!elm.trouble) elm.trouble = 1;
        if (!this.trouble) this.trouble = 1;
      }
    }
  }

  setUsedBy() {
    for (const vol of this.vols) {
      for (const node of vol.flatTree) {
        const desc = this.usedByElm(this.obj[node.id]);
        for (const elm of desc) {
          elm.usedBy.pushUnique(this.obj[node.id]);
          elm.usedBy.sort(function (a, b) {
            if (a.task > b.task) return 1;
            if (a.task < b.task) return -1;
          });
        }
      }
    }
  }

  usedByElm(elm) {
    let result = [];
    allDescendants(elm);

    function allDescendants(elm) {
      if (elm.datarows) {
        for (const it of elm.datarows) {
          result.pushUnique(it);
          it.usedBy.pushUnique(elm);
        }
      }
      if (elm.refs) {
        for (const it of elm.refs) {
          result.pushUnique(it.elm);
          it.elm.usedBy.pushUnique(elm);
        }
      }
      let cs = elm.children;
      if (cs && cs.length) {
        for (let i = 0; i < cs.length; i++) {
          let child = cs[i].elm;
          child.usedBy.pushUnique(elm);
          allDescendants(child);
          result.pushUnique(child);
        }
      }
      cs = elm.tree;
      if (cs && cs.length) {
        for (let i = 0; i < cs.length; i++) {
          let child = cs[i].elm;
          child.usedBy.pushUnique(elm);
          allDescendants(child);
          result.pushUnique(child);
        }
      }
    }
    return result;
  }
}
