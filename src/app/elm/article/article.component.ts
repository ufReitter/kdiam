import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ElmNode } from 'src/app/engine/entity';
import { DataService } from 'src/app/services/data.service';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';

@Component({
  selector: 'kd-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleComponent implements OnInit, AfterViewInit, OnDestroy {
  node: ElmNode;
  loadedSub: Subscription;
  localeSub: Subscription;
  searchSub: Subscription;
  routeSub: Subscription;
  routeSub2: Subscription;
  volumeSub: Subscription;
  defSub: Subscription;
  showAltSub: Subscription;
  cdArticleSub: Subscription;
  readMoreLink: string;
  @ViewChild('references', { static: false }) references;
  referencesElm: any;
  refsHeight = 0;
  articleElm: any;

  showAlt: string = 'none';

  urlSegments: string[] = [];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private snackbar: MatSnackBar,
    @Inject(DOCUMENT) private document,
    public cd: ChangeDetectorRef,

    public pS: ProfileService,
    public vS: ViewService,
    public dS: DataService,
  ) {}

  getAltNode(show, node) {
    let arr, vol, result;

    if (show === 'none') {
      arr = this.dS.arr;
    } else {
      arr = this.dS.rS.alts;
    }

    if (this.urlSegments[1] === 'store') {
      result = new ElmNode({
        id: node.id,
        elm: arr.find((x) => x._eid.str === node.id) || this.dS.obj[node.id],
      });
    } else {
      vol =
        arr.find((x) => x._eid.str === this.dS.selVol._eid.str) ||
        this.dS.selVol;

      result =
        vol.flatTree.find((x) => x.elm._eid.str === node.id) ||
        this.dS.system.roleElm.page404;
    }

    this.dS.allElmsNo(result);

    return result;
  }

  ngOnInit(): void {
    this.routeSub = this.route.data.subscribe(async (data) => {
      this.node = data['node'];

      this.urlSegments = this.route.snapshot.url.map((s) => s.path);

      this.dS.allElmsNo(this.node);

      if (this.node.elm !== this.dS.selElm) {
        this.dS.subject.viewElement.next(this.node.elm);
      }

      if (this.showAlt !== 'none') {
        this.node = this.getAltNode(this.showAlt, this.node);
      }

      this.cd.detectChanges();
    });
    this.showAltSub = this.dS.subject.showAlt.subscribe((show) => {
      if (show) {
        this.showAlt = show;
        this.node = this.getAltNode(show, this.node);
        this.cd.detectChanges();
      }
    });
    this.searchSub = this.dS.subject.search.subscribe((term) => {
      if (term || term === '') {
        this.cd.detectChanges();
      }
    });
    this.loadedSub = this.dS.subject.loaded.subscribe((loaded) => {
      if (loaded) {
        this.cd.detectChanges();
      }
    });
    this.localeSub = this.dS.subject.locale.subscribe((lang) => {
      if (lang) {
        this.cd.detectChanges();
      }
    });
    this.cdArticleSub = this.dS.subject.cdArticle.subscribe((doit) => {
      if (doit) {
        this.cd.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    this.referencesElm = this.references.nativeElement;
    this.routeSub2 = this.route.data.subscribe(async (data) => {
      let delay2 = timer(0).subscribe((t) => {
        if (this.referencesElm?.offsetHeight) {
          this.refsHeight = this.referencesElm.offsetHeight + 20;
        } else {
          this.refsHeight = 0;
        }
        this.cd.detectChanges();
      });
      if (
        this.node.elm.figure &&
        !this.node.elm.figure.image &&
        this.node.elm.figure.ext !== 'dyn' &&
        this.node.elm.figure.ext !== 'mov' &&
        this.node.elm.figure.ext !== 'mp4'
      ) {
        await this.dS.getImageHex(this.node.elm);
        this.cd.detectChanges();
      }
    });

    this.defSub = this.dS.subject.elmMod.subscribe((elm) => {
      this.cd.detectChanges();
    });
  }

  ngOnDestroy() {
    this.loadedSub?.unsubscribe();
    this.localeSub?.unsubscribe();
    this.searchSub?.unsubscribe();
    this.routeSub?.unsubscribe();
    this.routeSub2?.unsubscribe();
    this.defSub?.unsubscribe();
    this.showAltSub?.unsubscribe();
  }
}
