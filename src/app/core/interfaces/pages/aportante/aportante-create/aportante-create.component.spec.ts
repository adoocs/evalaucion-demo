import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AportanteCreateComponent } from './aportante-create.component';

describe('AportanteCreateComponent', () => {
  let component: AportanteCreateComponent;
  let fixture: ComponentFixture<AportanteCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AportanteCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AportanteCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
