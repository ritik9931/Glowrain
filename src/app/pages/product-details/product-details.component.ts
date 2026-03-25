import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CartService } from '../../services/cart.service';

const BASE_URL = 'http://localhost:5000';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {

  productId: any;
  product: any = null;
  loading = true;
  error = false;

  // Image gallery
  images: string[] = [];
  selectedImg = 0;

  // Cart
  quantity = 1;
  cartMap: { [id: number]: number } = {};
  addedToCart = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    this.loadProduct();

    this.cartService.cart$.subscribe(items => {
      this.cartMap = {};
      items.forEach(item => this.cartMap[item.id] = item.quantity);
    });
  }

  loadProduct() {
    this.http.get<any[]>(`${BASE_URL}/api/products/getAllProducts`)
      .subscribe({
        next: (products) => {
          this.product = products.find(p => p.id == this.productId);
          if (this.product) {
            // Build image array from img1..img4
            this.images = [
              this.product.img1,
              this.product.img2,
              this.product.img3,
              this.product.img4,
            ]
            .filter(Boolean)
            .map(path => `${BASE_URL}/${path}`);
          }
          this.loading = false;
        },
        error: () => {
          this.error = true;
          this.loading = false;
        }
      });
  }

  selectImg(index: number) {
    this.selectedImg = index;
  }

  increaseQty() {
    if (this.quantity < (this.product?.stock || 99)) this.quantity++;
  }

  decreaseQty() {
    if (this.quantity > 1) this.quantity--;
  }

  getCartQty(): number {
    return this.cartMap[this.productId] || 0;
  }

  addToCart() {
    for (let i = 0; i < this.quantity; i++) {
      this.cartService.addToCart(this.product);
    }
    this.addedToCart = true;
    setTimeout(() => this.addedToCart = false, 2500);
  }

  get inStock(): boolean {
    return this.product?.stock > 0;
  }
}