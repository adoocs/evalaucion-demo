import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiempoCreateComponent } from './tiempo-create.component';

describe('TiempoCreateComponent', () => {
  let component: TiempoCreateComponent;
  let fixture: ComponentFixture<TiempoCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiempoCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiempoCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
