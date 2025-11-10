import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { timer } from 'rxjs';
import { fadeInAnimation, slideInAnimation } from 'src/app/animations';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  animations: [fadeInAnimation, slideInAnimation],
})
export class CarouselComponent implements OnInit {
  @Input() pos = 'article';
  @Input() indicator = 'bottom';
  @Input() width = 320;

  @Output() push = new EventEmitter<any>();
  elm: Elm;
  slides = [];
  currentSlide = 0;
  trigger = 0;
  anim = 'right';
  timer: any;
  hover = false;
  constructor(public dS: DataService) {}

  ngOnInit(): void {
    this.elm = this.dS.obj['644770959fed5f19c8b91356'];
    this.slides = this.elm.children;
    this.preloadImages();
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timer) this.timer.unsubscribe();
  }

  stopTimer() {
    if (this.timer) this.timer.unsubscribe();
  }

  startTimer() {
    this.timer = timer(6000, 6000).subscribe(() => {
      this.onNextClick();
      this.push.emit(this.currentSlide);
    });
  }

  onPreviousClick() {
    const previous = this.currentSlide - 1;
    this.currentSlide = previous < 0 ? this.slides.length - 1 : previous;
    this.trigger--;
  }

  onNextClick() {
    const next = this.currentSlide + 1;
    this.currentSlide = next === this.slides.length ? 0 : next;
    this.trigger++;
  }

  onIndicatorClick(index: number) {
    this.currentSlide = index;
    this.trigger = index;
  }

  preloadImages() {
    for (const slide of this.slides) {
      if (slide.elm.figure) {
        new Image().src =
          '/images/scaled/' +
          slide.elm._eid.str +
          '-' +
          this.width +
          this.dS.retina.suffix +
          '.' +
          slide.elm.figure.ext +
          '?cb=' +
          slide.elm.figure.version;
      }
    }
  }
  navigate() {
    const elm = this.slides[this.currentSlide].set?.link
      ? this.dS.obj[this.slides[this.currentSlide].set.link]
      : this.slides[this.currentSlide].elm;
    this.dS.navigate(elm);
  }
}
