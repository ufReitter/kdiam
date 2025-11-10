import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FuncComponent } from './func.component';

describe('FuncComponent', () => {
  let component: FuncComponent;
  let fixture: ComponentFixture<FuncComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FuncComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FuncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
