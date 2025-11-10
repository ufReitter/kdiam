import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { ViewService } from 'src/app/services/view.service';
import { Elm } from '../../engine/entity';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-number',
  templateUrl: './number.component.html',
  styleUrls: ['./number.component.scss'],
})
export class NumberComponent implements OnInit, AfterViewInit {
  doSubject: Subscription;
  @Input() elm: Elm;
  @Input() set: any;
  @Output() slider = new EventEmitter<any>();
  value: number;
  oldValue: number;
  interval: any;
  numberEl: any;
  blink: boolean;

  @ViewChild('myNumber', { static: false }) myNumber;

  constructor(public vS: ViewService, public dS: DataService) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.set.state.val = this.set.state.val || this.elm.state.val || 0;
    this.value = this.set.state.val;
    this.numberEl = this.myNumber.nativeElement;
  }

  input(e) {
    if (
      this.set.state.maxValid &&
      this.numberEl.value >= this.set.state.maxValid
    ) {
      this.set.state.val = this.numberEl.value = this.set.state.maxValid;
    } else {
      this.set.state.val = this.numberEl.value;
    }
    this.value = this.set.state.val;
    if (this.set.parent.job && this.numberEl.value !== this.oldValue) {
      this.set.parent.job.doSubject.next({
        elm: this.elm,
        name: this.set.name,
        state: this.set.state,
        undo: true,
        project: true,
      });
    }
    this.oldValue = this.numberEl.value;
  }

  emitSlider() {
    this.slider.emit({ elm: this.elm, set: this.set });
  }

  inputPress() {
    this.numberEl.focus();
    this.numberEl.selectionStart = 0;
    this.numberEl.selectionEnd = 999;
  }

  inputPressup() {}

  inputTap() {
    this.emitSlider();

    let delay1 = timer(200).subscribe((t) => {
      this.blink = true;
    });

    let delay2 = timer(700).subscribe((t) => {
      this.blink = false;
    });
  }

  doStepMinus() {
    this.numberEl.stepDown();
    this.set.state.val = this.numberEl.value;
    this.input(this.set.state.val);
  }

  doStepPlus() {
    this.numberEl.stepUp();
    this.set.state.val = this.numberEl.value;
    this.input(this.set.state.val);
  }

  mouseDownPlus() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.doStepPlus();
    }, 100);
  }

  mouseDownMinus() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      this.doStepMinus();
    }, 100);
  }

  mouseUpMinus() {
    clearInterval(this.interval);
    this.doStepMinus();
    this.numberEl.blur();
  }

  mouseUpPlus() {
    clearInterval(this.interval);
    this.doStepPlus();
    this.numberEl.blur();
  }
}
