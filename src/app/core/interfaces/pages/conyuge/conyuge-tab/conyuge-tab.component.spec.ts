import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConyugeTabComponent } from './conyuge-tab.component';

describe('ConyugeTabComponent', () => {
  let component: ConyugeTabComponent;
  let fixture: ComponentFixture<ConyugeTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConyugeTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConyugeTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
