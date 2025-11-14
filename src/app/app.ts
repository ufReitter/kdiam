import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppVersion } from './shared/app-version/app-version';

import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';

import { MatSidenavModule } from '@angular/material/sidenav';
import { ContentManager } from './shared/content-manager';
import { ThemePicker } from './shared/theme-picker';
import { VolumeContent } from './shared/volume-content/volume-content';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    AppVersion,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FormsModule,
    MatSidenavModule,
    ThemePicker,
    VolumeContent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  showFiller = false;
  protected readonly title = signal('kdiam');
  constructor(public cM: ContentManager) {}
}
