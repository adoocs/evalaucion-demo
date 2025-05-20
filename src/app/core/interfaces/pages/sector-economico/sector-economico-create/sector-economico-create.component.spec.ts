import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorEconomicoCreateComponent } from './sector-economico-create.component';

describe('SectorEconomicoCreateComponent', () => {
  let component: SectorEconomicoCreateComponent;
  let fixture: ComponentFixture<SectorEconomicoCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorEconomicoCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorEconomicoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
