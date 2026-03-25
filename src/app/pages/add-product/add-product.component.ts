import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, FormsModule
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

const BASE_API = 'http://localhost:5000/api/products';
const BASE_URL = 'http://localhost:5000';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [RouterModule, CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css'
})
export class AddProductComponent implements OnInit {

  productForm!: FormGroup;
  previewImgs: string[] = [];
  loading = false;
  selectedFiles: File[] = [];

  products: any[] = [];
  filtered: any[] = [];
  searchText = '';
  page = 1;
  pageSize = 10;

  // Toaster state
  toast = { show: false, message: '', type: 'success' };
  private toastTimer: any;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.productForm = this.fb.group({
      name:        ['', Validators.required],
      description: ['', Validators.required],
      price:       ['', Validators.required],
      stock:       ['', Validators.required],
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3000);
  }

  onFileChange(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFiles[index - 1] = file;
    const reader = new FileReader();
    reader.onload = () => { this.previewImgs[index - 1] = reader.result as string; };
    reader.readAsDataURL(file);
  }

  submitProduct() {
    if (this.productForm.invalid) {
      this.showToast('Please fill all required fields', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name',        this.productForm.value.name);
    formData.append('description', this.productForm.value.description);
    formData.append('price',       this.productForm.value.price);
    formData.append('stock',       this.productForm.value.stock);
    this.selectedFiles.forEach(file => { if (file) formData.append('images', file); });

    this.loading = true;

    this.http.post(`${BASE_API}/createProduct`, formData).subscribe({
      next: () => {
        this.showToast('✅ Product added successfully!');
        this.productForm.reset();
        this.previewImgs   = [];
        this.selectedFiles = [];
        this.loading = false;
        this.loadProducts();
      },
      error: () => {
        this.showToast('❌ Error while saving product', 'error');
        this.loading = false;
      }
    });
  }

  loadProducts() {
    this.http.get<any[]>(`${BASE_API}/getAllProducts`).subscribe(res => {
      this.products = res;
      this.filtered  = res;
    });
  }

  imageUrl(path: string): string {
    return `${BASE_URL}/${path}`;
  }

  searchProducts() {
    const q = this.searchText.toLowerCase();
    this.filtered = this.products.filter(x =>
      x.name.toLowerCase().includes(q) ||
      x.description?.toLowerCase().includes(q)
    );
    this.page = 1;
  }

  get paginatedProducts() {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered.slice(start, start + this.pageSize);
  }

  previewImage(imgPath: string) {
    window.open(this.imageUrl(imgPath), '_blank');
  }

  deleteProduct(productId: number) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    this.http.delete(`${BASE_API}/deleteProduct/${productId}`).subscribe({
      next: () => {
        this.showToast('🗑 Product deleted successfully');
        this.loadProducts();
      },
      error: () => this.showToast('❌ Failed to delete product', 'error')
    });
  }
}