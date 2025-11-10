import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArticleComponent } from './elm/article/article.component';
import { ElmLegacyComponent } from './elm/elm-legacy/elm-legacy.component';
import { ElmComponent } from './elm/elm/elm.component';
import { HomepageComponent } from './elm/homepage/homepage.component';
import { NodeResolver } from './resolver/node.resolver';
import { AuthGuard } from './services/auth.service';
import { AuthenticateComponent } from './shared/authenticate/authenticate.component';

const routes: Routes = [
  {
    path: 'authenticate',
    component: AuthenticateComponent,
  },
  {
    path: 'load-edit',
    loadChildren: () =>
      import('./load-edit/load-edit.module').then((m) => m.LoadEditModule),
    outlet: 'load',
  },
  {
    path: 'vedit',
    loadChildren: () =>
      import('./vedit/vedit.module').then((m) => m.VeditModule),
    outlet: 'volume',
    canActivate: [AuthGuard],
  },
  {
    path: 'redit',
    loadChildren: () =>
      import('./redit/redit.module').then((m) => m.ReditModule),
    outlet: 'right',
    canActivate: [AuthGuard],
  },
  {
    path: ':locale/:volumeId/5e0cc2826d1fe51c8f0dae04',
    component: ElmLegacyComponent,
  },
  {
    path: ':locale/:volumeId/leichtbau-durch-sicken-fachbuch',
    component: ElmLegacyComponent,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale/authenticate',
    component: AuthenticateComponent,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale/users/:userId/:projectId',
    component: ElmComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':locale/users/:userId',
    component: ElmComponent,
    canActivate: [AuthGuard],
  },
  {
    path: ':locale/admin',
    loadChildren: () =>
      import('./admin/admin.module').then((m) => m.AdminModule),
    resolve: {
      node: NodeResolver,
    },
    canActivate: [AuthGuard],
  },
  {
    path: ':locale/:slug1/:slug2/:slug3/:slug4',
    component: ArticleComponent,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale/:slug1/:slug2/:slug3',
    component: ArticleComponent,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale/:slug1/:slug2',
    component: ArticleComponent,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale/:slug1',
    component: ArticleComponent,
    resolve: {
      node: NodeResolver,
    },
  },
  {
    path: ':locale',
    component: HomepageComponent,
    resolve: {
      node: NodeResolver,
    },
    data: {},
  },
  {
    path: '',
    component: HomepageComponent,
    resolve: {
      node: NodeResolver,
    },
    data: {},
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
      enableTracing: false,
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule {}
