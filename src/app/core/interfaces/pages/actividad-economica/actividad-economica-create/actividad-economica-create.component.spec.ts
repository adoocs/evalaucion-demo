import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActividadEconomicaCreateComponent } from './actividad-economica-create.component';

describe('ActividadEconomicaCreateComponent', () => {
  let component: ActividadEconomicaCreateComponent;
  let fixture: ComponentFixture<ActividadEconomicaCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActividadEconomicaCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActividadEconomicaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
