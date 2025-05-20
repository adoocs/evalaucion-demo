import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { AccountComponent } from './account.component';

export default [
    { path: '', 
      component: AccountComponent,
      children: [
        { path: '', component: ProfileComponent },
      ]
    },
] as Routes;
