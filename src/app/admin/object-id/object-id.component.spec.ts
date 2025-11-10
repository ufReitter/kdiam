import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectIdComponent } from './object-id.component';

describe('ObjectIdComponent', () => {
  let component: ObjectIdComponent;
  let fixture: ComponentFixture<ObjectIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ObjectIdComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
