import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TargetWrapperComponent } from './target-wrapper.component';

describe('TargetWrapperComponent', () => {
  let component: TargetWrapperComponent;
  let fixture: ComponentFixture<TargetWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TargetWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TargetWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
