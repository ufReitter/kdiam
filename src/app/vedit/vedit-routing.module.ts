import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TreeEditComponent } from '../redit/tree-edit/tree-edit.component';

const routes: Routes = [
  {
    path: '',
    component: TreeEditComponent,
  },
  {
    path: 'edit',
    component: TreeEditComponent,
    // resolve: {
    //   elm: ElmResolver,
    // },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VeditRoutingModule {}
