import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-volume-footer',
  standalone: false,
  templateUrl: './volume-footer.component.html',
  styleUrls: ['./volume-footer.component.scss'],
})
export class VolumeFooterComponent {
  view: 'toc';
  constructor(
    private router: Router,
    public pS: ProfileService,
    public vS: ViewService,
    public dS: DataService,
  ) {}
}
