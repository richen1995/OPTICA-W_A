import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../../../../services/api.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-registerlogin',
  templateUrl: './registerlogin.component.html',
  styleUrl: './registerlogin.component.scss',
  standalone: true,
    imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule
  ]
  
})
export class RegisterloginComponent {

  private router =  inject(Router);
  registerForm!: FormGroup;
  hide = true;
  hide2 = true;
  loading = false;
  passwordStrength = 0;

  constructor(private fb: FormBuilder, private apiService: ApiService,
    private toastr: ToastrService // Inyectamos el servicio de mensajes
  ) {}

  ngOnInit(){

    this.registerForm = this.fb.group({
      firstName:['',Validators.required],
      lastName:['',Validators.required],
      identification:['',[Validators.required,this.cedulaValidator]],
      email:['',[Validators.required,Validators.email]],
      password:['',[Validators.required,Validators.minLength(6)]],
      confirmPassword:['']
    },{validators:this.passwordMatch});

    this.registerForm.get('password')?.valueChanges.subscribe(v=>{
      this.passwordStrength=this.calcStrength(v);
    });
  }

  get f(){ return this.registerForm.controls }

  register(){

    if(this.registerForm.invalid) return;

    this.loading=true;

    const req = {
      ...this.registerForm.value,
      f_creation: new Date().toISOString(),
      f_update: new Date().toISOString()
    };
    delete req.confirmPassword;

    console.log('Datos a enviar:', req);

    this.apiService.registerLogin(req).subscribe({
      next:()=>{
        this.loading=false;
        this.toastr.success('Usuario registrado correctamente', '¡Éxito!'); // Mensaje de éxito
        this.router.navigate(['/login']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        console.error('Error de registro:', err);
        if (err.status === 0) {
          this.toastr.error('No se pudo conectar con el servidor. El backend podría estar caído.', 'Error de Conexión');
        } else {
          this.toastr.error(err.error?.error || 'Hubo un problema al registrar el usuario', 'Error');
        }
      }
    });
    

    setTimeout(()=>this.loading=false,1500);
  }

  passwordMatch(group:AbstractControl){
    return group.get('password')?.value === group.get('confirmPassword')?.value
      ? null : {notMatch:true};
  }

  calcStrength(p:string){
    if(!p)return 0;
    let s=0;
    if(p.length>5)s+=25;
    if(/[A-Z]/.test(p))s+=25;
    if(/[0-9]/.test(p))s+=25;
    if(/[^A-Za-z0-9]/.test(p))s+=25;
    return s;
  }

  cedulaValidator(control:AbstractControl){
    const ced=control.value;
    if(!ced || ced.length!==10) return {cedula:true};

    const coef=[2,1,2,1,2,1,2,1,2];
    let total=0;

    for(let i=0;i<9;i++){
      let v=ced[i]*coef[i];
      total+= v>9?v-9:v;
    }

    const dig=(10-(total%10))%10;
    return dig==ced[9]?null:{cedula:true};
  }

}
