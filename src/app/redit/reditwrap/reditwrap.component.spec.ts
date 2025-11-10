import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReditwrapComponent } from './reditwrap.component';

describe('ReditwrapComponent', () => {
  let component: ReditwrapComponent;
  let fixture: ComponentFixture<ReditwrapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReditwrapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReditwrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
