import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ViewService } from 'src/app/services/view.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-logo',
  templateUrl: './logo.component.html',
  styleUrls: ['./logo.component.scss'],
})
export class LogoComponent implements AfterViewInit, OnDestroy {
  svg = false;
  volumeSubject: Subscription;

  constructor(
    public router: Router,
    public vS: ViewService,
    public dS: DataService,
  ) {}

  ngAfterViewInit() {
    this.volumeSubject = this.dS.subject.volume.subscribe((vol) => {
      if (vol) {
        if (vol.figure?.ext === 'svg' && vol.figure?.render) {
          this.svg = vol.figure.render;
        } else {
          this.svg = vol.txts.srt;
        }
      }
    });
  }

  ngOnDestroy() {
    this.volumeSubject.unsubscribe();
  }
}
