import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  imports: [MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  forgotForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isLoading = true;
      const { email } = this.forgotForm.value;
      
      this.apiService.forgotPassword(email).subscribe({
        next: () => {
          this.toastr.success('Si el correo existe, recibirás un enlace de recuperación próximamente.');
          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Ocurrió un error al procesar la solicitud.');
          this.isLoading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/login']);
  }
}
