import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActividadEconomicaListComponent } from './actividad-economica-list.component';

describe('ActividadEconomicaListComponent', () => {
  let component: ActividadEconomicaListComponent;
  let fixture: ComponentFixture<ActividadEconomicaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActividadEconomicaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActividadEconomicaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
