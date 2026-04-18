import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualAcuityComponent } from './visual-acuity.component';

describe('VisualAcuityComponent', () => {
  let component: VisualAcuityComponent;
  let fixture: ComponentFixture<VisualAcuityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisualAcuityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisualAcuityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
