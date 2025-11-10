import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DbstatusComponent } from './dbstatus.component';

describe('DbstatusComponent', () => {
  let component: DbstatusComponent;
  let fixture: ComponentFixture<DbstatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DbstatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DbstatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
