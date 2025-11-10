import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ObjectIdComponent } from './admin/object-id/object-id.component';
import { MaterialModule } from './material.module';

@NgModule({
  imports: [CommonModule, MaterialModule],
  declarations: [ObjectIdComponent],
  exports: [ObjectIdComponent],
})
export class SharedLazyModule {}
