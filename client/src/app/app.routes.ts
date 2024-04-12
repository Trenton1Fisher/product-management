import { Routes } from '@angular/router';
import { Login } from './views/login/login.component';
import { Register } from './views/register/register.component';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
];
