import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ElmComponent } from './elm.component';

describe('ElmComponent', () => {
  let component: ElmComponent;
  let fixture: ComponentFixture<ElmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ElmComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
