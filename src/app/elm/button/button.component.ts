import { Component, Input } from '@angular/core';
import { Elm } from '../../engine/entity';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  selection: any[];
  @Input() elm: Elm;
  @Input() set: any;

  constructor(public dS: DataService) {}

  pressButton() {
    if (this.set.parent.job) {
      this.set.state.pressed = true;
      this.set.parent.job.doSubject.next({
        elm: this.elm,
        name: this.set.name,
        state: this.set.state,
        undo: true,
        project: true,
      });
    }
  }
}
