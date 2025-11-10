import { Injectable } from '@angular/core';
import Dexie from 'dexie';

@Injectable({
  providedIn: 'root',
})
export class DexieService extends Dexie {
  idbExists = false;
  constructor() {
    super('kompendia');

    this.version(11).stores({
      admins: '_id, user_id, scope',
      elements: '_id',
      projects: '_id,[elm_id+user_id]',
      prefs: '_id',
      images: '[_id+size]',
    });

    this.version(12)
      .stores({
        admins: '_id, user_id, scope',
        elms: '_eid',
        i18ns: '[_eid+lang]',
        projects: '[_eid+user_id]',
        prefs: '_id',
        images: '[_eid+size]',
      })
      .upgrade((trans) => {
        return trans
          .table('projects')
          .toCollection()
          .modify((proj) => {
            proj._id = proj._id;
            proj._eid = proj.elm_id;
            delete proj.elm_id;
          });
      });

    this.version(14).stores({
      imgs: '_eid',
      wasms: '_eid',
      images: null,
      elements: null,
    });

    this.version(15).stores({
      admins: '_id, _eid, role',
      i18nEdits: '[_eid+lang]',
      elmEdits: '_eid',
    });

    this.open()
      .then((result) => {
        this.idbExists = true;
      })
      .catch(Dexie.InvalidStateError, function (e) {
        console.error('Idb database closed due to: ' + e.inner);
      })
      .catch(Dexie.DatabaseClosedError, function (e) {
        console.error('Idb database closed due to: ' + e.inner);
      })
      .catch(Dexie.OpenFailedError, function (e) {
        console.error('Idb open failed due to: ' + e.inner);
      })
      .catch('NotFoundError', (e) => {
        console.error('NotFoundError due to: ' + e.inner);
        // Dexie.delete('kompendia');
        // window.location.reload();
      })
      .catch(Error, (e) => {
        console.error('Error due to: ' + e.inner);
        // Dexie.delete('kompendia');
        // window.location.reload();
      })
      .catch((e) => {
        console.error('Generic due to: ' + e.inner);
        // Dexie.delete('kompendia');
        // window.location.reload();
      });
  }
}
