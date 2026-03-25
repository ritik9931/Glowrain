import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { RouterLink } from '@angular/router';

const BASE_URL = 'http://localhost:5000';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {

  cartItems: any[] = [];

  constructor(private cartService: CartService) {}

  ngOnInit() {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items.map(item => ({
        ...item,
        // Build image URL if not already a full URL
        image: item.image
          ? item.image
          : item.img1
            ? `${BASE_URL}/${item.img1}`
            : 'assets/images/placeholder.png'
      }));
    });
  }

  increase(item: any) {
    this.cartService.addToCart(item);
  }

  decrease(item: any) {
    this.cartService.decreaseQty(item.id);
  }

  remove(id: number) {
    this.cartService.removeItem(id);
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  getItemCount(): number {
    return this.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  }

  getSavings(): number {
    // placeholder — extend later if you add original price
    return 0;
  }
}