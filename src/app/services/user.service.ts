import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http:HttpClient) { }
  url="http://59.94.176.2:3241/api/"; 

  accessToken = localStorage.getItem('accessToken'); 
  headers = new HttpHeaders({
    'Authorization': `Bearer ${this.accessToken}`
  });

  addUserbyCompany(formData:any){ 
    return this.http.post<any>("http://59.94.176.2:3241/api/User/add",formData,{headers:this.headers});
  }

  getUserListbyCompany(){
    return this.http.get<any>(`http://59.94.176.2:3241/api/User/all/company-admin`,{headers:this.headers});
  }
  
  updateUserPrivilagebyCompany(data:any){
    return this.http.put<any>(`http://59.94.176.2:3241/api/User/update/user-permission`,data,{headers:this.headers});
  }

  getUserById(id:any){
    return this.http.get<any>(`http://59.94.176.2:3241/api/User/details/by-userId?user_id=${id}`,{headers:this.headers});
  }

  getAllUsers(){
    return this.http.get<any>(`http://59.94.176.2:3241/api/User/details/all`,{headers:this.headers});
  }

  deleteUserById(id: any){
    return this.http.delete<any>(`http://59.94.176.2:3241/api/User/delete/by-userId?deleteUserId=${id}`,{headers:this.headers})
  }

  updateUserProfileByUser(data:any){
    return this.http.put<any>(`http://59.94.176.2:3241/api/User/update`,data,{headers:this.headers});
  }

  deleteUserProfile(){
    return this.http.delete<any>(`http://59.94.176.2:3241/api/User/delete/authorize-user`,{headers:this.headers})
  }


}
