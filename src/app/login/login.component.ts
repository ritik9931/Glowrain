import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  hidePassword = true; // for show/hide password

  // ✅ Toast properties
  showToast = false;
  toastMessage = '';
  toastClass = '';

  constructor(private fb: FormBuilder, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    // If stored in localStorage, auto-fill username
    const savedUsername = localStorage.getItem('rememberedUsername');
    if (savedUsername) {
      this.loginForm.patchValue({ username: savedUsername, rememberMe: true });
    }
  }

  get f(): any { return this.loginForm.controls; }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  displayToast(message: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = message;
    this.toastClass = type === 'success' ? 'bg-success text-white' : 'bg-danger text-white';
    this.showToast = true;

    setTimeout(() => this.showToast = false, 2000); // hide after 2s
  }

  onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) return;

    // Store username if "Remember Me" checked
    if (this.loginForm.value.rememberMe) {
      localStorage.setItem('rememberedUsername', this.loginForm.value.username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    // Simple dummy authentication
    if (this.loginForm.value.username === 'ritik' && this.loginForm.value.password === 'ritik123') {
      localStorage.setItem('authToken', 'loggedIn'); // token
      this.displayToast('Login successful!', 'success');
      setTimeout(() => this.router.navigate(['/dashboard']), 500); // navigate after toast
    } else {
      this.displayToast('Invalid username or password', 'error');
    }
  }
}
