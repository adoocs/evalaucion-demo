import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoViviendaListComponent } from './tipo-vivienda-list.component';

describe('TipoViviendaListComponent', () => {
  let component: TipoViviendaListComponent;
  let fixture: ComponentFixture<TipoViviendaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoViviendaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoViviendaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
