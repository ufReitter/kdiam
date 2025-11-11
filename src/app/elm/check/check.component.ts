import { Component, Input } from '@angular/core';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-check',
  standalone: false,
  templateUrl: './check.component.html',
  styleUrls: ['./check.component.scss'],
})
export class CheckComponent {
  @Input() elm: Elm;
  @Input() set: any;

  constructor(public dS: DataService) {}

  pressCheck(event) {
    this.set.state.checked = event.checked;
    if (this.set.parent.job) {
      this.set.parent.job.doSubject.next({
        elm: this.elm,
        name: this.set.name,
        state: this.set.state,
        undo: true,
      });
    }
  }
}
