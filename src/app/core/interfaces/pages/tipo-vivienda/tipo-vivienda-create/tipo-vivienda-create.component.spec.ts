import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoViviendaCreateComponent } from './tipo-vivienda-create.component';

describe('TipoViviendaCreateComponent', () => {
  let component: TipoViviendaCreateComponent;
  let fixture: ComponentFixture<TipoViviendaCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoViviendaCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoViviendaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
