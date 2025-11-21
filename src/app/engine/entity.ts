/**
 * @license
 * Copyright 4Ming e.K. All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * LICENSE file at https:// kompendia.net/LICENSE.txt
 */
import { HttpClient } from '@angular/common/http';
import Dexie from 'dexie';
import { BehaviorSubject } from 'rxjs';
import ObjectID from '../core/bson-objectid';
import { Utils } from '../core/global.utilities';
// import { ElmNode } from '../core/interfaces';
var getByKeyPath = Dexie.getByKeyPath;
var setByKeyPath = Dexie.setByKeyPath;
var shallowClone = Dexie.shallowClone;
var deepClone = Dexie.deepClone;

declare var PROP: string[];

var PROP = [
  '_eid',
  'active',
  'attrib',
  'children',
  'needs',
  'calc',
  'code',
  'codeMode',
  'created_at',
  'created_id',
  'current',
  'data',
  'datacols',
  'datarow',
  'deleted',
  'design',
  'element_id',
  'elm_id',
  'equ',
  'figure',
  'func',
  'grids',
  'height',
  'host_id',
  'key',
  'locale',
  'notes',
  'published',
  'refs',
  'sign',
  'srcs',
  'state',
  'style',
  'table',
  'toc',
  'tree',
  'lastmod_at',
  'updated_at',
  'updated_id',
  'user_id',
  'version',
  'view',
  'width',
];

export class Def {
  elms: Elm[];
  i18ns: any[];
}

export class Elms {
  arr: Elm[] = [];
  vols: Elm[] = [];
  selection: Elm[] = [];
  changeLogs = [];
  checked: Elm[] = [];
  favorites: Elm[] = [];
  obj: any = {};
  slug: any = {};
  selElm: Elm;
  selVol: Elm;
  system: Elm;
  loadedLangs = [];
  hasIdb = true;
  domain: string;
  constructor(
    private _http: HttpClient,
    private elmTable: Dexie.Table<Elm, string>,
    private i18nTable: Dexie.Table<any, string>,
    isBrowser,
    origin,
  ) {
    this.hasIdb = isBrowser;
  }
}

export class Entity {
  set: any;
  storage: any;
  created_id: ObjectID;
  updated_id: ObjectID;
  created_at: Date;
  updated_at: Date;
  lastmod_at: Date;
  comments: any[];
  logs: any[];
  hasWarning: boolean;
  hasError: boolean;
  trouble: number;
  checkout: boolean;
  savestatus: string;
  isDirty: boolean;
  dirty: boolean;
  constructor(def?) {}

  set def(def) {
    for (const key in def) {
      if (def.hasOwnProperty(key)) {
        const value = def[key];
        switch (key) {
          case 'created_at':
            this.created_at = new Date(value);
            break;
          case 'updated_at':
            this.updated_at = new Date(value);
            break;
          case 'created_id':
            this.created_id = new ObjectID(value);
            break;
          case 'updated_id':
            this.updated_id = new ObjectID(value);
            break;
          default:
            // this[key] = Utils.deepClone(value);
            this[key] = value;
            break;
        }
      }
    }

    let date = new Date();
    if (!this.created_at) this.created_at = date;
    if (!this.updated_at) this.updated_at = date;
  }

  get def() {
    const res: any = {};
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value: any = this[key];
      }
    }
    return res;
  }

  init(treeDB?) {}
  setTheme(theme) {}

  update(query?) {
    this.dirty = true;
    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        setByKeyPath(this, key, query[key]);
        if (this.storage) {
          this.storage.modify({ [key]: query[key] }).catch(function (e) {
            // console.error('DatabaseClosed error: ' + e.message);
          });
        }
      }
    }
    this.updated_at = new Date();
    // console.log("update", this);
  }

  log(kind, message, info?) {
    if (!this.logs) {
      this.logs = [];
    }

    if (kind === 'warning') {
      this.hasWarning = true;
    }

    this.logs.push(kind + ' ' + message + ' ' + info);
  }
  setDirty(status: boolean) {
    if (status) {
      this.updated_at = new Date();
    }
    this.dirty = status;
  }
}

export class Notification extends Entity {
  _id: ObjectID;
  user_id: ObjectID;
  context_id: ObjectID;
  subject_id: ObjectID;
  action: string;
  strs: any;
}
export class I18n {
  _eid: ObjectID;
  lang: string;
  strs: any = {};
  updated_at: Date;
  updated_id: ObjectID;
  checkout_id: ObjectID;
  constructor(def) {
    this.def = def;
  }

  set def(def) {
    for (const key in def) {
      if (def.hasOwnProperty(key)) {
        const value = def[key];
        switch (key) {
          case '_eid':
            this._eid = new ObjectID(value);
            break;
          case 'lang':
            this.lang = value;
            break;
          case 'strs':
            this.strs = { ...value };
            break;
          case 'updated_at':
            this.updated_at = new Date(value);
            break;
          case 'updated_id':
            this.updated_id = new ObjectID(value);
            break;
          case 'checkout_id':
            this.checkout_id = new ObjectID(value);
            break;
        }
      }
    }
  }

  get def() {
    const res: any = {};
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value: any = this[key];
        switch (key) {
          case '_eid':
            res._eid = value.str;
            break;
          case 'lang':
            res.lang = value;
            break;
          case 'strs':
            res.strs = { ...value };
            break;
          case 'updated_at':
            res.updated_at = value.toISOString();
            break;
          case 'updated_id':
            res.updated_id = value.str;
            break;
          case 'checkout_id':
            res.checkout_id = value.str;
            break;
        }
      }
    }
    return res;
  }
}

export class ElmNode {
  id: string;
  elm: Elm;
  tableId: string;
  lbls: any;
  slugs: any;
  children: ElmNode[];
  expandable: boolean;
  level: number;
  num: string;
  nums: any;
  parents: any;
  path: string;
  no: number;
  role: string;
  set: ChildSet;
  setDef: any;
  constructor(def: any = {}) {
    for (const key in def) {
      if (def.hasOwnProperty(key)) {
        this[key] = def[key];
      }
    }
    this.set = new ChildSet(def.set);

    this.setDef = new ChildSet(Utils.deepClone(def.set));
  }

  getPath(lang) {
    let path = '/' + lang;
    for (const par of this.parents || []) {
      path += '/' + par.elm.i18n[lang]?.strs.slug || par.elm.txts.slug;
    }
    path += '/' + this.elm.i18n[lang]?.strs.slug || this.elm.txts.slug;
    return path;
  }
}

export class ChildSet {
  name: string;
  no: number;
  state: any;
  figure: any;
  attrib: any;
  setDef: any;
  parent: Elm;
  constructor(def: any = {}) {
    this.name = def.name;
    this.no = def.no;
    this.state = def.state || {};
    this.figure = def.figure || {};
    this.attrib = def.attrib || {};
  }
}
export class Elm extends Entity {
  test: any;
  _eid: ObjectID;
  seNo: number;
  attrib: any;
  checked = false;
  checkout_id: string;
  refs: any[] = [];
  calc: any;
  code: any;
  codeMode: string;
  datacols: any;
  datarow: any;
  defSubject: BehaviorSubject<any>;
  figure: any;
  equ: any;
  func: any;
  grids: any[];
  host_id: string;
  i18n: any = {};
  key: string;
  references: Elm[];
  sets: any[] = [];
  sign: string;
  srcs: any[] = [];
  style: any;
  table: any;
  txts: any = {};
  version: string;
  view: string;
  history: any;
  altElm: Elm;

  roleElm: any;
  children: any[];
  tree: ElmNode[];
  flatTree: ElmNode[];

  notes: string;

  project: any;

  views = 0;

  misc: any = {};

  parent: Elm;
  home: Elm;
  usedBy: Elm[] = [];
  task = 0;
  ident: string;
  selectedTab1: number;
  num: string;
  absnum: number;
  state: any = {};
  val: any;
  dataHost: Elm;
  datarows: Elm[];
  dataselection: any[];
  input: boolean;
  viewPort: any;
  job: any;
  autoGrids: any[];
  construct: any;
  featureIndex = 0;
  undos: any[];
  undoIndex = 0;
  featureIndexSubject = new BehaviorSubject<number>(0);
  selected: boolean;
  published_at: Date;
  constructor(def) {
    super(def);

    this.def = def;

    if (def.tree) {
      this.flatTree = this.flattenTree(def.tree).concat(this.children);
    }

    if (!def._eid) {
      this._eid = new ObjectID();
    }
    if (!this.attrib) {
      this.attrib = {};
    }

    this.defSubject = new BehaviorSubject<any>(false);

    if (def.style && def.style.sizes) {
      def.style.sizes[6] = {
        size: 'full',
        width: 1920,
      };
    }

    if (def.figure) {
      if (def.figure.filename && def.figure.filename.includes('.jpeg')) {
        //def.figure.themed = true;
      }
    }

    if (def._eid === '5d3b78c08770d2664a24dee9') {
      let found = def.datacols.find((col) => col.field === 'rpId');
      if (!found) def.datacols.push({ field: 'rpId' });
    }

    this.key = def.key;
    this.dataselection = [];

    if (def.children && def.code) {
    }
    this.sets[0] = {
      state: Utils.deepClone(this.state || {}),
      def: { state: {}, figure: {} },
    };

    if (this.host_id === '5d0949f7e37e491e8a1a25bd' && !this.datarow) {
      this.datarow = {};
    }

    if (this.view) {
      this.setGrids();
    }

    if (this.figure) {
      if (this.figure.ext === 'jpg' || this.figure.ext === 'png') {
        if (!this.figure.version) {
          this.figure.version = 1;
        }
        if (!this.figure.ratio) {
          this.figure.ratio = 1;
          if (this.figure.width && this.figure.height) {
            this.figure.ratio = this.figure.width / this.figure.height;
          }
        }
      }
    }

    if (this.attrib.role === 'volume') {
      this.roleElm = {
        poster: this.children.find((nd) => nd.role === 'poster'),
        feature: this.children.find((nd) => nd.role === 'feature'),
        about: this.children.find((nd) => nd.role === 'about'),
        contact: this.children.find((nd) => nd.role === 'contact'),
        impress: this.children.find((nd) => nd.role === 'impress'),
        page404: this.children.find((nd) => nd.role === 'page404'),
      };
    }
  }

  set def(def) {
    super.def = def;
    for (const key in def) {
      if (def.hasOwnProperty(key)) {
        const value = def[key];
        switch (key) {
          case '_eid':
            this._eid = new ObjectID(value);

            break;
          case 'children':
            this.children = [];
            for (const child of def.children || []) {
              if (this.attrib?.role === 'volume') {
                this.children.push(new ElmNode(child));
              } else {
                this.children.push(new ElmNode(child));
              }
            }
            break;
          case 'refs':
            this[key] = value.map((id) => {
              return { id: id };
            });
            // let newRefs = [];
            // for (const it of value) {
            //   if (it.id) {
            //     newRefs.push(it.id);
            //   }
            // }
            // if (newRefs.length > 0) {
            //   this[key] = newRefs;
            // } else {
            //   this[key] = value || [];
            // }

            break;
          case 'toc':
            this.children = def.toc;
            break;
          case 'table':
            if (value) {
              value.data = value.data.filter((r) => r);
              this[key] = Utils.deepClone(value);
            }
            break;

          case 'figure':
            this[key] = Utils.deepClone(value);
            break;

          case 'state':
            for (const key in def.state) {
              if (def.state.hasOwnProperty(key)) {
                this.state[key] = def.state[key];
              }
            }
            break;
          case 'created_at':
            break;
          case 'updated_at':
            break;
          case 'created_id':
            break;
          case 'updated_id':
            break;
          default:
            this[key] = value;
            break;
        }
      }
    }

    if (this.code) {
      if (!this.version) {
        this.version = '0.0.1';
      }
      if (!this.children) this.children = [];
      this.undos = [];
    }
    let date = new Date();
    if (!this.created_at) this.created_at = date;
    if (!this.updated_at) this.updated_at = date;

    this.task = this.getTask();
  }
  get def() {
    const res: any = {};
    for (const key in this) {
      if (this.hasOwnProperty(key) && PROP.includes(key)) {
        let value: any = this[key];
        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            if (value.length) {
              switch (key) {
                case 'children':
                  res[key] = value.map((entry) => {
                    let child = entry.elm;
                    const childDef: any = { id: entry.id };
                    if (entry.tableId) {
                      childDef.tableId = entry.tableId;
                    }
                    if (entry.colNameId) {
                      childDef.colNameId = entry.colNameId;
                    }
                    if (entry.colValueId) {
                      childDef.colValueId = entry.colValueId;
                    }
                    if (entry.colId) {
                      childDef.colId = entry.colId;
                    }
                    if (entry.rowId) {
                      childDef.rowId = entry.rowId;
                    }
                    if (entry.setDef) {
                      childDef.set = Utils.deepClone(
                        entry.setDef || entry.set,
                        true,
                      );
                      if (!Utils.notEmpty(childDef.set)) {
                        delete childDef.set;
                      }
                    }
                    if (entry.num) {
                      childDef.num = Utils.deepClone(entry.num);
                    }
                    if (entry.role) {
                      childDef.role = entry.role;
                    }
                    if (entry.slugs) {
                      childDef.slugs = entry.slugs;
                    }
                    return childDef;
                  });
                  break;
                case 'tree':
                  res['tree'] = this.getTree(this.tree);
                  break;
                case 'refs':
                  res[key] = value.map((ref) => {
                    return ref.id;
                  });
                  break;
                case 'datacols':
                  res[key] = value.map((elm) => {
                    let entry = { ...elm };
                    delete entry.targetElement;
                    return entry;
                  });
                  break;
                case 'authors':
                  res[key] = value.map((elm) => {
                    return elm;
                  });
                  break;
                case 'grids':
                  let newGrid = [];
                  for (const it of value) {
                    let entry = {};
                    for (const key in it) {
                      if (it.hasOwnProperty(key) && key !== 'children') {
                        entry[key] = it[key];
                      }
                    }
                    newGrid.push(entry);
                  }
                  if (newGrid.length) {
                    res[key] = newGrid;
                  } else {
                    res[key] = null;
                  }
                  break;

                default:
                  break;
              }
            } else {
              if (key === 'children') {
                res[key] = null;
              }
            }
          }

          if (key === 'table') {
            const toSplice = [];
            const cols = this.table.cols.filter(
              (col) => col.field !== 'dynamicUi',
            );
            // for (const col of cols) {
            //   delete col.mode;
            // }
            const data = this.table.data
              .filter((r) => r._eid || !r.elm)
              .map((r, i) => {
                let entry = { ...r };
                delete entry.elm;
                return entry;
              });
            res[key] = { ...this.table };
            res[key].cols = cols;
            res[key].data = data;
          }

          if (key === 'equ') {
            delete this.equ.no;
            if (this.equ.tex) {
              res[key] = { ...this.equ };
            } else {
              value = null;
              for (const key in this.i18n) {
                if (Object.prototype.hasOwnProperty.call(this.i18n, key)) {
                  const lang = this.i18n[key];
                  if (lang.tex) {
                    delete lang.tex;
                  }
                }
              }
            }
          }
          if (key === 'figure') {
            res[key] = { ...this.figure };
            delete res[key].image;
          }

          if (key === 'i18n') {
            const toDelete = [];
            for (const locale in this.i18n) {
              if (Object.prototype.hasOwnProperty.call(this.i18n, locale)) {
                const lang = this.i18n[locale];
                for (const key in lang) {
                  if (Object.prototype.hasOwnProperty.call(lang, key)) {
                    if (!lang[key] || lang[key]?.length === 0) {
                      toDelete.push({ locale: locale, key: key });
                    }
                    if (key === 'tex' && !this.equ?.tex) {
                      toDelete.push({ locale: locale, key: key });
                    }
                  }
                }
              }
            }
            for (const it of toDelete) {
              delete this.i18n[it.locale][it.key];
            }
            res[key] = deepClone(this[key]);
          }

          if (key === 'datarow') {
            res['datarow'] = deepClone(this.datarow);
            delete res['datarow'].figure;
            delete res['datarow'].latex;
            delete res['datarow'].elm;
          }

          if (typeof value === 'object' && value instanceof Date) {
            res[key] = value.toISOString();
          }
          if (typeof value === 'object' && value instanceof ObjectID) {
            res[key] = value.str;
          }
          if (
            value !== null &&
            Object.entries(value).length > 0 &&
            !res[key] &&
            key !== 'grids' &&
            key !== 'tocdef'
          ) {
            if (key === 'style') {
              res[key] = { sizes: [...value.sizes] };
            } else {
              res[key] = Utils.deepClone(value);
            }
          }
        } else {
          if (value) {
            res[key] = value;
          }
        }
      }
    }

    return res;
  }

  flattenTree(tree, parent?) {
    let flat = [];
    for (let i = 0; i < tree.length; i++) {
      const node = (tree[i] = new ElmNode(tree[i]));
      node.expandable = !!node.children;
      node.nums = node.nums || [i];
      node.level = parent ? parent.level + 1 : 0;
      if (parent) {
        node.nums = [...(parent.nums || [0])];
        node.parents = [...(parent.parents || [])];
        node.parents.push(parent);
        node.nums[node.parents.length] = i + 1;
      }
      flat.push(node);
      if (node.children) {
        flat = flat.concat(this.flattenTree(node.children, node));
      }
    }
    for (let i = 0; i < flat.length; i++) {
      const nd = flat[i];
      nd.num = flat[i].nums.join('.');
      nd.path = '';
    }
    return flat;
  }

  getTree(tree) {
    let def = [];

    for (let i = 0; i < tree.length; i++) {
      const obj = tree[i];
      const objDef: any = {
        id: obj.id,
        lbls: deepClone(obj.lbls),
        slugs: deepClone(obj.slugs),
      };
      if (obj.attrib) {
        objDef.attrib = obj.attrib;
      }
      def.push(objDef);

      allDescendants(obj, objDef);
      function allDescendants(node, nodeDef) {
        let cs = node.children;
        if (cs && cs.length) {
          for (let ii = 0; ii < cs.length; ii++) {
            let c = cs[ii];
            let cDef: any = {
              id: c.id,
              lbls: deepClone(c.lbls),
              slugs: deepClone(c.slugs),
            };
            if (c.attrib) {
              cDef.attrib = c.attrib;
            }
            if (!nodeDef.children) {
              nodeDef.children = [];
            }
            nodeDef.children.push(cDef);
            allDescendants(c, cDef);
          }
        }
      }
    }

    return def;
  }

  distSlugs() {
    for (const nd of this.flatTree) {
      console.log('distSlugs', nd.elm, nd.slugs);
      for (const key in nd.slugs) {
        if (nd.slugs.hasOwnProperty(key)) {
          const slug = nd.slugs[key];
          const i18n = nd.elm.i18n[key];
          if (slug && i18n) {
            if (!i18n.strs.slug) {
              i18n.strs.slug = slug;
            }
          }
        }
      }
    }
  }

  setProject(proj) {
    if (proj) {
      for (const it of this.children) {
        let entry = proj.current.find((entry) => it.id === entry.id);
        if (!entry && it.set) {
          entry = { id: it.id, state: deepClone(it.set.state) };
          proj.current.push(entry);
        }
        for (const dat of proj.data) {
          let entry = proj.dat?.state?.find((entry) => it.id === entry.id);
          if (!entry && it.set) {
            entry = { id: it.id, state: deepClone(it.set.state) };
            proj.data?.state?.push(entry);
          }
        }
      }
    }
  }

  getTask() {
    let task = 0;
    if (this.datarow) {
      task = 11;
    }
    // if (this.equ) {
    //   task = 4;
    // }
    if (this.figure) {
      task = 8;
      // if (this.figure.ext === 'tex') {
      //   task = 4;
      // }
      if (
        this.figure.ext === 'flac' ||
        this.figure.ext === 'mov' ||
        this.figure.ext === 'mp4' ||
        this.figure.ext === 'm4a'
      ) {
        task = 13;
      }
    }
    if (this.attrib?.role === 'volume') {
      task = 1;
    }
    if (this.table) {
      task = 9;
    }
    if (this.datacols) {
      task = 10;
    }
    if (this.equ) {
      task = 4;
    }
    if (this.sign) {
      task = 5;
    }
    if (this.view === 'calc') {
      task = 3;
    }
    if (this.view === 'grid') {
      task = 8;
    }
    if (!task) {
      task = 14;
      for (const key in this.i18n) {
        if (this.i18n.hasOwnProperty(key)) {
          const element = this.i18n[key];
          if (element.bdy) {
            task = 12;
          }
        }
      }
    }
    return task;
  }

  makeGrids(width) {
    let countFigures = 0,
      cols = 1,
      size = 0;
    let wM = 0,
      hM = 0;

    for (let index = 0; index < this.children.length; index++) {
      const element = this.children[index];
      if (element.figure && element.figure.ext === 'tex') {
        countFigures++;
        wM = Math.max(wM, element.figure.width) || width;
        hM = Math.max(hM, element.figure.height) || 28;
      }
    }
    if (countFigures) {
      cols = Math.floor(width / (wM + 55)) || 1;
      if (this.autoGrids) {
        this.autoGrids.unshift({
          cols: 1, // xxx
          end: countFigures,
          rowHeight: hM + 6,
          name: 'grid0',
          align: 'left',
          lblWidth: 0,
          signWidth: 0,
          unitWidth: 0,
          buttonWidth: 0,
        });
      }
    }
  }
  setGrids(view?) {
    this.view = view || this.view;
    view = view || this.view;
    if (view === 'list') {
      this.grids = null;
    }
    if (view === 'none') {
      this.grids = null;
    }
    if (view === 'calc') {
      this.grids = [
        {
          cols: 1,
          table: true,
          rowHeight: 28,
          name: 'grid1',
          children: [],
        },
        {
          cols: 1,
          table: true,
          rowHeight: 28,
          name: 'grid2',
          children: [],
        },
        {
          cols: 1,
          table: true,
          rowHeight: 28,
          name: 'grid3',
          children: [],
        },
      ];
    }
    if (view === 'grid') {
      this.grids = [
        {
          cols: 4,
          table: false,
          rowHeight: 128,
          name: 'grid1',
          children: [],
        },
      ];
    }
  }
  fillGrids() {
    if (this.view === 'calc') {
      if (this.grids.length !== 3) {
        this.setGrids();
      }
      this.grids[0].children = [];
      this.grids[1].children = [];
      this.grids[2].children = [];
      for (const it of this.children) {
        if (it.elm?.equ && !it.elm?.sign) {
          this.grids[0].children.push(it);
        }
        if (it.elm?.sign && !it.set?.state.input && !it.set?.state.play) {
          this.grids[1].children.push(it);
        }
        if (it.elm?.sign && (it.set?.state.input || it.set?.state.play)) {
          this.grids[2].children.push(it);
        }
      }
    }

    if (this.view === 'grid') {
      this.grids[0].children = [];
      for (const it of this.children) {
        if (it.elm.figure && it.elm.figure.ext === 'png') {
          this.grids[0].table = false;
          this.grids[0].children.push(it);
        }
      }
    }

    return this.grids;
  }
  setUndo(value) {
    if (this.input) {
      this.parent.undos.push({
        element_id: this._eid,
        status: { value: value, values: value },
      });
      this.parent.undoIndex = this.parent.undos.length;
    }
  }
  getUndo() {}
  setTheme(theme) {
    if (this.construct) {
      // this.construct.setSvg(null,this.tree);
      // this.construct.renderAll();
    }
    if (this.children && this.children.length) {
      for (const iterator of this.children) {
        iterator.elm.setTheme();
      }
    }
  }
  onElementInit() {
    if (this.construct) {
      this.construct.init(this.tree);
      if (!this.construct.initialized) {
        this.construct.prepareTree(this.tree);
      }
    }
    /*
    if (this.onInit) {
      this.onInit(this.tree);
    }
    if (this.onChanges) {
      this.onChanges(this.tree);
    }
    */
    if (this.construct) {
      this.construct.viewPort = this.viewPort;
      this.construct.setSvg(0, this.tree);
      this.construct.refAll();
      this.construct.featureAll(0, this.tree);
      this.construct.feature(0, this.tree);
      this.construct.renderAll(0, this.tree);
      this.construct.featureLateAll(0, this.tree);
      this.construct.renderReportAll(0, this.tree);
      this.construct.featureLate(0, this.tree);
      this.viewPort.nativeElement.appendChild(this.construct.render.svg);
      this.construct.accuQualities(this.tree);
    }
    this.featureIndexSubject.next(0);
  }
  onInputChange() {
    const index = this.featureIndex++;
    if (this.construct) {
      this.construct.refAll();
      this.construct.featureAll(index, this.tree);
      this.construct.feature(index, this.tree);
    }
    /*
    if (this.onChanges) {
      this.onChanges(this.tree);
    }
    */
    if (this.construct) {
      this.construct.logAll(index);
      this.construct.setSvg(index, this.tree);
      this.construct.renderAll(index, this.tree);
      this.construct.featureLateAll(index, this.tree);
      this.construct.featureLate(index, this.tree);
      this.construct.renderReportAll(0, this.tree);
    }
    this.featureIndexSubject.next(index);
  }
  find(str, locale) {
    let result;
    const arr = this.tree || this.children;

    for (let i = 0; i < arr.length; i++) {
      const nd = arr[i];
      const elm = nd.elm;
      if (elm?._eid.str === str || elm?.i18n[locale].alias === str) {
        return nd;
      }
      result = allDescendants(nd);
      if (result) {
        return result;
      }
    }

    function allDescendants(node) {
      let cs = node.children;
      if (cs && cs.length) {
        for (let i = 0; i < cs.length; i++) {
          const nd = cs[i];
          const elm = nd.elm;
          if (elm._eid.str === str || elm.i18n[locale].alias === str) {
            return nd;
          }
          result = allDescendants(nd);
          if (result) {
            return result;
          }
        }
      }
      return false;
    }

    return false;
  }
}

export class Project extends Entity {
  user_id: ObjectID;
  _eid: ObjectID;
  version: number;
  active: number;
  activeIsExample: boolean;
  data: any;
  current: any = [];
  input: any = {};
  design: string;
  instances: any;
  query: any;
  sorting: any;
  tree: any;
  dataTable: any;
  idb: any;
  delay: any;
  constructor(def?, idb?) {
    super(def);
    this.idb = idb;
    this.def = def;
    if (!this.data) {
      this.data = [];
      this.active = 0;
    }
  }

  set def(def) {
    super.def = def;
    for (const key in def) {
      if (def.hasOwnProperty(key)) {
        const value = def[key];
        switch (key) {
          case 'user_id':
            this[key] = new ObjectID(value);
            break;
          case '_eid':
            this[key] = new ObjectID(value);
            break;
          default:
            //this[key] = Utils.deepClone(value);
            this[key] = value;
            break;
        }
      }
    }

    let date = new Date();
    if (!this.created_at) this.created_at = date;
    if (!this.updated_at) this.updated_at = date;
  }

  get def() {
    let res = super.def;
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value: any = this[key];

        switch (key) {
          case 'idb':
            break;

          default:
            res[key] = value;
            break;
        }
        if (value instanceof Date) {
          res[key] = value.toISOString();
        }
        if (value instanceof ObjectID) {
          res[key] = value.str;
        }
      }
    }
    return res;
  }

  getKeypath(elm) {
    let keypath = '';
    keypath += 'tree.';
    keypath += elm._eid.str;
    return keypath;
  }
  getState(elm) {
    let state = getByKeyPath(this, this.getKeypath(elm) + '.state');

    return state;
  }
  update(query?) {
    if (!query) query = this;
    let keypath = '';
    this.updated_at = new Date();
    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        let payload = query[key];
        switch (key) {
          case 'input':
            this.input = payload;
            if (this.idb) {
              if (this.delay) clearTimeout(this.delay);
              this.delay = setTimeout(() => {
                this.idb
                  .update(
                    {
                      _eid: this._eid.str,
                      user_id: this.user_id.str,
                    },
                    { input: payload },
                  )
                  .catch(function (e) {
                    console.error('Generic error: ' + e);
                  });
                this.idb
                  .update(
                    {
                      _eid: this._eid.str,
                      user_id: this.user_id.str,
                    },
                    { updated_at: this.updated_at.toISOString() },
                  )
                  .catch(function (e) {
                    console.error('Generic error: ' + e);
                  });
              }, 800);
            }
            break;
          case 'current':
            this.current = payload;
            if (this.idb) {
              if (this.delay) clearTimeout(this.delay);
              this.delay = setTimeout(() => {
                this.idb
                  .update(
                    {
                      _eid: this._eid.str,
                      user_id: this.user_id.str,
                    },
                    { current: payload },
                  )
                  .catch(function (e) {
                    console.error('Generic error: ' + e);
                  });
                this.idb
                  .update(
                    {
                      _eid: this._eid.str,
                      user_id: this.user_id.str,
                    },
                    { updated_at: this.updated_at.toISOString() },
                  )
                  .catch(function (e) {
                    console.error('Generic error: ' + e);
                  });
              }, 800);
            }
            break;
          case 'state':
            keypath = this.getKeypath(payload.elm) + '.state';

            setByKeyPath(this, keypath, payload.state);

            if (this.idb) {
              this.idb
                .update(
                  {
                    _eid: this._eid.str,
                    user_id: this.user_id.str,
                  },
                  { [keypath]: payload.state },
                )
                .catch(function (e) {
                  // console.error('Generic error: ' + e);
                });
              this.idb
                .update(
                  {
                    _eid: this._eid.str,
                    user_id: this.user_id.str,
                  },
                  { updated_at: this.updated_at.toISOString() },
                )
                .catch(function (e) {
                  console.error('Generic error: ' + e);
                });
            }
            break;
          case 'user_id':
            break;
          default:
            setByKeyPath(this, key, query[key]);
            if (this.idb) {
              this.idb
                .update(
                  {
                    _eid: this._eid.str,
                    user_id: this.user_id.str,
                  },
                  { [key]: query[key] },
                )
                .catch(function (e) {
                  // console.error('Generic error: ' + e);
                });
              this.idb
                .update(
                  {
                    _eid: this._eid.str,
                    user_id: this.user_id.str,
                  },
                  { updated_at: this.updated_at.toISOString() },
                )
                .catch(function (e) {
                  console.error('Generic error: ' + e);
                });
            }
            break;
        }
      }
    }

    if (this.idb) {
    }
  }
}

export class Preferences extends Entity {
  _id: ObjectID;
  locale: string;
  favorites: any[] = [];
  display: any = {
    strain: true,
    dimensionsA: true,
    dimensionsB: false,
    fulScreen: false,
    showAxes: true,
    showGrid: true,
    grid: 10,
    analyse: false,
  };
  edit: any = {};
  editElement: string;
  viewElement: string;
  selectedVolume: string;
  selectedProject: string;
  routerUrl: string;
  filter: string[] = [];
  routeSegments: string[] = [];
  filterString: string;
  noToolTips = false;
  query: any;
  sorting: any;
  idb: any;
  showDebugger: boolean;
  view: any = {};
  theme: any = {};
  player: any = { inFooter: true };
  snavOpened: boolean = true;
  notify: false;
  debugMode: boolean = false;
  debug: any = {
    show: false,
    position: {
      x: 400,
      y: 100,
    },
    paths: ['dS.selElm.def'],
    index: 0,
  };
  editor: any = {
    volume: 'toc',
    right: 'editor',
    editTab: 0,
    debug: [],
    showEdits: false,
  };
  admin: any = {
    active: 0,
    tabs: { ranking: {}, webclient: {} },
  };
  snav: any = {
    mode: 'side', // over
    content: 'nav',
    opened: true,
    editTab1: 0,
    editTab2: 0,
  };
  volume: Elm;

  editorLoaded = true;
  devs = [];
  notification_at: Date = new Date(0);
  contentTree: any = {};

  constructor(def?, idb?) {
    super(def);

    this.def = def;

    this.idb = idb;
    this.sorting = def.sorting || {
      active: 'tasksort',
      direction: 'asc',
    };
    this.query = def.query || {
      prop: {},
      def: {},
      set: {},
      val: {},
      i18n: '',
      id: '',
      figure: false,
      table: false,
      textbody: false,
      latex: false,
      datarow: false,
      reference: false,
      code: false,
      children: true,
    };
  }

  set def(def) {
    super.def = def;
    for (const key in def) {
      if (def.hasOwnProperty(key)) {
        const value = def[key];
        switch (key) {
          case '_id':
            this._id = new ObjectID(value);

            break;
          case 'notification_at':
            this.notification_at = new Date(value);

            break;
          default:
            // this[key] = Utils.deepClone(value);
            this[key] = value;
            break;
        }
      }
    }
  }
  get def() {
    let res = super.def;
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value: any = this[key];

        switch (key) {
          case 'idb':
            break;

          default:
            res[key] = value;
            break;
        }
        if (typeof value === 'object' && value instanceof Date) {
          res[key] = value.toISOString();
        }
        if (typeof value === 'object' && value instanceof ObjectID) {
          res[key] = value.str;
        }
      }
    }
    return res;
  }

  save(query) {
    let changes;
    for (const key in query) {
      const value = query[key];
      switch (key) {
        case 'favorites':
          changes = [];
          for (const it of query[key]) {
            changes.push(it._eid.str);
          }

          break;

        default:
          changes = query[key];
          break;
      }

      setByKeyPath(this, key, changes);

      if (this.idb) {
        this.idb.update(this._id.str, { [key]: changes }).catch(function (e) {
          // console.error('Idb error: ' + e);
        });
      }
    }
  }

  update(query) {
    let keypath, changes;
    for (const key in query) {
      if (query.hasOwnProperty(key)) {
        switch (key) {
          case 'favorites':
            changes = [];
            for (const it of query[key]) {
              changes.push(it._eid.str);
            }

            break;

          default:
            changes = query[key];
            break;
        }

        if (this.idb) {
          this.idb.update(this._id.str, { [key]: changes }).catch(function (e) {
            // console.error('Idb error: ' + e);
          });
        }
      }
    }
  }
}

export class User extends Entity {
  _id: ObjectID;
  nickname: string;
  title: string;
  fullname: string;
  name: string;
  email: string;
  email_verified: boolean;
  company: string;
  roles: string[];
  address: string[];
  url: string[];
  idb: any;
  constructor(def?, idb?) {
    super(def);
    this.def = def;
    this.idb = idb;
  }
  set def(def) {
    super.def = def;
    for (const key in def) {
      if (def.hasOwnProperty(key)) {
        const value = def[key];
        switch (key) {
          case '_id':
            this._id = new ObjectID(value);

            break;
          default:
            // this[key] = Utils.deepClone(value);
            this[key] = value;
            break;
        }
      }
    }
  }
  get def() {
    let res = super.def;
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        const value: any = this[key];

        switch (key) {
          case 'idb':
            break;

          default:
            res[key] = value;
            break;
        }
        if (typeof value === 'object' && value instanceof Date) {
          res[key] = value.toISOString();
        }
        if (typeof value === 'object' && value instanceof ObjectID) {
          res[key] = value.str;
        }
      }
    }
    return res;
  }
}

export function compareInput(a, b) {
  if (a.input < b.input) return -1;
  if (a.input > b.input) return 1;
  return 0;
}

export function objectIdHex(str) {
  let res = '',
    hex;
  if (str.length > 8) {
    return 'ffffffffffffffffffffffff';
  }
  if (str.length < 8) {
    str = str.padStart(8, '0');
  }
  for (const iterator of str) {
    hex = iterator.charCodeAt(0).toString(16);
    res += hex;
  }
  res = res.padStart(24, 'f');
  return res;
}
