import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http:HttpClient) { }

  url="http://59.94.176.2:3241/api/"; 

  accessToken = localStorage.getItem('accessToken'); 
  headers = new HttpHeaders({
    'Authorization': `Bearer ${this.accessToken}`
  });
  
  
login(data:any){
  return this.http.post<any>(`${this.url}Authentication/login`,data);
}

resetPin(data:any){
  const accessToken = localStorage.getItem('accessToken'); 
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${accessToken}`
  });
  return this.http.post<any>(`${this.url}Authentication/reset_pin_after_login`,data,{ headers:headers });
}


}
