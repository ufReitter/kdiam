import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VolumeViewComponent } from './volume-view.component';

describe('VolumeViewComponent', () => {
  let component: VolumeViewComponent;
  let fixture: ComponentFixture<VolumeViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VolumeViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
