import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ProjectPickerComponent } from './project-picker.component';

describe('ProjectPickerComponent', () => {
  let component: ProjectPickerComponent;
  let fixture: ComponentFixture<ProjectPickerComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectPickerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
