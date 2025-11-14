import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditsMenuComponent } from './edits-menu.component';

describe('EditsMenuComponent', () => {
  let component: EditsMenuComponent;
  let fixture: ComponentFixture<EditsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditsMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
