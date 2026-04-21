import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { person } from '../models/person.model';
import { medicalRecord } from '../models/medical-record.model';
import { lensometry } from '../models/lensometry.model';
import { visualAcuity } from '../models/visual-acuity.model';
import { rx } from '../models/rx.model';
import { fullpersondata } from '../models/fullpersondata.model';
import { fullmedicaldata, MedicalRecordExtended } from '../models/fullmedicaldata.model';
import { registerrequest } from '../models/registerrequest';

/*SERVICIO PARA PERSONA*/
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'http://localhost:8080';
  //private baseUrl = 'https://jail-converted-quantitative-considerable.trycloudflare.com';
  //private baseUrl = 'https://optica-w-a-back.onrender.com';



  constructor(private http: HttpClient) { }

/*   getData(endpoint: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/person/${endpoint}`);
  }

  postData(endpoint: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${endpoint}`, data);
  } */

  //PERSONA
  createPersona(persona: person): Observable<person> {
    return this.http.post<person>(this.baseUrl + "/person", persona);
  }  

  updatePersona(persona: person): Observable<person> {
    return this.http.put<person>(this.baseUrl + "/person", persona);
  }
  
  getPersonById(id: number): Observable<person> {
    return this.http.get<person>(`${this.baseUrl}/person/${id}`);
  }

  getPersonByIdentification(id: string): Observable<person> {
    return this.http.get<person>(`${this.baseUrl}/person/identification/${id}`);
  }


  //HISTORIA CLÍNICA
  createMedicalRecord(historiaClinica: medicalRecord): Observable<medicalRecord> {
    return this.http.post<medicalRecord>(this.baseUrl + "/medicalRecord", historiaClinica);
  }  

  updateMedicalRecord(historiaClinica: medicalRecord): Observable<medicalRecord> {
    return this.http.put<medicalRecord>(this.baseUrl + "/medicalRecord", historiaClinica);
  }  

  // NUEVO: GUARDADO TRANSACCIONAL COMPLETO
  createFullMedicalRecord(fullData: MedicalRecordExtended): Observable<MedicalRecordExtended> {
    return this.http.post<MedicalRecordExtended>(`${this.baseUrl}/medicalRecord/full`, fullData);
  }

  updateFullMedicalRecord(fullData: MedicalRecordExtended): Observable<MedicalRecordExtended> {
    return this.http.put<MedicalRecordExtended>(`${this.baseUrl}/medicalRecord/full`, fullData);
  }

  getMedicalRecords(): Observable<medicalRecord> {
    return this.http.get<medicalRecord>(`${this.baseUrl}/medicalRecord`);
  }

  //LENSOMETRÍA
  createLensometry(lensometria: lensometry): Observable<lensometry> {
    return this.http.post<lensometry>(this.baseUrl + "/lensometry", lensometria);
  }  

  updateLensometry(lensometria: lensometry): Observable<lensometry> {
    return this.http.put<lensometry>(this.baseUrl + "/lensometry", lensometria);
  }  

  //AGUDEZA VISUAL
  createVisualAcuity(visualAcuity: visualAcuity): Observable<visualAcuity> {
    return this.http.post<visualAcuity>(this.baseUrl + "/visual_acuities", visualAcuity);
  }  

  updateVisualAcuity(visualAcuity: visualAcuity): Observable<visualAcuity> {
    return this.http.put<visualAcuity>(this.baseUrl + "/visual_acuities", visualAcuity);
  }  

  //DIAGNÓSTICO ÓPTICO (RX)
  createRx(rx: rx): Observable<rx> {
    return this.http.post<rx>(this.baseUrl + "/rx", rx);
  } 

  updateRx(rx: rx): Observable<rx> {
    return this.http.put<rx>(this.baseUrl + "/rx", rx);
  } 

  // SRV PARA OBTENER EL JSON COMPLETO DE PERSONA + HISTORIA CLÍNICA + LENSOMETRÍA + AGUDEZA VISUAL + DIAGNÓSTICO ÓPTICO (RX)
  getFullPersonData(id: number): Observable<fullpersondata> {
    return this.http.get<fullpersondata>(`${this.baseUrl}/person/${id}`);
  } 

  //SVR PARA OBTENER UN LISTADO DE JSON DE HISTORIAS CLÍNICAS COMPLETAS CON SUS RESPECTIVAS LENSOMETRÍAS, AGUDEZAS VISUALES Y DIAGNÓSTICOS ÓPTICOS (RX)
  getFullMedicalRecordData(id: number): Observable<fullmedicaldata> {
    return this.http.get<fullmedicaldata>(`${this.baseUrl}/medicalRecord/${id}`);
  }
  
  //SVR PARA OBTENER UN LISTADO DE JSON DE HISTORIAS CLÍNICAS COMPLETAS CON SUS RESPECTIVAS LENSOMETRÍAS, AGUDEZAS VISUALES Y DIAGNÓSTICOS ÓPTICOS (RX)
  getFullMedicalRecordDataTotal(): Observable<MedicalRecordExtended> {
    return this.http.get<MedicalRecordExtended>(`${this.baseUrl}/medicalRecord`);
  }

  //SVR PARA OBTENER UN LISTADO DE JSON DE HISTORIAS CLÍNICAS COMPLETAS CON SUS RESPECTIVAS LENSOMETRÍAS, AGUDEZAS VISUALES Y DIAGNÓSTICOS ÓPTICOS (RX)
  getMedicalRecordDataExtended(id: number): Observable<MedicalRecordExtended[]> {
    return this.http.get<MedicalRecordExtended[]>(`${this.baseUrl}/medicalRecord/${id}`);
  }

  //SEARCH FILTER FOR MEDICAL RECORDS
  getSearchMedicalRecord(identification?: string, fdesde?: string, fhasta?: string, name?: string): Observable<medicalRecord[]> {
    let params = new HttpParams()
      .set('identification', identification || '')
    .set('fdesde', fdesde || '')
      .set('fhasta', fhasta || '')
      .set('name', name || '');

    return this.http.get<medicalRecord[]>(`${this.baseUrl}/medicalRecord/searchFilter`, { params });
  }

  //LOGIN
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { username, password });
  }

  //REGISTER LOGIN
  registerLogin(userData: registerrequest): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/register`, userData);
  }

  //OLVIDÉ MI CONTRASEÑA
  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  //RESTABLECER CONTRASEÑA
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/reset-password`, { token, newPassword });
  }

  //GESTION DE USUARIOS
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/auth/users`);
  }

  updateUserStatus(id_user: number, is_active: boolean): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/auth/users/${id_user}/status`, { is_active });
  }
}

