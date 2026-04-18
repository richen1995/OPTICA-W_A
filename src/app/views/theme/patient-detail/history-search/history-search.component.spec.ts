import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorySearchComponent } from './history-search.component';

describe('HistorySearchComponent', () => {
  let component: HistorySearchComponent;
  let fixture: ComponentFixture<HistorySearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorySearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorySearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
