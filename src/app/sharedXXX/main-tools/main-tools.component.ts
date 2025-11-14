import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-main-tools',
  standalone: false,
  templateUrl: './main-tools.component.html',
  styleUrls: ['./main-tools.component.scss'],
})
export class MainToolsComponent {
  versions;
  @Input() pos: string;

  constructor(
    public router: Router,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  aboutKompendia() {
    const elm = this.dS.obj['629c46fcc67b07794a027a62'];
    this.dS.navigate(elm);
  }
  onChangeTooltips() {
    this.dS.noToolTips = !this.dS.noToolTips;
    this.pS.pref.save({ noToolTips: this.dS.noToolTips });
  }
  onInfo(e) {
    this.dS.viewMode.info = !this.dS.viewMode.info;
    if (this.dS.viewMode.info && this.dS.selElm) {
      //console.log(this.dS.selElm);
    }
  }

  reload() {
    window.location.reload();
  }
}
