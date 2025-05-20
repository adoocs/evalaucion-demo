import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GastoFinancieroTabComponent } from './gasto-financiero-tab.component';

describe('GastoFinancieroTabComponent', () => {
  let component: GastoFinancieroTabComponent;
  let fixture: ComponentFixture<GastoFinancieroTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GastoFinancieroTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GastoFinancieroTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
