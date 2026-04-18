import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { SearchFilter } from "../models/searchfilter.model";

@Injectable({
  providedIn: 'root'
})

export class SearchService {

  private searchSource = new BehaviorSubject<SearchFilter>({
    fdesde: '',
    fhasta: '',
    identification: '',
    name: ''
  });


  search$ = this.searchSource.asObservable();

  setSearch(value: SearchFilter) {
    this.searchSource.next(value);
  }

}