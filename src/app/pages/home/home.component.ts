import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

const BASE_URL = 'http://localhost:5000';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  bestSellers: any[] = [];

  // Live map of productId → quantity so the template knows what to show
  cartMap: { [id: number]: number } = {};

  constructor(private http: HttpClient, private cartService: CartService) {}

  ngOnInit() {
    this.loadLatestProducts();

    // Rebuild cartMap every time cart changes
    this.cartService.cart$.subscribe(items => {
      this.cartMap = {};
      items.forEach(item => this.cartMap[item.id] = item.quantity);
    });
  }

  loadLatestProducts() {
    this.http.get<any[]>(`${BASE_URL}/api/products/getAllProducts`)
      .subscribe(res => {
        const sorted = res.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        this.bestSellers = sorted.slice(0, 20).map(p => ({
          ...p,
          image: p.img1 ? `${BASE_URL}/${p.img1}` : 'assets/images/placeholder.png'
        }));
      });
  }

  getQty(productId: number): number {
    return this.cartMap[productId] || 0;
  }

  add(product: any) {
    this.cartService.addToCart(product);
  }

  decrease(product: any) {
    this.cartService.decreaseQty(product.id);
  }

  categories = [
    { name: 'Men\'s Fashion',   image: 'assets/images/categories/men.png' },
    { name: 'Women\'s Fashion', image: 'assets/images/categories/women.jpg' },
    { name: 'Electronics',      image: 'assets/images/categories/electronics.jpg' },
    { name: 'Home Decor',       image: 'assets/images/categories/home.jpg' },
    { name: 'Beauty & Care',    image: 'assets/images/categories/beauty.jpg' },
    { name: 'Accessories',      image: 'assets/images/categories/accessories.jpg' },
  ];

  reviews = [
    { name: 'Amit Verma',   text: 'Amazing quality and fast delivery!' },
    { name: 'Sneha Sharma', text: 'Love the designs. Will shop again!' },
    { name: 'Rohan Das',    text: 'Great prices and friendly support!' },
  ];
}