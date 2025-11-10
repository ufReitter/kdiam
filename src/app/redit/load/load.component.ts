import { Component } from '@angular/core';
import { ViewService } from 'src/app/services/view.service';
import { ReditService } from '../redit.service';

@Component({
  selector: 'kd-load',
  templateUrl: './load.component.html',
  styleUrls: ['./load.component.scss'],
})
export class LoadComponent {
  constructor(private vS: ViewService, private rS: ReditService) {
    this.vS.editorIsLoaded = true;
  }
}
