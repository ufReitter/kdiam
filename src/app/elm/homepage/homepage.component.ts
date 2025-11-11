import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-homepage',
  standalone: false,
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent implements OnInit, OnDestroy {
  children: any;
  elm: Elm;
  node: any;
  volumeSubject: Subscription;
  view: Subscription;
  constructor(
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngOnInit() {
    this.volumeSubject = this.dS.subject.volume.subscribe((v) => {
      if (v) {
        const hideBody = this.dS.originName === 'kompendia' ? true : false;
        this.elm =
          v.roleElm.poster.elm ||
          this.dS.system.roleElm.poster.elm ||
          v.tree[0].elm;
        this.node = {
          elm: this.elm,
          set: { attrib: { hideBody: hideBody } },
          figure: {},
        };
        this.children = this.elm.children;

        this.dS.subject.viewElement.next(v);
        //this.dS.updateMetaTags(v);
      }
    });
    this.view = this.vS.sizeSub.subscribe((fs) => {});
    this.vS.sizeSub.next(this.vS.windowOnResize(2));
  }

  toggleNav(e) {
    if (this.dS.selVol._eid.str !== '5c40af3f4f5eb4199613c5e1') {
      this.pS.pref.snav.opened = !this.pS.pref.snav.opened;
    }
  }

  ngOnDestroy() {
    this.volumeSubject.unsubscribe();
  }
}
