import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoadComponent } from './load/load.component';
import { ReditResolver } from './redit.resolver';
import { ReditwrapComponent } from './reditwrap/reditwrap.component';

const routes: Routes = [
  {
    path: 'inline',
    component: LoadComponent,
  },
  {
    path: ':component/:id',
    component: ReditwrapComponent,
    resolve: {
      elm: ReditResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReditRoutingModule {}
