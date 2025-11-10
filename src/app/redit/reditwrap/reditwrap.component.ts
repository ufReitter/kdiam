import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Elm } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { ReditService } from '../redit.service';

@Component({
  selector: 'kd-reditwrap',
  templateUrl: './reditwrap.component.html',
  styleUrls: ['./reditwrap.component.scss'],
})
export class ReditwrapComponent implements OnInit, OnDestroy {
  component: string;
  node: any;
  elm: Elm;
  index: number;
  ident = '';
  noViewElement = false;
  isCurrent: boolean;
  isDevelopment: boolean = false;
  routeSub: Subscription;
  viewElementSub: Subscription;
  loadedSub: Subscription;
  showAltSub: Subscription;
  data: any = {};
  toolHeight = 50;
  constructor(
    public router: Router,
    private route: ActivatedRoute,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
    public rS: ReditService,
  ) {}

  ngOnInit(): void {
    // if (!this.dS.selEditElm) {
    // this.dS.selEditElm = this.elm =
    //   this.dS.obj[this.pS.pref.editor._eid] || this.dS.selElm;
    // }
    // this.editElementSub = this.dS.subject.editElement.subscribe(async (elm) => {
    //   if (elm) {
    //     this.elm =
    //       this.rS.edits.find((x) => x._eid.str === elm._eid.str) || elm;
    //     this.pS.pref.save({ 'editor._eid': this.elm._eid.str });
    //   }
    // });
    // this.loadedSub = this.rS.loaded.subscribe(async (loaded) => {
    //   if (loaded) {
    //     this.elm = this.rS.edits.find((x) => x._eid.str === this.elm._eid.str);
    //   }
    // });
    this.vS.editorIsLoaded = true;
    this.routeSub = this.route.params.subscribe((params) => {
      this.component = params.component;
      if (this.component !== 'inline') {
        this.elm = this.route.snapshot.data.elm;
        this.pS.pref.editor.right = this.component;
        if (!this.vS.buttons.activeEdit.includes('editor')) {
          this.vS.buttons.activeEdit = ['editor'];
        }
      }
    });

    this.showAltSub = this.dS.subject.showAlt.subscribe((show) => {
      if (show) {
        this.elm =
          this.dS.rS.alts.find((x) => x._eid.str === this.elm._eid.str) ||
          this.elm;
      }
    });
    // this.viewElementSub = this.dS.subject.viewElement.subscribe((elm) => {
    //   if (elm !== this.elm) {
    //     this.dS.selEditElm = elm;
    //     this.router.navigate([
    //       {
    //         outlets: {
    //           right: ['redit', this.component, elm._eid.str],
    //         },
    //       },
    //     ]);
    //   }
    // });
  }
  ngOnDestroy() {
    this.routeSub?.unsubscribe();
    this.viewElementSub?.unsubscribe();
    this.showAltSub?.unsubscribe();
  }
}
