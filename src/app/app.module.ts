import { registerLocaleData } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import localeDe from '@angular/common/locales/de';
import localeEnGb from '@angular/common/locales/en-GB';
import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { JwtModule } from '@auth0/angular-jwt';
// import { TransferHttpCacheModule } from '@nguniversal/common';
import { ScullyLibModule } from '@scullyio/ng-lib';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ErrorInterceptor } from './auth/auth.interceptor';
import { CookieWarningDialogComponent } from './dialog/cookie-warning-dialog.component';
import { LoadJsonDialogComponent } from './dialog/load-json-dialog.component';
import { ElmModule } from './elm/elm.module';
import { RbdyComponent } from './elm/rbdy/rbdy.component';
import { WidgetComponent } from './elm/widget/widget.component';
import { MaterialModule } from './material.module';
import { CoreModule } from './services/core.module';
import { GlobalErrorHandler } from './services/error-handler';
import { SharedModule } from './shared.module';
import { AuthenticateComponent } from './shared/authenticate/authenticate.component';
import { BrandingComponent } from './shared/branding/branding.component';
import { ChangelogComponent } from './shared/changelog/changelog.component';
import { DebugComponent } from './shared/debug/debug.component';
import { ElementTitleComponent } from './shared/element-title/element-title.component';
import { FavoritesComponent } from './shared/favorites/favorites.component';
import { FeatureComponent } from './shared/feature/feature.component';
import { I18nComponent } from './shared/i18n/i18n.component';
import { JobsComponent } from './shared/jobs/jobs.component';
import { LangPickerComponent } from './shared/lang-picker/lang-picker.component';
import { LogoComponent } from './shared/logo/logo.component';
import { MainNavComponent } from './shared/main-nav/main-nav.component';
import { MainToolsComponent } from './shared/main-tools/main-tools.component';
import { MainComponent } from './shared/main/main.component';
import { NewsComponent } from './shared/news/news/news.component';
import { NotificationsComponent } from './shared/notifications/notifications.component';
import { ProjectPickerComponent } from './shared/project-picker/project-picker.component';
import { SearchComponent } from './shared/search/search.component';
import { ThemePickerModule } from './shared/theme-picker/theme-picker';
import { UniLoaderComponent } from './shared/uni-loader/uni-loader.component';
import { UserPickerComponent } from './shared/user-picker/user-picker.component';
import { VolumeContentComponent } from './shared/volume-content/volume-content.component';
import { VolumeFooterComponent } from './shared/volume-footer/volume-footer.component';
import { VolumePickerComponent } from './shared/volume-picker/volume-picker.component';
import { UserComponent } from './user/user.component';

import { QuillModule } from 'ngx-quill';
import { agoPipe } from './pipes/ago.pipe';
import { EditToolsComponent } from './shared/edit-tools/edit-tools.component';
import { EditsMenuComponent } from './shared/edits-menu/edits-menu.component';

registerLocaleData(localeDe, 'de');
registerLocaleData(localeEnGb, 'en');

export function tokenGetter() {
  let token = null;
  if (typeof localStorage !== 'undefined') {
    token = localStorage.getItem('token');
  } else {
    token = '';
  }

  return token;
}

export function jwtOptionsFactory(platformId) {
  return {
    // headerName: 'authorization',
    tokenGetter: (platformId) => {
      let token = null;
      // if (isPlatformBrowser(platformId)) {
      //   token = localStorage.getItem('token');
      // }
      // if (isPlatformServer(platformId)) {
      //   token =
      //     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1Zjg4YjgyZjhlMGUyOTA0ZGM2ZGI5ZjEiLCJuaWNrbmFtZSI6Im1hY2hpbmVVc2VyIiwicm9sZXMiOlsidXNlciJdLCJlbWFpbCI6Im1hY2hpbmVVc2VyQDRtaW5nLmRlIiwiaWF0IjoxNjAyNzk2OTQ0LCJleHAiOjQ3NTg1NTY5NDR9.6zHPeERGhcuztOoXi2_PVDdghVcxWPEUB1ftMNHSJ0c';
      // }
      return token;
    },
    allowedDomains: [
      'localhost:3100',
      'localhost:4000',
      'localhost:4200',
      '192.168.178.30:4200',
      'kompendia.net',
      '4ming.de',
    ],
    disallowedRoutes: ['localhost:3001/axxxuth/'],
  };
}

@NgModule({
  declarations: [
    agoPipe,
    DebugComponent,
    CookieWarningDialogComponent,
    AppComponent,
    LoadJsonDialogComponent,
    MainComponent,
    I18nComponent,
    UserComponent,
    UserPickerComponent,
    SearchComponent,
    LogoComponent,
    ElementTitleComponent,
    ProjectPickerComponent,
    VolumeContentComponent,
    VolumePickerComponent,
    JobsComponent,
    AuthenticateComponent,
    RbdyComponent,
    LangPickerComponent,
    WidgetComponent,
    FeatureComponent,
    UniLoaderComponent,
    BrandingComponent,
    NewsComponent,
    MainToolsComponent,
    MainNavComponent,
    VolumeFooterComponent,
    ChangelogComponent,
    FavoritesComponent,
    NotificationsComponent,
    EditToolsComponent,
    EditsMenuComponent,
  ],
  imports: [
    SharedModule,
    ReactiveFormsModule,
    MaterialModule,
    MatDialogModule,
    RouterModule,
    CoreModule,
    ElmModule,
    BrowserModule.withServerTransition({ appId: 'kompendia' }),
    // TransferHttpCacheModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    ThemePickerModule,
    LoggerModule.forRoot({
      serverLoggingUrl: '/api/logs/clientconsole',
      level: NgxLoggerLevel.DEBUG,
      serverLogLevel: NgxLoggerLevel.ERROR,
    }),
    FormsModule,
    QuillModule.forRoot({
      suppressGlobalRegisterWarning: true,
    }),
    JwtModule.forRoot({
      config: {
        headerName: 'authorization',
        tokenGetter: tokenGetter,
        allowedDomains: [
          'localhost:3100',
          'localhost:4000',
          'localhost:4200',
          '192.168.178.30:4200',
          'kompendia.net',
          '4ming.de',
        ],
        disallowedRoutes: ['localhost:3001/axxxuth/'],
      },
    }),
    ServiceWorkerModule.register('/ngsw-worker.js', {
      enabled: environment.production,
    }),
    // ScullyLibModule,
    ScullyLibModule.forRoot({
      useTransferState: true,
      alwaysMonitor: false,
      manualIdle: true,
    }),
  ],
  providers: [
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    { provide: LOCALE_ID, useValue: 'de' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
