import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from 'src/app/material.module';
import { ContentManager } from 'src/app/shared/content-manager/content-manager';

@Component({
  selector: 'kd-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCheckboxModule,
    FormsModule,
    MaterialModule,
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class Admin implements AfterViewInit {
  palim: boolean = false;
  bust: number;
  constructor(public cM: ContentManager) {}

  ngAfterViewInit() {
    this.cM.selElm = null;
    this.cM.viewElementSubject.next(null);
  }

  onTabChange(e) {}

  onTabChangeDone() {}
  reload() {
    this.bust = Math.random();
  }
  onPalimChange($event) {}
}
