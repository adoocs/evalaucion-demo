import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuntajeSentinelTabComponent } from './puntaje-sentinel-tab.component';

describe('PuntajeSentinelTabComponent', () => {
  let component: PuntajeSentinelTabComponent;
  let fixture: ComponentFixture<PuntajeSentinelTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PuntajeSentinelTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuntajeSentinelTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
