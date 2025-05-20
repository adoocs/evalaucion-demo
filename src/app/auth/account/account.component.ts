import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [
    ToastModule,
    ToolbarModule,
    ButtonModule,
    PanelModule,
    DividerModule,
    RouterOutlet
  ],
  template: `
  <p-toolbar styleClass="mb-6">
    <ng-template #center>
      <p-button label="Cuenta" [rounded]="true" severity="secondary" />
      <p-button label="Privacidad" [rounded]="true" severity="secondary" />
      <p-button label="Secondary" [rounded]="true" severity="secondary" />
      <p-button label="Secondary" [rounded]="true" severity="secondary" />
    </ng-template>
  </p-toolbar>
  <router-outlet></router-outlet>
`,
  providers: [MessageService],
})
export class AccountComponent {

}
