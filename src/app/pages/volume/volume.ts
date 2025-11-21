import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { MaterialModule } from 'src/app/material.module';
//import { ProfileService } from 'src/app/services/profile.service';
//import { ViewService } from 'src/app/services/view.service';
import { ContentManager } from 'src/app/shared/content-manager';

@Component({
  selector: 'kd-volume',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MaterialModule],
  templateUrl: './volume.html',
  styleUrls: ['./volume.scss'],
})
export class Volume implements OnInit, OnDestroy {
  children: any;
  elm: Elm;
  node: any;
  volumeSubject: Subscription;
  view: Subscription;
  constructor(
    //public vS: ViewService,
    //public pS: ProfileService,
    public cM: ContentManager,
  ) {}

  ngOnInit() {}

  toggleNav(e) {
    if (this.cM.selVol._eid.str !== '5c40af3f4f5eb4199613c5e1') {
      //this.pS.pref.snav.opened = !this.pS.pref.snav.opened;
    }
  }

  ngOnDestroy() {
    this.volumeSubject.unsubscribe();
  }
}
