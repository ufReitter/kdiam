import { AfterViewInit, Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements AfterViewInit {
  bust: number;
  constructor(
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngAfterViewInit() {
    this.dS.selElm = null;
    this.dS.subject.viewElement.next(null);
    this.vS.sizeSub.next(this.vS.windowOnResize(1));
  }
  onTabChange(e) {
    this.pS.pref.save({ 'admin.active': e });
  }
  onTabChangeDone() {}
  reload() {
    this.bust = Math.random();
  }
}
