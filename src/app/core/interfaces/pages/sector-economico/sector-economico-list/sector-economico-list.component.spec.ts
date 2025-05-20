import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectorEconomicoListComponent } from './sector-economico-list.component';

describe('SectorEconomicoListComponent', () => {
  let component: SectorEconomicoListComponent;
  let fixture: ComponentFixture<SectorEconomicoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectorEconomicoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SectorEconomicoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
