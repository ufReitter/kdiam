import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetNotificationsComponent } from './set-notifications.component';

describe('SetNotificationsComponent', () => {
  let component: SetNotificationsComponent;
  let fixture: ComponentFixture<SetNotificationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetNotificationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
