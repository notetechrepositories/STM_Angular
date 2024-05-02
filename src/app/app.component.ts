import { Component,HostListener } from '@angular/core'; 
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormControl, FormGroup } from '@angular/forms';
import { MasterService } from './services/master.service';
import { DbConfig } from './model/DbConfig';
import { Router } from '@angular/router';
import { NavigationService } from './navigation/navigation.service';
import { Subject, Observable, timer } from 'rxjs';
import { switchMap, startWith, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [MessageService, ConfirmationService]
})
export class AppComponent {
  title: any;
  isLoggedIn=false;

  private timeoutMinutes = 30;
  private idleTimer$: Observable<number> | undefined;
  private userActions$ = new Subject<void>();
  logoutTimer: any;

  accessToken!:any;
  pinUpdatedStatus!:any;
  connectionId!:any;

  constructor(private router: Router,
              private service: MasterService,
              private navigationService:NavigationService){}
       

@HostListener('document:mousemove')
@HostListener('document:click')
@HostListener('document:keypress')
    
resetTimer() {
    this.userAction();
}   
    
    
  ngOnInit() {
    this.loadData();
    if(this.connectionId!=null){
    this.initializeIdleTimer();
    this.startLogoutTimer();
    }
    
  }

  loadData(){
    this.accessToken=localStorage.getItem('accessToken');
    this.pinUpdatedStatus=localStorage.getItem('pinUpdatedStatus');
    this.connectionId=localStorage.getItem('connectionId');
    if(this.accessToken != null && this.pinUpdatedStatus =="y" || this.connectionId!=null){
      this.isLoggedIn=true;
    }
    else{
      this.isLoggedIn=false;
      this.service.logout(this.connectionId).subscribe({
        next:res=>{
          localStorage.clear();
           this.navigationService.setNavigationViewState(false);
           this.router.navigate(['/login']).then(() => {
              window.location.reload();
            });
        },
        error:status=>{
          console.log(status);
        }
      });
    }
 }


//  idle detector

 initializeIdleTimer() {
  this.idleTimer$ = this.userActions$.pipe(
    startWith(0),
    switchMap(() => timer(this.timeoutMinutes * 60 * 1000)),
    tap(() => {
      this.logout();
    })
  );
  this.idleTimer$.subscribe();
}

userAction() {
  this.userActions$.next();
}

logout() {
  if(this.connectionId!=null){
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

  private startLogoutTimer() {
    const timeoutDuration = 48 * 60 * 1000; 
    this.logoutTimer = setTimeout(() => {
      this.logout();
    }, timeoutDuration);
  }

}
