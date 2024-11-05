import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ForgotAndResetService {

  constructor(private http:HttpClient) { }

  url="http://59.94.176.2:3241/api/"; 

  forgotPassword(data:any){
    return this.http.post<any>(`${this.url}Authentication/forgot_password`,data);
  }

  OtpVerification(data:any){
    return this.http.post<any>(`${this.url}Authentication/otp_verification`,data);
  }

  resetPassword(data:any){
    return this.http.post<any>(`${this.url}Authentication/reset_pin_before_login`,data);
  }
}
