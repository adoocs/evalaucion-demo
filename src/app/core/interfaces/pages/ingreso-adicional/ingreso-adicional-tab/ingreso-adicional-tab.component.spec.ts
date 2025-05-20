import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresoAdicionalTabComponent } from './ingreso-adicional-tab.component';

describe('IngresoAdicionalTabComponent', () => {
  let component: IngresoAdicionalTabComponent;
  let fixture: ComponentFixture<IngresoAdicionalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresoAdicionalTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IngresoAdicionalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
