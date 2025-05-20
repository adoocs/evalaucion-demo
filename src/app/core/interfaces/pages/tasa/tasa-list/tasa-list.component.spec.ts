import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TasaListComponent } from './tasa-list.component';

describe('TasaListComponent', () => {
  let component: TasaListComponent;
  let fixture: ComponentFixture<TasaListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TasaListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TasaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
