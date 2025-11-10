import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NumerationComponent } from './numeration.component';

describe('NumerationComponent', () => {
  let component: NumerationComponent;
  let fixture: ComponentFixture<NumerationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NumerationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumerationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
