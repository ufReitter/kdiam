import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VolumeFooterComponent } from './volume-footer.component';

describe('VolumeFooterComponent', () => {
  let component: VolumeFooterComponent;
  let fixture: ComponentFixture<VolumeFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VolumeFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VolumeFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
