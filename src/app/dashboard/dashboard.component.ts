import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

// For charts
import { NgChartsModule } from 'ng2-charts';
import { ChartOptions, ChartType, ChartData, ChartDataset } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  // Dashboard Stats
  stats = [
    { title: 'Total Orders', value: 1200, icon: 'bi-cart-check', bg: 'bg-primary' },
    { title: 'Revenue', value: '$50,000', icon: 'bi-currency-dollar', bg: 'bg-success' },
    { title: 'New Customers', value: 150, icon: 'bi-people', bg: 'bg-warning' },
    { title: 'Products in Stock', value: 320, icon: 'bi-box-seam', bg: 'bg-info' },
  ];

  // Latest Orders
  latestOrders = [
    { id: 1001, customer: 'John Doe', status: 'Pending', amount: '$200', date: '10/10/2025' },
    { id: 1002, customer: 'Alice Smith', status: 'Shipped', amount: '$150', date: '10/10/2025' },
    { id: 1003, customer: 'Mark Lee', status: 'Delivered', amount: '$300', date: '09/10/2025' },
  ];

  // Sales Chart Data
  salesData: ChartData<'line'> = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      { data: [1200, 1500, 1800, 1400, 2000, 2200, 2400], label: 'Sales', fill: true, tension: 0.3, backgroundColor: 'rgba(0,123,255,0.2)', borderColor: 'rgba(0,123,255,1)' }
    ]
  };

  salesOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: true, // allows height defined by container
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true }
  }
};

}
