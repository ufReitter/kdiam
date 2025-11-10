import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import { LOCALE_ID, NgModule } from '@angular/core';
import { MAT_LEGACY_DIALOG_DEFAULT_OPTIONS as MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/legacy-dialog';
import { ThemeStorage } from '../shared/theme-picker/theme-storage/theme-storage';
import { AuthGuard } from './auth.service';
import { DataService } from './data.service';
import { DexieService } from './dexie.service';
import { StyleManager } from './style-manager';

registerLocaleData(localeDe);

@NgModule({
  providers: [
    { provide: LOCALE_ID, useValue: 'de' },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } },
    StyleManager,
    ThemeStorage,
    DexieService,
    DataService,
    AuthGuard,
  ],
})
export class CoreModule {}
