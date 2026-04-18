import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    data: {
      title: ''
    },
    children: [
      {
        path: 'colors',
        loadComponent: () => import('./colors.component').then(m => m.ColorsComponent),
        data: {
          title: 'Colors'
        }
      },
      {
        path: 'patients',
        loadComponent: () => import('./patients.component').then(m => m.PatientsComponent),
        data: {
          title: 'Examen Optométrico'
        }
      },
      {
        path: 'patient-detail',
        loadComponent: () => import('./patient-detail/patient-detail.component').then(m => m.PatientDetailComponent),
        data: {
          title: 'Historial Médico'
        }
      },
      {
        path: 'typography',
        loadComponent: () => import('./typography.component').then(m => m.TypographyComponent),
        data: {
          title: 'Typography'
        }
      }
    ]
  }
];

