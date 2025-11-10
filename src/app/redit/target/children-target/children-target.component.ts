import { Component, Input, OnChanges } from '@angular/core';
import { ElmNode } from 'src/app/engine/entity';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { Elm } from '../../../engine/entity';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'kd-children-target',
  templateUrl: './children-target.component.html',
  styleUrls: ['../../../elm/children/children.component.scss'],
})
export class ChildrenTargetComponent implements OnChanges {
  slider1: any;
  slider2: any;
  playing: boolean;
  @Input() node: ElmNode;
  @Input() elm: Elm;
  @Input() set: any;
  @Input() target = 'en';

  constructor(
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  ngOnChanges() {
    // this.elm = this.node.elm;
    // this.set = this.node.set;
    if (
      this.elm.grids &&
      this.elm.grids[1] &&
      this.elm.grids[1].children &&
      this.elm.grids[1].children.length &&
      this.elm.view === 'calc'
    ) {
      this.slider1 = {
        elm: this.elm.grids[1].children[0].elm,
        set: this.elm.grids[1].children[0].set,
      };
    }
    if (
      this.elm.grids &&
      this.elm.grids[2] &&
      this.elm.grids[2].children &&
      this.elm.grids[2].children.length &&
      this.elm.view === 'calc'
    ) {
      this.slider2 = {
        elm: this.elm.grids[2].children[0].elm,
        set: this.elm.grids[2].children[0].set,
      };
    } else {
      this.slider2 = null;
    }
  }

  input(event) {
    this.slider2.set.state.val = event.value;
    this.slider2.set.state.error = this.slider2.set.parent.job.invalid;
    this.slider2.set.parent.job.doSubject.next({
      elm: this.slider2.elm,
      name: this.slider2.set.name,
      state: this.slider2.set.state,
      undo: false,
      project: false,
    });
  }
  change(event) {
    this.slider2.set.state.val = event.value;
    this.slider2.set.parent.job.doSubject.next({
      elm: this.slider2.elm,
      name: this.slider2.set.name,
      state: this.slider2.set.state,
      undo: true,
      project: true,
    });
  }
  setInput() {
    let i =
      this.elm.grids[2].children.findIndex(
        (it) => it.elm._eid.str === this.slider2.elm._eid.str,
      ) + 1;

    if (i > this.elm.grids[2].children.length - 1) {
      i = 0;
    }

    this.slider2 = {
      elm: this.elm.grids[2].children[i].elm,
      set: this.elm.grids[2].children[i].set,
    };
  }
}
