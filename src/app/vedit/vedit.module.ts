import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';

import { ElmModule } from '../elm/elm.module';
// import { TreeEditComponent } from '../redit/tree-edit/tree-edit.component';
import { SharedModule } from '../shared.module';
import { TocComponent } from './toc/toc.component';
import { VeditRoutingModule } from './vedit-routing.module';

@NgModule({
  declarations: [TocComponent],
  imports: [
    FormsModule,
    SharedModule,
    ElmModule,
    MaterialModule,
    VeditRoutingModule,
  ],
})
export class VeditModule {}
