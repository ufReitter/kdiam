/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { Component, Input } from '@angular/core';

@Component({
  selector: 'kd-logo',
  standalone: true,
  styleUrl: 'logo.scss',
  templateUrl: './logo.html',
})
export class AppLogo {
  @Input() name: string = 'kompendia';
}
