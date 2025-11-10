import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Elm, ElmNode } from '../../engine/entity';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-numeration',
  templateUrl: './numeration.component.html',
  styleUrls: ['./numeration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumerationComponent implements OnInit, AfterViewInit, OnDestroy {
  volumeSubject: Subscription;
  num: string;
  artnum = '';

  @Input() node: ElmNode;
  @Input() elm: Elm;
  @Input() parent: Elm;

  constructor(private cd: ChangeDetectorRef, public dS: DataService) {}

  ngOnInit() {
    this.elm = this.node.elm;
  }
  ngAfterViewInit() {
    this.volumeSubject = this.dS.subject.volume.subscribe((vol) => {
      if (vol) {
        this.num = this.elm.num;
        if (this.elm.home && this.elm.home !== this.dS.selElm) {
          this.artnum = this.elm.home.num;
        }
        this.cd.detectChanges();
      }
    });
  }
  ngOnDestroy() {
    this.volumeSubject.unsubscribe();
  }
}
