import { Component, Input } from '@angular/core';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-result',
  standalone: false,
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss'],
})
export class ResultComponent {
  @Input() elm: Elm;
  @Input() set: any;

  constructor(public vS: ViewService, public dS: DataService) {}

  ngOnChanges() {
    this.set.state = this.set.state || {};
    delete this.set.state.val;
  }

  copyResult(e) {
    const value = (
      this.set.state.val * (this.set.state.coeff || this.elm.state.coeff || 1)
    ).toString();
    this.vS.copyFromContent(value);
  }
}
