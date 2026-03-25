import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';

const BASE_URL = 'http://localhost:5000';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.css'
})
export class MyOrdersComponent implements OnInit {

  // Phone lookup
  phone       = '';
  phoneInput  = '';
  searched    = false;
  loading     = false;

  orders: any[]  = [];
  expanded: number | null = null;  // which order is expanded

  ngOnInit() {
    // Auto-load if phone saved from last order
    const lastOrder = localStorage.getItem('lastOrder');
    if (lastOrder) {
      const parsed = JSON.parse(lastOrder);
      const savedPhone = parsed?.address?.phone;
      if (savedPhone) {
        this.phoneInput = savedPhone;
        this.searchOrders();
      }
    }
  }

  constructor(private http: HttpClient) {}

  searchOrders() {
    const clean = this.phoneInput.trim().replace(/\D/g, '');
    if (clean.length !== 10) return;

    this.phone   = clean;
    this.loading = true;
    this.searched = false;

    this.http.get<any[]>(`${BASE_URL}/api/orders/byPhone/${clean}`)
      .subscribe({
        next: (res) => {
          this.orders   = res;
          this.loading  = false;
          this.searched = true;
          // Auto-expand the latest order
          if (res.length > 0) this.expanded = res[0].id;
        },
        error: () => {
          this.orders   = [];
          this.loading  = false;
          this.searched = true;
        }
      });
  }

  toggleExpand(orderId: number) {
    this.expanded = this.expanded === orderId ? null : orderId;
  }

  orderNumber(id: number): string {
    return `ORD${String(id).padStart(8, '0')}`;
  }

  getStatusStep(status: string): number {
    return ['pending','confirmed','shipped','delivered'].indexOf(status);
  }

  isCancelled(status: string): boolean {
    return status === 'cancelled';
  }

  getStatusClass(status: string): string {
    return {
      pending:   'st-pending',
      confirmed: 'st-confirmed',
      shipped:   'st-shipped',
      delivered: 'st-delivered',
      cancelled: 'st-cancelled',
    }[status] || 'st-pending';
  }
}