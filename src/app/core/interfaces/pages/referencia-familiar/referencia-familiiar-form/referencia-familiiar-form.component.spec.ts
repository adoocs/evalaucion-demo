import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenciaFamiliiarFormComponent } from './referencia-familiiar-form.component';

describe('ReferenciaFamiliiarFormComponent', () => {
  let component: ReferenciaFamiliiarFormComponent;
  let fixture: ComponentFixture<ReferenciaFamiliiarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferenciaFamiliiarFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferenciaFamiliiarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
