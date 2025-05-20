import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenominacionCreateComponent } from './denominacion-create.component';

describe('DenominacionCreateComponent', () => {
  let component: DenominacionCreateComponent;
  let fixture: ComponentFixture<DenominacionCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DenominacionCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DenominacionCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
