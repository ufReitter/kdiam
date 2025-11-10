import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RbdyComponent } from './rbdy.component';

describe('RbdyComponent', () => {
  let component: RbdyComponent;
  let fixture: ComponentFixture<RbdyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RbdyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RbdyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
