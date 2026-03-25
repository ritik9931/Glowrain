import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  cartCount = 0;

  constructor(private cartService: CartService) {}

  ngOnInit() {
    // cart$ emits the full array — we just need the total quantity
    this.cartService.cart$.subscribe(items => {
      this.cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    });
  }
}