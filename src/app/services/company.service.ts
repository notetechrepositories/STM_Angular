import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CompanyDetailsModel } from '../model/CompanyDetailsModel';


@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private http:HttpClient) { }

  url="http://59.94.176.2:3241/api/"; 

  accessToken = localStorage.getItem('accessToken'); 
  headers = new HttpHeaders({
    'Authorization': `Bearer ${this.accessToken}`
  });

  companyRegistration(formData:any){
    return this.http.post<any>(`${this.url}Authentication/register_company`,formData);
  }

  companyRegistrationByNotetech(formData:any){
    return this.http.post<any>(`${this.url}Company/add`,formData,{headers:this.headers});
  }

  getAllCompany(){
    return this.http.get<any>(`${this.url}Company/details/all`,{headers:this.headers});
  }

  getCompanyById(id:number){
    return this.http.get<any>(`${this.url}Company/deatils/by-id?companyId=${id}`,{headers:this.headers});
  }

  // getCompanyNameById(id: number): Observable<string> {
  //   return this.http.get<{ name: string }>(`https://localhost:7152/api/Company/deatils/by-id?companyId=${id}`,{headers:this.headers}).pipe(
  //     map(response => response.name)
  //   );
  // }
  
  updateLoginPermissionApproved(id:any,data:any){
    return this.http.put<any>(`${this.url}Company/approved/${id}`,data,{headers:this.headers});
  }

  updateLoginPermissionUnapproved(id:any){
    console.log(this.headers);
    
    return this.http.put<any>(`${this.url}Company/unapproved/${id}`,{},{headers:this.headers});
  }

  updateCompanyByAdmin(data:any){
    return this.http.put<any>(`${this.url}Company/update`,data,{headers:this.headers});
  }

  updateAuthorizeUser(data:any){
    return this.http.put<any>(`${this.url}Company/update/authorize-user`,data,{headers:this.headers})
  }

  deleteCompanyById(id:number){
    return this.http.delete<any>(`${this.url}Company/delete/by-companyId?company_id=${id}`,{headers:this.headers});
  }
  
  updateCompanyProfileByCompany(data:any){
    return this.http.put<any>(`${this.url}Company/update/authorize-user`,data,{headers:this.headers});
  }

  deleteCompanyProfile(){
    return this.http.delete<any>(`${this.url}Company/delete/authorize-user`,{headers:this.headers});
  }

  updateAdminPrivilageByCompany(status:any){
    return this.http.put<any>(`${this.url}User/update/authorize-user-permission?t6_admin=${status}`,{},{headers:this.headers});
  }

  
}
