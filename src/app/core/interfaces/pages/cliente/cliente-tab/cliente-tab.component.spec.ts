import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClienteTabComponent } from './cliente-tab.component';

describe('ClienteTabComponent', () => {
  let component: ClienteTabComponent;
  let fixture: ComponentFixture<ClienteTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClienteTabComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClienteTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
