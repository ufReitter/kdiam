import { Component, EventEmitter, Input, Output } from '@angular/core';
import { interval, timer } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-animation',
  standalone: false,
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss'],
})
export class AnimationComponent {
  animation: any;
  play: boolean;
  reverse: boolean;

  @Input() elm: Elm;
  @Input() set: any;
  @Output() plays = new EventEmitter<any>();

  constructor(public dS: DataService) {}

  pressButton() {
    this.play = !this.play;

    if (this.play) {
      this.set.state.noslider = true;
    } else {
      this.animation.unsubscribe();
    }

    this.plays.emit(this.play);

    let delay = timer(100).subscribe((t) => {
      if (this.play) {
        this.animation = interval(40).subscribe(() => this.animate());
      } else {
        this.set.state.noslider = false;
        this.set.parent.job.doSubject.next({
          elm: this.elm,
          name: this.set.name,
          state: this.set.state,
          undo: true,
          project: true,
        });
      }
    });
  }
  animate() {
    if (this.reverse) {
      this.set.state.val = this.set.state.val - this.set.state.step;
    } else {
      this.set.state.val = this.set.state.val + this.set.state.step;
    }

    if (this.set.state.val > this.set.state.max) {
      this.set.state.val = this.set.state.max;
      this.reverse = true;
    }

    if (this.set.state.val < this.set.state.min) {
      this.set.state.val = this.set.state.min;
      this.reverse = false;
    }

    if (this.set.parent.job) {
      this.set.parent.job.doSubject.next({
        elm: this.elm,
        name: this.set.name,
        state: this.set.state,
        undo: false,
        project: false,
      });
    }
  }
}
