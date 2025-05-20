import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditoAnteriorTabComponent } from './credito-anterior-tab.component';

describe('CreditoAnteriorTabComponent', () => {
  let component: CreditoAnteriorTabComponent;
  let fixture: ComponentFixture<CreditoAnteriorTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditoAnteriorTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditoAnteriorTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
