import { Injectable, EventEmitter } from '@angular/core';

export interface SiteTheme {
  name: string;
  accent: string;
  primary: string;
  isDark?: boolean;
  isDefault?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ThemeStorage {
  static storageKey = 'kompendia-theme-storage-current-name';

  onThemeUpdate: EventEmitter<SiteTheme> = new EventEmitter<SiteTheme>();

  storeTheme(theme: SiteTheme) {
    try {
      window.localStorage[ThemeStorage.storageKey] = theme.name;
    } catch {}
    this.onThemeUpdate.emit(theme);
  }

  getStoredThemeName(): string | null {
    try {
      let theme = window.localStorage[ThemeStorage.storageKey];
      if (theme !== 'kia-dark-theme' || theme !== 'kia-light-theme') {
        theme = 'kia-dark-theme';
      }
      return theme;
    } catch {
      return null;
    }
  }

  clearStorage() {
    try {
      window.localStorage.removeItem(ThemeStorage.storageKey);
    } catch {}
  }
}
