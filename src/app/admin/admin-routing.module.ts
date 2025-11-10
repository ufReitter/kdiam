import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from '../services/auth.service';

import { UsersComponent } from './users/users.component';
import { DeployComponent } from './deploy/deploy.component';
import { StatsComponent } from './stats/stats.component';
import { LogsComponent } from './logs/logs.component';
import { AdminResolver } from '../resolver/admin.resolver';
import { AdminComponent } from './admin/admin.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    resolve: {
      admin: AdminResolver,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'deploy',
    component: DeployComponent,
    resolve: {
      admin: AdminResolver,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    component: UsersComponent,
    resolve: {
      admin: AdminResolver,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'stats',
    component: StatsComponent,
    resolve: {
      admin: AdminResolver,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'logs',
    component: LogsComponent,
    resolve: {
      admin: AdminResolver,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'user/:id',
    component: UsersComponent,
    resolve: {
      admin: AdminResolver,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'backup/:id',
    component: UsersComponent,
    resolve: {
      admin: AdminResolver,
    },
    canActivate: [AuthGuard],
  },
  {
    path: 'synchronize/:id',
    component: UsersComponent,
    resolve: {
      admin: AdminResolver,
    },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
