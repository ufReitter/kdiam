import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-lang-picker',
  templateUrl: './lang-picker.component.html',
  styleUrls: ['./lang-picker.component.scss'],
})
export class LangPickerComponent implements OnInit {
  nextLocale: string;
  nextLink: string;
  localeSubject: Subscription;
  viewElmSubject: Subscription;
  volumeSubject: Subscription;
  routeSegments: string[];
  routerLink = '';

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public dS: DataService,
  ) {}

  ngOnInit(): void {}
  switchLanguage() {
    this.dS.searchTerm = '';
    const rs = this.dS.routeSegments;
    let index = this.dS.locales.indexOf(this.dS.locale) + 1;
    if (index > this.dS.locales.length - 1) {
      index = 0;
    }
    const nextLang = this.dS.locales[index];
    if (rs[1] === 'admin') {
      return this.router.navigate([nextLang, 'admin']);
    }
    if (rs[1] === 'store') {
      return this.router.navigate([nextLang, rs[1], rs[2]]);
    }
    const vol = this.dS.selVol;
    const elm = this.dS.selElm;

    this.router.navigate(this.getNewRouteSegments(elm, vol, nextLang));

    // const newRoute = [nextLang];
    // const edition = this.dS.editions.find((item) => item._eid === vol._eid.str);
    // let vslug = edition.i18n[nextLang].slug;
    // let eslug;
    // if (rs[2] === 'leichtbau-durch-sicken-fachbuch') {
    //   eslug = 'leichtbau-durch-sicken-fachbuch';
    // } else {
    //   eslug = this.getNewSlug(elm, nextLang);
    // }
    // if (rs.length === 2) {
    //   newRoute.push(eslug);
    // }
    // if (rs.length > 2) {
    //   newRoute.push(vslug);
    //   newRoute.push(eslug);
    // }
    // this.router.navigate(newRoute);
  }
  getNewRouteSegments(elm, vol, lang) {
    const nrs = [];
    nrs.push(lang);
    const node =
      vol.flatTree.find((nd) => nd.elm === elm) ||
      vol.children.find((nd) => nd.elm === elm);
    if (!node) {
      return nrs;
    }
    for (const par of node?.parents || []) {
      nrs.push(par.slugs[lang]);
    }
    nrs.push(node.slugs[lang]);
    return nrs;
  }
  getNewSlug(elm, nextLang) {
    let newSlug;
    const node = this.dS.selVol?.flatTree.find((nd) => nd.id === elm._eid.str);
    newSlug = node?.slugs[nextLang];
    if (!newSlug) {
      for (const key in this.dS.slug[nextLang]) {
        if (Object.prototype.hasOwnProperty.call(this.dS.slug[nextLang], key)) {
          if (this.dS.slug[nextLang][key] === elm._eid.str) {
            newSlug = key;
          }
        }
      }
    }

    return newSlug || elm._eid.str;
  }
}
