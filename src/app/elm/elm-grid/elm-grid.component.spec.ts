import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElmGridComponent } from './elm-grid.component';

describe('ElmGridComponent', () => {
  let component: ElmGridComponent;
  let fixture: ComponentFixture<ElmGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ElmGridComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ElmGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
