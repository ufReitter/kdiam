import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.css'],
})
export class SettingComponent implements OnInit {
  refresh: string;
  table: any;
  lang: string;
  strs = [];

  constructor(public vS: ViewService, public dS: DataService) {
    this.table = {
      full: true,
      rowh: true,
      cols: [
        { field: 'key', text: true, align: 'left', sortable: true },
        { field: 'str', text: true, sortable: true },
      ],
      data: [],
    };
  }

  ngOnInit(): void {
    this.lang = this.dS.locale;
    this.changeLang(this.lang);
    this.vS.inlineEditor = true;
  }

  ngOnDestroy() {
    this.vS.inlineEditor = false;
  }

  saveRow(row) {
    if (!this.dS.system.i18n.de.strs[row.key]) {
      this.dS.system.i18n.de.strs[row.key] = '';
      this.dS.system.i18n.de.strs.dirty = true;
    }
    if (!this.dS.system.i18n.en.strs[row.key]) {
      this.dS.system.i18n.en.strs[row.key] = '';
      this.dS.system.i18n.en.strs.dirty = true;
    }
    this.dS.system.i18n[this.lang].strs[row.key] = row.str;
    this.dS.system.i18n[this.lang].strs.dirty = true;
    for (const key in this.dS.system.i18n[this.lang].strs) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.dS.system.i18n[this.lang].strs,
          key,
        )
      ) {
        if (this.table.data.findIndex((x) => x.key === key) === -1) {
          delete this.dS.system.i18n.de.strs[key];
          delete this.dS.system.i18n.en.strs[key];
          this.dS.system.i18n.de.strs.dirty = true;
          this.dS.system.i18n.en.strs.dirty = true;
        }
      }
    }
    this.dS.save(this.dS.system);
  }

  changeLang(lang) {
    this.lang = lang;
    this.strs = [];
    for (const key in this.dS.system.i18n[lang].strs) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.dS.system.i18n[lang].strs,
          key,
        )
      ) {
        const str = this.dS.system.i18n[lang].strs[key];
        const entry = {
          key: key,
          str: str,
        };
        this.strs.push(entry);
      }
      this.strs.sort((x, y) => {
        let a, b;
        a = x.key;
        b = y.key;
        if (a > b) return 1;
        if (a < b) return -1;
      });
      this.table.data = this.strs;
    }
    this.refresh = new Date().toISOString();
  }
}
