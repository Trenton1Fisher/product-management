import { Routes } from '@angular/router';
import { Login } from './views/login/login.component';
import { Register } from './views/register/register.component';
import { Dashboard } from './views/dashboard/dashboard.component';
import { LandingPage } from './views/landingPage/landingPage.component';

export const routes: Routes = [
  { path: '', component: LandingPage },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
];
