import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ScrollItemComponent } from './scroll-item.component';

describe('ScrollItemComponent', () => {
  let component: ScrollItemComponent;
  let fixture: ComponentFixture<ScrollItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ScrollItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
