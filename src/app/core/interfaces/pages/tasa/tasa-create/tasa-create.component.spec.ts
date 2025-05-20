import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasaCreateComponent } from './tasa-create.component';

describe('TasaCreateComponent', () => {
  let component: TasaCreateComponent;
  let fixture: ComponentFixture<TasaCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasaCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
