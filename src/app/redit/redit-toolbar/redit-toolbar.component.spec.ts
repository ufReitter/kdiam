import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReditToolbarComponent } from './redit-toolbar.component';

describe('ReditToolbarComponent', () => {
  let component: ReditToolbarComponent;
  let fixture: ComponentFixture<ReditToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReditToolbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReditToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
