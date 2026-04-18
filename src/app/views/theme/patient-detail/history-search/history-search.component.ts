import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchFilter } from '../../../../models/searchfilter.model';
import { SearchService } from '../../../../services/search.service';

@Component({
  selector: 'app-history-search',
  standalone: true,
  templateUrl: './history-search.component.html',
  styleUrl: './history-search.component.scss',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatButtonModule, MatIconModule, MatTooltipModule]
})
export class HistorySearchComponent {

  filtro: SearchFilter = {
    fdesde: '',
    fhasta: '',
    identification: '',
    name: ''
  }

  showFilters: boolean = false;

  constructor(private searchService: SearchService) {}

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  buscar() {
    this.searchService.setSearch(this.filtro);
  }

  limpiar() {
    this.filtro = {
      fdesde: '',
      fhasta: '',
      identification: '',
      name: ''
    };
    this.searchService.setSearch(this.filtro);
  }

  ngOnInit(): void {}
}
