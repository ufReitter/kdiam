import { Component, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { NavigationEnd, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { ViewService } from '../services/view.service';

@Component({
  selector: 'dialog-cookie-warning',
  styleUrls: ['cookie-warning-dialog.component.css'],
  templateUrl: 'cookie-warning-dialog.component.html',
})
export class CookieWarningDialogComponent {
  introMenu =
    'Interaktive Berechnungswerkzeuge für Ihre Methodenplanung Blechumformung.';
  introNoMenu =
    'Interaktive Berechnungswerkzeuge für Ihre Methodenplanung Blechumformung. Das Inhaltsverzeichnis öffnet mit dem Button in der linken oberen Bildschirm-Ecke.';
  introNoMenuFachbuch =
    'Bitte beachten Sie auch unsere neuen interaktiven Berechnungswerkzeuge für Ihre Methodenplanung Blechumformung. Das Inhaltsverzeichnis öffnet mit dem Button in der linken oberen Bildschirm-Ecke.';
  introFachbuch =
    'Bitte beachten Sie auch unsere neuen interaktiven Berechnungswerkzeuge für Ihre Methodenplanung Blechumformung im Hauptmenü links.';
  cookies =
    'Wir verwenden Google Analytics Cookies für eine Zugriffsstatistik zu unserem Internet Angebot. Wir bitten Sie das mit "OK In Ordnung" zu akzeptieren.';
  noMenu: boolean;
  fachbuch: boolean;
  constructor(
    public vS: ViewService,
    public dS: DataService,
    public router: Router,
    public dialogRef: MatDialogRef<CookieWarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: boolean,
  ) {
    dialogRef.disableClose = true;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (this.vS.size.w < 960) {
          this.noMenu = true;
        }
        if (this.dS.routeSegments.includes('leichtbau-durch-sicken-fachbuch')) {
          this.fachbuch = true;
        }
      }
    });
  }

  dismiss() {
    this.dialogRef.close({ data: false });
  }
  accept() {
    this.dialogRef.close({ data: true });
  }
}
