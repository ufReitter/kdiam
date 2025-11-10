import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-volume-picker',
  templateUrl: './volume-picker.component.html',
  styleUrls: ['./volume-picker.component.css'],
})
export class VolumePickerComponent implements OnInit, OnDestroy {
  localeSubject: Subscription;
  isExpanded: boolean;
  editions: any[];

  constructor(private router: Router, public dS: DataService) {}

  ngOnInit() {
    this.localeSubject = this.dS.subject.locale.subscribe((locale) => {
      if (locale) {
        this.editions = this.dS.editions.sort(function (x, y) {
          let a, b;
          a = x.i18n[locale].strs?.lbl;
          b = y.i18n[locale].strs?.lbl;
          if (a > b) return 1;
          if (a < b) return -1;
        });
      }
    });
  }
  ngOnDestroy() {
    if (this.localeSubject) this.localeSubject.unsubscribe();
  }

  async checkStatus() {
    for (const ed of this.editions) {
      if (this.dS.selVol._eid.str === ed._eid) {
        ed.loadStatus = 'active';
      } else if (this.dS.vols.find((v) => v._eid.str === ed._eid)) {
        ed.loadStatus = 'local';
      } else {
        ed.loadStatus = 'cloud';
      }
    }
  }

  onVolumeChanged(ed) {
    this.router.navigate([this.dS.locale, ed.i18n[this.dS.locale].slug]);
  }

  expandAll() {}

  getVersions() {}
}
