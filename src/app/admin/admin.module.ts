import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ElmModule } from '../elm/elm.module';
import { MaterialModule } from '../material.module';
import { SharedLazyModule } from '../shared-lazy.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin/admin.component';
import { DatabaseComponent } from './database/database.component';
import { DeployComponent } from './deploy/deploy.component';
import { LogsComponent } from './logs/logs.component';
import { AbsPipe } from './pipes/abs.pipe';
import { IsYoungerPipe } from './pipes/isyounger.pipe';
import { LastConnectedPipe } from './pipes/lastconnected.pipe';
import { MidEllipsisPipe } from './pipes/mid-ellipsis';
import { SettingComponent } from './setting/setting.component';
import { StatsComponent } from './stats/stats.component';
import { UsersChartComponent } from './users-chart/users-chart.component';
import { UsersComponent } from './users/users.component';
import { SetNotificationsComponent } from './set-notifications/set-notifications.component';

@NgModule({
  declarations: [
    AbsPipe,
    IsYoungerPipe,
    MidEllipsisPipe,
    LastConnectedPipe,
    UsersComponent,
    DeployComponent,
    StatsComponent,
    LogsComponent,
    AdminComponent,
    DatabaseComponent,
    UsersChartComponent,
    SettingComponent,
    SetNotificationsComponent,
  ],
  imports: [
    SharedLazyModule,
    ElmModule,
    CommonModule,
    FormsModule,
    MaterialModule,
    AdminRoutingModule,
  ],
})
export class AdminModule {}
