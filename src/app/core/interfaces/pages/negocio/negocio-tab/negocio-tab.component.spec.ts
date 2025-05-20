import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NegocioTabComponent } from './negocio-tab.component';

describe('NegocioTabComponent', () => {
  let component: NegocioTabComponent;
  let fixture: ComponentFixture<NegocioTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NegocioTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NegocioTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
