import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { PasswordModule } from 'primeng/password';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    AvatarModule,
    ButtonModule,
    InputTextModule,
    PanelModule,
    PasswordModule,
    TextareaModule,
    
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {

}
