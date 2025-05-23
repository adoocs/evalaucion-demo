import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodoCreateComponent } from './periodo-create.component';

describe('PeriodoCreateComponent', () => {
  let component: PeriodoCreateComponent;
  let fixture: ComponentFixture<PeriodoCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodoCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeriodoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
