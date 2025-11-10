import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Elm, I18n } from '../engine/entity';
import { DataService } from '../services/data.service';
import { DexieService } from '../services/dexie.service';
import { ProfileService } from '../services/profile.service';

@Injectable({
  providedIn: 'root',
})
export class ReditService {
  edits: Elm[] = [];
  alts: Elm[] = [];
  editsList: any[] = [];
  vols: Elm[] = [];
  selVol: Elm;
  snapshotList: any[] = [];
  altsState = '';
  activeSnapshot = '';
  elmsTable: Table;
  i18nsTable: Table;
  history: any = { elm: null, selected: null, items: [] };
  loaded = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    public dexieService: DexieService,
    @Inject(DataService) private dS: DataService,
    @Inject(ProfileService) private pS: ProfileService,
  ) {
    this.elmsTable = this.dexieService.table('elmEdits');
    this.i18nsTable = this.dexieService.table('i18nEdits');
    this.loadIDB().then(() => {
      if (this.pS.pref.editor.showEdits) {
        this.showEdits(true);
      }
    });

    this.dS.rS = this;
  }

  async loadIDB() {
    let defs: any = {};
    defs.elms = await this.elmsTable.toArray();
    defs.i18ns = await this.i18nsTable.toArray();
    this.insert(defs, this.edits);
    this.vols = this.edits.filter((x) => x.attrib.role === 'volume');
    this.selVol = this.vols[0];

    this.alts = this.getAlts(this.edits);
    this.altsState = 'edits';
    this.editsList = this.edits.map((x) => {
      return { elm: x, checked: false };
    });
    this.dS.subject.locale.subscribe((lang) => {
      if (lang) {
        for (let i = 0; i < this.alts.length; i++) {
          const elm = this.alts[i];
          elm.txts =
            elm.i18n[lang]?.strs ||
            this.dS.obj[elm._eid.str].i18n[lang]?.strs ||
            {};
          if (elm.flatTree) {
            for (const node of elm.flatTree) {
              node.path = node.getPath(lang);
            }
          }
        }
      }
    });
    this.loaded.next(true);
  }

  createEditElm(_eid) {}

  async save(elm, key, value?, lang?) {
    const updated_at = new Date();
    const updated_id = this.pS.profile._id.str;
    let obj, table, primekey, keypath, checkoutkey;

    value = value || Dexie.getByKeyPath(elm.def, key);

    if (lang) {
      obj = elm.i18n[lang];
      table = this.i18nsTable;
      primekey = {
        _eid: elm._eid.str,
        lang: lang,
      };
      checkoutkey = primekey;
      keypath = 'strs.' + key;
      if (!this.edits.find((x) => x._eid.str === elm._eid.str)) {
        this.insert({ elms: [], i18ns: [elm.i18n[lang].def] }, this.edits);
        const ne = this.edits.find((x) => x._eid.str === elm._eid.str);
        Dexie.setByKeyPath(ne.i18n[lang], keypath, value);
        ne.i18n[lang].updated_at = updated_at;
        ne.i18n[lang].updated_id = updated_id;
        this.editsList.pushUnique({ elm: ne, checked: false });
        await table.put(ne.i18n[lang].def);
        this.dS.subject.cdArticle.next(true);
        return ne;
      }
    } else {
      obj = elm;
      table = this.elmsTable;
      primekey = elm._eid.str;
      checkoutkey = {
        _eid: elm._eid.str,
      };
      keypath = key;
      const storedElm = await table.get(primekey);
      if (!storedElm) {
        this.insert({ elms: [elm.def], i18ns: [] }, this.edits);
        const ne = this.edits.find((x) => x._eid.str === elm._eid.str);
        Dexie.setByKeyPath(ne, keypath, value);
        ne.created_at = updated_at;
        ne.created_id = updated_id;
        ne.updated_at = updated_at;
        ne.updated_id = updated_id;
        this.editsList.pushUnique({ elm: ne, checked: false });
        await table.put(ne.def);
        this.dS.subject.cdArticle.next(true);
        return ne;
      }
      value = Dexie.getByKeyPath(elm.def, keypath);
    }

    // if (this.online) {
    //   let data1$: any = this.http.patch<any>(
    //     '/api/elements/checkout',
    //     checkoutkey,
    //   );
    //   const message = await lastValueFrom(data1$);
    //   console.log(checkoutkey, message);
    // }

    await table
      .update(primekey, {
        [keypath]: value,
        updated_at: updated_at.toISOString(),
        updated_id: updated_id,
      })
      .then(function (updated) {
        if (updated) {
          obj.updated_at = updated_at;
          obj.updated_id = updated_id;
          console.log(elm._eid.str + ' ' + lang + ' was set to: ' + value);
        } else {
          console.log(
            'Nothing was updated - there was no i18n with primary key: ' +
              elm._eid.str +
              ' ' +
              lang,
          );
        }
      });

    this.dS.subject.cdArticle.next(true);
    return elm;
  }

  showEdits(show) {
    if (show) {
      if (this.altsState !== 'edits') {
        this.alts = this.getAlts(this.edits);
        this.altsState = 'edits';
      }
      this.dS.subject.showAlt.next('edits');
    } else {
      this.dS.subject.showAlt.next('none');
    }
    this.pS.pref.save({ 'editor.showEdits': show });
  }

  getAlts(arr) {
    const result = [...arr];
    const elms = [];
    let elm;
    for (const it of result) {
      for (const by of it.usedBy) {
        elm = result.find((x) => x._eid.str === by._eid.str);
        if (!elm) {
          elm = new Elm(this.dS.obj[by._eid.str].def);
          elm.i18n = this.dS.obj[by._eid.str].i18n;
          elm.txts = elm.i18n['de']?.strs;
          elms.pushUnique(elm);
        }
        elm.test = 'altElm';
        result.pushUnique(elm);
      }
    }
    for (const elm of elms) {
      this.populate([elm], result);
    }
    const vols = result.filter((x) => x.attrib.role === 'volume');
    for (const vol of vols) {
      for (const node of vol.flatTree) {
        const elm = result.find((x) => x._eid.str === node.id);
        if (elm) {
          node.elm = elm;
        }
      }
    }
    return result;
  }

  getElm(eid) {
    return (
      this.edits.find((x) => x._eid.str === eid) ||
      this.dS.obj[eid] ||
      this.dS.page404
    );
  }

  insert(defs, target) {
    let elm: Elm,
      elms: Elm[] = [],
      i18n: I18n;
    for (const def of defs.elms) {
      elm = target.find((x) => x._eid.str === def._eid);
      if (elm) {
        elm.def = def;
        elm.test = 'altElm';
      } else {
        elm = new Elm(def);
        elm.i18n.de = new I18n(this.dS.obj[def._eid].i18n.de.def);
        elm.i18n.en = new I18n(this.dS.obj[def._eid].i18n.en.def);
        elm.usedBy = this.dS.obj[def._eid].usedBy;
        target.push(elm);
      }
      elms.push(elm);
    }
    for (const def of defs.i18ns) {
      elm =
        target.find((x) => x._eid.str === def._eid) ||
        new Elm(this.dS.obj[def._eid].def);
      elm.usedBy = this.dS.obj[def._eid].usedBy;
      if (!target.find((x) => x._eid.str === def._eid)) {
        target.push(elm);
        elms.push(elm);
      }
      i18n = elm.i18n[def.lang];
      if (i18n) {
        i18n.def = def;
      } else {
        i18n = new I18n(def);
        elm.i18n[def.lang] = i18n;
      }
    }
    for (const elm of elms) {
      elm.txts = elm.i18n['de']?.strs;
    }
    this.populate(elms, target);
  }

  populate(elms, pool) {
    for (const elm of elms) {
      for (const child of elm.children || []) {
        if (!child.elm) {
          child.elm =
            pool.find((x) => x._eid.str === child.id) ||
            this.dS.obj[child.id] ||
            this.dS.page404;
        }
        if (child.tableId && this.dS.obj[child.tableId]) {
          child.tableElm = this.dS.obj[child.tableId];
        }
        if (!child.set.parent) {
          child.set.parent = elm;
        }
      }
      for (const node of elm.flatTree || []) {
        if (!node.elm) {
          node.elm =
            pool.find((x) => x._eid.str === node.id) ||
            this.dS.obj[node.id] ||
            this.dS.page404;
        }
      }
      for (const node of elm.refs || []) {
        if (!node.elm) {
          node.elm =
            pool.find((x) => x._eid.str === node.id) ||
            this.dS.obj[node.id] ||
            this.dS.page404;
        }
      }

      if (elm.view) {
        elm.fillGrids();
      }

      if (elm.flatTree) {
        elm.distSlugs(); // xxx
      }

      //elm.txts = elm.i18n['de']?.strs;
    }
  }

  async createSnapshot(sn) {
    const data$: any = this.http.post<any>(`/api/elements/snapshot`, sn);
    const res: any = await lastValueFrom(data$).catch((e) => {});
    return res;
  }

  async getSnapshotList(vid) {
    const data$: any = this.http.get<any>(`/api/elements/snapshots?vid=${vid}`);
    const res: any = await lastValueFrom(data$).catch((e) => {});

    this.snapshotList = res;
    const sn = this.snapshotList.find((x) => x._id === this.activeSnapshot);
    if (sn) sn.checked = true;

    return this.snapshotList;
  }

  async loadSnapshot(id) {
    let res: any,
      defs: any = {};
    if (id !== 'published') {
      const data$: any = this.http.get<any>(`/api/elements/snapshot/${id}`);
      res = await lastValueFrom(data$).catch((e) => {});
      //this.insert(res.defs);
      console.log('loadSnapshot', res.defs);
      this.elmsTable.bulkPut(res.defs.elms);
      this.i18nsTable.bulkPut(res.defs.i18ns);
    }

    if (id === 'published') {
      defs.elms = await this.elmsTable.toArray();
      defs.i18ns = await this.i18nsTable.toArray();
    }

    this.snapshotList.forEach((x) => (x.checked = false));
    this.activeSnapshot = id;
    const sn = this.snapshotList.find((x) => x._id === this.activeSnapshot);
    if (sn) sn.checked = true;
    console.log('loadSnapshot', this.edits);
  }

  async getHistory(elm, kind) {
    // if (!this.dS.users.length) {
    //   let data1$: any = this.http.get<any>('/api/users/all');
    //   this.dS.users = await lastValueFrom(data1$);
    //   for (const it of this.dS.users) {
    //     this.dS.usersObj[it._id] = it;
    //   }
    // }
    let data2$: any = this.http.get<any>(
      `/api/elements/history/${elm._eid.str}?kind=${kind}`,
    );
    this.history.items = await lastValueFrom(data2$);
    this.history.elm = elm;
    this.history.selected = this.history.items[0];
    return this.history;
  }

  viewHistory(hist) {
    if (hist.lang) {
      // console.log('viewHistory', hist._eid, this.history.elm._eid.str);
      this.history.selected = hist;
      this.history.elm.txts = hist.strs;
      this.history.elm.defSubject.next(this.history.elm.def);
    }
  }

  async makeCurrent(item) {
    // let data$: any = this.http.patch<any>(`/api/elements/history`, {
    //   cmd: 'current',
    //   id: item._id,
    //   kind: item.lang || 'elm',
    // });
    // const res: any = await lastValueFrom(data$);
    // if (res.ok) {
    //   this.history.selected = this.history.items[0];
    //   this.history.elm.txts = this.history.selected.strs;
    //   this.history.elm.defSubject.next(this.history.elm.def);
    //   this.history.items = this.history.items.filter(
    //     (it) => it._id !== item._id,
    //   );
    //   this.i18nsTable.put(item);
    // }
  }

  async deleteItem(item) {
    let data$: any = this.http.patch<any>(`/api/elements/history`, {
      cmd: 'delete',
      id: item._id,
      kind: item.lang || 'elm',
    });
    const res: any = await lastValueFrom(data$);
    if (res.ok) {
      if (this.history.selected === item) {
        this.history.selected = this.history.items[0];
        this.history.elm.txts = this.history.selected.strs;
        this.history.elm.defSubject.next(this.history.elm.def);
      }
      this.history.items = this.history.items.filter(
        (it) => it._id !== item._id,
      );
    }
  }
}
