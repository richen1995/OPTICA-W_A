import { CommonModule } from '@angular/common';
import {  AfterViewInit, Component, Input, OnInit, SimpleChanges, ViewChild, OnChanges } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicalRecordExtended } from '../../../../models/fullmedicaldata.model';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HistoryDetailComponent } from '../history-detail/history-detail.component';
import { HistorySearchComponent } from '../history-search/history-search.component';
import { SearchService } from '../../../../services/search.service';
import { ApiService } from '../../../../services/api.service';


@Component({
  selector: 'app-history-list',
  standalone: true,
  templateUrl: './history-list.component.html',
  styleUrl: './history-list.component.scss',
    imports: [
      CommonModule, 
      ReactiveFormsModule, 
      MatButtonModule, 
      MatTableModule, 
      MatSortModule, 
      MatPaginatorModule, 
      MatCardModule, 
      MatFormFieldModule, 
      MatInputModule, 
      MatIconModule, 
      MatTooltipModule, 
      HistoryDetailComponent, 
      HistorySearchComponent
    ],
})


export class HistoryListComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() listMedicalRecordsExtended?: MedicalRecordExtended[] = [];
  id_medical_record?: number;
  isMobile = false;
  mobilePageSize = 5;
  mobileVisibleCount = 5;

    displayedColumns: string[] = [
    'index',
    'identificacion',
    'paciente',
    'fecha',
    'motivo',
    'acciones'
  ];

  dataSource = new MatTableDataSource<MedicalRecordExtended>([]);

  private _paginator!: MatPaginator;
  private _sort!: MatSort;

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
     this._paginator = value;
     if (this._paginator) {
       this.dataSource.paginator = this._paginator;
     }
  }
  get paginator(): MatPaginator {
    return this._paginator;
  }

  @ViewChild(MatSort) set sort(value: MatSort) {
     this._sort = value;
     if (this._sort) {
       this.dataSource.sort = this._sort;
     }
  }
  get sort(): MatSort {
    return this._sort;
  }

  constructor(private searchService: SearchService, private apiService: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.detectScreen();
    window.addEventListener('resize', () => {
      this.detectScreen();
    });

    this.searchService.search$.subscribe(filtro => {
      console.log('Filtro recibido:', filtro);
      if (filtro && (filtro.fdesde || filtro.fhasta)) {
        this.apiService.getSearchMedicalRecord(filtro.identification, filtro.fdesde, filtro.fhasta, filtro.name)
          .subscribe({
            next: (data) => {
              console.log('Resultados de búsqueda:', data);
              // Asignamos los datos directamente al dataSource
              // Note: el tipado podría ser MedicalRecordExtended[] if backend returns it
              this.dataSource.data = (data as any[]).filter(item => item.person);
              if (this.paginator) {
                this.paginator.firstPage();
              }
            },
            error: (error) => {
              console.error('Error al realizar la búsqueda:', error);
            }
          });
      } else {
        // Si no hay filtro, mostramos la lista original
        this.dataSource.data = (this.listMedicalRecordsExtended || []).filter(item => item.person);
      }
    })
  }

  detectScreen() {
    this.isMobile = window.innerWidth <= 768;

    if (this.isMobile) {
      this.mobileVisibleCount = this.mobilePageSize;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['listMedicalRecordsExtended']) {
      console.log('LISTADO DE HISTORIAS CLINICAS:', this.listMedicalRecordsExtended);

      // Filtramos para que solo se muestren los registros que tienen el objeto 'person'
      this.dataSource.data = (this.listMedicalRecordsExtended || []).filter(item => item.person);

      if (this.sort) {
        this.dataSource.sort = this.sort;
      }

      // RE-ENLAZAR paginator y sort
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
        this.paginator.firstPage(); 
      }
    } 
  }

  ngAfterViewInit(): void {
    this.dataSource.sortingDataAccessor = (item: any, property: string) => {
      const value = (() =>{
        switch (property) {
          case 'paciente':
            return item.person?.first_name ?? '';
          case 'telefono':
            return item.person?.phone ?? '';
          case 'fecha':
            return item.f_creation ?? '';
          case 'identificacion':
            return item.fh_general ?? '';
          default:
            return item[property];

          }
      })();
        return typeof value === 'string' 
          ? value.toLowerCase() 
          : value;
    }

    // Personalizar el filtro para que busque en el objeto anidado 'person'
    this.dataSource.filterPredicate = (data: MedicalRecordExtended, filter: string) => {
      const searchStr = (
        (data.person?.first_name || '') + ' ' + 
        (data.person?.last_name || '') + ' ' + 
        (data.person?.identification || '') + ' ' + 
        (data.reasons_for_visit || '')
      ).toLowerCase();
      return searchStr.indexOf(filter) !== -1;
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  verDetalle(id: number | undefined) {
    this.id_medical_record = id;
    console.log('ID de la historia clínica seleccionado:', id);
  }

  volverAlListado() {
    this.id_medical_record = undefined;
  }

  editarExamen(id: number | undefined) {
    if (id) {
      this.router.navigate(['/theme/patients'], { queryParams: { id_record: id } });
    }
  }

  // Método para obtener los datos paginados y que el móvil muestre lo mismo que la tabla
  get pagedData() {
    if (this.dataSource && this.dataSource.paginator) {
      const startIndex = this.dataSource.paginator.pageIndex * this.dataSource.paginator.pageSize;
      return this.dataSource.data.slice(startIndex, startIndex + this.dataSource.paginator.pageSize);
    }  
    return this.dataSource.data;
  }

  loadMore() {
    this.mobileVisibleCount += this.mobilePageSize;
  }
}
