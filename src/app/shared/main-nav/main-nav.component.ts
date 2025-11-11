import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-main-nav',
  standalone: false,
  templateUrl: './main-nav.component.html',
  styleUrls: ['./main-nav.component.scss'],
})
export class MainNavComponent {
  @Input() pos: string;
  constructor(
    public router: Router,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
  ) {}
  toggleDrawer() {
    this.vS.drawerSidenav.toggle();
    this.pS.pref.snav.opened = this.vS.drawerSidenav.opened;
    this.dS.subject.snav.next(this.pS.pref.snav);
  }
}
