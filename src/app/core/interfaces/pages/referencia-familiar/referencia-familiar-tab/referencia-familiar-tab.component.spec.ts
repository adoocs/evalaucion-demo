import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenciaFamiliarTabComponent } from './referencia-familiar-tab.component';

describe('ReferenciaFamiliarTabComponent', () => {
  let component: ReferenciaFamiliarTabComponent;
  let fixture: ComponentFixture<ReferenciaFamiliarTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferenciaFamiliarTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferenciaFamiliarTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
