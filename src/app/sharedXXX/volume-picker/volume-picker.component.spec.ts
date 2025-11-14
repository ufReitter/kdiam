import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VolumePickerComponent } from './volume-picker.component';

describe('VolumePickerComponent', () => {
  let component: VolumePickerComponent;
  let fixture: ComponentFixture<VolumePickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VolumePickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
