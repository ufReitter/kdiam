import { Component } from '@angular/core';
import { ViewService } from '../../services/view.service';

@Component({
  selector: 'kd-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
})
export class WidgetComponent {
  constructor(public vS: ViewService) {}
}
