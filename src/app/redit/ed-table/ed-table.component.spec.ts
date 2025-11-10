import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdTableComponent } from './ed-table.component';

describe('EdTableComponent', () => {
  let component: EdTableComponent;
  let fixture: ComponentFixture<EdTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EdTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
