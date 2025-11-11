import { Component, Input } from '@angular/core';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-json',
  standalone: false,
  templateUrl: './json.component.html',
  styleUrls: ['./json.component.scss'],
})
export class JsonComponent {
  @Input() elm: Elm;
  @Input() elms: Elm[] = [];
  constructor(public vS: ViewService, public dS: DataService) {}
  ngOnChanges() {
    console.log(this.elm);
  }
}
