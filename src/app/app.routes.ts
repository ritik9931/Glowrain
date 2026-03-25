import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [

  // ── Outside layout ───────────────────────────────────────
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.component').then(m => m.RegisterComponent)
  },

  // ── Inside layout ────────────────────────────────────────
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'pages/home', pathMatch: 'full' },

      // ── Admin only ───────────────────────────────────────
      {
        path: 'dashboard',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'pages/add-product',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./pages/add-product/add-product.component').then(m => m.AddProductComponent)
      },

      // ── Logged in users only ─────────────────────────────
      {
        path: 'checkout',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
      },
      {
        path: 'order-confirmation',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent)
      },
      {
        path: 'my-orders',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/my-orders/my-orders.component').then(m => m.MyOrdersComponent)
      },

      // ── Public (anyone) ──────────────────────────────────
      {
        path: 'pages/home',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'product/:id',
        loadComponent: () =>
          import('./pages/product-details/product-details.component').then(m => m.ProductDetailsComponent)
      },
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart.component').then(m => m.CartComponent)
      },
    ]
  },

  { path: '**', redirectTo: 'pages/home' }
];