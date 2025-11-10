import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SnapshotsMenuComponent } from './snapshots-menu.component';

describe('SnapshotsMenuComponent', () => {
  let component: SnapshotsMenuComponent;
  let fixture: ComponentFixture<SnapshotsMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SnapshotsMenuComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SnapshotsMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
