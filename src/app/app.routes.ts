import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LayoutComponent } from './layout/layout.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'pages/home', component: HomeComponent },
      // you can add other child routes like:
      // { path: 'products', component: ProductsComponent },
      // { path: 'orders', component: OrdersComponent }
    ],
  },

  // catch-all route (optional)
  { path: '**', redirectTo: 'login' }
];
