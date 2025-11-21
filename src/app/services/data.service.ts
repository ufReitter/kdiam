import { _isNumberValue } from '@angular/cdk/coercion';
import { BreakpointObserver } from '@angular/cdk/layout';
import { OverlayContainer } from '@angular/cdk/overlay';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import {
  DOCUMENT,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  NgZone,
  Optional,
  PLATFORM_ID,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
//import { SwUpdate } from '@angular/service-worker';
import Dexie from 'dexie';
import { DeviceDetectorService } from 'ngx-device-detector';
import { NGXLogger } from 'ngx-logger';
import {
  BehaviorSubject,
  EMPTY,
  Observable,
  ReplaySubject,
  fromEvent,
  lastValueFrom,
  throwError,
  timer,
} from 'rxjs';

// import { IdleMonitorService } from '@scullyio/ng-lib';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { CalcService } from '../calc/calc.service';
import { ResultsConvention } from '../calc/render-lib/module';
import ObjectID from '../core/bson-objectid';
import '../core/global.prototypes';
import { Elm, ElmNode, I18n, Project, User } from '../engine/entity';
//import { SiteTheme } from '../shared/theme-picker/theme-storage/theme-storage';
import { CalculationService } from './calculation.service';
import { DexieService } from './dexie.service';
import { ProfileService } from './profile.service';
import { ViewService } from './view.service';

const rCon = new ResultsConvention();

var deepClone = Dexie.deepClone;

export const HOST_ID = new InjectionToken<string>('host');

@Injectable({
  providedIn: 'root',
})
export class DataService {
  debugMode: boolean;
  codeError: boolean;
  codePending: boolean;
  refererSent = '';
  editions: any[] = [];
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

  isOnline: boolean;

  navSlugs = {
    de: {
      about: 'ueber-kdia',
      contact: 'kontakt',
      impress: 'impressum',
    },
    en: {
      about: 'about-kdia',
      contact: 'contact',
      impress: 'impress',
    },
  };

  rS: any = {};
  defs: any = {};
  arr: Elm[] = [];
  obj: any = {};
  objSnapshot: any = {};
  vols: Elm[] = [];
  selection: Elm[] = [];
  checked: Elm[] = [];
  favorites: Elm[] = [];
  checkouts: Elm[] = [];
  slug: any = { de: {}, en: {} };
  paths: any = {};
  selElm: Elm;
  selEditElm: Elm;
  selVol: Elm;
  system: Elm;
  users: User[] = [];
  usersObj: any = {};
  statusAt: Date = new Date();
  hasIdb = true;
  hasLoadedIdb = false;
  useIdb = false;

  isBrowser = false;
  isServer = false;
  routeSegments: string[] = [];
  trouble: number;
  deviceInfo = null;
  style = {
    sizes: [
      {
        size: 'cond',
        width: null,
      },
      {
        size: 'xsmall',
        width: 150,
      },
      {
        size: 'small',
        width: 250,
      },
      {
        size: 'medium',
        width: 340,
      },
      {
        size: 'big',
        width: 480,
      },
      {
        size: 'xbig',
        width: 640,
      },
      {
        size: 'full',
        width: 1024,
      },
    ],
  };

  tasks = [
    { order: 0, name: 'none', icon: 'radio_button_unchecked', suffix: 'elm' },
    { order: 1, name: 'volume', icon: 'home', suffix: 'vol' },
    { order: 2, name: 'article', icon: 'filter_none', suffix: 'art' },
    { order: 3, name: 'calculation', icon: 'code', suffix: 'cal' },
    {
      order: 4,
      name: 'equation',
      icon: 'functions',
      sign: 'π',
      suffix: 'equ',
    },
    { order: 5, name: 'variable', icon: 'format_italic', suffix: 'var' },
    { order: 6, name: 'result', icon: 'code', suffix: 'res' },
    { order: 7, name: 'imput', icon: 'code', suffix: 'inp' },
    { order: 8, name: 'image', icon: 'image', suffix: 'img' },
    { order: 9, name: 'table', icon: 'table_chart', sign: 't', suffix: 'tbl' },
    {
      order: 10,
      name: 'datahost',
      icon: 'table_chart',
      sign: 'h',
      suffix: 'dho',
    },
    {
      order: 11,
      name: 'datarow',
      icon: 'table_chart',
      sign: 'r',
      suffix: 'dro',
    },
    { order: 12, name: 'text', icon: 'text_fields', suffix: 'txt' },
    { order: 13, name: 'stream', icon: 'play_circle_outline', suffix: 'stm' },
    { order: 14, name: 'none', icon: 'radio_button_unchecked', suffix: 'elm' },
  ];

  selectedEditElement: Elm;
  selectedTranElement: Elm;
  selectedProject: Project;

  subject: any = {};

  loaded = false;
  isDark = true;

  projectsUser: Project[] = [];
  datahosts: Elm[] = [];

  searchTerm = '';

  table: any = {};
  locales: string[] = ['de', 'en'];
  locale: string;

  viewMode: any = {
    mode: 'store-root',
    full: false,
    scroll: false,
    collection: false,
    dialog: false,
    info: false,
    edit: false,
    editDrawer: false,
  };

  noToolTips = false;

  version: string;
  year: string;
  origin: string;
  originName: string;
  defaultVolId: string;

  retina: any = {
    factor: 1,
    suffix: '',
  };

  errorMessage: string;

  overlay: any;
  /* theme: SiteTheme;
  themes: SiteTheme[] = [
    {
      primary: '#673AB7',
      accent: '#FFC107',
      name: 'deeppurple-amber',
      isDark: false,
    },
    {
      primary: '#3F51B5',
      accent: '#E91E63',
      name: 'kia-light-theme',
      isDark: false,
      isDefault: true,
    },
    {
      primary: '#E91E63',
      accent: '#607D8B',
      name: 'kia-dark-theme',
      isDark: true,
    },
    {
      primary: '#9C27B0',
      accent: '#4CAF50',
      name: 'purple-green',
      isDark: true,
    },
  ]; */
  mdes = {
    de: ['', 'Online Berechnung zum Tiefziehen mit Formeln und Gleichungen.'],
    en: ['', 'Online calculation on deep-drawing with formulae and equations.'],
  };
  title = {
    de: ['', 'interaktiv'],
    en: ['', 'interactive'],
  };
  cookieIsWarned = false;
  interactiveIsAware = false;

  online: boolean;
  domain: string;
  page404: any;
  sound1: any;
  sound2: any;

  constructor(
    // private swUpdate: SwUpdate,
    private snackbar: MatSnackBar,
    public domSanitizer: DomSanitizer,
    private injector: Injector,
    @Optional() @Inject(HOST_ID) private host: InjectionToken<string>,
    public meta: Meta,
    public titleService: Title,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document,
    private overlayContainer: OverlayContainer,
    @Inject(ViewService) private vS: ViewService,
    @Inject(ProfileService) private pS: ProfileService,
    @Inject(CalculationService) private cSold: CalculationService,
    @Inject(CalcService) private cS: CalcService,
    public http: HttpClient,
    public router: Router,
    public route: ActivatedRoute,
    public breakpointObserver: BreakpointObserver,
    public dexieService: DexieService,
    private deviceService: DeviceDetectorService,
    public logger: NGXLogger,
    private zone: NgZone, // private ims: IdleMonitorService,
  ) {
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    if (
      isPlatformBrowser(this.platformId) &&
      !this.vS.userAgentIsBot &&
      !this.vS.userAgentIsPrerender
    ) {
      this.status.dbversion = JSON.parse(localStorage.getItem('dbversion'));
      if (localStorage.getItem('syncable')) {
        this.status.syncable = true;
      }
      this.isBrowser = true;
      this.hasIdb = true;
    }
    if (isPlatformServer(this.platformId)) {
      this.isServer = true;
      this.hasIdb = false;
    }
    if (this.vS.userAgentIsBot || this.vS.userAgentIsPrerender) {
      this.vS.userAgentIsBot = true;
      this.isBrowser = true;
      this.hasIdb = false;
    }
    this.overlay = this.overlayContainer.getContainerElement();

    this.subject.online = new BehaviorSubject<boolean>(navigator.onLine);
    this.subject.status = new BehaviorSubject<any>({});
    this.subject.statustimer = new BehaviorSubject<any>(false);
    this.subject.updatetimer = new BehaviorSubject<any>(false);
    this.subject.elmDef = new BehaviorSubject<Elm>(null);
    this.subject.i18nDef = new BehaviorSubject<any>(null);
    this.subject.elmMod = new BehaviorSubject<any>(null);
    this.subject.selection = new BehaviorSubject<Elm[]>(null);
    this.subject.sort = new BehaviorSubject<Elm[]>(null);
    this.subject.snav = new BehaviorSubject<any>({});
    this.subject.locale = new BehaviorSubject<string>('');
    this.subject.volume = new BehaviorSubject<Elm>(null);
    this.subject.editElement = new BehaviorSubject<any>(null);
    this.subject.viewElement = new BehaviorSubject<Elm>(null);
    this.subject.project = new BehaviorSubject<Project>(null);
    //this.subject.theme = new BehaviorSubject<SiteTheme>(null);
    this.subject.inserted = new BehaviorSubject<boolean>(null);
    this.subject.loaded = new BehaviorSubject<boolean>(false);
    this.subject.showAlt = new BehaviorSubject<string>('');
    this.subject.search = new BehaviorSubject<any>(false);

    this.subject.fullScreen = new BehaviorSubject<boolean>(false);
    this.subject.editTab = new BehaviorSubject<number>(null);
    this.subject.stepNav = new BehaviorSubject<Elm>(null);
    this.subject.collection = new BehaviorSubject<Elm[]>(null);
    this.subject.checked = new BehaviorSubject<Elm[]>(null);
    this.subject.checkouts = new BehaviorSubject<Elm[]>(null);
    this.subject.favorites = new BehaviorSubject<Elm[]>(null);
    this.subject.cdArticle = new BehaviorSubject<boolean>(false);

    cSold.projectSubject = this.pS.projSub;
    cSold.init(8);

    this.version = environment.version;
    let today = new Date();
    this.year = String(today.getFullYear());
    this.origin = window.location.origin;
    switch (this.origin) {
      case 'https://kompendia.net':
        this.originName = 'kompendia';
        break;
      case 'https://4ming.de':
        this.originName = 'forming';
        break;
      case 'about://':
        this.originName = 'forming';
        break;
      default:
        this.originName = 'forming';
        break;
    }

    this.defaultVolId =
      this.originName === 'kompendia'
        ? '5c40af3f4f5eb4199613c5e1'
        : '5c81b1cc8df0b13e5a079cd5';

    if (this.isBrowser) {
      this.editions = JSON.parse(localStorage.getItem('editions')) || [];
      const bust = Math.random();
      this.sound1 = new Audio();
      this.sound1.src = './assets/sounds/Submarine.mp3';
      this.sound1.load();
      this.sound2 = new Audio();
      this.sound2.src = './assets/sounds/Glass.mp3';
      this.sound2.load();
    }

    /* if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          const msg1 = {
            de: ` \nEine neue Version der App ist verfügbar\n `,
            en: ` \nA new version of the App is available\n `,
          };
          const warning = msg1[this.locale];
          const action = this.system.txts.UPDATELOAD;
          const snack = this.snackbar.open(warning, action, {
            duration: 14400000,
            panelClass: ['kd-snackbar'],
          });
          snack.onAction().subscribe(() => {
            this.swUpdate.activateUpdate().then(() => window.location.reload());
          });
        }
      });
    } */

    this.isOnline = navigator.onLine ? true : false;

    fromEvent(window, 'online').subscribe(() => {
      this.isOnline = true;
      this.subject.online.next(true);
      if (this.isBrowser) {
        let url;
        this.subject.statustimer = timer(6000, this.status.interval).subscribe(
          () => {
            let bust = Math.random();
            url = `/api/status/?cb=${bust}&elm=${this.status.lastElm}&i18n=${this.status.lastI18n}`;
            if (this.pS.profile.role.editor) {
              url += `&proj=${this.status.lastProject}`;
            }
            this.http.get(url).subscribe((body) => {
              this.handleStatus(body);
            });
          },
        );

        /* if (this.swUpdate.isEnabled) {
          this.subject.updatetimer = timer(60000, 60000).subscribe(() =>
            this.swUpdate.checkForUpdate(),
          );
        } */
      }
    });
    fromEvent(window, 'offline').subscribe(() => {
      this.isOnline = false;
      this.subject.online.next(false);
      if (this.isBrowser) {
        if (this.subject.statustimer) {
          this.subject.statustimer.unsubscribe();
          this.subject.statustimer = null;
        }
        if (this.subject.updatetimer) {
          this.subject.updatetimer.unsubscribe();
          this.subject.updatetimer = null;
        }
      }
    });
    this.retina.factor = window.devicePixelRatio || 1;
    this.retina.suffix = this.retina.factor > 1 ? '@2x' : '@1x';

    // let prString = (this.retina.factor * 100).toFixed(0);

    let locale;
    if (navigator.language && navigator.language.indexOf('-') > -1) {
      locale = navigator.language.split('-')[0];
    }
    this.deviceInfo = {
      browser: this.deviceService.getDeviceInfo().browser,
      os: this.deviceService.getDeviceInfo().os,
      isMobile: this.deviceService.isMobile(),
      isTablet: this.deviceService.isTablet(),
      isDesktopDevice: this.deviceService.isDesktop(),
      locale: locale,
    };

    //this.locale = locale || 'de';
    // this.langsLoaded.push(this.locale);

    let token = '';

    if (this.isBrowser) {
      token = localStorage.getItem('token');
    }

    this.slug = {};
    for (const locale of this.locales) {
      this.slug[locale] = {};
    }

    const url = window.location.href;

    let first = true;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = this.router.url;
        if (!this.vS.userAgentIsBot) {
          if (this.isOnline) {
            const cachebust = Math.random();
            let navurl = '/api/stats/nav';
            navurl += '?route=' + this.router.url;
            if (first) {
              navurl += '&is_session_start=true';
            }
            if (
              !window.document.referrer.includes('https://kompendia.net') &&
              !window.document.referrer.includes('https://4ming.de') &&
              this.refererSent !== window.document.referrer
            ) {
              navurl += '&referer=' + window.document.referrer;
              this.refererSent = window.document.referrer;
            }
            navurl += '&cb=' + cachebust;
            this.http.get(navurl).subscribe((body) => {});
          }
        }

        first = false;
        this.routeSegments = url.replace('/', '').split('(')[0].split('/');
        if (this.pS.profile.role.editor && this.routeSegments[0] !== 'last') {
          localStorage.setItem('lastRoute', url);
        }
      }
    });

    if (!this.isBrowser) {
      this.domain = environment.domain;
    } else {
      this.domain = origin;
    }

    this.table.elms = this.dexieService.table('elms');
    this.table.i18ns = this.dexieService.table('i18ns');
    this.table.imgs = this.dexieService.table('imgs');
    this.table.wasms = this.dexieService.table('wasms');

    this.init();
  }

  debugModeChange(event) {
    this.debugMode = event.checked;
    if (this.debugMode) {
      console.log('selElm', this.selElm.def);
    }

    this.pS.pref.save({ debugMode: this.debugMode });
  }
  recompile(elm) {
    this.codePending = true;
    const ios = ['displayProps'];
    for (const it of elm.children) {
      if (it.set.name) {
        ios.push(it.set.name);
      }
    }
    const body = {
      srcs: elm.calc.srcs,
      pts: elm.attrib.ptsCount || 0,
      lines: elm.attrib.linesCount || 0,
      ios: ios,
      rCon: rCon,
    };
    this.http
      .post('/api/calculations/wasm/' + elm._eid.str, body)
      .subscribe((res) => {
        let body: any = res;
        if (body.success) {
          ++elm.calc.version;
          elm.dirty = true;
          this.codePending = false;

          this.codeError = false;
          this.cS.compilerErrors = '';

          console.log('asc compiler stats', body.stats);
          if (elm.job) {
            this.cS.initCalcSubject(elm);
          }
          this.save(elm);
        } else {
          // this.elm.dirty = false;
          this.codeError = true;

          this.cS.compilerErrors = body.error.replace(/\n/g, '<br>');
          console.log(body.error);
        }
      });
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

  getNode(urlSegments) {
    const subject = new ReplaySubject<ElmNode>();
    const obs = subject.asObservable();
    this.resolveNode(urlSegments, subject);
    return obs;
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
      this.subject.volume.next(this.obj[this.defaultVolId]);
    }

    if (this.locale !== lang) {
      this.subject.locale.next(lang);
    }

    const node = this.getElmNode(urlSegments);

    if (!node) {
      return this.router.navigate([lang]);
    }

    subject.next(node);
    subject.complete();

    this.updateMetaTags(node.elm);
    this.subject.loaded.next(true);
  }

  async loadIdb() {
    if (!this.hasIdb) {
      return null;
    }
    const defs: any = {};
    defs.elms = await this.table.elms
      .toArray()
      .catch(Dexie.InvalidStateError, (e) => {
        this.hasIdb = false;
      })
      .catch(Dexie.DatabaseClosedError, (e) => {
        this.hasIdb = false;
      });
    defs.i18ns = await this.table.i18ns
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
    if (this.pS.pref.debugMode) console.log('findElmHttp', defs);
    if (this.hasIdb && (this.pS.profile.role.editor || full)) {
      const putElms = await this.table.elms
        .bulkPut(defs?.elms || [])
        .catch(function (e) {
          console.error('Database error: ' + e.message);
        });
      const putI18ns = await this.table.i18ns
        .bulkPut(defs?.i18ns || [])
        .catch(function (e) {
          console.error('Database error: ' + e.message);
        });
    }
    this.insert(defs, lang);
  }

  createNode(elm) {
    const node = {
      id: elm?._eid?.str || '5c40af3f4f5eb4199613c5e6',
      elm: elm || this.obj['5c40af3f4f5eb4199613c5e6'],
      children: null,
      numeration: '',
      no: 0,
      eNo: 0,
      set: {
        state: {},
        figure: {},
        attrib: {},
        parent: null,
        no: 1,
      },
      setDef: null,
    };
    return node;
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
        if (this.pS.profile.role.editor && def.checkout_id) {
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
        if (this.pS.profile.role.editor && def.checkout_id) {
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

    if (this.pS.profile.role.editor) {
      this.setUsedBy();
    }

    this.subject.inserted.next(defs.elms);
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
        this.vS.system = this.system;
        this.pS.system = this.system;
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
        elm.distSlugs(); // xxx
      }
    }

    return success;
  }

  async refreshElm(elm): Promise<boolean> {
    const data$: any = this.http.get<any>(
      `${this.domain}/api/elements/${elm._eid.str}?kind=elm`,
    );
    const def: any = await lastValueFrom(data$).catch((e) => {});

    console.log(def);
    // elm.def = def;
    // success = this.populate([elm], lang);
    // elm.defSubject.next(def);
    return false;
  }

  async refreshI18n(elm, lang): Promise<boolean> {
    const data$: any = this.http.get<any>(
      `${this.domain}/api/elements/${elm._eid.str}?kind=${lang}`,
    );
    const def: any = await lastValueFrom(data$).catch((e) => {});
    console.log(def);
    elm.i18n[lang] = {
      strs: def.strs,
      updated_at: def.updated_at,
      updated_id: def.updated_id,
    };
    elm.txts = elm.i18n[lang].strs;
    // elm.def = def;
    // success = this.populate([elm], lang);
    elm.defSubject.next(def);
    await this.table.i18ns.update(
      { _eid: elm._eid.str, lang: lang },
      {
        strs: def.strs,
        updated_at: def.updated_at,
        updated_id: def.updated_id,
        checkout_id: undefined,
      },
    );
    return true;
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

  save(elm, replace?) {
    // const updated_at = new Date();
    // if (elm?.dirty || replace) {
    //   const updated_id = new ObjectID(this.pS.profile._id.str);
    //   elm.updated_id = updated_id;
    //   elm.updated_at = updated_at;
    //   const body = { def: elm.def, usedBy: elm.usedBy.map((e) => e._eid.str) };
    //   elm.attrib.lastmod_at = updated_at;
    //   this.table.elms.put(body.def);
    //   elm.defSubject.next(body.def);
    //   this.selElm.defSubject.next(this.selElm.def);
    //   elm.task = elm.getTask();
    //   this.status.lastElm = updated_at.toISOString();
    //   elm.dirty = false;
    //   if (false) {
    //     this.http
    //       .post<any>('api/elements', body)
    //       .pipe(map(this.serverApiResponse), catchError(this.handleError))
    //       .subscribe((res) => {});
    //   }
    // }
    // if (!elm.i18n[this.locale]) {
    //   elm.i18n[this.locale] = {};
    // }
    // if (!elm.i18n[this.locale]._eid) {
    //   elm.i18n[this.locale]._eid = elm._eid.str;
    //   elm.i18n[this.locale].lang = this.locale;
    //   elm.i18n[this.locale].updated_id = this.pS.profile._id.str;
    //   elm.i18n[this.locale].updated_at = updated_at.toISOString();
    //   elm.i18n[this.locale].strs = elm.txts;
    // }
    // for (const lang in elm.i18n) {
    //   if (Object.prototype.hasOwnProperty.call(elm.i18n, lang)) {
    //     const strs = elm.i18n[lang].strs || {};
    //     if (strs.dirty || replace) {
    //       const body = {
    //         def: {
    //           _eid: elm._eid.str,
    //           lang: lang,
    //           strs: strs,
    //           updated_id: this.pS.profile._id.str,
    //           updated_at: updated_at.toISOString(),
    //         },
    //         usedBy: elm.usedBy.map((e) => e._eid.str),
    //       };
    //       delete strs.dirty;
    //       delete body.def.strs.dirty;
    //       this.table.i18ns.put(body.def);
    //       this.status.lastI18n = updated_at.toISOString();
    //       elm.i18n[lang].updated_at = updated_at.toISOString();
    //       elm.defSubject.next(elm.def);
    //       elm.task = elm.getTask();
    //       const defElm = this.selElm || elm;
    //       defElm.defSubject.next(defElm.def);
    //       this.subject.i18nDef.next(elm.i18n[lang]);
    //       if (false) {
    //         this.http
    //           .post<any>('/api/elements', body)
    //           .pipe(map(this.serverApiResponse), catchError(this.handleError))
    //           .subscribe((res) => {});
    //       }
    //     }
    //   }
    // }

    return false;
  }

  async handleStatus(body) {
    if (body.success) {
      for (const key in body) {
        if (Object.prototype.hasOwnProperty.call(body, key)) {
          const it = body[key];
          switch (key) {
            case 'editions':
              let toSave = false;
              for (const vol of it) {
                const old = this.editions.find(
                  (e) => e._eid === vol._eid && e.edition === vol.edition,
                );
                if (!old) {
                  this.editions.push(vol);
                  toSave = true;
                } else {
                  if (old.edition !== vol.edition) {
                    this.editions = it;
                    toSave = true;
                  }
                }
              }
              if (toSave) {
                localStorage.setItem('editions', JSON.stringify(it));
              }
              break;
            case 'usersActiveCount':
              if (this.pS.pref.notify) {
                if (it > this.status.usersActiveCount) {
                  this.sound1.play();
                }
              }
              this.status.usersActiveCount = it;
              break;
            case 'syncDefsXXX':
              if (environment.production) {
                console.log('syncDefs', it);
                if (this.hasIdb) {
                  await this.table.elms
                    .bulkPut(it?.elms || [])
                    .catch(function (e) {
                      console.error('Database error: ' + e.message);
                    });
                  await this.table.i18ns
                    .bulkPut(it?.i18ns || [])
                    .catch(function (e) {
                      console.error('Database error: ' + e.message);
                    });

                  const success = this.insert(it, this.locale);
                }
              }
              break;

            default:
              this.status[key] = it;
              break;
          }
        }
      }

      this.subject.status.next(body);
      const date = new Date().toISOString();
      localStorage.setItem('lastStatusCheck', date);
    }
  }

  async init() {
    //this.installTheme();

    /* 
  isHandsetPortrait$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.HandsetPortrait)
    .pipe(
      map((result) => {
        return result.matches;
      }),
    );
  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((result) => result.matches));

  isXSmall$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.XSmall)
    .pipe(map((result) => result.matches));
  isSmall$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Small)
    .pipe(map((result) => result.matches)); */

    if (this.isBrowser) {
      const warned = localStorage.getItem('cookieIsWarned');
      const aware = localStorage.getItem('interactiveIsAware');
      this.cookieIsWarned = true;

      if (aware) {
        this.interactiveIsAware = true;
      }
    }

    this.subject.locale.subscribe((lang) => {
      if (lang) {
        for (let i = 0; i < this.arr.length; i++) {
          const elm = this.arr[i];
          elm.txts = elm.i18n[lang]?.strs || {};
        }
        for (let i = 0; i < this.selVol.flatTree.length; i++) {
          const node = this.selVol.flatTree[i];
          node.path = node.getPath(lang);
        }
        for (let i = 0; i < this.selVol.children.length; i++) {
          const node = this.selVol.children[i];
          // node.path = this.getPath(node, lang);
        }
        this.locale = lang;
      }
    });

    this.subject.volume.subscribe((v) => {
      if (v && this.selVol !== v) {
        if (this.isBrowser && this.online) {
        }
        switch (v._eid.str) {
          case '5c40af3f4f5eb4199613c5e1':
            this.originName = 'kompendia';
            break;
          case '5c81b1cc8df0b13e5a079cd5':
            this.originName = 'forming';
            break;
          default:
            this.originName = 'forming';
            break;
        }
        let parts;
        if (this.pS.profile.role.editor) {
          parts = v.attrib.editorLocales?.replace(' ', '').split(',');
        } else {
          parts = v.attrib.publicLocales?.replace(' ', '').split(',');
        }
        if (parts && parts.length > 0 && parts[0].length > 1) {
          this.locales = parts;
        }

        this.selVol = v;

        for (const it of this.arr) {
          if (it.task === 2) {
            it.task = 14;
          }
        }

        let desc = [],
          absnum = 1;

        if (this.pS.profile.role.editor) {
          for (const it of v.flatTree) {
            const elm = this.obj[it.id];
            if (elm) {
              elm.volume = v;
              elm.task = 2;
              // if (it.elm.view === 'calc') {
              //   it.elm.description = 1;
              // }
              // for (const it2 of it.elm.children || []) {
              //   if (it2.elm.view === 'calc') {
              //     it.elm.description = 1;
              //   }
              // }
              elm.num = it.num;
              elm.absnum = absnum;
              absnum++;
              desc.push(elm);
            }
          }
        }

        // allElmsMeta(desc);

        if (this.selectedProject) {
          for (const child of v.usedElms) {
            // const child = iterator.elm;
            if (child.state) {
              let state = this.selectedProject.getState(child);
              if (state) {
                child.state = state;
              }
            }
          }
        }
        if (this.loaded) {
          let delay = timer(1000).subscribe((t) => {
            this.filter();
          });
        }
      }

      let delay = timer(1500).subscribe((t) => {
        for (const it of this.pS.pref.favorites) {
          let elm = this.obj[it];
          if (elm) {
            this.favorites.pushUnique(elm);
          }
        }
        this.subject.favorites.next(this.favorites);
      });
    });

    this.subject.viewElement.subscribe((elm) => {
      if (elm) {
        this.selElm = elm;
      }
    });

    this.subject.online.subscribe(async (online) => {
      this.online = online;
    });

    this.subject.elmDef.subscribe((elm) => {
      if (elm) {
        elm.defSubject.next(elm.def);
        elm.task = elm.getTask();
        this.subject.elmMod.next(elm);
      }
    });

    this.pS.profileSub.subscribe((profile) => {
      if (profile) {
        if (profile.role.editor) {
          this.status.interval = 30000;
        } else {
          this.status.interval = 600000;
        }
      }
    });

    this.pS.prefSub.subscribe((pref) => {
      if (pref) {
        //this.installTheme(pref.theme.name);
      }
    });

    this.subject.project.subscribe((project) => {
      if (project) {
        this.selectedProject = project;
        if (this.loaded)
          this.pS.pref.update({ selectedProject: project._id.str });
      }
    });

    this.subject.theme.subscribe((theme) => {
      if (theme && this.selElm) {
        this.selElm.setTheme(theme);
      }
    });
    /* 
    this.isHandset$.subscribe((data) => {
      if (data) {
        this.pS.pref.snav.opened = false;
      }
    }); */

    this.subject.loaded.subscribe(async (loaded) => {
      if (loaded && !this.loaded) {
        this.loaded = loaded;

        let delay = timer(1000).subscribe((t) => {
          if (this.deviceInfo.isTablet) {
            this.noToolTips = true;
          } else {
            this.noToolTips = this.pS.pref.noToolTips;
          }
          this.filter();
        });

        let url;
        if (this.isOnline) {
          this.subject.statustimer = timer(
            2000,
            this.status.interval,
          ).subscribe(() => {
            let bust = Math.random();
            url = `/api/status?cb=${bust}&elm=${this.status.lastElm}&i18n=${this.status.lastI18n}`;
            if (this.pS.profile.role.editor) {
              url += `&proj=${this.status.lastProject}`;
            }
            this.http.get(url).subscribe((body) => {
              this.handleStatus(body);
            });
          });

          /* if (this.swUpdate.isEnabled) {
            this.subject.updatetimer = timer(60000, 60000).subscribe(() =>
              this.swUpdate.checkForUpdate(),
            );
          } */
        }
        if (this.pS.profile.role.editor) {
          let data1$: any = this.http.get<any>('/api/users/all');
          this.users = await lastValueFrom(data1$);
          this.users.sort(function (x, y) {
            let a, b;
            a = x.nickname.toLowerCase();
            b = y.nickname.toLowerCase();
            if (a > b) return 1;
            if (a < b) return -1;
          });
          for (const it of this.users) {
            this.usersObj[it._id] = it;
          }
        }
        //setTimeout(() => this.ims.fireManualMyAppReadyEvent(), 1000);
      }
    });

    this.pS.profileSub.subscribe((profile) => {
      if (profile.role.editor) {
        this.setUsedBy();
      }
    });
  }

  async updateImgs(elms) {
    for (const elm of elms) {
      if (elm.figure?.ext === 'jpg' || elm.figure?.ext === 'png') {
        const img = await this.table.imgs.get(elm._eid.str);
        if (img?.version !== elm.figure.version) {
          const res = await fetch(
            '/images/scaled/' +
              elm._eid.str +
              '-' +
              Math.floor(
                this.style.sizes[elm.figure.size || 3].width *
                  (elm.figure.magnification || 1.0),
              ) +
              this.retina.suffix +
              '.' +
              elm.figure.ext,
          );
          if (res.status === 200) {
            const blob = await res.blob();
            if (this.hasIdb) {
              await this.table.imgs
                .put({
                  _eid: elm._eid.str,
                  version: elm.figure.version,
                  image: blob,
                })
                .catch(Dexie.InvalidStateError, (e) => {
                  this.hasIdb = false;
                })
                .catch(Dexie.DatabaseClosedError, (e) => {
                  this.hasIdb = false;
                })
                .catch((e) => {
                  this.hasIdb = false;
                });
            }
          }
        }
      }
    }
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
          content: 'assets/icons/' + this.originName + '-og.png',
        },
        `property='og:image'`,
      );
      this.meta.updateTag(
        {
          property: 'twitter:image',
          content: 'assets/icons/' + this.originName + '-twitter.png',
        },
        `property='twitter:image'`,
      );
    }
  }

  public httpError(error: HttpErrorResponse) {
    //console.error(error);

    return EMPTY;
  }

  slugSuggest(elm, vol, lang) {
    let notValid = true;
    let slug = '';
    slug = this.slugify(elm.i18n[lang]?.lbl || elm._eid.str, this.locale);
    let count = 1;
    while (notValid) {
      const exists = vol.flatTree.find((nd) => nd.slugs[lang] === slug);
      if (!exists) {
        notValid = false;
      } else {
        slug =
          this.slugify(elm.i18n[lang]?.lbl || elm._eid.str, this.locale) +
          '-' +
          count;
        count++;
      }
    }

    return slug;
  }

  slugify(string, lang) {
    const a =
      'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;';
    const b =
      'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------';
    const p = new RegExp(a.split('').join('|'), 'g');

    const and = lang === 'de' ? 'und' : 'and';

    return string
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/ä/gi, 'ae')
      .replace(/ö/gi, 'oe')
      .replace(/ü/gi, 'ue')
      .replace(/ß/gi, 'ss')
      .replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-' + and + '-') // Replace & with 'and'
      .replace(/[^\w\-]+/g, '') // Remove all non-word characters
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  }

  /* toggleTheme() {
    let name =
      this.theme.name === 'kia-light-theme'
        ? 'kia-dark-theme'
        : 'kia-light-theme';

    this.pS.pref.theme = this.themes.find((theme) => theme.name === name);
    this.installTheme(name);
  }
  installTheme(name?: string) {
    if (!name) name = 'kia-dark-theme';
    const theme = this.themes.find((theme) => theme.name === name);
    if (!theme) {
      return;
    }
    this.subject.theme.next(theme);
    this.theme = theme;
    if (
      this.theme.name === 'kia-light-theme' &&
      this.overlay.classList.contains('kia-dark-theme')
    ) {
      this.overlay.classList.remove('kia-dark-theme');
    }
    if (
      this.theme.name === 'kia-dark-theme' &&
      this.overlay.classList.contains('kia-light-theme')
    ) {
      this.overlay.classList.remove('kia-light-theme');
    }
    this.overlay.classList.add(this.theme.name);
    this.isDark = this.theme.isDark;
    if (theme.isDefault) {
      this.removeStyle('theme');
    } else {
      this.setStyle('theme', `/assets/${theme.name}.css`);
    }
    if (this.theme) {
      this.pS.pref.update({ theme: this.pS.pref.theme });
    }
  } */
  removeStyle(key: string) {
    const existingLinkElement = this.getExistingLinkElementByKey(key);
    if (existingLinkElement) {
      this.document.head.removeChild(existingLinkElement);
    }
  }
  setStyle(key: string, href: string) {
    this.getLinkElementForKey(key).setAttribute('href', href);
  }
  getLinkElementForKey(key: string) {
    return (
      this.getExistingLinkElementByKey(key) ||
      this.createLinkElementWithKey(key)
    );
  }
  getExistingLinkElementByKey(key: string) {
    // return document.head.querySelector(`link.${getClassNameForKey(key)}`);
    return this.document.head.querySelector(
      `link[rel="stylesheet"].${this.getClassNameForKey(key)}`,
    );
  }
  createLinkElementWithKey(key: string) {
    const linkEl = this.document.createElement('link');
    linkEl.setAttribute('rel', 'stylesheet');
    linkEl.classList.add(this.getClassNameForKey(key));
    this.document.head.appendChild(linkEl);
    return linkEl;
  }

  getClassNameForKey(key: string) {
    return `style-manager-${key}`;
  }

  async getImageHex(elm: Elm) {
    const img = await this.table.imgs.get(elm._eid.str);
    if (img?.version !== elm.figure.version) {
      const res = await fetch(
        '/images/scaled/' +
          elm._eid.str +
          '-' +
          Math.floor(
            this.style.sizes[elm.figure.size || 3].width *
              (elm.figure.magnification || 1.0),
          ) +
          this.retina.suffix +
          '.' +
          elm.figure.ext +
          '?cb=' +
          elm.figure.version,
      );
      if (res.status === 200) {
        const blob = await res.blob();
        if (this.hasIdb) {
          await this.table.imgs
            .put({
              _eid: elm._eid.str,
              version: elm.figure.version,
              image: blob,
            })
            .catch(Dexie.InvalidStateError, (e) => {
              this.hasIdb = false;
            })
            .catch(Dexie.DatabaseClosedError, (e) => {
              this.hasIdb = false;
            })
            .catch((e) => {
              this.hasIdb = false;
            });
        }
        const base64 = await this.blobToBase64(blob);
        elm.figure.image = base64;
      }
    } else {
      const base64 = await this.blobToBase64(img.image);
      elm.figure.image = base64;
    }
  }
  blobToBase64(blob) {
    return new Promise((resolve, _) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  }

  hexToBase64(str) {
    return btoa(
      String.fromCharCode.apply(
        null,
        str
          .replace(/\r|\n/g, '')
          .replace(/([\da-fA-F]{2}) ?/g, '0x$1 ')
          .replace(/ +$/, '')
          .split(' '),
      ),
    );
  }

  getImage(imageUrl: string): Observable<Blob> {
    let headers = new HttpHeaders({
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      Expires: 'Sat, 01 Jan 2000 00:00:00 GMT',
      'content-type': 'image/jpeg',
    });
    return this.http.get(imageUrl, { headers: headers, responseType: 'blob' });
  }

  createImageFromBlob(image: Blob, elm, target) {
    let reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        elm[target] = reader.result;
        if (target === 'viewImage') {
          elm.viewImageSubject.next(reader.result);
          elm.isImageLoading = false;
        }
        if (target === 'fullImage') {
          elm.fullImageSubject.next(reader.result);
          elm.isImageLoading = false;
        }
      },
      false,
    );

    if (image) {
      reader.readAsDataURL(image);
    }
  }

  elementImage(elm, target) {
    let cachebust = '?cachebust=' + Math.random();
    cachebust = '';
    let url;
    if (target === 'viewImage') {
      url =
        '/images/scaled/' +
        elm._eid.str +
        '-' +
        this.style.sizes[elm.figure.size].width +
        this.retina.suffix +
        '.' +
        elm.figure.ext +
        cachebust;
    } else if (target === 'thumbImage') {
      url =
        '/images/scaled/' +
        elm._eid.str +
        '-thumb.' +
        elm.figure.ext +
        cachebust;
    } else if (target === 'fullImage') {
      url =
        '/images/scaled/' +
        elm._eid.str +
        '-' +
        this.style.sizes[6].width +
        this.retina.suffix +
        '.' +
        elm.figure.ext +
        cachebust;
    }

    elm.isImageLoading = true;
    this.getImage(url).subscribe(
      (data) => {
        this.createImageFromBlob(data, elm, target);
      },
      (error) => {
        elm.isImageLoading = false;
        console.log('elementImage ', error);
      },
    );
  }

  allSelection() {
    for (const it of this.selection) {
      it.checked = true;
    }
    this.checked = [...this.selection];

    this.subject.selection.next(this.selection);
    this.subject.checked.next(this.checked);
  }

  clearSelection() {
    for (const it of this.arr) {
      it.checked = false;
    }
    this.checked = [];

    this.subject.selection.next(this.selection);
    this.subject.checked.next(this.checked);
  }

  invertSelection() {
    this.checked = [];
    for (const it of this.selection) {
      if (!it.checked) {
        it.checked = true;
        this.checked.pushUnique(it);
      } else {
        it.checked = false;
      }
    }

    this.subject.selection.next(this.selection);
    this.subject.checked.next(this.checked);
  }

  fixSelection() {
    for (const it of this.checked) {
      it.i18n.en = {
        strs: {
          lbl: it.i18n.de.strs.lbl,
        },
      };
      it.i18n.en.strs.bdy = '<p>' + this.system.i18n.en.strs.IPSUM + '</p>';

      it.i18n.en.strs.dirty = true;
      this.save(it);
    }
    this.checked = [];

    this.subject.checked.next(this.checked);
  }

  viewNewElement(query) {
    if (query.selection) {
      this.pS.pref.sorting = { active: 'updated_at', direction: 'desc' };
      this.pS.pref.filterString = '';
      this.pS.pref.filter = [];
      this.pS.pref.query = {
        children: false,
        code: false,
        datarow: false,
        def: {},
        figure: false,
        i18n: '',
        id: '',
        latex: false,
        prop: {},
        reference: false,
        set: {},
        table: false,
        textbody: false,
        val: {},
      };
      this.filter();
    }
    if (query.viewer) {
      this.navigate(this.selection[0]);
    }
    if (query.editor) {
      this.edit(this.selection[0]);
    }
  }

  addElement(kind?) {
    let owner_id = this.pS.profile._id.str;
    let elm = new Elm({ created_id: owner_id, updated_id: owner_id });
    elm.dirty = true;
    let labelKey;
    if (kind === 'child') {
      labelKey = 'NEW_ELEMENT';
    } else {
      labelKey = 'NEW_ELEMENT';
    }

    let suffix = 1,
      candidate;

    for (const locale of this.locales) {
      candidate = this.system.i18n[locale].strs[labelKey];

      elm.i18n[locale] = {
        strs: {
          lbl: this.system.i18n[locale].strs[labelKey],
        },
      };
      if (kind === 'ipsum') {
        elm.i18n[locale].strs.bdy =
          '<p>' + this.system.i18n[locale].strs.IPSUM + '</p>';
      }
      elm.i18n[locale].strs.dirty = true;
    }
    elm.txts = elm.i18n[this.locale].strs;
    elm.task = elm.getTask();
    this.arr.push(elm);
    this.obj[elm._eid.str] = elm;
    this.save(elm);
    this.subject.selection.next(this.selection);
    return elm;
  }

  deleteChecked() {
    for (const it of this.checked) {
      this.deleteElement(it);
    }
  }

  deleteElement(elm) {
    if (!elm.parent && !elm.usedBy.length) {
      this.http
        .delete<any>('/api/elements/' + elm._eid.str)
        .subscribe((res) => {
          if (res.success) {
            this.table.elms.delete(res.element_id).catch(function (e) {
              // console.error('DatabaseClosed error: ' + e.message);
            });
            const index = this.arr.findIndex(
              (el) => el._eid.str === res.element_id,
            );
            this.arr.splice(index, 1);
            this.filter();
          }
        });
    }
  }

  showAlts(show) {
    if (show) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { state: this.rS.state },
      });
    } else {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { state: null },
        queryParamsHandling: 'merge',
      });
    }
  }

  edit(elm, component?, tab?) {
    component = component || this.pS.pref.editor.right || 'editor';
    if (!this.pS.profile.role.editor) {
      return false;
    }
    this.selEditElm = elm;
    this.router.navigate([
      {
        outlets: {
          right: ['redit', component, elm._eid.str],
        },
      },
    ]);

    // const elms = this.allDesc(elm);
    // const index = elms.findIndex((el) => el._eid.str === elm._eid.str);
    // if (tab) {
    //   this.pS.pref.save({ ['edit.' + elm._eid.str + '.tab']: tab });
    // }
    // this.router.navigate([
    //   {
    //     outlets: {
    //       right: [
    //         'redit',
    //         this.pS.pref.edit[elm._eid.str]?.button || 'editor',
    //         elm._eid.str,
    //         index + 1 || 0,
    //       ],
    //     },
    //   },
    // ]);
    // const keypath = 'edit.' + elm._eid.str + '.index';
    // this.pS.pref.save({ [keypath]: index + 1 });
  }

  nav(node) {
    const segments = [];
    segments.push(this.locale);
    segments.push(this.selVol.i18n[this.locale].alias || this.selVol._eid.str);
    segments.push(node.elm.i18n[this.locale].alias || node.elm._eid.str);

    this.router.navigate(segments);
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

  updatedAt(store) {
    let latest = new Date(100);
    for (const iterator of store) {
      if (iterator.updated_at > latest) latest = iterator.updated_at;
    }
    return latest;
  }

  sort(para?: any) {
    let sorting = this.pS.pref.sorting;
    var c = [];
    if (para) {
      this.selection = para;
    }
    this.selection = [
      ...this.selection.sort((x, y) => {
        switch (sorting.active) {
          case 'tasksort':
            c[0] = { a: x.task, b: y.task };
            let a, b;
            if (x.datarow) {
              if (x.host_id === '5d0949f7e37e491e8a1a25bd') {
                a = x.seNo || 1000000;
                a = Number(a);
              }
              if (x.datarow.designs) {
                a = 1000000;
              }
            } else {
              a = 2000000;
              if (x.datacols) {
                // a = -1000000;
              }
              if (x.sign) {
                a = -1000000;
              }
            }
            if (y.datarow) {
              if (y.host_id === '5d0949f7e37e491e8a1a25bd') {
                b = y.seNo || 1000000;
                b = Number(b);
              }
              if (y.datarow.designs) {
                b = 1000000;
              }
            } else {
              b = 2000000;
              if (y.datacols) {
                // b = -1000000;
              }
              if (y.sign) {
                b = -1000000;
              }
            }
            c[1] = { a: a, b: b };
            if (x.datarow) {
              if (x.host_id === '5d0949f7e37e491e8a1a25bd') {
                a = x.datarow.title;
              }
              if (x.datarow.designs) {
                a = '';
                for (const iterator of x.datarow.designs) {
                  a += iterator;
                }
              }
            } else {
              a = 'zzzz';
              if (x.datacols) {
                // a = x.txts.lbl || 'aaaa';
              }
            }
            if (y.datarow) {
              if (y.host_id === '5d0949f7e37e491e8a1a25bd') {
                b = y.datarow.title;
              }
              if (y.datarow.designs) {
                b = '';
                for (const iterator of y.datarow.designs) {
                  b += iterator;
                }
              }
            } else {
              b = 'zzzz';
              if (y.datacols) {
                // b = y.txts.lbl || 'aaaa';
              }
            }
            c[2] = { a: a, b: b };
            if (x.sign) {
              a = x.sign.toLowerCase();
            }
            if (y.sign) {
              b = y.sign.toLowerCase();
            }
            c[3] = { a: a, b: b };

            a =
              y.trouble ||
              x.absnum ||
              x.txts.lbl ||
              x.txts.cpt ||
              x.ident ||
              x._eid.str;
            b =
              x.trouble ||
              y.absnum ||
              y.txts.lbl ||
              y.txts.cpt ||
              y.ident ||
              y._eid.str;
            c[4] = { a: a, b: b };
            break;
          case 'created_at':
            c[0] = { a: x.created_at, b: y.created_at };
            break;
          case 'updated_at':
            c[0] = { a: x.updated_at, b: y.updated_at };
            break;
          case 'updated_at_de':
            c[0] = {
              a: x.i18n.de?.updated_at || '1970-00-00T00:00:00.0Z',
              b: y.i18n.de?.updated_at || '1970-00-00T00:00:00.0Z',
            };
            break;
          case 'updated_at_en':
            c[0] = {
              a: x.i18n.en?.updated_at || '1970-00-00T00:00:00.0Z',
              b: y.i18n.en?.updated_at || '1970-00-00T00:00:00.0Z',
            };
            break;
          case 'views':
            c[0] = {
              a: x.views,
              b: y.views,
            };
            break;
          case 'ident':
            let xistr = '';
            if (x.datarow) {
              if (x.host_id === '5d0949f7e37e491e8a1a25bd') {
                xistr = x.datarow.title || x.datarow.author;
              }
              if (x.host_id === '5d440a14f338af0586baf31d') {
                xistr = x.equ.tex;
              }
              if (x.datarow.designs) {
                for (const iterator of x.datarow.designs) {
                  xistr += iterator;
                }
              }
            }
            let yistr = '';
            if (y.datarow) {
              if (y.host_id === '5d0949f7e37e491e8a1a25bd') {
                yistr = y.datarow.title || y.datarow.author;
              }
              if (y.host_id === '5d440a14f338af0586baf31d') {
                yistr = y.equ.tex;
              }
              if (y.datarow.designs) {
                for (const iterator of y.datarow.designs) {
                  yistr += iterator;
                }
              }
            }
            c[0] = {
              a: (x.txts.lbl || x.ident || xistr)
                .toLowerCase()
                .replace(/\\/gi, '')
                .replace(/ä/gi, 'ae')
                .replace(/ö/gi, 'oe')
                .replace(/ü/gi, 'ue'),
              b: (y.txts.lbl || y.ident || yistr)
                .toLowerCase()
                .replace(/\\/gi, '')
                .replace(/ä/gi, 'ae')
                .replace(/ö/gi, 'oe')
                .replace(/ü/gi, 'ue'),
            };
            break;
          default:
            c[0] = { a: x, b: y };
            break;
        }
        for (const iterator of c) {
          if (_isNumberValue(iterator.a) && _isNumberValue(iterator.b)) {
            iterator.a = Number(iterator.a);
            iterator.b = Number(iterator.b);
          } else {
            iterator.a = iterator.a || 'zzzz';
            iterator.b = iterator.b || 'zzzz';
          }
        }
        if (sorting.direction === 'desc') {
          for (const iterator of c) {
            if (iterator.a === 'zzzz') iterator.a = 'aaaa';
            if (iterator.b === 'zzzz') iterator.b = 'aaaa';
            if (!iterator.a) iterator.a = 'zzz';
            if (!iterator.b) iterator.b = 'zzz';
            if (iterator.a > iterator.b) return -1;
            if (iterator.a < iterator.b) return 1;
          }
        } else {
          for (const iterator of c) {
            if (iterator.a > iterator.b) return 1;
            if (iterator.a < iterator.b) return -1;
          }
        }
      }),
    ];
    this.subject.sort.next(this.selection);
    if (this.loaded) this.pS.pref.update({ sorting: this.pS.pref.sorting });
  }
  filter(userId?) {
    let query = this.pS.pref.query;
    // let filtered = this.selection;
    let filtered: Elm[] = this.arr.filter((elm) => {
      if (userId) {
        if (!elm.updated_id) return false;
        if (elm.updated_id.str !== userId) return false;
      }
      return true;
    });
    if (this.pS.pref.filter.includes('dev')) {
      filtered = [];
      const newDefs = [];
      let updateDefs = false;
      for (const it of this.pS.pref.devs) {
        if (this.obj[it]) {
          newDefs.push(it);
        } else {
          updateDefs = true;
        }
      }
      for (const it of newDefs) {
        filtered.push(this.arr.find((elm) => elm._eid.str === it));
      }
      if (updateDefs) {
        this.pS.pref.save({ devs: newDefs });
      }
    }

    if (this.pS.pref.filter.includes('trouble')) {
      for (const elm of this.arr) {
        this.scanForTrouble(elm);
      }
      filtered = filtered.filter((elm) => elm.trouble);
    } else {
      for (const domain of this.pS.pref.filter) {
        switch (domain) {
          case 'checked':
            filtered = filtered.filter((elm) => elm.checked);
            break;
          case 'opus':
            filtered = filtered.filter(
              (elm) => elm === this.selVol || elm.task === 2,
            );
            break;
          case 'textbody':
            filtered = filtered.filter((elm) => elm.txts && elm.txts.bdy);
            break;
          case 'latex':
            filtered = filtered.filter(
              (elm) => elm.figure && elm.figure.ext === 'tex',
            );
            break;
          case 'datarow':
            filtered = filtered.filter(
              (elm) =>
                elm.host_id && elm.host_id !== '5d0949f7e37e491e8a1a25bd',
            );
            break;
          case 'reference':
            filtered = filtered.filter(
              (elm) =>
                elm.datarow && elm.host_id === '5d0949f7e37e491e8a1a25bd',
            );
            break;
          case 'figure':
            filtered = filtered.filter((elm) => elm.figure);
            break;
          case 'table':
            filtered = filtered.filter(
              (elm) => elm.table || elm.datarow || elm.datacols,
            );
            break;
          case 'code':
            filtered = filtered.filter((elm) => elm.view === 'calc');
            break;
          case 'ver':
            filtered = filtered.filter((elm) => elm.sign);
            break;
          case 'equ':
            filtered = filtered.filter((elm) => elm.equ);
            break;
          case 'children':
            filtered = filtered.filter(
              (elm) => elm.children && elm.children.length > 0,
            );
            break;
          case 'prop':
            for (const key in query[domain]) {
              if (query[domain].hasOwnProperty(key)) {
                filtered = filtered.filter((elm) => elm[key] === query[key]);
              }
            }
            break;
          case 'def':
          case 'set':
            for (const key in query[domain]) {
              if (query[domain].hasOwnProperty(key)) {
                filtered = filtered.filter(
                  (elm) => elm[domain][key] === query[domain][key],
                );
              }
            }
            break;
          case 'id':
            if (query.id) {
              filtered = filtered.filter((elm) => elm._eid.str === query.id);
            }
            break;
          default:
            break;
        }
      }
      if (this.pS.pref.filterString) {
        const str = this.pS.pref.filterString.toLowerCase();
        filtered = filtered.filter((elm) => {
          if (str.includes('table.')) {
            const key = str.split('.')[1];
            if (elm.table) {
              for (const it of elm.table.cols) {
                if (it[key]) {
                  return elm;
                }
              }
            }
          } else {
            let latex = '';
            if (elm.figure && elm.figure.src) {
              latex = elm.figure.src;
            }
            const lbl = elm.txts.lbl || '';
            const lng = elm.txts.lng || '';
            const ident = elm.ident || '';
            const bdy = elm.txts.bdy || '';
            const id = elm._eid.str || '';
            let filename = '';
            8;
            let ext = '';
            let datahost = '';
            if (elm.host_id) {
              let host = this.obj[elm.host_id];
              if (host) {
                datahost = host.txts.lbl;
              }
            }

            if (elm.figure && elm.figure.filename) {
              if (elm.figure.filename) {
                filename = elm.figure.filename;
              }
              if (elm.figure.ext) {
                ext = elm.figure.ext;
              }
            }
            if (
              lbl.toLowerCase().includes(str) ||
              lng.toLowerCase().includes(str) ||
              ident.toLowerCase().includes(str) ||
              bdy.toLowerCase().includes(str) ||
              ext.toLowerCase().includes(str) ||
              datahost.toLowerCase().includes(str) ||
              id.toLowerCase().includes(str) ||
              filename.toLowerCase().includes(str) ||
              latex.toLowerCase().includes(str)
            ) {
              return elm;
            }
          }
        });
      }
    }
    this.selection = filtered;
    this.sort();
    this.subject.selection.next(filtered);
    this.pS.pref.update({ filter: this.pS.pref.filter });
    this.pS.pref.update({ filterString: this.pS.pref.filterString });
    this.pS.pref.update({ sorting: this.pS.pref.sorting });
  }

  async checkOut(elm, lang?) {
    if (this.online) {
      const ckeckouKey: any = { _eid: elm._eid.str };
      if (lang) {
        ckeckouKey.lang = lang;
      }
      let data$: any = this.http.patch<any>(
        '/api/elements/checkout',
        ckeckouKey,
      );
      let message: any = await lastValueFrom(data$);
      if (message.success) {
        if (lang) {
          elm.i18n[lang].checkout_id = message.checkout_id;
        } else {
          elm.checkout_id = message.checkout_id;
        }
        return true;
      } else {
        this.snackbar.open('Server check-out blockiert', message.checkout_id, {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
        });
        return false;
      }
    }
    this.snackbar.open('Server check-out nicht möglich', 'offline', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
    return false;
  }
  checkIn(elm) {
    // if (this.online) {
    //   this.http
    //     .patch(this.origin + '/api/elements/checkin', {
    //       id: elm._eid.str,
    //     })
    //     .subscribe((body: any) => {
    //       if (body.success) {
    //         elm.checkout = false;
    //         elm.savestatus = '';
    //       }
    //     });
    // } else {
    //   elm.checkout = false;
    // }
    return false;
  }
  globalCheckIn() {
    if (this.online) {
      this.http
        .patch(this.origin + '/api/elements/globalcheckin', {
          cmd: 'global',
        })
        .subscribe((body: any) => {
          console.log(body);
        });
    }
  }

  deleteDb() {
    Dexie.delete('kompendia')
      .then(() => {
        console.log('Database successfully deleted');
      })
      .catch((err) => {
        console.error('Could not delete database');
      });
  }

  async overwriteDevDB() {
    await this.table.elms.clear().catch((err) => {
      console.error('Database error: ' + err.message);
    });
    console.log('Elements successfully deleted');
    await this.table.i18ns.clear().catch((err) => {
      console.error('Database error: ' + err.message);
    });
    console.log('Elements i18n successfully deleted');
    window.location.reload();
  }

  saveElmsToProductionDB() {
    for (const elm of this.checked) {
      this.save(elm, true);
      elm.checked = false;
    }
    this.subject.checked.next((this.checked = []));
  }

  getAbsNum(num, maxLevel) {
    let absnum = '';
    for (let index = 0; index <= maxLevel; index++) {
      absnum += (10000 + (num[index] || 0)).toString();
    }
    return parseInt(absnum);
  }

  saveElmsToFileSystem(all) {
    const result: any = { elms: [], i18ns: [] };
    const sel = this.checked;
    let elms = [];
    if (all) {
      elms = this.usedElms(sel);
    } else {
      elms = sel;
    }
    for (const elm of elms) {
      result.elms.push(elm.def);
      const i18n = elm.i18n;
      for (const lang in i18n) {
        if (Object.prototype.hasOwnProperty.call(i18n, lang)) {
          const strs = i18n[lang].strs || {};
          delete strs._eid;
          delete strs.lang;
          const def = {
            _eid: elm._eid.str,
            lang: lang,
            strs: strs,
            updated_id: elm.updated_id?.str || '5b302d7a33dcbd34e4000e61',
            updated_at: elm.updated_at.toISOString(),
          };
          result.i18ns.push(def);
        }
      }
    }
    this.saveToFileSystem(result, 'kdiaDB-selection');
  }

  saveToFileSystem(obj, filename?) {
    const text = JSON.stringify(obj, null, '\t');
    const blob = new Blob([text], { type: 'application/json' });
    var a = document.createElement('a'),
      url = URL.createObjectURL(blob);
    a.href = url;
    a.download = filename || 'kdiaDB';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  getEqu(element) {
    let body = { data: element.figure.src };
    this.serverApi('/typeset', body).subscribe(
      (body) => this.getEquAction(body, element),
      (error) => (this.errorMessage = <any>error),
    );
  }

  getEquAction(body, element) {
    if (body.success) {
      element.figure.render = body.data.svg;
      element.errors = null;
      element.update({ 'figure.render': element.figure.render });
    } else {
      element.errors = body.data.errors;
      console.log(body.confirmation);
    }
  }

  serverApi(route, body): Observable<{}> {
    let url = this.origin + '/api' + route;
    if (route === '/auth/login') {
      body.userAgentInfo = this.deviceInfo;
    }
    const httpOptions = {
      // headers: headers
    };
    return this.http
      .post(url, body, httpOptions)
      .pipe(map(this.serverApiResponse), catchError(this.handleError));
  }
  serverApiResponse(res) {
    return res || {};
  }
  private handleError(error: HttpErrorResponse) {
    console.log(error);
    return throwError('Something bad happened; please try again later.');
  }

  setVarKeys(elm) {
    let keys = [];
    let doubles = true;
    let l = 0;
    let cs = elm.children.filter((child) => child.elm.sign);
    let incr = 0;

    do {
      l++;
      keys = [];
      for (const it of cs) {
        let c = it.elm;
        let k;

        if (l === 2 && c.sign.length === 1 && c.sign.toLowerCase() === c.sign) {
          k = c.sign + '_';
        } else {
          k = c.sign.replace(/<[^>]*>?/gm, '').toLowerCase();
        }

        for (let i = 0; i < GREEKCHARS.length; i++) {
          k = k.replace(GREEKCHARS[i], GREEKCHARNAMES[i].toLowerCase());
        }
        k = k.replace(/[^a-zA-Z0-9\_\:]*/gm, '');

        if (k.length > 0) {
          k = k.substring(0, l);
        }

        if (k.length < l) {
          // k = k + '_' + incr;
          incr++;
        }

        it.set.name = k;
        it.setDef.name = k;
        keys.push(k);
      }

      var duplicates = keys.reduce(function (acc, el, i, arr) {
        if (arr.indexOf(el) !== i && acc.indexOf(el) < 0) acc.push(el);
        return acc;
      }, []);

      if (duplicates.length) {
        cs = [];
        for (const k of duplicates) {
          let found = elm.children.filter((child) => child.set.name === k);
          cs = cs.concat(found);
        }
        doubles = true;
      } else {
        doubles = false;
      }
      if (l > 12) {
        for (const k of duplicates) {
          let found = elm.children.filter((child) => child.set.name === k);
          found[1].set.name = found[1].set.name + '_';
          found[1].setDef.name = found[1].setDef.name + '_';
          elm.dirty = true;
        }
        console.log('exit');
        doubles = false;
      }
    } while (doubles);

    let names = [];
    let sigs = elm.children.filter((child) => child.elm.sign);
    for (const it of sigs) {
      names.push(it.set.name);
      const srcs = elm.srcs || [];
      for (const src of srcs) {
        if (src.body) {
          var re = new RegExp('_.' + it.elm.key, 'gm');
          src.body = src.body.replace(re, '_.' + it.set.name);
          // console.log(src.body);
        }
      }
    }
    if (names.length) {
      // console.log(names, l, duplicates, elm._eid.str);
    }

    // this.save(elm,true);
  }

  allDesc(elm) {
    let result = [];
    allDescendants(elm);
    function allDescendants(node) {
      let desc = node.children;
      if (desc?.length) {
        for (var i = 0; i < desc.length; i++) {
          var child = desc[i].elm;
          allDescendants(child);
          result.push(child);
        }
      }
    }
    return result;
  }

  allTreeNodes(vol) {
    let result = [],
      absnum = 1;
    for (let i = 0; i < vol.tree.length; i++) {
      const node = vol.tree[i];
      result.pushUnique(node);
      allDescendants(node);
    }
    function allDescendants(node) {
      let cs = node.children;
      if (cs && cs.length) {
        for (let i = 0; i < cs.length; i++) {
          let child = cs[i];
          result.pushUnique(child);
          allDescendants(child);
        }
      }
    }
    return result;
  }
  allTreeElms(vol) {
    let result = [];
    let nodes = this.allTreeNodes(vol);
    for (const it of nodes) {
      result.pushUnique(it.elm);
    }
    return result;
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
  usedElms(elms) {
    let result = [];
    for (let i = 0; i < elms.length; i++) {
      const elm = elms[i];
      result.pushUnique(elm);
      allDescendants(elm);
    }
    function allDescendants(elm) {
      if (elm.datarows) {
        for (const it of elm.datarows) {
          result.pushUnique(it);
        }
      }
      if (elm.refs) {
        for (const it of elm.refs) {
          result.pushUnique(it);
        }
      }
      let cs = elm.children;
      if (cs && cs.length) {
        for (let i = 0; i < cs.length; i++) {
          let child = cs[i].elm;
          allDescendants(child);
          result.pushUnique(child);
        }
      }
      cs = elm.tree;
      if (cs && cs.length) {
        for (let i = 0; i < cs.length; i++) {
          let child = cs[i].elm;
          allDescendants(child);
          result.pushUnique(child);
        }
      }
    }
    return result;
  }
  allElmsNo(node) {
    let counters = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const task = node.elm.getTask();
    counters[task]++;
    node.no = counters[task];

    if (node.elm.children?.length) {
      for (let i = 0; i < node.elm.children.length; i++) {
        const nd = node.elm.children[i];
        const elm = node.elm.children[i].elm;

        allDescendants(nd);
      }
    }
    function allDescendants(nd) {
      counters[nd.elm.task]++;
      nd.no = counters[nd.elm.task];
      let cs = nd.elm.children;
      if (cs && cs.length) {
        for (let i = 0; i < cs.length; i++) {
          const node = cs[i];
          const child = cs[i].elm;
          if (child.task && child.task !== 2 && child.task !== 4) {
            counters[child.task]++;
            node.no = counters[child.task];
          }
          allDescendants(node);
        }
      }
    }
  }

  getValueType(value) {
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'string') {
      if (/<\/?[a-z][\s\S]*>/i.test(value)) {
        return 'html';
      }
      if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(value))
        return 'string';
      const d = new Date(value);
      if (!isNaN(d.getTime()) && d.toISOString() === value) return 'date';

      return 'string';
    }
    if (typeof value === 'object' && value.isArray()) {
      return 'array';
    }

    if (typeof value === 'object' && value instanceof ObjectID) {
      return 'objectId';
    }

    if (typeof value === 'object' && value instanceof Date) {
      return 'date';
    }

    return 'string';
  }
}

var GREEKCHARS = [
  'Α',
  'Β',
  'Γ',
  'Δ',
  'Ε',
  'Ζ',
  'Η',
  'Θ',
  'Ι',
  'Κ',
  'Λ',
  'Μ',
  'Ν',
  'Ξ',
  'Ο',
  'Π',
  'Ρ',
  'Σ',
  'Τ',
  'Υ',
  'ϒ',
  'Φ',
  'Χ',
  'Ψ',
  'Ω',
  ' ',
  ' ',
  'α',
  'β',
  'γ',
  'δ',
  'ε',
  'ζ',
  'η',
  'θ',
  'ϑ',
  'ι',
  'κ',
  'λ',
  'μ',
  'ν',
  'ξ',
  'ο',
  'π',
  'ϖ',
  'ρ',
  'ς',
  'σ',
  'τ',
  'υ',
  'φ',
  'χ',
  'ψ',
  'ω',
  'ϑ',
  'ϒ',
  'ϖ',
  '・',
  '…',
  ' ',
  ' ',
  ' ',
  ' ',
  '①',
  '②',
];

var GREEKCHARNAMES = [
  'Alpha',
  'Beta',
  'Gamma',
  'Delta',
  'Epsilon',
  'Zeta',
  'Eta',
  'Theta',
  'Iota',
  'Kappa',
  'Lambda',
  'Mu',
  'Nu',
  'Xi',
  'Omicron',
  'Pi',
  'Rho',
  'Sigma',
  'Tau',
  'Upsilon',
  'Phi',
  'Chi',
  'Psi',
  'Psi',
  'Omega',
  ' ',
  ' ',
  'Alpha',
  'Beta',
  'Gamma',
  'Delta',
  'Epsilon',
  'Zeta',
  'Eta',
  'Theta',
  'ϑ',
  'ι',
  'Kappa',
  'Lambda',
  'Mu',
  'Nu',
  'Xi',
  'Omicron',
  'Pi',
  'ϖ',
  'ρ',
  'ς',
  'sigma',
  'τ',
  'υ',
  'phi',
  'χ',
  'ψ',
  'ω',
  'ϑ',
  'ϒ',
  'ϖ',
  '・',
  '…',
  ' ',
  ' ',
  ' ',
  ' ',
  'aaa',
  'bbb',
];
