import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule} from '@angular/forms';

@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  imports: [CommonModule, ReactiveFormsModule]
})
export class PatientsComponent implements OnInit {

  formulario: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formulario = this.fb.group({
      apellidos: ['', [Validators.required, Validators.minLength(3)]],
      nombres: ['', [Validators.required, Validators.minLength(3)]],
      lugarNacimiento: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      cedula: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      edad: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
      genero: ['', Validators.required],
      ocupacion: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      direccion: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      procedencia: ['', Validators.required],
      usaLentes: ['', Validators.required],
      ultimoControl: ['', Validators.required],
      motivoConsulta: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    // Initialization logic here
  }

  enviarFormulario() {
    if (this.formulario.valid) {
      console.log('Formulario enviado:', this.formulario.value);
    } else {
      console.log('Formulario inválido');
      this.formulario.markAllAsTouched(); // Marca los campos como tocados para mostrar errores
    }
  }

}

/*
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
 
@Component({
  templateUrl: 'patient.component.html',
  imports: [BrowserModule, ReactiveFormsModule
]
})
export class PatientComponent implements OnInit{
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  
}
*/ 
