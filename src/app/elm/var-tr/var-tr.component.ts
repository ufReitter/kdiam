import { Component, Input, OnChanges } from '@angular/core';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: '[kd-var-tr]',
  templateUrl: './var-tr.component.html',
  styleUrls: ['./var-tr.component.css'],
})
export class VarTrComponent implements OnChanges {
  @Input() node: any;
  @Input() elm: Elm;
  @Input() set: any;
  constructor(public pS: ProfileService, public dS: DataService) {}

  ngOnChanges() {
    if (this.node) {
      this.elm = this.node.elm;
      this.set = this.node.set;
    }
    if (!this.set) {
      this.set = { attrib: {}, state: this.elm.state };
    }
  }
}
