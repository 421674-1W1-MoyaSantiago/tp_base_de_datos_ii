import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Client, Vehicle } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private http = inject(HttpClient);

  getClients(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get(`${environment.apiUrl}/clients?page=${page}&size=${size}`);
  }

  getClientById(id: string): Observable<Client> {
    return this.http.get<Client>(`${environment.apiUrl}/clients/${id}`);
  }

  createClient(client: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(`${environment.apiUrl}/clients`, client);
  }

  updateClient(id: string, client: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${environment.apiUrl}/clients/${id}`, client);
  }

  deleteClient(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/clients/${id}`);
  }

  searchClients(term: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${environment.apiUrl}/clients/search?term=${term}`);
  }

  addVehicle(clientId: string, vehicle: Vehicle): Observable<Client> {
    return this.http.post<Client>(`${environment.apiUrl}/clients/${clientId}/vehicles`, vehicle);
  }

  removeVehicle(clientId: string, licensePlate: string): Observable<Client> {
    return this.http.delete<Client>(`${environment.apiUrl}/clients/${clientId}/vehicles/${licensePlate}`);
  }
}
