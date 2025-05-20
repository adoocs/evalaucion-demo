import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodoListComponent } from './periodo-list.component';

describe('PeriodoListComponent', () => {
  let component: PeriodoListComponent;
  let fixture: ComponentFixture<PeriodoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
