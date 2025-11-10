import { Component, OnInit } from '@angular/core';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'kd-edits-menu',
  templateUrl: './edits-menu.component.html',
  styleUrls: ['./edits-menu.component.scss'],
})
export class EditsMenuComponent implements OnInit {
  checkedAll = false;
  indeterminateAll = false;
  countCheckouts = 0;
  countChecked = 0;
  constructor(public pS: ProfileService, public dS: DataService) {}

  ngOnInit(): void {}

  async createSnapshot() {
    let checkeds = this.dS.rS.editsList.filter((x) => x.checked);
    const snapshot = {
      name: 'Redigiert',
      _eid: this.dS.selVol._eid.str,
      defs: { elms: [], i18ns: [] },
    };
    const defs = snapshot.defs;
    for (const item of checkeds) {
      defs.elms.push(item.elm.def);
      for (const lang in item.elm.i18n) {
        if (Object.prototype.hasOwnProperty.call(item.elm.i18n, lang)) {
          const i18n = item.elm.i18n[lang];
          if (i18n.checkout_id) {
            defs.i18ns.push({
              _eid: item.elm._eid.str,
              lang: lang,
              ...i18n,
            });
          }
        }
      }
    }

    const res = await this.dS.rS.createSnapshot(snapshot);
    console.log(snapshot, res);
  }

  updateEdits() {
    this.dS.rS.editsList.sort((a, b) => {
      let x = a.elm.txts.lbl || a.elm._eid.str;
      let y = b.elm.txts.lbl || b.elm._eid.str;
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });
    return;
    const newElms: Elm[] = [];
    for (const elm of this.dS.checkouts) {
      if (elm.checkout_id) {
        newElms.pushUnique(elm);
      }
      for (const lang in elm.i18n) {
        if (Object.prototype.hasOwnProperty.call(elm.i18n, lang)) {
          const i18n = elm.i18n[lang];

          if (i18n.checkout_id) {
            newElms.pushUnique(elm);
          }
        }
      }
    }
    for (const elm of newElms) {
      if (!this.dS.rS.editsList.find((x) => x.elm === elm)) {
        this.dS.rS.editsList.push({ checked: false, elm: elm });
      }
    }
    this.countCheckouts = this.dS.rS.editsList.length;
    this.dS.rS.editsList.sort((a, b) => {
      let x = a.elm.txts.lbl || a.elm._eid.str;
      let y = b.elm.txts.lbl || b.elm._eid.str;
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });
  }

  async refreshCheckouts() {
    return;
    let checkeds = this.dS.rS.editsList.filter((x) => x.checked);
    for (const item of checkeds) {
      const elm = item.elm;

      for (const lang in elm.i18n) {
        if (Object.prototype.hasOwnProperty.call(elm.i18n, lang)) {
          const i18n = elm.i18n[lang];
          if (i18n.checkout_id) {
            const success = await this.dS.refreshI18n(item.elm, item.kind);
            if (success) {
              const index = this.dS.rS.editsList.findIndex(
                (x) => x.elm === item.elm && x.kind === item.kind,
              );
              this.dS.rS.editsList.splice(index, 1);
              this.updateSelection();
            }
          }
        }
      }

      if (item.kind === 'elm') {
        const success = await this.dS.refreshElm(item.elm);
        if (success) {
          const index = this.dS.rS.editsList.findIndex(
            (x) => x.elm === item.elm && x.kind === item.kind,
          );
          this.dS.rS.editsList.splice(index, 1);
          this.updateSelection();
        }
      } else {
        const success = await this.dS.refreshI18n(item.elm, item.kind);
        if (success) {
          const index = this.dS.rS.editsList.findIndex(
            (x) => x.elm === item.elm && x.kind === item.kind,
          );
          this.dS.rS.editsList.splice(index, 1);
          this.updateSelection();
        }
      }
    }
    if (checkeds.length) {
      for (const item of this.dS.rS.editsList) {
        this.dS.checkouts = [];
        this.dS.checkouts.pushUnique(item.elm);
      }
    }
  }

  updateSelection(checked?, item?) {
    let count = 0;
    if (item) item.checked = checked;
    for (const checkout of this.dS.rS.editsList) {
      if (checkout.checked) {
        count++;
      }
      if (count > 0) {
        this.checkedAll = true;
      } else {
        this.checkedAll = false;
        this.indeterminateAll = false;
      }
      if (count === this.dS.rS.editsList.length) {
        this.indeterminateAll = false;
      }
      if (count > 0 && count < this.dS.rS.editsList.length) {
        this.indeterminateAll = true;
      }
    }
    this.countChecked = count;
  }

  updateSelectionAll() {
    if (this.checkedAll && !this.indeterminateAll) {
      for (const checkout of this.dS.rS.editsList) {
        checkout.checked = true;
      }
    } else {
      for (const checkout of this.dS.rS.editsList) {
        checkout.checked = false;
      }
    }
  }
}
