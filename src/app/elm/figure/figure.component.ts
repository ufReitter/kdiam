import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ProfileService } from 'src/app/services/profile.service';
import { ViewService } from 'src/app/services/view.service';
import { Elm, ElmNode } from '../../engine/entity';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'kd-figure',
  standalone: false,
  templateUrl: './figure.component.html',
  styleUrls: ['./figure.component.scss'],
})
export class FigureComponent implements OnInit, OnDestroy {
  progress: any;
  width: number;
  height: number;
  audio: any;
  numeration: string;
  index: number;
  figure: any;
  cachebust = '';
  scrapeUrl = '';
  scrapeFilename = '';
  isFullscreen = false;
  viewElementSubject: Subscription;
  viewImageSubject: Subscription;
  fullW: any;
  fullH: any;
  size = 3;

  @Input() node: ElmNode;
  @Input() elm: Elm;
  @Input() parent: Elm;
  @Input() set: any;
  @Input() grid: any;
  @Input() view: string;
  @Input() viewDepth: number;

  @ViewChild('viewPort') viewPort;

  constructor(
    private cd: ChangeDetectorRef,
    private snackbar: MatSnackBar,
    public vS: ViewService,
    public pS: ProfileService,
    public dS: DataService,
  ) {}

  async ngOnInit() {
    // console.log(this.parent);
    this.elm = this.node.elm;
    if (!this.set) {
      this.set = this.node.set;
    }
    if (this.set?.figure) {
      this.figure = this.set.figure;
    } else {
      this.figure = this.elm.figure;
    }
    if (this.elm.figure.ext === 'tex' && !this.elm.figure.render) {
      this.dS.getEqu(this.elm);
    }
    if (this.elm.figure.canvas) {
      this.width = 500;
      this.height = Math.round(this.width * 0.5624);
    }

    this.dS.isHandsetPortrait$.subscribe((data) => {
      if (data && !this.grid) {
        const orig = this.figure.size || this.elm.figure.size;
        if (orig > 3) {
          this.size = 3;
        } else {
          this.size = orig;
        }
      } else {
        this.size = this.figure.size || this.elm.figure.size;
      }
    });

    if (this.elm.figure.ext === 'jpg' || this.elm.figure.ext === 'png') {
      if (!this.elm.figure.ratio) {
        this.elm.figure.ratio = 1;
        if (this.elm.figure.width && this.elm.figure.height) {
          this.elm.figure.ratio =
            this.elm.figure.width / this.elm.figure.height;
        }
      }
      if (!this.elm.figure.image) {
        await this.dS.getImageHex(this.elm);
        this.cd.detectChanges();
      }
    }

    if (this.elm.figure.ext === 'flac') {
      this.scrapeUrl =
        'https://audio.radioparadise.com/audio/m4a/320/' +
        this.elm.datarow.rpId +
        '.m4a';
      this.scrapeFilename = this.elm._eid.str + '.m4a';
    }
  }

  copyLatex(e) {
    const value = this.elm.equ.tex;
    this.vS.copyFromContent(value);
  }

  setisFullscreen(full) {
    if (!this.set.attrib.noFullScreen) {
      this.isFullscreen = full;
      this.pS.pref.view.full = full;

      this.fullH = 1000;
      this.fullW = (this.fullH / this.figure.height) * this.figure.width;

      this.fullH = 800;
      this.fullW = 800;
    }
  }
  toggleFullScreen() {
    this.isFullscreen = !this.isFullscreen;
    this.vS.isFullscreen = this.isFullscreen;
    this.vS.onlyMain = this.isFullscreen;

    // if (this.isFullscreen) {
    //   if (screenfull.isEnabled) {
    //     screenfull.request();
    //   }
    // } else {
    //   if (screenfull.isEnabled) {
    //     screenfull.exit();
    //   }
    // }
  }

  ngOnDestroy() {
    if (this.viewElementSubject) this.viewElementSubject.unsubscribe();
    if (this.viewImageSubject) this.viewImageSubject.unsubscribe();
  }
}
