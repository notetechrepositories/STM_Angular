import { Component, HostListener } from '@angular/core';
import { UserService } from '../services/user.service';
import { MasterService } from '../services/master.service';
import { CompanyService } from '../services/company.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CompanyDetailsModel } from '../model/CompanyDetailsModel';
import Swal from 'sweetalert2';
import { LoginService } from '../login/login.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { NavigationService } from '../navigation/navigation.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  profileDetails: any[] = [];
  connectionList: any[] = [];

  errorMessage!: string;
  userUpdateForm!: FormGroup;
  companyUpdateForm!: FormGroup;
  resetForm!: FormGroup;
  userType!: any;
  connectionId!: any;

  type: string = 'password';
  isText: boolean = false;
  eyeIcon: string = 'fa-eye-slash';

  updateSaveButton = false;
  adminSaveButton = false;
  Company_UserProfile_View: boolean = false;
  Company_AdminProfile_View: boolean = false;
  AdminProfile_View: boolean = false;
  CompanyUpdateProfileVisible: boolean = false;
  ResetPinPopupVisible: boolean = false;
  errorMessageView: boolean = false;
  isEdit: boolean = false;
  isEditDropdown: boolean = false;
  isEditinput: boolean = false;
  isEditIcon: boolean = true;

  editedName!: string;
  adminStatus!: string;
  selfActive!:string;

  constructor(
    private service: MasterService,
    private companyService: CompanyService,
    private userService: UserService,
    private loginService: LoginService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private navigationService: NavigationService,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.getAuthorizeUserDetails();
    this.forms();
    this.loadData();
    this.getConnectionList();
  }

  logout() {
    if (this.connectionId != null) {
      console.log(this.connectionId);
      this.service.logout(this.connectionId).subscribe({
        next: (res) => {
          localStorage.clear();
          this.navigationService.setNavigationViewState(false);
          this.router.navigate(['/login']).then(() => {
            window.location.reload();
          });
        },
        error: (error) => {},
      });
    }
  }

  onlyNumbers(event: KeyboardEvent) {
    const charCode = event.which || event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }
  inputboxClick(event: any) {
    this.errorMessageView = false;
  }

  loadData() {
    this.connectionId = localStorage.getItem('connectionId');
    this.userType = localStorage.getItem('userType');
    if (this.userType == 'company_user') {
      this.Company_UserProfile_View = true;
      this.Company_AdminProfile_View = false;
      this.AdminProfile_View = false;
    } else if (this.userType == 'company_admin') {
      this.Company_UserProfile_View = false;
      this.Company_AdminProfile_View = true;
      this.AdminProfile_View = false;
    } else {
      this.Company_UserProfile_View = false;
      this.Company_AdminProfile_View = false;
      this.AdminProfile_View = true;
    }
  }

  forms() {
    this.userUpdateForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      adminPrivilege: ['', Validators.required],
    });

    this.companyUpdateForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', Validators.required],
      address: ['', Validators.required],
      address2: [''],
      city: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      zipcode: [
        '',
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10),
        ],
      ],
    });

    this.resetForm = this.fb.group(
      {
        password: ['', Validators.required],
        newpassword: ['', Validators.required],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  getAuthorizeUserDetails() {
    this.service.getAuthorizedUserDetails().subscribe({
      next: (res) => {
        this.profileDetails.push(res.data);
        if (this.profileDetails[0].t6_admin == 'y') {
          this.isEdit = true;
        } else {
          this.isEdit = false;
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  onEditProfile(usertype: string) {
    if (usertype == 'user') {
      this.CompanyUpdateProfileVisible = false;
    } else if (usertype == 'company') {
      this.CompanyUpdateProfileVisible = true;
    } else {
    }
  }

  onInput(event: any) {
    this.updateSaveButton = true;
    this.editedName = event.target.innerText;
  }

  onUpdateCompanyProfile() {
    let companyUpdateData: any = {
      t5_company_name: this.profileDetails[0].t5_company_name,
      t5_address_1: this.profileDetails[0].t5_address_1,
      t5_address_2: this.profileDetails[0].t5_address_2,
      t5_country: this.profileDetails[0].t5_country,
      t5_state: this.profileDetails[0].t5_state,
      t5_city: this.profileDetails[0].t5_city,
      t5_zip_pincode: this.profileDetails[0].t5_zip_pincode,
      t5_mobile_no: this.profileDetails[0].t5_mobile_no,
      t5_email: this.profileDetails[0].t5_email,
    };
    console.log(companyUpdateData);
    this.companyService
      .updateCompanyProfileByCompany(companyUpdateData)
      .subscribe({
        next: (res) => {
          this.CompanyUpdateProfileVisible = false;
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Updated Successfully!',
            showConfirmButton: false,
            timer: 3000,
          });
        },
        error: (error) => {
          console.log(error);
          this.errorMessageView = false;
          this.errorMessage = error.message;
        },
      });
  }

  onResetPassword() {
    this.ResetPinPopupVisible = true;
  }

  resetpin() {
    const formValue = this.resetForm.value;
    let resetData: any = {
      t6_login_pin: formValue.password,
      encrypted_data: '',
    };

    if (resetData != null) {
      this.loginService.resetPin(resetData).subscribe({
        next: (res) => {
          this.ResetPinPopupVisible = false;
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Pin reset Successfully!',
            showConfirmButton: false,
            timer: 3000,
          });
        },
        error: (error) => {
          Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Oops!',
            text: 'Something went wrong.',
            showConfirmButton: true,
          });
        },
      });
    }
  }

  hideShowPassword() {
    this.isText = !this.isText;
    this.isText ? (this.eyeIcon = 'fa-eye') : (this.eyeIcon = 'fa-eye-slash');
    this.isText ? (this.type = 'text') : (this.type = 'password');
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const passwordControl = formGroup.get('password');
    const newPasswordControl = formGroup.get('newpassword');

    if (passwordControl && newPasswordControl) {
      const password = passwordControl.value;
      const confirmPassword = newPasswordControl.value;

      if (password !== confirmPassword) {
        newPasswordControl.setErrors({ mismatch: true });
      } else {
        newPasswordControl.setErrors(null);
      }
    }
  }

  deleteUserAccount(event: any) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this account?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
          this.userService.deleteUserProfile().subscribe({
            next: (res) => {
              this.messageService.add({
                severity: 'info',
                summary: 'Confirmed',
                detail: 'Account Deleted',
              });
              console.log(this.connectionId);
              localStorage.clear();
              this.router.navigate(['/login']).then(() => {
                window.location.reload();
              });
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Rejected',
                detail: 'Unable to Delete this account',
              });
            },
          });
      },
      reject: () => {},
    });
  }

  
  deleteCompanyAccount(event: any){
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to delete this account?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      accept: () => {
        this.companyService.deleteCompanyProfile().subscribe({
          next:res=>{
            this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'Account Deleted' });
            console.log(this.connectionId);
              localStorage.clear();
              this.router.navigate(['/login']).then(() => {
                window.location.reload();
              });
          },
          error:error=>{
            this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'Unable to Delete this account' });
          }
        });
      },
      reject: () => {},
    });
  }

  onEdit() {
    this.isEdit = false;
    this.isEditDropdown = true;
  }

  onDropdownChange(event: any) {
    this.adminStatus = event.target.value;
    console.log(this.adminStatus);
    this.profileDetails[0].t6_admin = this.adminStatus;
    this.isEdit = false;
    this.isEditDropdown = false;
    this.adminSaveButton = true;
  }

  adminPrivilegeUpdate() {
    console.log(this.adminStatus);
    this.companyService
      .updateAdminPrivilageByCompany(this.adminStatus)
      .subscribe({
        next: (res) => {
          if (res.status == 200) {
            this.adminSaveButton = false;
            Swal.fire({
              position: 'center',
              icon: 'success',
              title: 'Updated Successfully!',
              showConfirmButton: false,
              timer: 3000,
            });
          } else {
            this.isEditDropdown = false;
            this.adminSaveButton = false;
            Swal.fire({
              position: 'center',
              icon: 'error',
              title: 'Oops!',
              text: res.message,
              showConfirmButton: true,
            }).then((result) => {
              if (result.isConfirmed) {
                window.location.reload();
              }
            });
          }
        },
        error: (error) => {
          let statusCode = error.status;
          if (statusCode == 401) {
            this.logout();
          } else {
            Swal.fire({
              position: 'center',
              icon: 'error',
              title: 'Oops!',
              text: 'Something went wrong.',
              showConfirmButton: true,
            });
          }
        },
      });
  }

  onEditIcon() {
    this.isEditIcon = false;
    this.isEditinput = true;
  }

  onInputChange(event: any) {
    this.editedName = event.target.value;
    this.isEditIcon = false;
    this.updateSaveButton = true;
  }

  onUpdateUserProfile() {
    let userUpdateData: any = {
      t6_name: this.editedName,
    };
    console.log(userUpdateData);
    this.userService.updateUserProfileByUser(userUpdateData).subscribe({
      next: (res) => {
        if (res.status == 200) {
          this.updateSaveButton = false;
          this.isEditIcon = true;
          this.isEditinput = false;
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Updated Successfully!',
            showConfirmButton: false,
            timer: 3000,
          });
        }
      },
      error: (error) => {
        Swal.fire({
          position: 'center',
          icon: 'error',
          title: 'Oops!',
          text: 'Something went wrong.',
          showConfirmButton: true,
        });
      },
    });
  }

  getConnectionList() {
    const localConnectionId = localStorage.getItem('connectionId'); // Retrieve the stored connection ID once
    this.service.getConnectionList().subscribe({
      next: (res) => {
        console.log(res);
        this.connectionList = res.data.map((item: any) => ({
          ...item,
          t7_user_agents: this.extractBrowserInfo(item.t7_user_agents),
          selfActive: item.t7_singalR_connection_id === this.connectionId
        }));
        
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
  

  private extractBrowserInfo(userAgent: string): string {
    const regex =/Chrome\/[\d.]+(?:.*$)/;
    const match = userAgent.match(regex);
    return match ? match[0] : 'Browser not identified';
  }

  onTerminate(connectionId: string) {
    this.service.logout(connectionId).subscribe({
      next: (res) => {
        if (this.connectionId == connectionId) {
          localStorage.clear();
          this.navigationService.setNavigationViewState(false);
          this.router.navigate(['/login']).then(() => {
            window.location.reload();
          });
        } else {
          this.messageService.add({
            severity: 'success',
            summary: connectionId,
            detail: 'Session Terminated',
            life: 3000,
          });
          window.location.reload();
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
  }
}
