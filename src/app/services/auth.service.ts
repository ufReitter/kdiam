import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class AuthGuard  {
  route: ActivatedRouteSnapshot;
  jwtHelper = new JwtHelperService();
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
  ) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let loggedIn = false;
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem('token') || '';
      loggedIn = !this.jwtHelper.isTokenExpired(token);
    }
    if (!loggedIn) {
      const routeSegments = state.url.replace('/', '').split('(')[0].split('/');
      let lang = routeSegments[0] || 'de';
      if (lang !== 'de' && lang !== 'en') {
        lang = 'de';
      }

      this.router.navigate([lang, 'authenticate']);
    }
    return loggedIn;
  }
}
