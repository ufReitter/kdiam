import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { ReditService } from '../redit.service';

@Component({
  selector: 'kd-redit-tools',
  templateUrl: './redit-tools.component.html',
  styleUrls: ['./redit-tools.component.scss'],
})
export class ReditToolsComponent implements OnInit, OnDestroy {
  @Input() component: string;
  @Input() elm: Elm;

  constructor(
    private router: Router,
    public pS: ProfileService,
    public vS: ViewService,
    public dS: DataService,
    public rS: ReditService,
  ) {}

  ngOnInit(): void {}
  ngOnDestroy() {}

  onChangeGroup(e) {
    switch (e.source?.value) {
      case 'toc':
        break;
      case 'editor':
        break;
      case 'storage':
        break;
      case 'json':
        break;
      case 'code':
        break;
      case 'translate':
        break;
      case 'history':
        break;
      case 'debug':
        break;
      default:
        break;
    }
  }

  onChangeButton(e) {
    const keyPath =
      'edit.' +
      (this.vS.editRootElm?._eid.str || this.dS.selElm?._eid.str) +
      '.button';
    switch (e.value) {
      case 'toc':
        this.vS.buttons.volume = 'toc';
        this.pS.pref.snavOpened = true;
        this.router.navigate([{ outlets: { volume: null } }]);
        break;
      case 'edittoc':
        this.vS.buttons.volume = 'edittoc';
        this.pS.pref.snavOpened = true;
        this.router.navigate([{ outlets: { volume: ['vedit', 'edit'] } }]);
        break;
      case 'snapshot':
        this.router.navigate([
          {
            outlets: {
              right: ['redit', e.value, this.elm._eid.str],
            },
          },
        ]);
        break;
      case 'storage':
        this.router.navigate([
          {
            outlets: {
              right: ['redit', e.value, this.elm._eid.str],
            },
          },
        ]);
        break;
      case 'editor':
        this.router.navigate([
          {
            outlets: {
              right: ['redit', e.value, this.elm._eid.str],
            },
          },
        ]);
        this.pS.pref.save({ [keyPath]: e.value });

        break;
      case 'json':
        this.router.navigate([
          {
            outlets: {
              right: ['redit', e.value, this.elm._eid.str],
            },
          },
        ]);
        this.pS.pref.save({ [keyPath]: e.value });
        break;
      case 'code':
        this.router.navigate([
          {
            outlets: {
              right: ['redit', e.value, this.elm._eid.str],
            },
          },
        ]);
        this.pS.pref.save({ [keyPath]: e.value });
        break;
      case 'history':
        this.router.navigate([
          {
            outlets: {
              right: ['redit', e.value, this.elm._eid.str],
            },
          },
        ]);
        this.pS.pref.save({ [keyPath]: e.value });
        break;
      case 'translate':
        this.router.navigate([
          {
            outlets: {
              right: ['redit', e.value, this.elm._eid.str],
            },
          },
        ]);
        this.pS.pref.save({ [keyPath]: e.value });
        break;
      case 'target':
        this.router.navigate([
          {
            outlets: {
              right: ['redit', e.value, this.elm._eid.str],
            },
          },
        ]);
        this.pS.pref.save({ [keyPath]: e.value });
        break;
      case 'debug':
        if (e.source._checked) {
          this.pS.pref.save({ 'debug.show': true });
        } else {
          this.pS.pref.save({ 'debug.show': false });
        }
        this.pS.prefSub.next(this.pS.pref);
        break;
      default:
        break;
    }
  }
}
