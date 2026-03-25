import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  categories = [
    { name: 'Men’s Fashion', image: 'assets/images/categories/men.png' },
    { name: 'Women’s Fashion', image: 'assets/images/categories/women.jpg' },
    { name: 'Electronics', image: 'assets/images/categories/electronics.jpg' },
    { name: 'Home Decor', image: 'assets/images/categories/home.jpg' },
    { name: 'Beauty & Care', image: 'assets/images/categories/beauty.jpg' },
    { name: 'Accessories', image: 'assets/images/categories/accessories.jpg' },
  ];

  bestSellers = [
    { name: 'Smart Watch', price: 2499, image: 'assets/images/products/watch.png' },
    { name: 'Wireless Earbuds', price: 1799, image: 'assets/images/products/earbuds.png' },
    { name: 'Men’s Jacket', price: 2199, image: 'assets/images/products/jacket.png' },
    { name: 'Women’s Handbag', price: 1599, image: 'assets/images/products/handbag.png' },
  ];

  reviews = [
    { name: 'Amit Verma', text: 'Amazing quality and fast delivery!' },
    { name: 'Sneha Sharma', text: 'Love the designs. Will shop again!' },
    { name: 'Rohan Das', text: 'Great prices and friendly support!' },
  ];
}
