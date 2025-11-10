import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-viewport-input',
  templateUrl: './viewport-input.component.html',
  styleUrls: ['./viewport-input.component.scss'],
})
export class ViewportInputComponent implements AfterViewInit {
  @Input() elm: any;

  projectSubject: any;

  features: string[] = ['Pt', 'Supplement', 'Dim'];
  mode = 'definition';
  gradientIndex = 0;
  gradients: string[] = ['minmax', 'min', 'max'];
  gradient = 'minmax';

  featuresEl: any;
  modeEl: any;

  wasModeClick: boolean;

  @ViewChild('myFeatures', { static: false }) featuresGroup;
  @ViewChild('myMode', { static: false }) modeGroup;

  constructor(public dS: DataService) {
    this.mode = 'definition';
  }

  ngAfterViewInit() {
    this.featuresEl = this.featuresGroup.nativeElement;
    this.modeEl = this.modeGroup.nativeElement;
  }

  onFeatures(event) {
    this.elm.tree.viewFeatures = this.features = event.value;
    // this.elm.construct.prepareTree(this.elm.tree);
    this.elm.onInputChange();
    const keypath = 'tree.' + this.elm._eid.str + '.viewFeatures';
    this.dS.selectedProject.update({ [keypath]: this.features });
  }

  onMode(event) {
    this.wasModeClick = true;
    this.elm.tree.viewMode = this.mode = event.value;
    const keypath = 'tree.' + this.elm._eid.str + '.viewMode';
    this.dS.selectedProject.update({ [keypath]: this.mode });
  }

  modeClick() {
    if (
      !this.wasModeClick &&
      this.mode !== 'definition' &&
      this.mode !== 'thickness'
    ) {
      let i = this.gradients.indexOf(this.gradient);
      i++;
      if (i > this.gradients.length - 1) {
        i = 0;
      }
      this.gradient = this.gradients[i];
      this.elm.tree.viewGradient = this.gradient || 'real';
      const keypath = 'tree.' + this.elm._eid.str + '.viewGradient';
      this.dS.selectedProject.update({ [keypath]: this.gradient });
    }
    this.wasModeClick = false;
    this.elm.onInputChange();
  }
}
