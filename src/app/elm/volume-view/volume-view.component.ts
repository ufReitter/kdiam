import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Elm } from '../../engine/entity';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-volume-view',
  standalone: false,
  templateUrl: './volume-view.component.html',
  styleUrls: ['./volume-view.component.scss'],
})
export class VolumeViewComponent implements OnInit, OnDestroy {
  volumeSubject: Subscription;
  @Input() volume: Elm;

  constructor(public dS: DataService) {}

  ngOnInit() {
    if (!this.volume) {
      this.volumeSubject = this.dS.subject.volume.subscribe((volume) => {
        this.volume = volume;
      });
    }
  }

  ngOnDestroy() {
    if (this.volumeSubject) this.volumeSubject.unsubscribe();
  }
}
