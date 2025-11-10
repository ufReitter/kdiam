import {
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ProfileService } from 'src/app/services/profile.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-scroll',
  templateUrl: './scroll.component.html',
  styleUrls: ['./scroll.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollComponent implements OnInit, AfterViewInit, OnDestroy {
  localeSubject: Subscription;
  viewElementSubject: Subscription;
  editTabSubject: Subscription;
  selectionSubject: Subscription;
  sortSubject: Subscription;
  stepNavSubject: Subscription;
  showAltSub: Subscription;
  isInit = true;

  @Input() elements: any;
  @Input() itemSize: number;
  @Input() view: string;
  @Input() statusInfo: boolean;

  // @ViewChild('myViewport') myViewport;

  @ViewChild(CdkVirtualScrollViewport)
  private readonly scrollRef: CdkVirtualScrollViewport;
  @ViewChild(CdkVirtualForOf)
  private readonly elementsRef: any;

  constructor(
    private router: Router,
    private cd: ChangeDetectorRef,
    public pS: ProfileService,
    public dS: DataService,
  ) {
    this.isInit = true;
  }
  ngOnInit() {
    if (this.view === 'store-root') this.itemSize = 32;
    if (this.view === 'edit-children') this.itemSize = 62;
  }
  ngAfterViewInit() {
    this.elementsRef.viewChange.subscribe((view) => {});
    this.elementsRef.dataStream.subscribe((data) => {
      // console.log(data.length);
    });
    this.localeSubject = this.dS.subject.locale.subscribe((locale) => {
      this.cd.detectChanges();
    });
    this.selectionSubject = this.dS.subject.selection.subscribe((selection) => {
      let delay = timer(100).subscribe((t) => {
        this.cd.detectChanges();
        // this.scrollTo('top');
      });
    });
    this.sortSubject = this.dS.subject.sort.subscribe((selection) => {
      let delay = timer(100).subscribe((t) => {
        this.scrollRef.scrollTo({ top: 0, behavior: 'auto' });
        this.cd.detectChanges();
      });
    });
    this.viewElementSubject = this.dS.subject.viewElement.subscribe(
      (element) => {
        this.cd.detectChanges();
        // this.scrollTo('auto');
      },
    );
    this.stepNavSubject = this.dS.subject.stepNav.subscribe((element) => {
      if (!this.isInit) {
        let delay = timer(150).subscribe((t) => {
          if (this.isInit) {
            this.scrollRef.scrollTo({ top: 0, behavior: 'auto' });
          } else {
            this.scrollTo('auto');
          }
        });
      }
    });
    this.showAltSub = this.dS.subject.showAlt.subscribe((show) => {
      this.cd.detectChanges();
    });
    this.isInit = false;
  }
  ngOnDestroy() {
    this.localeSubject?.unsubscribe();
    this.editTabSubject?.unsubscribe();
    this.viewElementSubject?.unsubscribe();
    this.selectionSubject?.unsubscribe();
    this.sortSubject?.unsubscribe();
    this.stepNavSubject?.unsubscribe();
    this.showAltSub?.unsubscribe();
  }

  private scrollTo(pos) {
    let index = this.elements.indexOf(this.dS.selElm);
    let elmPos,
      scrollNew,
      size = this.scrollRef.getViewportSize(),
      scrollOld = this.scrollRef.measureScrollOffset();

    if (index > -1) {
      elmPos = index * this.itemSize;
      if (pos === 'auto') {
        if (elmPos < scrollOld + 1 * this.itemSize) {
          scrollNew = elmPos - 1 * this.itemSize;
        }
        if (elmPos > scrollOld + size - 2 * this.itemSize) {
          scrollNew = elmPos - size + 2 * this.itemSize;
        }
      }
      if (pos === 'top') {
        scrollNew = elmPos - 1 * this.itemSize;
      }
      if (pos === 'middle') {
        scrollNew = elmPos - size / 2 + 0.5 * this.itemSize;
      }
      if (scrollNew) {
        this.scrollRef.scrollTo({ top: scrollNew, behavior: 'auto' });
      }
    }
  }
  viewElement(event, element) {
    if (event.cntrKey) {
      this.checkElement(element);
      return true;
    }
    if (event.altKey) {
      this.router.navigate([
        {
          outlets: {
            right: [
              'redit',
              this.pS.pref.edit[element._eid.str]?.button || 'editor',
              element._eid.str,
              this.pS.pref.edit[element._eid.str]?.index || 0,
            ],
          },
        },
      ]);
    }
    if (!event.altKey) {
      this.dS.navigate(element);
    }
  }

  checkElement(elm) {
    elm.checked = !elm.checked;
    if (elm.checked) {
      this.dS.checked.pushUnique(elm);
    } else {
      const index = this.dS.checked.findIndex((e) => e._eid.equals(elm._eid));
      if (index !== -1) {
        this.dS.checked.splice(index, 1);
      }
    }
    this.dS.subject.checked.next(this.dS.checked);
  }
  private scrollToIndex(index) {}
}
