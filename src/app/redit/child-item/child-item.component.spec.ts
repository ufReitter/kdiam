import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ChildItemComponent } from './child-item.component';

describe('EditItemComponent', () => {
  let component: ChildItemComponent;
  let fixture: ComponentFixture<ChildItemComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ChildItemComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
