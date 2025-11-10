import { Component, Input } from '@angular/core';
import { Elm } from 'src/app/engine/entity';

@Component({
  selector: 'kd-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
})
export class SliderComponent {
  @Input() elm: Elm;
  @Input() set: any;

  constructor() {}

  input(event) {
    this.set.state.val = event.value;
    this.set.parent.job.doSubject.next({
      elm: this.elm,
      name: this.set.name,
      state: this.set.state,
      undo: false,
      project: false,
    });
  }
  change(event) {
    this.set.state.val = event.value;
    this.set.parent.job.doSubject.next({
      elm: this.elm,
      name: this.set.name,
      state: this.set.state,
      undo: true,
      project: true,
    });
  }
}
