import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit {

  isSidebarOpen = false;
  isSearchOpen  = false;
  currentYear   = new Date().getFullYear();

  cartCount  = 0;
  isLoggedIn = false;
  userName   = '';
  isAdmin    = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Cart count
    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((t, i) => t + i.quantity, 0);
    });

    // Auth state — reactive, updates on login/logout
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.userName   = user?.name || '';
      this.isAdmin    = user?.is_admin === 'YES';
    });
  }

  toggleSidebar() { this.isSidebarOpen = !this.isSidebarOpen; }
  closeSidebar()  { this.isSidebarOpen = false; }
  toggleSearch()  { this.isSearchOpen  = !this.isSearchOpen; }

  logout() {
    this.authService.logout(); // clears localStorage + navigates to /login
  }
}