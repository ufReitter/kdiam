import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElmLegacyComponent } from './elm-legacy.component';

describe('ElmLegacyComponent', () => {
  let component: ElmLegacyComponent;
  let fixture: ComponentFixture<ElmLegacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElmLegacyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ElmLegacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
