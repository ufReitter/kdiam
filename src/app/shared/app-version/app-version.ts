import { Component } from '@angular/core';
const { version: appVersion } = require('../../../package.json');

@Component({
  selector: 'kd-app-version',
  templateUrl: './app-version.html',
  styleUrl: './app-version.scss',
})
export class AppVersion {
  public appVersion;

  constructor() {
    this.appVersion = appVersion;
  }
}
