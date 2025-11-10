import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, timer } from 'rxjs';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, AfterViewInit, OnDestroy {
  toolTips: boolean;
  routeParamsSub: any;
  routeUrlSub: any;
  idStr: string;
  url: any;
  route: string[] = [];
  toolBarMode = 'article';
  outletMode = 'element';
  drawerWidth = 500;
  isTop: boolean;
  isBottom: boolean;
  navButtons = true;
  navIndex = 0;
  navSelection: any;
  @ViewChild('drawerSidenav', { static: false }) drawerSidenav;
  @ViewChild('drawerContentView', { static: false }) drawerContentView;
  @ViewChild('mainOutlet', { static: false }) mainOutlet;
  @ViewChild('rightOutlet', { static: false }) rightOutlet;
  @ViewChild('container', { static: false }) container;
  @ViewChild('article', { static: false }) article;
  drawerContentElm: any;
  drawerContentViewElm: any;
  mainOutletElm: any;
  rightOutletElm: any;
  volumeSubject: Subscription;
  viewElementSubject: Subscription;
  selectionSubject: Subscription;
  stepNavSubject: Subscription;
  snavSubject: Subscription;
  sortSubject: Subscription;
  localeSubject: Subscription;
  routeReuseSubject: Subscription;
  prefSubject: Subscription;
  lastMouseWheel = 0;
  mouseWheel = 0;
  mouseWheelTimeStamp = 0;
  impressLink = '/de/impressum';
  formingLink = '/de/unsere-taetigkeit';
  contactLink = '/de/kontakt';
  menuLink = ['/' + this.dS.locale];
  playStatus = false;
  routeSegmentsPrePlay: string[] = [];
  routeToPlay: string[] = [];
  routeBeforeFull: string[] = [];
  indexToPlay = 0;
  playInterval: any;
  playDir = 1;
  ttEdit: '';
  isBrowser: boolean;
  showOutlet = true;
  disableSnavAnimation = false;
  showScrollTotop: boolean;
  scrollTrigger: boolean;
  dimSubject: any;
  toolbarSubject: any;
  trans05 = false;
  articleElm: any;
  windowRef: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public router: Router,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
    private zone: NgZone,
  ) {
    this.windowRef = window;
    window['fncIdentifierCompRef'] = {
      component: this,
    };
    this.route = [];
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
      this.route = window.location.pathname.split('/');
    }

    this.navSelection = this.dS.selection;
    this.playDir = 1;
  }
  toggleDrawer() {
    this.drawerSidenav.toggle();
  }
  nav(value) {
    this.router.navigate(value);
  }
  navigate(value) {
    const node =
      this.dS.selVol.flatTree.find((x) => x.elm._eid.str === value) ||
      this.dS.system.roleElm.page404;
    const elm = this.dS.obj[value];
    if (!this.vS.quillOpen) {
      for (const slug in this.dS.slug[this.dS.locale]) {
        if (
          Object.prototype.hasOwnProperty.call(
            this.dS.slug[this.dS.locale],
            slug,
          )
        ) {
          const id = this.dS.slug[this.dS.locale][slug];
          if (id === value) {
            value = slug;
          }
        }
      }

      this.zone.run(() => {
        this.router.navigate([node.getPath(this.dS.locale)]);
      });
    }
  }
  open(value) {
    if (!this.vS.quillOpen) {
      window.open(value, '_blank', 'noopener');
    }
  }
  ngOnInit() {
    this.toolTips = !this.dS.noToolTips;
    //this.dS.subject.viewElement.next(this.dS.system);
    this.localeSubject = this.dS.subject.locale.subscribe((locale) => {
      if (locale) {
        switch (locale) {
          case 'de':
            this.impressLink = '/de/impressum';
            this.formingLink = '/de/unsere-taetigkeit';
            this.contactLink = '/de/kontakt';
            break;
          case 'en':
            this.impressLink = '/en/impress';
            this.formingLink = '/en/our-activity';
            this.contactLink = '/en/contact';
            break;
          default:
            break;
        }
      }
    });
  }
  ngAfterViewInit() {
    this.vS.drawerSidenav = this.drawerSidenav;
    if (this.dS.isServer) {
      this.pS.pref.snav.opened = true;
    }
    this.container.autosize = true;
    this.drawerContentViewElm = this.drawerContentView.nativeElement;

    this.vS.drawerContentViewElm = this.drawerContentView.nativeElement;
    this.vS.initDrawerSidenav(this.drawerSidenav);

    this.articleElm = this.article.nativeElement;

    this.vS.size.articleH = this.articleElm?.offsetHeight;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const url = event.url.replace('(sidebar:edit)', '');
        this.route = url.split('/');
        if (this.dS.selElm === this.dS.system) {
          this.menuLink = [
            '/' +
              this.dS.locale +
              '/' +
              this.dS.selVol?.txts.alias +
              '/' +
              this.dS.selVol?.tree[0].elm.txts.alias,
          ];
        } else {
          this.menuLink = [
            '/' +
              this.dS.locale +
              '/' +
              this.dS.selVol?.txts.alias +
              '/' +
              (this.dS.selElm?.txts.alias || this.dS.selElm?._eid.str),
          ];
        }
        let delay2 = timer(0).subscribe((t) => {
          const s = this.vS.size;
          s.articleH = this.articleElm?.offsetHeight;
          s.editorH = s.h - s.header - s.footer;
        });
      }
    });

    this.drawerSidenav.openedChange.subscribe((event) => {
      this.pS.pref.save({ snavOpened: this.pS.pref.snavOpened });
      localStorage.setItem(
        'snavOpened',
        JSON.stringify(this.pS.pref.snavOpened),
      );
    });

    if (this.dS.deviceInfo.os === 'Windows') {
      let body = document.getElementsByTagName('body')[0];
      body.className += 'noscrollbar';
    }
    if (this.dS.deviceInfo.browser === 'Firefox') {
      let body = document.getElementsByTagName('body')[0];
      body.className += 'scrollbar';
    }
    this.volumeSubject = this.dS.subject.volume.subscribe((vol) => {
      if (vol) {
        if (this.dS.selElm === this.dS.system) {
          this.menuLink = [
            '/' +
              this.dS.locale +
              '/' +
              vol.txts.alias +
              '/' +
              vol.tree[0].elm.txts.alias,
          ];
        } else {
          this.menuLink = [
            '/' +
              this.dS.locale +
              '/' +
              vol.txts.alias +
              '/' +
              (this.dS.selElm?.txts.alias || this.dS.selElm?._eid.str),
          ];
        }

        this.navSelection = vol.children;
        this.navIndex = this.navSelection.indexOf(this.dS.selElm);
      }
    });
    this.viewElementSubject = this.dS.subject.viewElement.subscribe(
      (element) => {
        if (element) {
          if (this.dS.isBrowser) {
            this.scrollToTop();
          }
          this.isTop = true;
        }
      },
    );
    this.selectionSubject = this.dS.subject.selection.subscribe((selection) => {
      if (selection) {
        this.navSelection = selection;
        this.navIndex = selection.indexOf(this.dS.selElm);
      }
    });
    this.sortSubject = this.dS.subject.sort.subscribe((selection) => {
      if (selection) {
        this.navSelection = selection;
        this.navIndex = selection.indexOf(this.dS.selElm);
      }
    });

    // // @ts-ignore
    // console.log(window.prerenderReady);
    // // @ts-ignore
    // window.prerenderReady = true;
  }
  navHelp() {
    this.pS.pref.snav.help = !this.pS.pref.snav.help;
    this.dS.subject.snav.next(this.pS.pref.snav);
  }
  scrollToTop() {
    this.drawerContentViewElm.scrollTop = 0;
    this.showScrollTotop = false;
    this.isTop = true;
    let delay = timer(20).subscribe((t) => {
      this.showScrollTotop = false;
    });
  }
  ngOnDestroy() {
    if (this.prefSubject) this.prefSubject.unsubscribe();
    if (this.dimSubject) this.dimSubject.unsubscribe();
    if (this.playInterval) this.playInterval.unsubscribe();
    if (this.volumeSubject) this.volumeSubject.unsubscribe();
    if (this.viewElementSubject) this.viewElementSubject.unsubscribe();
    if (this.selectionSubject) this.selectionSubject.unsubscribe();
    if (this.sortSubject) this.sortSubject.unsubscribe();
    if (this.stepNavSubject) this.stepNavSubject.unsubscribe();
    if (this.snavSubject) this.snavSubject.unsubscribe();
    if (this.localeSubject) this.localeSubject.unsubscribe();
  }
  addClick() {
    var els = document.getElementById('rbdy').children;
    let length = els.length;
    for (let i = 0; i < length; i++) {
      const el = els[i];
      // el.addEventListener("click", highLightElement);
    }
  }
  fullScreenToggle(e) {
    this.playStatus = false;
    this.dS.viewMode.full = e.source.checked;

    if (e.source.checked) {
      this.routeBeforeFull = [...this.dS.routeSegments];
      this.pS.pref.snav.opened = false;
      this.dS.subject.snav.next(this.pS.pref.snav);
    } else {
      this.router.navigate(this.routeBeforeFull);
    }
    this.dS.subject.fullScreen.next(e.source.checked);
  }
  slideShow(e) {}
  onScroll(event?) {
    this.showScrollTotop = true;
    this.trans05 = true;
    if (!this.scrollTrigger) {
      if (this.vS.size.articleH + 120 > this.vS.size.h) {
        this.vS.sizeSub.next(this.vS.windowOnResize(1));
        this.vS.animated = true;
        timer(510).subscribe((t) => {
          this.vS.animated = false;
        });
      }
      this.scrollTrigger = true;
    }

    if (event.srcElement.scrollTop === 0) {
      this.showScrollTotop = false;
      // if (this.dS.routeSegments[1] !== 'admin') {
      //   this.vS.sizeSub.next(this.vS.windowOnResize(2));
      //   this.vS.size.feature = false;
      //   this.vS.size.news = false;
      //   if (this.vS.size.articleH + 120 > this.vS.size.h) {
      //     this.vS.animated = true;
      //   } else {
      //     this.vS.size.feature = true;
      //   }
      //   timer(510).subscribe((t) => {
      //     this.vS.animated = false;
      //     this.vS.sizeSub.next(this.vS.windowOnResize(2));
      //   });
      //   this.scrollTrigger = false;
      //   this.showScrollTotop = false;
      // }
    }
  }
  onSwipeUp(event) {}
  onSwipeDown(event) {}
  navPrev() {}
  navNext(dir) {
    this.navIndex = this.navIndex + dir;

    if (this.navIndex > this.navSelection.length - 1) {
      this.navIndex = this.navSelection.length - 1;
    }

    if (this.navIndex < 0) {
      this.navIndex = 0;
    }

    this.dS.navigate(this.navSelection[this.navIndex]);
    this.dS.subject.stepNav.next(this.dS.selElm);
  }
  openDrawer(content?) {
    if (!this.dS.selVol) {
      this.dS.subject.volume.next(this.pS.pref.volume || this.dS.system);
    }
    this.pS.pref.snav.opened = true;
    this.dS.subject.snav.next(this.pS.pref.snav);
    this.drawerSidenav.open(this.pS.pref.snav.opened);
  }
  onOpenedStart() {
    if (this.pS.pref.snav.content === 'edit') {
      this.dS.viewMode.editDrawer = true;
    }
  }
  onClosedStart() {
    this.dS.viewMode.editDrawer = false;
  }
  onOpenedChange(e) {
    this.vS.sizeSub.next(this.vS.windowOnResize(this.vS.headerIndex));
  }

  edit(tab?) {
    if (this.pS.profile.role.editor) {
      if (
        this.pS.pref.snav.content === 'edit' &&
        this.pS.pref.snav.opened === true &&
        this.dS.selElm === this.dS.selectedEditElement
      ) {
        this.pS.pref.snav.content = 'edit';
        this.pS.pref.snav.opened = true;
        this.dS.subject.snav.next(this.pS.pref.snav);
        this.dS.subject.editElement.next({
          elm: this.dS.selElm,
          src: 'main-nav',
        });
      } else {
        this.pS.pref.snav.content = 'edit';
        this.pS.pref.snav.opened = true;
        this.dS.subject.snav.next(this.pS.pref.snav);
        this.dS.subject.editElement.next({
          elm: this.dS.selElm,
          src: 'main-nav',
        });
      }
      this.pS.pref.update({ snav: this.pS.pref.snav });
    }
  }
}
