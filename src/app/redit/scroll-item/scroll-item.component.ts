import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProfileService } from 'src/app/services/profile.service';
import { Elm } from '../../engine/entity';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-scroll-item',
  templateUrl: './scroll-item.component.html',
  styleUrls: ['./scroll-item.component.scss'],
})
export class ScrollItemComponent implements OnInit, OnChanges, OnDestroy {
  localeSubject: Subscription;
  defSubject: Subscription;
  showAltSub: Subscription;

  ident: string;

  @Input() elm: Elm;
  altElm: Elm = null;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngOnInit() {
    this.localeSubject = this.dS.subject.locale.subscribe((locale) => {
      if (this.elm.i18n.de?.strs?.bdy) {
        this.ident = this.elm.i18n.de.strs?.bdy
          .replace(/<(?:.|\n)*?>/gm, '')
          .substring(0, 56);
      }
    });
    this.showAltSub = this.dS.subject.showAlt.subscribe((show) => {
      if (show) {
        this.elm =
          this.dS.rS.alts.find((x) => x._eid.str === this.elm._eid.str) ||
          this.elm;
      } else {
        this.elm = this.dS.obj[this.elm._eid.str];
      }

      this.cd.detectChanges();
    });
  }
  ngOnChanges() {
    this.defSubject = this.elm.defSubject.subscribe((def) => {
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.localeSubject?.unsubscribe();
    this.defSubject?.unsubscribe();
    this.showAltSub?.unsubscribe();
  }

  viewElement(event, elm) {
    if (event.cntrKey) {
      this.checkElement(elm);
      return true;
    }
    if (event.altKey) {
      this.dS.edit(elm, 'editor');
    } else {
      this.dS.navigate(elm);
    }
  }

  checkElement(elm) {
    elm.checked = !elm.checked;
    if (elm.checked) {
      this.dS.checked.pushUnique(elm);
    } else {
      const index = this.dS.checked.findIndex((e) => e._eid.equals(elm._eid));
      if (index !== -1) {
        this.dS.checked.splice(index, 1);
      }
    }
    this.dS.subject.checked.next(this.dS.checked);
  }
}
