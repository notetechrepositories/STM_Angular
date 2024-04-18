import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  private navigationViewState = new BehaviorSubject<boolean>(true); // Assuming true is the initial state
  AddEmployeeButton:boolean=false;
  HowItsWorkTab=false;
  HomeTab=false;

  constructor() {}

  setNavigationViewState(state: boolean) {
    this.navigationViewState.next(state);
  }

  getNavigationViewState() {
    return this.navigationViewState.asObservable();
  }

  companyAdminNavigation(){
      this.AddEmployeeButton=true;
      this.HowItsWorkTab=true;
      this.HomeTab=true;
      console.log("companyAdminNavigation");
      
  }

  companyUserNavigation(){
    this.AddEmployeeButton=false;
    this.HowItsWorkTab=true;
    this.HomeTab=true;
    console.log("companyUserNavigation");
}

}
