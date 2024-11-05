import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MasterService } from '../services/master.service';
import { CompanyDetailsModel } from '../model/CompanyDetailsModel';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { UserDetailsModel } from '../model/UserDetailsModel';
import { ConfirmationService, MessageService } from 'primeng/api';
import { NavigationService } from './navigation.service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  isLoggeddIn = false;
  isNavMenuActive = false;
  loginVisible:boolean=false;
  homePage:boolean=true;
  tutorialPage:boolean=false;
  AddEmployeeVisible:boolean=false;
  UserListVisible:boolean=false;
  AddEmployeeButton:boolean=false;
  HowItsWorkTab=false;
  HomeTab=false
  editing=false;
  navigationView:Boolean=true;
  userType!: any;
  accessToken!:any;
  connectionId!:any;
  companyDetails:CompanyDetailsModel=new CompanyDetailsModel();
  userDetails: UserDetailsModel[] = [];
  userData:any[] = [];
  statuses: any;
  errorMessageView:boolean=false;
  errorMessage!:string;
  successMessageView:boolean=false;
  successMessage!:string;


  userList: any[] = [];
  selectedUser: any[] =[];

  userRegForm!:FormGroup

  private navigationViewSub: Subscription;

  constructor(private router: Router,
              private service:MasterService,
              private userService:UserService,
              private confirmationService: ConfirmationService,
              private messageService: MessageService,
              private fb:FormBuilder,
              private navigationService: NavigationService) { 
                this.navigationViewSub = this.navigationService.getNavigationViewState().subscribe((state) => {
                  this.navigationView = state;
                });
              }

  ngOnInit() {

    this.loadData();

    if(this.userType=="company_admin"){
      this.AddEmployeeButton=true;
      this.HowItsWorkTab=true;
      this.HomeTab=true;
    }
    else if(this.userType=="notetech"){
      this.AddEmployeeButton=false;
      this.HowItsWorkTab=false;
    }
    else{
      this.AddEmployeeButton=false;
      this.HowItsWorkTab=true;
      this.HomeTab=true;
    }

    this.userRegForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      adminPrivilege: ['', Validators.required]
    });

    this.statuses = [
      { label: 'Yes', value: 'y' },
      { label: 'No', value: 'n' }
  ];

  }

  goToHome(){
    this.router.navigate(['/home'])
  }

  loadData(){
    this.getAuthorizedUserData();
    this.userType=localStorage.getItem('userType');
    this.accessToken=localStorage.getItem('accessToken');
    this.connectionId=localStorage.getItem('connectionId');
  }

  ngOnDestroy() {
    if (this.navigationViewSub) {
      this.navigationViewSub.unsubscribe();
    }
  }

  toggleNavMenu() {
    this.isNavMenuActive = !this.isNavMenuActive;
  }

  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.which || event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }
  inputboxClick(event: any) {
    this.errorMessageView=false;
  }




  onUserListButton(){
    this.UserListVisible=true;
    this.userService.getUserListbyCompany().subscribe(res=>{
      this.userDetails=res.data;
    })
  }

  getAuthorizedUserData(){
    this.service.getAuthorizedUserDetails().subscribe(res=>{
      this.companyDetails=res.data;
    })
  }

  updateUserPrivilege(id:number,event:any){
    let updateData:any={
        id_t6_company_users: id,
        t6_admin:event.value
      }
      this.userService.updateUserPrivilagebyCompany(updateData).subscribe({
        next:(res)=>{
          console.log(res);
          if(res.status==400){
            this.errorMessage=res.message;
            this.messageService.add({ severity: 'error', summary: 'Unable to Update!', detail: this.errorMessage, life: 5000 });
            this.onUserListButton();
          }
          else{
            this.errorMessageView=false;
            this.successMessage=res.message;
            this.messageService.add({ severity: 'success', summary: 'Successfully Updated!', detail:  this.successMessage, life: 3000 });
          }
        },
        error:(error)=>{ 
          if(error.status==401){
            this.logout();
          }
        }
      })
    }
    
    onAddEmployeeButton(){
      this.AddEmployeeVisible=true;
      this.userRegForm.reset({
        name: '',
        email: '',
        mobile: '',
        adminPrivilege: ''
      });
      this.errorMessageView=false;
    }

  onAddUser(){
    if (this.userRegForm.invalid) {
      this.userRegForm.markAllAsTouched();
      return;
    }
    else{
    const formValue = this.userRegForm.value;
    let userRegData: any={
      id_t5_m_company: this.companyDetails.id_t5_m_company,
      t6_name: formValue.name,
      t6_mobile_no: formValue.mobile,
      t6_email: formValue.email,
      t6_admin: formValue.adminPrivilege
    }
    if(userRegData!=null){
      this.userService.addUserbyCompany(userRegData).subscribe({
        next:(res)=>{
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Pin reset Successfully!",
            showConfirmButton: false,
            timer: 3000
          });
           this.AddEmployeeVisible=true;
          this.userRegForm.reset();
        },
        error:(error)=>{
          this.errorMessage=error.error.message;
          this.errorMessageView=true;
          if(error.status==401){
            this.logout();
          }
        }
      })
    }
    }
    
  }

  
  deleteSelectedUser(){
    this.confirmationService.confirm({  
      message: 'Are you sure you want to delete the selected employees?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userDetails = this.userDetails.filter((val) => !this.selectedUser?.includes(val));
        this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'User Deleted', life: 3000 });
      }
    });
  }

  deleteUser(data:any){
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this employee?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.userDetails = this.userDetails.filter((val) => (val.id_t6_company_users !== data.id_t6_company_users));
          this.userService.deleteUserById(data.id_t6_company_users).subscribe({
            next:(res)=>{
              this.messageService.add({ severity: 'success', summary: 'Successfull', detail: 'Successfully Deleted', life: 3000 });
            },
            error:(error)=>{
              this.messageService.add({ severity: 'error', summary: 'Unsuccessfull', detail: error.error.message, life: 3000 });
            }
          })
      }
    });
  }

  logout(){ 
    this.service.logout(this.connectionId).subscribe({
      next:res=>{
        localStorage.clear();
        this.navigationService.setNavigationViewState(false);
        this.router.navigate(['/login']).then(() => {
           window.location.reload();
         });
      },
      error:error=>{
        if(error.status==401){
          console.log("Authorization Expired");
          
        }
      }
      
    })
  }
}
