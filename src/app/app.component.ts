import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  ElementRef,
  enableProdMode,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { MatLegacyButton as MatButton } from '@angular/material/legacy-button';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatSidenavContainer } from '@angular/material/sidenav';
import { NavigationEnd, Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DataService } from './services/data.service';
import { ProfileService } from './services/profile.service';
import { StyleManager } from './services/style-manager';
import { ViewService } from './services/view.service';

declare let gtag: Function;

enableProdMode();
@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  templateUrl: './app.component.html',
  providers: [SwUpdate],
})
export class AppComponent implements OnInit, OnDestroy {
  swUpdateSubject: Subscription;
  statusSubject: any;
  sideNavOpened: boolean;
  sideEditOpened: boolean;
  sideNavMode: string;
  sideNavContent: string;
  buttonSideNavShown = true;
  appCache: any;
  checkCacheInterval: any;
  sub: any;
  loadingCache = false;
  navButtons = true;
  zoomFactor = 1.0;
  outletElement: any;
  scrollContainerElement: any;
  roleEditorHold: boolean;
  debugLit = true;
  syncProgress = 0;
  color: string;
  files: FileList;
  sideEdit: any;
  @ViewChild('mySedit') mySedit;
  @ViewChild(MatSidenavContainer)
  sidenavContainer: MatSidenavContainer;

  gaKompendia = environment.gaKompendia;
  gaForming = environment.gaForming;
  trackingCode: string;
  canonical: HTMLElement;
  html: HTMLElement;

  cookieIsWarned = false;
  cookiesAccepted = false;

  constructor(
    public http: HttpClient,
    public router: Router,
    // public swUpdate: SwUpdate,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,
    private readonly renderer: Renderer2,
    private el: ElementRef,
    public pS: ProfileService,
    public vS: ViewService,
    public dS: DataService,
    public styleManager: StyleManager,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) document,
  ) {
    // cookie consent text only regarding indexedDB

    this.statusSubject = new BehaviorSubject<number>(0);
    const loading = document.getElementById('loading') as HTMLElement;
    this.renderer.addClass(loading, 'kd-display-none');

    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     if (isPlatformBrowser(this.platformId) && typeof gtag !== 'undefined') {
    //       gtag('config', this.trackingCode, {
    //         page_path: event.urlAfterRedirects,
    //       });
    //     }
    //   }
    // });

    this.html = document.getElementsByTagName('html')[0];
    this.canonical = this.renderer.createElement('link') as HTMLElement;

    this.renderer.setAttribute(this.canonical, 'id', 'canon');
    this.renderer.setAttribute(this.canonical, 'rel', 'canonical');

    const head = document.getElementsByTagName('head')[0];

    this.renderer.appendChild(head, this.canonical);

    const origin =
      this.dS.origin === 'about://' ? 'https://4ming.de' : this.dS.origin;

    this.dS.subject.viewElement.subscribe((elm) => {
      if (elm?.attrib.canonical) {
        this.renderer.setAttribute(
          this.canonical,
          'href',
          elm.attrib.canonical,
        );
      } else {
        let href = origin + this.router.url;
        if (
          this.dS.origin === 'https://kompendia.net' &&
          this.router.url.includes('forming-handbuch')
        ) {
          href = href.replace('https://kompendia.net', 'https://4ming.de');
        }
        if (href !== this.dS.origin + '/') {
          this.renderer.setAttribute(this.canonical, 'href', href);
        }
      }
    });
    // this.dS.subject.locale.subscribe((locale) => {
    //   let href = origin + this.router.url;
    //   this.renderer.setAttribute(this.canonical, 'href', href);
    //   this.renderer.setAttribute(this.html, 'lang', locale);
    // });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let href = origin + this.router.url;
        this.renderer.setAttribute(this.canonical, 'href', href);
        this.renderer.setAttribute(this.html, 'lang', this.dS.locale);
      }
    });
  }
  @HostListener('document:keyup.escape', ['$event']) onKeydownHandler(
    event: KeyboardEvent,
  ) {
    this.vS.onlyMain = false;
    console.log(event);
  }

  handleClose = (button: MatButton) => {
    (<any>button)._focusMonitor.stopMonitoring(button._getHostElement());
  };

  ngOnInit() {
    // if (!this.vS.userAgentIsBot) {
    //   let delay = timer(3500).subscribe((t) => {
    //     if (!localStorage.getItem('isInfoAware')) {
    //       if (!this.dS.hasIdb) {
    //         const msg2 = {
    //           de: `Es wurde kein lokaler Browserspeicher erkannt. Vermutlich besuchen Sie uns mit einem Browser im Privat-Modus. Bitte erwägen Sie dies zu deaktivieren damit das Handbuch lokal gespeichert werden kann, und es bei Ihrem nächsten Besuch schneller erscheint.`,
    //           en: `No local browser storage was detected. You are probably visiting us with a browser in private mode. Please consider disabling this so the content can be saved locally to appear instantaneously on your next visit.`,
    //         };
    //         let str = msg2[this.dS.locale];
    //         const snackAware = this.snackbar.open(
    //           str,
    //           this.dS.system.txts.UNDERSTOOD,
    //           {
    //             duration: 120000,
    //             horizontalPosition: 'center',
    //             verticalPosition: 'bottom',
    //             panelClass: ['kd-snackbar'],
    //           },
    //         );
    //         snackAware.onAction().subscribe(() => {
    //           localStorage.setItem('isInfoAware', 'true');
    //           this.dS.interactiveIsAware = true;
    //         });
    //       }
    //     }
    //   });
    // }
  }

  ngOnDestroy() {
    if (this.swUpdateSubject) this.swUpdateSubject.unsubscribe();
    if (this.statusSubject) this.statusSubject.unsubscribe();
  }

  acceptCookies(value) {
    this.cookiesAccepted = value;
    localStorage.setItem('cookiesAccepted', 'true');
  }

  handleStatus(status) {
    console.log(status);
    if (status) {
    }
  }
  setCookies() {
    if (
      this.dS.origin === 'https://kompendia.net' ||
      this.dS.origin === 'http://192.168.178.30:4200' ||
      this.dS.origin === 'http://localhost:4200'
    ) {
      this.trackingCode = this.gaKompendia;
    } else {
      this.trackingCode = this.gaForming;
    }
    const body = document.getElementsByTagName('body')[0];
    const script = this.renderer.createElement('script') as HTMLScriptElement;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.trackingCode}`;
    script.async = true;
    this.renderer.appendChild(this.el.nativeElement, script);
    const script2 = this.renderer.createElement('script') as HTMLScriptElement;
    const scriptBody = this.renderer.createText(`
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        dataLayer.push(arguments);
      }
      gtag('js', new Date());
      gtag('config', '${this.trackingCode}');
    `);
    this.renderer.appendChild(script2, scriptBody);
    this.renderer.appendChild(this.el.nativeElement, script2);
    this.renderer.appendChild(body, script);
  }

  closeMenu(menu) {
    setTimeout(() => {
      menu.closeMenu();
    }, 250);
  }

  loadFile(files: FileList) {
    this.files = files;
    let reader = new FileReader();
    reader.onload = (e) => {
      let event: any = e;
      // this.dS.setStorage(JSON.parse(event.srcElement.result));
    };
    reader.readAsText(files[0]);
  }
  add() {}
  // reload() {
  //   if (this.swUpdate.isEnabled) {
  //     this.swUpdate
  //       .checkForUpdate()
  //       .then(() =>
  //         this.swUpdate.activateUpdate().then(() => window.location.reload()),
  //       );
  //   } else {
  //     window.location.reload();
  //   }
  // }
  next() {}
  back() {}

  setFavorite() {}
}
