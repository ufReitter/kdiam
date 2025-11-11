import { Component, Input, OnInit } from '@angular/core';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'kd-reference',
  standalone: false,
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss'],
})
export class ReferenceComponent implements OnInit {
  @Input() ref: any;
  elm: Elm;
  @Input() parent: Elm;

  constructor(public pS: ProfileService, public dS: DataService) {}
  ngOnInit() {
    this.elm = this.ref.elm;
    this.elm.seNo =
      this.dS.selVol.refs.findIndex((ref) => ref.id === this.elm._eid.str) + 1;
  }
}
