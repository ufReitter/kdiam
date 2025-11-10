import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DatarowsComponent } from './datarows.component';

describe('DatarowsComponent', () => {
  let component: DatarowsComponent;
  let fixture: ComponentFixture<DatarowsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DatarowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatarowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
