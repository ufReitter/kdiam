import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ReditService } from '../redit.service';

@Component({
  selector: 'kd-snapshots-menu',
  standalone: false,
  templateUrl: './snapshots-menu.component.html',
  styleUrls: ['./snapshots-menu.component.scss'],
})
export class SnapshotsMenuComponent implements OnInit {
  constructor(public dS: DataService, public rS: ReditService) {}

  ngOnInit(): void {
    this.rS.getSnapshotList(this.dS.selVol._eid.str);
  }
}
