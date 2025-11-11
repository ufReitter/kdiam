import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-element-title',
  standalone: false,
  templateUrl: './element-title.component.html',
  styleUrls: ['./element-title.component.scss'],
})
export class ElementTitleComponent {
  constructor(public dS: DataService) {}

  edit(tab?) {
    if (!tab) {
      if (this.dS.selElm.children || this.dS.selElm.code) {
        tab = 3;
      } else {
        tab = 1;
      }
    }
    this.dS.selElm.selectedTab1 = tab;
    this.dS.subject.editElement.next({ elm: this.dS.selElm });
  }
}
