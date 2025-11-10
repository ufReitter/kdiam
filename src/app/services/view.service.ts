import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Router } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { DeviceDetectorService } from 'ngx-device-detector';
import { BehaviorSubject, timer } from 'rxjs';
import { Elm } from '../engine/entity';

export type LineNumbersType =
  | 'on'
  | 'off'
  | 'relative'
  | 'interval'
  | ((lineNumber: number) => string);
export type WordWrapType = 'on' | 'off' | 'wordWrapColumn' | 'bounded';

@Injectable({
  providedIn: 'root',
})
export class ViewService {
  userAgentIsBot = false;
  userAgentIsPrerender = false;
  deviceInfo = null;
  isFullscreen = false;
  onlyMain = false;
  drawerSidenav: any = {};
  quillModules: any;
  quillToolbarContainers: any = {};
  quillOpen: boolean;
  editorLatexOptions = {
    theme: 'vs-dark-plus',
    language: 'latex',
    minimap: { enabled: false },
    automaticLayout: true,
    lineNumbersMinChars: 0,
    lineNumbers: 'off' as LineNumbersType,
    wordWrap: 'on' as WordWrapType,
  };
  editorTypescriptOptions = {
    theme: 'vs-dark-plus',
    language: 'typescript',
    // quickSuggestions: {
    //   other: true,
    //   comments: false,
    //   strings: false,
    // },
    // parameterHints: {
    //   enabled: false,
    // },
    // ordBasedSuggestions: false,
    // suggestOnTriggerCharacters: false,
    // acceptSuggestionOnEnter: 'off',
    // tabCompletion: 'off',
    // wordBasedSuggestions: false,
    minimap: { enabled: false },
    automaticLayout: true,
    lineNumbersMinChars: 3,
    lineNumbers: 'on' as LineNumbersType,
    wordWrap: 'on' as WordWrapType,
  };
  editRootElm: Elm;
  editRouteParams: any;
  drawerSidenavElm: any;
  drawerContentViewElm: any;
  drawerContentElm: any;
  norm = true;
  editorIsLoaded = false;
  inlineEditor = false;
  editorActive = false;
  header: boolean = true;
  footer: boolean = true;
  toolbarHeights = [0, 52, 92, 120];
  snavWidths = [290, 320];
  headerIndex = 2;
  snavWidthIndex = 1;
  routeVol = null;
  routeRight = null;

  editor: any = {};
  buttons: any = {
    activeEdit: [],
    volume: 'toc',
    right: '',
    debug: [],
  };

  size: any = {
    w: window.innerWidth,
    h: window.innerHeight,
    mainW: 818,
    mainH: 600,
    device: 'desktop',
    orientation: 'landscape',
    deviceSize: 4,
    headerIndex: 1,
    snavIndex: 2,
    paddingX: 50,
    paddingY: 50,
    header: 92,
    footer: 92,
    snav: 320,
    snavFooter: 300,
    articleMinHeight: 600,
    articlePadding: 25,
    footerMargin: '16px',
    centerFooter: true,
    centerFooterBig: true,
    users: true,
    feature: true,
    news: true,
    buttonsIn: false,
    logoZoom: 1.0,
    refHeight: 2.2,
    articleH: 0,
    editorH: 0,
  };
  sizeSub = new BehaviorSubject<any>({
    header: 92,
    footer: 92,
    snav: 320,
    articleMinHeight: 600,
    articlePadding: 25,
  });
  system: any;
  hasIdb: boolean;

  animated: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public router: Router,
    private snackbar: MatSnackBar,
    public clipboard: ClipboardService,

    private deviceService: DeviceDetectorService,
  ) {
    let crawlerAgentRegex =
      /bot|google|minds|facebook|aolbuild|baidu|bing|msn|duckduckgo|teoma|slurp|yandex/i;
    this.userAgentIsBot = crawlerAgentRegex.test(navigator.userAgent)
      ? true
      : false;

    let prerenderAgentRegex = /scully|prerender/i;
    this.userAgentIsPrerender = prerenderAgentRegex.test(navigator.userAgent)
      ? true
      : false;

    let locale;
    if (navigator.language && navigator.language.indexOf('-') > -1) {
      locale = navigator.language.split('-')[0];
    }

    this.deviceInfo = {
      browser: this.deviceService.getDeviceInfo().browser,
      os: this.deviceService.getDeviceInfo().os,
      isMobile: this.deviceService.isMobile(),
      isTablet: this.deviceService.isTablet(),
      isDesktopDevice: this.deviceService.isDesktop(),
      locale: locale,
    };

    this.initEditor();
    this.sizeSub.next(this.windowOnResize());

    window.onresize = (e) => {
      this.sizeSub.next(this.windowOnResize(this.headerIndex));
    };
    let delay = timer(5000).subscribe((t) => {});
  }
  initDrawerSidenav(ref) {
    ref.openedChange.subscribe((event) => {
      this.sizeSub.next(this.windowOnResize(this.headerIndex));
    });
  }

  copyFromContent(content: any) {
    this.clipboard.copyFromContent(content);
    this.snackbar.open(content, this.system.txts.COPIED, {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }
  async pasteFromContent() {
    const text = await navigator.clipboard.readText();
    return text;
  }

  windowOnResize(hi?) {
    const s = this.size;
    this.headerIndex = hi || 2;
    s.w = window.innerWidth;
    s.h = window.innerHeight;
    s.mainW = this.drawerContentViewElm?.offsetWidth || 818;
    s.mainH = this.drawerContentViewElm?.offsetHeight - 100 || 600;

    s.orientation = s.w / s.h < 1 ? 'portrait' : 'landscape';

    if (s.w > 1440) {
      s.device = 'desktop';
      s.deviceSize = 4;
      s.headerIndex = hi || 2;
      s.snavIndex = 1;
      s.paddingX = 50;
      s.paddingY = 20;
      s.footerMargin = '40px';
      s.centerFooterBig = true;
      s.feature = true;
      s.news = true;
    } else if (s.w > 1280) {
      s.device = 'laptop';
      s.deviceSize = 3;
      s.headerIndex = hi || 2;
      s.snavIndex = 0;
      s.paddingX = 25;
      s.paddingY = 16;
      s.footerMargin = '20px';
      s.centerFooterBig = true;
      s.feature = true;
      s.news = true;
    } else if (s.w > 1059) {
      s.device = 'laptop';
      s.deviceSize = 3;
      s.headerIndex = hi || 2;
      s.snavIndex = 0;
      s.paddingX = 25;
      s.paddingY = 16;
      s.footerMargin = '20px';
      s.centerFooterBig = true;
      s.feature = true;
      s.news = true;
    } else if (s.w > 1023 || (s.w <= 768 && s.orientation === 'portrait')) {
      s.device = 'tablet';
      s.deviceSize = 2;
      s.headerIndex = 1;
      s.snavIndex = 0;
      s.paddingX = 15;
      s.paddingY = 16;
      s.footerMargin = '20px';
      s.centerFooterBig = false;
      s.feature = true;
      s.news = true;
      s.users = true;
    } else if (s.w > 767) {
      s.device = 'tablet';
      s.deviceSize = 2;
      s.headerIndex = hi || 2;
      s.snavIndex = 0;
      s.paddingX = 15;
      s.paddingY = 16;
      s.footerMargin = '20px';
      s.centerFooterBig = true;
      s.feature = true;
      s.news = false;
      s.users = true;
    }
    if (s.w < 540) {
      s.device = 'cellphone';
      s.deviceSize = 1;
      s.headerIndex = 1;
      s.snavIndex = 0;
      s.paddingX = 15;
      s.paddingY = 16;
      s.footerMargin = '20px';
      s.centerFooterBig = true;
      s.feature = true;
      s.news = false;
      s.footer = 0;
      s.users = false;
    } else {
      s.footer = 92;
    }

    if (s.headerIndex < 2) {
      s.logoZoom = 0.6;
    } else {
      s.logoZoom = 1;
    }
    if (s.w < 1024) {
      s.feature = false;
      s.news = false;
    }

    if (
      this.deviceInfo.isMobile ||
      this.deviceInfo.isTablet ||
      s.h < 900 ||
      s.snavIndex === 0 ||
      window.location.origin !== 'https://4ming.de'
    ) {
      s.snavFooter = 42;
    } else {
      s.snavFooter = 300;
    }

    s.header = this.toolbarHeights[s.headerIndex];

    s.snav = this.snavWidths[s.snavIndex];
    s.articleMinHeight = s.h - s.header - s.footer - 50;
    s.volumeFooter = 42;
    s.articlePadding = 25;

    s.editorH = s.h - s.header - s.footer;

    return s;
  }

  fullscreenToggle(element?) {
    if (isPlatformBrowser(this.platformId)) {
      this.isFullscreen = !this.isFullscreen;
      if (this.isFullscreen) {
        this.enterFullscreen(element || document.documentElement);
      } else {
        this.exitFullscreen();
      }
    }
  }

  enterFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  }

  exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }

  initEditor() {
    let specialCharacters = [],
      counter,
      unicode;
    for (let index = 945; index < 945 + 25; index++) {
      specialCharacters.push(String.fromCharCode(index));
    }
    for (let index = 913; index < 913 + 25; index++) {
      if (index !== 930) specialCharacters.push(String.fromCharCode(index));
    }

    let specialChars = [
      'Α',
      'Β',
      'Γ',
      'Δ',
      'Ε',
      'Ζ',
      'Η',
      'Θ',
      'Ι',
      'Κ',
      'Λ',
      'Μ',
      'Ν',
      'Ξ',
      'Ο',
      'Π',
      'Ρ',
      'Σ',
      'Τ',
      'Υ',
      'ϒ',
      'Φ',
      'Χ',
      'Ψ',
      'Ω',
      ' ',
      ' ',
      'α',
      'β',
      'γ',
      'δ',
      'ε',
      'ζ',
      'η',
      'θ',
      'ϑ',
      'ι',
      'κ',
      'λ',
      'μ',
      'ν',
      'ξ',
      'ο',
      'π',
      'ϖ',
      'ρ',
      'ς',
      'σ',
      'τ',
      'υ',
      'φ',
      'χ',
      'ψ',
      'ω',
      'ϑ',
      'ϒ',
      'ϖ',
      '・',
      '…',
      '≤',
      '≥',
      ' ',
      ' ',
      '①',
      '②',
      '③',
      '④',
      '⑤',
      '⑥',
      '⑦',
      '⑧',
      '⑨',
      '⑩',
    ];

    this.quillToolbarContainers = {
      cpt: [
        [
          'kd-caption-a',
          'kd-caption-b',
          'bold',
          'italic',
          'underline',
          { script: 'sub' },
          { script: 'super' },
          { kompendia: 'variable' },
          { chars: specialChars },
          'clean',
        ],
      ],
      lbl: [
        [
          'kd-caption-a',
          'kd-caption-b',
          'bold',
          'italic',
          'underline',
          { script: 'sub' },
          { script: 'super' },
          { kompendia: 'variable' },
          { chars: specialChars },
          'clean',
        ],
      ],
      bdy: [
        [
          { header: [1, 2, 3, 4, 5, 6, false] },
          'bold',
          'italic',
          'underline',
          { script: 'sub' },
          { script: 'super' },
          { kompendia: 'variable' },
          { kompendia: 'nbsp' },
          // 'nbsp',
          { chars: specialChars },
          // { refs: this.refs },
          // { kompendia: "reference" },
          { align: [] },
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
          'image',
          'link',
        ],
      ],
      bdy2: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [
          'bold',
          'italic',
          'underline',
          { script: 'sub' },
          { script: 'super' },
          { kompendia: 'variable' },
          { chars: specialChars },
          // { refs: this.refs },
          // { kompendia: "reference" },
        ],
        [
          // 'kd-lines',
          { align: [] },
          { list: 'ordered' },
          { list: 'bullet' },
          { indent: '-1' },
          { indent: '+1' },
        ],
        ['image', 'link'],
      ],
    };
    this.quillModules = {
      clipboard: {
        matchVisual: false,
      },
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [
            'bold',
            'italic',
            'underline',
            'strike',
            { kompendia: 'variable' },
            { kompendia: 'reference' },
            { script: 'sub' },
            { script: 'super' },
            { align: [] },
          ],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          ['clean', 'link'],
        ],
        cardEditable: true,
        handlers: {
          image: function (value) {
            var range = this.quill.getSelection();
            var url = prompt('What is the image URL');
            if (url) {
              this.quill.insertEmbed(range.index, 'image', url, 'user');
            }
          },
          chars: function (value) {
            let selection = this.quill.getSelection();
            this.quill.insertText(selection.index, value);
          },
          kompendia: function (value) {
            let selection = this.quill.getSelection();

            if (selection.length > 0) {
              let lastChar = this.quill.getText(
                selection.index + selection.length - 1,
                1,
              );

              if (lastChar === ' ') {
                this.quill.setSelection(selection.index, selection.length - 1);
              }

              let format = this.quill.getFormat(selection).kompendia;

              if (format) {
                this.quill.removeFormat(selection);
              }

              if (value === 'variable') {
                this.quill.format('kompendia', value, 'user');
                return;
              }

              if (value === 'nbsp') {
                // let text = this.quill.getText(
                //   selection.index,
                //   selection.length,
                // );
                let text =
                  '<span class="kd-variable">s<sub>0</sub></span> = 0,7…1,5';
                this.quill.insertEmbed(selection.index || 0, 'nbsp', text);
                return;
              }

              if (value === 'lineheight') {
                this.quill.format('kompendia', value, 'user');
                return;
              }

              if (value === 'reference') {
                let selText = this.quill.getText(
                  selection.index,
                  selection.length,
                );

                let exists = this.quill.options.dS.findOne({
                  seNo: selText,
                });

                if (!isNaN(selText) && exists) {
                  this.quill.format('kompendia', value, 'user');
                }

                if (isNaN(selText)) {
                  this.quill.setSelection(
                    selection.index + selection.length,
                    0,
                  );
                  selection = this.quill.getSelection();
                }
              }
            }
            if (selection.length === 0) {
              let insert;
              if (value === 'reference') insert = '1';
              if (value === 'variable') insert = 'A';
              this.quill.insertText(selection.index, insert);
              let before = this.quill.getText(selection.index - 1, 1);
              let after = this.quill.getText(selection.index + 1, 1);
              if (before !== ' ' && after !== ' ') {
                this.quill.insertText(selection.index, ' ');
                this.quill.insertText(selection.index + 2, ' ');
                this.quill.setSelection(selection.index + 1, 1);
              } else {
                if (before !== ' ') {
                  this.quill.insertText(selection.index, ' ');
                  this.quill.setSelection(selection.index + 1, 1);
                }
                if (after !== ' ') {
                  this.quill.insertText(selection.index + 1, ' ');
                  this.quill.setSelection(selection.index, 1);
                }
              }
              this.quill.format('kompendia', value, 'user');
            }

            selection = this.quill.getSelection();
            this.quill.setSelection(selection.index + selection.length + 1, 0);
          },
          characters: function (value) {
            if (value) {
              const cursorPosition = this.quill.getSelection().index;
              this.quill.insertText(cursorPosition, value);
              this.quill.setSelection(cursorPosition + value.length);
            }
          },
          references: function (value) {
            this.selection = this.quill.getSelection();
            if (value === '_neu') {
              this.openElementDialog({ model: 'Reference', id: 'new' });
            }
            if (value && value !== '_neu') {
              this.insertReference(value);
            }
          }.bind(this),
        },
      },
    };
  }
}
