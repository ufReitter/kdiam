import { Component, Input } from '@angular/core';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'kd-header-target',
  templateUrl: './header-target.component.html',
  styleUrls: ['../../../shared/header/header.component.css'],
})
export class HeaderTargetComponent {
  @Input() elm: Elm;
  @Input() target = 'en';

  constructor(public pS: ProfileService, public dS: DataService) {}
}
