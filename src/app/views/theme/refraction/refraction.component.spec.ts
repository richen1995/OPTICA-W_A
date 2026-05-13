import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefractionComponent } from './refraction.component';

describe('RefractionComponent', () => {
  let component: RefractionComponent;
  let fixture: ComponentFixture<RefractionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefractionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RefractionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
