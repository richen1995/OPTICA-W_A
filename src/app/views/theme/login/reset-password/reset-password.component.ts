import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  imports: [CommonModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule]
})
export class ResetPasswordComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  resetForm: FormGroup = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  token: string = '';
  hide = true;
  isLoading = false;

  ngOnInit() {
    // Obtenemos el token de los parámetros de la URL (?token=xxxx)
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    console.log('Token capturado:', this.token);

    if (!this.token) {
      console.warn('No se encontró el token en la URL, redirigiendo...');
      this.toastr.error('Token inválido o expirado.');
      this.router.navigate(['/login']);
    }
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      this.isLoading = true;
      const { password } = this.resetForm.value;

      console.log('Enviando petición de reset:', { token: this.token, password: password });

      this.apiService.resetPassword(this.token, password).subscribe({
        next: () => {
          this.toastr.success('Contraseña restablecida con éxito. Ya puedes iniciar sesión.');
          this.isLoading = false;
          this.router.navigate(['/login']);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error de reseteo:', err);
          if (err.status === 0) {
            this.toastr.error('No se pudo conectar con el servidor. El backend podría estar caído.', 'Error de Conexión');
          } else {
            this.toastr.error('Error al restablecer la contraseña. El token podría haber expirado.');
          }
          this.isLoading = false;
        }
      });
    }
  }
}
