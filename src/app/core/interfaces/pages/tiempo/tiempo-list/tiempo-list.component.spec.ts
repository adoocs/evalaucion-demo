import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiempoListComponent } from './tiempo-list.component';

describe('TiempoListComponent', () => {
  let component: TiempoListComponent;
  let fixture: ComponentFixture<TiempoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TiempoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiempoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
