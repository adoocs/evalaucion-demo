import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DenominacionListComponent } from './denominacion-list.component';

describe('DenominacionListComponent', () => {
  let component: DenominacionListComponent;
  let fixture: ComponentFixture<DenominacionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DenominacionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DenominacionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
