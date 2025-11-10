import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import Dexie from 'dexie';
import { BehaviorSubject, timer } from 'rxjs';
import ObjectID from '../core/bson-objectid';
import { Preferences, Project } from '../engine/entity';
import { DexieService } from './dexie.service';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  jwtHelper = new JwtHelperService();
  isBrowser: boolean;
  isServer: boolean;
  profile: {
    _id: any;
    nickname: string;
    roles: any[];
    role: {
      none: boolean;
      user: boolean;
      editor: boolean;
      testeditor: boolean;
      manager: boolean;
      admin: boolean;
      superuser: boolean;
    };
  };

  profileSub = new BehaviorSubject<any>(null);
  prefSub = new BehaviorSubject<any>(null);
  projSub = new BehaviorSubject<any>(null);
  pref: Preferences;
  prefTable: any;
  projTable: any;
  prefs = [];
  projects = [];
  projectsUser = [];
  snavOpened = false;
  loaded = false;
  prefLoaded = false;

  routeSegments: string[] = [];
  origin: string;

  hasIdb = true;

  system: any;
  selectedProject: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    public http: HttpClient,
    public router: Router,
    public dexieService: DexieService,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
      this.hasIdb = true;
    }
    if (isPlatformServer(this.platformId)) {
      this.isServer = true;
      this.hasIdb = false;
    }

    this.origin = window.location.origin;

    let token = '';

    if (this.isBrowser) {
      token = localStorage.getItem('token');
      this.snavOpened = JSON.parse(localStorage.getItem('snavOpened'));
    }
    if (window.innerWidth < 768) {
      this.snavOpened = false;
    } else {
      if (!localStorage.getItem('snavOpened')) {
        this.snavOpened = true;
      }
    }

    this.profile = this.getProfile(token);

    if (this.isServer) {
      this.pref = new Preferences({ snavOpened: true });
    } else {
      this.pref = new Preferences({ _id: '303030303030303030303030' });
      this.pref.snavOpened = this.snavOpened;
    }
    this.init();
  }

  async init() {
    this.prefTable = this.dexieService.table('prefs');
    this.projTable = this.dexieService.table('projects');
    const test = await this.prefTable
      .get({ _id: '303030303030303030303030' })
      .catch(Dexie.InvalidStateError, (e) => {
        this.hasIdb = false;
        this.prefTable = null;
        this.projTable = null;
      })
      .catch(Dexie.DatabaseClosedError, (e) => {
        this.hasIdb = false;
      });
    if (this.hasIdb) {
      await this.prefTable
        .each((def) => {
          const pref = new Preferences(def, this.prefTable);
          pref.snavOpened = this.snavOpened;
          this.prefs[pref._id.str] = pref;
        })
        .catch(Dexie.InvalidStateError, (e) => {
          this.hasIdb = false;
        });
      await this.projTable
        .each((def) => {
          this.projects.push(new Project(def, this.projTable));
        })
        .catch(Dexie.InvalidStateError, (e) => {
          this.hasIdb = false;
        });
    } else {
    }

    this.selectedProject = this.projects[0] || null;
    this.pref = this.prefs[this.profile._id.str] || this.pref;

    const url = window.location.href;
    const routeSegments = url.replace('/', '').split('(')[0].split('/');
    if (routeSegments.length < 4) {
      // this.router.navigate(this.pref.routeSegments);
    }

    // this.router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     const url = this.router.url;

    //     this.routeSegments = url.replace('/', '').split('(')[0].split('/');
    //     this.pref.save({ routeSegments: this.routeSegments });

    //     if(this.profile.role.editor) {
    //       localStorage.setItem(
    //         'lastRoute',
    //         this.router.url,
    //       );
    //     }
    //   }
    // });

    this.profileSub.subscribe(async (profile) => {
      let pref = this.prefs[profile._id.str];
      if (pref) {
        this.pref = pref;
      } else {
        this.pref = new Preferences({ _id: profile._id.str }, this.prefTable);

        if (window.innerWidth < 768) {
          this.pref.snavOpened = false;
        }

        if (this.hasIdb) {
          this.prefTable
            .put(this.pref.def)
            .catch(Dexie.InvalidStateError, (e) => {
              this.hasIdb = false;
            });
        }
      }

      this.prefSub.next(this.pref);
      this.prefLoaded = true;

      this.loaded = true;

      this.projectsUser = this.projects.filter(
        (elem) => elem.user_id.str === profile._id.str,
      );

      if (!this.projectsUser.length) {
        let project = new Project(
          {
            user_id: profile._id.str,
            design: 'Project',
          },
          this.projTable,
        );
        let number = 0;
        for (const iterator of this.projects) {
          if (project.design === iterator.design) {
            project.design = project.design + number++;
          }
        }
        this.projects.push(project);
        this.projectsUser.push(project);
        if (this.hasIdb) {
          // let def = await this.projTable.put(project.def);
        }
      }

      this.projectsUser = this.projects.filter(
        (elm) => elm.user_id.str === profile._id.str,
      );

      this.projSub.next(this.projectsUser[0]);
      if (
        profile.role.editor &&
        this.loaded &&
        !this.routeSegments.includes('admin')
      ) {
        let delay = timer(1000).subscribe((t) => {
          // this.syncxxx();
        });
      }
    });
  }

  addProject() {
    let design = this.system.txts.NEW_PROJECT;
    let test = design;
    let suffix = 0;
    let exists = true;
    while (exists) {
      let found = this.projects.find((pr) => pr.design === test);
      if (found) {
        suffix = ++suffix;
        test = design + '-' + suffix;
        exists = true;
      } else {
        exists = false;
        design = test;
      }
    }
    let project = new Project(
      {
        user_id: this.profile._id.str,
        design: design,
      },
      this.projTable,
    );
    this.projects.push(project);
    this.projectsUser.push(project);
    if (this.hasIdb) {
      this.projTable.put(project.def);
    }
  }

  getProfile(token?) {
    let profile = {
      _id: new ObjectID('303030303030303030303030'),
      nickname: 'default',
      roles: [],
      role: {
        none: true,
        user: false,
        editor: false,
        testeditor: false,
        manager: false,
        admin: false,
        superuser: false,
      },
    };
    let loggedIn = false;
    if (this.isBrowser && token) {
      loggedIn = !this.jwtHelper.isTokenExpired(token);
    }
    if (token && loggedIn) {
      let decoded = this.jwtHelper.decodeToken(token);
      profile._id = new ObjectID(decoded._id);
      profile.nickname = decoded.nickname;
      profile.roles = decoded.roles;
      for (let i = 0; i < profile.roles.length; i++) {
        if (profile.roles[i] === 'user') {
          profile.role.superuser = false;
          profile.role.admin = false;
          profile.role.manager = false;
          profile.role.editor = false;
          profile.role.user = true;
        } else if (profile.roles[i] === 'editor') {
          profile.role.superuser = false;
          profile.role.admin = false;
          profile.role.manager = false;
          profile.role.editor = true;
          profile.role.user = true;
        } else if (profile.roles[i] === 'manager') {
          profile.role.superuser = false;
          profile.role.admin = false;
          profile.role.manager = true;
          profile.role.editor = true;
          profile.role.user = true;
        } else if (profile.roles[i] === 'admin') {
          profile.role.superuser = false;
          profile.role.admin = true;
          profile.role.manager = true;
          profile.role.editor = true;
          profile.role.user = true;
        } else if (profile.roles[i] === 'superuser') {
          profile.role.superuser = true;
          profile.role.admin = true;
          profile.role.manager = true;
          profile.role.editor = true;
          profile.role.user = true;
        }

        profile.role.none = true;
      }
    }

    this.profileSub.next(profile);

    return profile;
  }
  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
    }
    this.loggedIn();
  }

  loggedIn() {
    let loggedIn = false;
    if (this.isBrowser && localStorage.getItem('token')) {
      const token = localStorage.getItem('token');
      loggedIn = !this.jwtHelper.isTokenExpired(token);
    }
    if (!loggedIn) this.profile = this.getProfile();
    return loggedIn;
  }
}
