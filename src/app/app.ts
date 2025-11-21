import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AppVersion } from './shared/app-version/app-version';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MaterialModule } from './material.module';
import { ContentManager } from './shared/content-manager';
import { CookiePopup } from './shared/cookie-popup/cookie-popup';
import { AppLogo } from './shared/logo/logo';
import { ThemePicker } from './shared/theme-picker';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    AppVersion,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FormsModule,
    ThemePicker,
    MaterialModule,
    CookiePopup,
    AppLogo,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  showFiller = false;
  showDebug = false;
  protected readonly title = signal('kdiam');
  logoName: string;
  constructor(public cM: ContentManager) {}

  ngOnInit() {
    switch (this.cM.hostname) {
      case 'localhost':
        this.logoName = '4Ming';
        break;
      case 'kompendia.net':
        this.logoName = 'kompendiam';
        break;
      case '4ming.de':
        this.logoName = '4Ming';
        break;
      default:
        this.logoName = 'kompendiam';
        break;
    }
  }
}
