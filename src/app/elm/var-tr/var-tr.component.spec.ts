import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VarTrComponent } from './var-tr.component';

describe('VarTrComponent', () => {
  let component: VarTrComponent;
  let fixture: ComponentFixture<VarTrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VarTrComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VarTrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
