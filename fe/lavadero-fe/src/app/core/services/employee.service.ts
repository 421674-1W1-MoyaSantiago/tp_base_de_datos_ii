import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeRole } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private http = inject(HttpClient);

  getEmployees(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get(`${environment.apiUrl}/employees?page=${page}&size=${size}`);
  }

  getActiveEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.apiUrl}/employees/active`);
  }

  getEmployeesByRole(role: EmployeeRole): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${environment.apiUrl}/employees/role/${role}`);
  }

  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<Employee>(`${environment.apiUrl}/employees/${id}`);
  }

  createEmployee(employee: Partial<Employee>): Observable<Employee> {
    return this.http.post<Employee>(`${environment.apiUrl}/employees`, employee);
  }

  updateEmployee(id: string, employee: Partial<Employee>): Observable<Employee> {
    return this.http.put<Employee>(`${environment.apiUrl}/employees/${id}`, employee);
  }

  toggleEmployeeStatus(id: string): Observable<Employee> {
    return this.http.patch<Employee>(`${environment.apiUrl}/employees/${id}/status`, {});
  }

  deleteEmployee(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/employees/${id}`);
  }
}
