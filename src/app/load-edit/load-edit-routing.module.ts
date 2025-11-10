import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoadComponent } from '../redit/load/load.component';

const routes: Routes = [
  {
    path: '',
    component: LoadComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoadEditRoutingModule {}
