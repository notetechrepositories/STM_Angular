import { Component,OnInit } from '@angular/core';
import { MasterService } from '../services/master.service';
import { CompanyModel } from '../model/CompanyModel';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyService } from '../services/company.service';
import { CompanyDetailsModel } from '../model/CompanyDetailsModel';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { UserService } from '../services/user.service';
import { Subscription, interval, map } from 'rxjs';
import { NavigationService } from '../navigation/navigation.service';
import { Route, Router } from '@angular/router';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  // company:CompanyModel=new CompanyModel();
  companyDetails:CompanyDetailsModel[]=[];
  severity!:string;
  ptagValue!:string;
  DetailsVisible:boolean=false;
  PopUpVisible:boolean=false;
  AddCompanyForm !: FormGroup;
  companyRegForm!: FormGroup;
  company:CompanyDetailsModel=new CompanyDetailsModel();
  isreadonly=false;
  buttonDisabled=false;
  errorMessage!:string;
  errorMessageView:boolean=false;
  AddButton=false;
  StatusButton=false;
  companyCount!:number;
  userCount!:number;
  pendingCount!:number;
  currentTime!: string;
  currentDate=new Date();
  minFromDate!:string;
  minToDate!:string;
  connectionId:any;
  private clockSubscription !: Subscription;
 
  constructor(private userService:UserService,
              private fb:FormBuilder,
              private companyService:CompanyService,
              private service:MasterService,
              private navigationService:NavigationService,
              private router:Router,
              private datePipe:DatePipe){}

ngOnInit() {

  this.companyRegForm = this.fb.group({
    companyname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    mobile: ['', Validators.required],
    address: ['', Validators.required],
    address2: [''],
    city: ['', Validators.required],
    country: ['', Validators.required],
    state: ['', Validators.required],
    zipcode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
    accessFromdate:[new Date().toISOString()],
    accessTodate:[''],
    maxUsers:[''],
    deviceLogin:['']
  });

  this.clockSubscription = interval(1000) // Emit value every 1000 milliseconds
  .pipe(map(() => new Date().toLocaleTimeString())) // Map the emitted value to current time string
  .subscribe(time => {
    this.currentTime = time; // Update the currentTime property
  });
  
  // this.currentDate= this.datePipe.transform(new Date(), 'MMMM d, y') as string;
  this.getCompany();
  this.getUsers();   

  this.connectionId=localStorage.getItem('connectionId');
}

logout() {
  if(this.connectionId!=null){
    console.log(this.connectionId);
    this.service.logout(this.connectionId).subscribe({
      next:res=>{
        localStorage.clear();
        this.navigationService.setNavigationViewState(false);
        this.router.navigate(['/login']).then(() => {
          window.location.reload();
        });
      },
      error: error => {
      }
    });
  }
  }

inputboxClick(event: any) {
  this.errorMessageView=false;
}


onViewDetails(data:any){
  this.PopUpVisible=true;
  this.company=data;
  this.isreadonly=true;
  this.AddButton=false;
  this.StatusButton=true;
  const currentDate=new Date();
  this.minFromDate=currentDate.toISOString().split('T')[0];
  this.minToDate=currentDate.toISOString().split('T')[0];
  let fromDate=this.datePipe.transform(this.company.t5_access_from_date, 'yyyy-MM-dd')
  let toDate=this.datePipe.transform(this.company.t5_access_till_date, 'yyyy-MM-dd')
  this.company.t5_access_from_date=fromDate as string;
  this.company.t5_access_till_date=toDate as string; 
  if(this.company.t5_approved == "y"){
    this.buttonDisabled=true;
  }
  else{
    this.buttonDisabled=false;
  }
}

onAddCompany(){
  this.PopUpVisible=true;
  this.company=new CompanyDetailsModel();
  this.isreadonly=false;
  this.AddButton=true;
  this.StatusButton=false;
  this.errorMessageView=false;
  this.company.t5_max_device_login_per_username=3;
  this.company.t5_max_users_allowed=11;
  const currentDate=new Date();
  const twoDaysAfter=new Date();
  twoDaysAfter.setDate(twoDaysAfter.getDate() + 2);
 let fromdate=this.datePipe.transform(currentDate, 'yyyy-MM-dd')
 let todate=this.datePipe.transform(twoDaysAfter, 'yyyy-MM-dd');
 this.company.t5_access_from_date=fromdate as string;
 this.company.t5_access_till_date=todate as string;
 this.minFromDate=currentDate.toISOString().split('T')[0];
}

updateMinDate(event:any, target: string) {
  if (target === 'to') {
    let selectedDate=event.target.value;
    this.minToDate = selectedDate;
  }
}

onSubmit() {
  if(this.companyRegForm.valid){
    this.companyService.companyRegistrationByNotetech(this.company).subscribe({
      next:(res)=>{
        this.PopUpVisible=false;
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Pin reset Successfully!",
          showConfirmButton: false,
          timer: 3000
        });
      },
      error:(error)=>{
        this.errorMessage=error.error.message;
        this.errorMessageView=true;
        let statusCode = error.status; 
        if(statusCode == 401){
          this.logout()
        }
        else{
          Swal.fire({
            position: "center",
            icon: "error",
            title: "Oops!",
            text:"Something went wrong.",
            showConfirmButton: true
          });
        }
      }
     })  
  }
  else{
    this.companyRegForm.markAllAsTouched();
      return;
  }
}



getCompany(){
  this.companyService.getAllCompany().subscribe(res=>{
    this.companyDetails=res.data;
    const approvedCompanies = this.companyDetails.filter((company: { t5_approved: string; }) => company.t5_approved === "y");
    this.companyCount=approvedCompanies.length;
    const pendingCompanies = this.companyDetails.filter((company: { t5_approved: string; }) => company.t5_approved === "p");
    this.pendingCount=pendingCompanies.length;
  })
}

getUsers(){
  this.userService.getAllUsers().subscribe(res=>{
    this.userCount=res.data.length;
  });
}

updateLoginPermissionApproved(){
let updatedata:any={
  t5_access_from_date: this.company.t5_access_from_date,
  t5_access_till_date: this.company.t5_access_till_date,
  t5_max_device_login_per_username: this.company.t5_max_users_allowed,
  t5_max_users_allowed:this.company.t5_max_device_login_per_username
}
  this.companyService.updateLoginPermissionApproved(this.company.id_t5_m_company,updatedata).subscribe({
    next:(res)=>{
      if(res.status==200){
        this.PopUpVisible=false;
        Swal.fire({
          position: "center",
          icon: "success",
          title: "Status Changed Successfully",
          showConfirmButton: false,
          timer: 3000
        });
      }
      setTimeout(() => {
        window.location.reload();
      }, 3000);
      
    },
    error:(error)=>{
      let statusCode = error.status; 
      if(statusCode == 401){
        this.logout()
      }
      else{
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Oops!",
          text:"Something went wrong.",
          showConfirmButton: true
        });
      }
      
    }
  })
  
}

updateLoginPermissionUnapproved(){
    this.companyService.updateLoginPermissionUnapproved(this.company.id_t5_m_company).subscribe({
      next:(res)=>{
        if(res.status==200){
          this.PopUpVisible=false;
          Swal.fire({
            position: "center",
            icon: "success",
            title: "Status Changed Successfully",
            showConfirmButton: false,
            timer: 3000
          });
        }
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        
      },
      error:(error)=>{
        let statusCode = error.status; 
      if(statusCode == 401){
        this.logout()
      }
      else{
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Oops!",
          text:"Something went wrong.",
          showConfirmButton: true
        });
      }
      }
    })
    
  }

onlyNumbers(event: KeyboardEvent) {
  const charCode = event.which || event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57)) {
    event.preventDefault();
  }
}

}
