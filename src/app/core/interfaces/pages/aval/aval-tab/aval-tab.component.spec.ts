import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvalTabComponent } from './aval-tab.component';

describe('AvalTabComponent', () => {
  let component: AvalTabComponent;
  let fixture: ComponentFixture<AvalTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvalTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AvalTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
