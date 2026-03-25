import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartData } from 'chart.js';

const BASE_URL = 'http://localhost:5000';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterLink, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  loading = true;

  // ── Stats ─────────────────────────────────────────────────
  totalOrders    = 0;
  totalRevenue   = 0;
  totalProducts  = 0;
  pendingOrders  = 0;

  // ── Orders table ──────────────────────────────────────────
  allOrders:    any[] = [];
  recentOrders: any[] = [];

  // ── Status update ─────────────────────────────────────────
  updatingId: number | null = null;
  toast = { show: false, message: '', type: 'success' };
  private toastTimer: any;

  readonly STATUS_OPTIONS = ['pending','confirmed','shipped','delivered','cancelled'];

  // ── Chart ─────────────────────────────────────────────────
  salesChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Revenue (₹)',
      backgroundColor: 'rgba(40,116,240,0.75)',
      borderColor: '#2874f0',
      borderRadius: 6,
      borderWidth: 0,
    }]
  };

  salesChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ₹${Number(ctx.raw).toLocaleString('en-IN')}`
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: 'DM Sans' } } },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          font: { family: 'DM Sans' },
          callback: (v) => '₹' + Number(v).toLocaleString('en-IN')
        }
      }
    }
  };

  // Order status donut chart
  statusChartData: ChartData<'doughnut'> = {
    labels: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    datasets: [{
      data: [0, 0, 0, 0, 0],
      backgroundColor: ['#f59e0b','#3b82f6','#8b5cf6','#10b981','#ef4444'],
      borderWidth: 0,
      hoverOffset: 6
    }]
  };

  statusChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { family: 'DM Sans', size: 12 }, padding: 16, boxWidth: 10 }
      }
    }
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading = true;

    // Load orders + products in parallel
    Promise.all([
      this.http.get<any[]>(`${BASE_URL}/api/orders/getAllOrders`).toPromise(),
      this.http.get<any[]>(`${BASE_URL}/api/products/getAllProducts`).toPromise()
    ]).then(([orders, products]) => {

      this.allOrders   = orders || [];
      this.recentOrders = this.allOrders.slice(0, 8);
      this.totalProducts = (products || []).length;

      // ── Compute stats ──────────────────────────────────────
      this.totalOrders   = this.allOrders.length;
      this.totalRevenue  = this.allOrders.reduce((s, o) => s + Number(o.total), 0);
      this.pendingOrders = this.allOrders.filter(o => o.status === 'pending').length;

      // ── Status counts for donut ────────────────────────────
      const counts = [0, 0, 0, 0, 0]; // pending, confirmed, shipped, delivered, cancelled
      this.allOrders.forEach(o => {
        const idx = ['pending','confirmed','shipped','delivered','cancelled'].indexOf(o.status);
        if (idx >= 0) counts[idx]++;
      });
      this.statusChartData = {
        ...this.statusChartData,
        datasets: [{ ...this.statusChartData.datasets[0], data: counts }]
      };

      // ── Revenue by month (last 6 months) ───────────────────
      this.buildRevenueChart(this.allOrders);

      this.loading = false;

    }).catch(() => {
      this.loading = false;
    });
  }

  buildRevenueChart(orders: any[]) {
    const monthMap: { [key: string]: number } = {};
    const now = new Date();

    // Build last 6 month keys
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      monthMap[key] = 0;
    }

    orders.forEach(o => {
      const d = new Date(o.placed_at);
      const key = d.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      if (key in monthMap) monthMap[key] += Number(o.total);
    });

    this.salesChartData = {
      labels: Object.keys(monthMap),
      datasets: [{
        data: Object.values(monthMap),
        label: 'Revenue (₹)',
        backgroundColor: 'rgba(40,116,240,0.75)',
        borderColor: '#2874f0',
        borderRadius: 6,
        borderWidth: 0,
      }]
    };
  }

  // ── Update order status inline ─────────────────────────────
  updateStatus(order: any, newStatus: string) {
    this.updatingId = order.id;

    this.http.patch(`${BASE_URL}/api/orders/${order.id}/status`, { status: newStatus })
      .subscribe({
        next: () => {
          order.status = newStatus;
          this.updatingId = null;
          this.pendingOrders = this.allOrders.filter(o => o.status === 'pending').length;
          this.showToast(`Order #${order.id} marked as ${newStatus}`);
        },
        error: () => {
          this.updatingId = null;
          this.showToast('Failed to update status', 'error');
        }
      });
  }

  showToast(message: string, type: 'success' | 'error' = 'success') {
    clearTimeout(this.toastTimer);
    this.toast = { show: true, message, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, 3000);
  }

  getStatusClass(status: string): string {
    return {
      pending:   'badge-pending',
      confirmed: 'badge-confirmed',
      shipped:   'badge-shipped',
      delivered: 'badge-delivered',
      cancelled: 'badge-cancelled',
    }[status] || 'badge-pending';
  }
}