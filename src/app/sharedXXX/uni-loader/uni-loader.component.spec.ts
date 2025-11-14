import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniLoaderComponent } from './uni-loader.component';

describe('UniLoaderComponent', () => {
  let component: UniLoaderComponent;
  let fixture: ComponentFixture<UniLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UniLoaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UniLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
