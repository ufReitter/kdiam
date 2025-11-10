import { Component, Input, OnInit } from '@angular/core';
import { CalcService } from 'src/app/calc/calc.service';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'kd-play-button',
  templateUrl: './play-button.component.html',
  styleUrls: ['./play-button.component.scss'],
})
export class PlayButtonComponent implements OnInit {
  icon = 'play_arrow';
  @Input() elm: Elm;
  constructor(public dS: DataService, public cS: CalcService) {}

  ngOnInit(): void {
    this.icon = this.elm.attrib.autoStart ? 'pause' : 'play_arrow';
  }
  press() {
    if (this.icon === 'play_arrow') {
      this.cS.play(this.elm.job);
      this.icon = 'pause';
    } else {
      this.cS.pause(this.elm.job);
      this.icon = 'play_arrow';
    }
  }
}
