import { Component, Input } from '@angular/core';
import { ElmNode } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'kd-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  @Input() node: ElmNode;

  constructor(public pS: ProfileService, public dS: DataService) {}
}
