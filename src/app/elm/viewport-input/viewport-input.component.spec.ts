import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewportInputComponent } from './viewport-input.component';

describe('ViewportInputComponent', () => {
  let component: ViewportInputComponent;
  let fixture: ComponentFixture<ViewportInputComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewportInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewportInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
