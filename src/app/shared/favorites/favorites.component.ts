import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'kd-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css'],
})
export class FavoritesComponent implements OnInit, OnDestroy {
  prefSub: Subscription;
  viewElementSubject: Subscription;
  isFav: boolean;
  constructor(
    private router: Router,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngOnInit(): void {
    this.pS.prefSub.subscribe((pref) => {
      if (pref) {
        if (this.viewElementSubject) this.viewElementSubject.unsubscribe();
        this.viewElementSubject = this.dS.subject.viewElement.subscribe(
          (elm) => {
            const index = this.dS.favorites.findIndex((it) => it === elm);
            if (index > -1) {
              this.isFav = true;
            } else {
              this.isFav = false;
            }
          },
        );
      }
    });
    this.dS.subject.favorites.subscribe((fav) => {
      if (fav) {
        const index = fav.findIndex((it) => it === this.dS.selElm);
        if (index > -1) {
          this.isFav = true;
        } else {
          this.isFav = false;
        }
      }
    });
  }
  ngOnDestroy() {
    if (this.prefSub) this.prefSub.unsubscribe();
    if (this.viewElementSubject) this.viewElementSubject.unsubscribe();
  }

  viewElement(elm) {
    this.dS.navigate(elm);
  }

  toggle() {
    if (this.isFav) {
      this.remove();
    } else {
      this.add();
    }
  }

  add() {
    this.dS.favorites.push(this.dS.selElm);
    0;
    this.dS.favorites.sort(function (x, y) {
      let a, b;
      a = x.txts.lbl || x._eid.str;
      b = y.txts.lbl || y._eid.str;
      if (a > b) return 1;
      if (a < b) return -1;
    });

    this.pS.pref.update({ favorites: this.dS.favorites });

    this.isFav = true;
  }
  remove() {
    const index = this.dS.favorites.findIndex((it) => it === this.dS.selElm);

    if (index > -1) {
      this.dS.favorites.splice(index, 1);
      this.pS.pref.update({ favorites: this.dS.favorites });
      this.isFav = false;
    }
  }
}
