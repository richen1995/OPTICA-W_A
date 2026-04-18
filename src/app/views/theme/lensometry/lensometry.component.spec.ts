import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LensometryComponent } from './lensometry.component';

describe('LensometryComponent', () => {
  let component: LensometryComponent;
  let fixture: ComponentFixture<LensometryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LensometryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LensometryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
