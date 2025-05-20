import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AportanteListComponent } from './aportante-list.component';

describe('AportanteListComponent', () => {
  let component: AportanteListComponent;
  let fixture: ComponentFixture<AportanteListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AportanteListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AportanteListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
