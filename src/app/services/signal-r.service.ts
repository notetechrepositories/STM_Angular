import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { MasterService } from './master.service';
import { NavigationService } from '../navigation/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class SignalRService {

  hubConnection!: signalR.HubConnection;
  private isConnectionActive: boolean = false;
  connectionId:any;

  private deviceListSubject = new BehaviorSubject<any[]>([]); // Initialize with an empty array

  public deviceList$ = this.deviceListSubject.asObservable();
 

  constructor(private router: Router,
              private service:MasterService,
              private navigationService:NavigationService,
              ) { }

  ngOnInit() {
    this.connectionId = localStorage.getItem('connectionId');
  }


  // public startConnection = () => {
  //   this.hubConnection = new signalR.HubConnectionBuilder()
  //     .withUrl('http://59.94.176.2:3241/STM_SignalR_Hub')
  //     .build();

  //   this.hubConnection
  //     .start()
  //     .then(() => {
  //       console.log('Connection started');
  //       console.log(this.hubConnection.connectionId);
  //     })
  //     .catch((err) => console.log('Error while starting connection: ' + err));

  //   this.hubConnection.on('AlertTerminate', (message: string) => {
  //     console.log(message);
  //     alert(message);
  //   });

  
  // };
  // public getConnectionId(): string | null | undefined {
  //   return this.hubConnection?.connectionId;
  // }

  // public registerHandler(
  //   eventName: string,
  //   callback: (...args: any[]) => void
  // ): void {
  //   this.hubConnection?.on(eventName, callback);
  // }

  // =========================================================================================================

  // public startConnection(): Promise<void> {
  //   if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
  //     console.log('Using existing connection:', this.hubConnection.connectionId);
  //     return Promise.resolve();
  //   }

  //   this.hubConnection = new signalR.HubConnectionBuilder()
  //     .withUrl('http://59.94.176.2:3241/STM_SignalR_Hub')
  //     .build();

  //   return this.hubConnection.start()
  //     .then(() => {
  //       console.log('Connection started, ID:', this.hubConnection.connectionId);
  //     })
  //     .catch(err => {
  //       console.error('Error while starting connection:', err);
  //       return Promise.reject(err); 
  //     });
  // }

  // public getConnectionId(): string | null|undefined {
  //   return this.hubConnection?.connectionId;
  // }

  // public registerHandler(eventName: string, method: (...args: any[]) => void): void {
  //   this.hubConnection?.on(eventName, method);
  // }

  // public stopConnection(): Promise<void> {
  //   if (!this.hubConnection) {
  //     return Promise.resolve();
  //   }

  //   return this.hubConnection.stop()
  //     .then(() => console.log('Connection stopped'))
  //     .catch(err => {
  //       console.error('Error while stopping connection:', err);
  //       return Promise.reject(err);
  //     });
  // }

  // ====================================================================================

  public async startConnection(): Promise<void> {
    if (!this.isConnectionActive) {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl('http://59.94.176.2:3241/STM_SignalR_Hub')
        .build();
      try {
        await this.hubConnection.start();
        this.isConnectionActive = true;
        console.log('Connection started, ID:', this.hubConnection.connectionId);

        this.hubConnection.on('AlertAuthentication', (list: any) => {
          console.log('Received device list:', list);
          this.deviceListSubject.next(list);
        });

        this.hubConnection.on('SampleTerminate', (message: string) => {
          console.log(message);
          if(message== localStorage.getItem('connectionId')){
            this.logout()
          }  
        });

      } catch (error) {
        console.error('Error while starting SignalR connection:', error);
        window.location.reload();
      }
    } else {
      console.log('Reusing existing connection, ID:', this.hubConnection.connectionId);

    }
  }

  private logout(){ 
    this.service.logout(localStorage.getItem('connectionId')).subscribe(res=>{
      localStorage.clear();
      this.navigationService.setNavigationViewState(false);
      this.router.navigate(['/login']).then(() => {
         window.location.reload();
       });
    })
  }



  // Method to stop the connection
  public async stopConnection(): Promise<void> {
    if (this.hubConnection && this.isConnectionActive) {
      await this.hubConnection.stop();
      this.isConnectionActive = false;
      console.log('Connection stopped');
    }
  }

  // Getter for the connection ID
  public getConnectionId(): string |null| undefined {
    return this.hubConnection?.connectionId;
  }







  public invokeLoginSignalR(data: any): Promise<any> {
    if (
      this.hubConnection &&
      this.hubConnection.state === signalR.HubConnectionState.Connected
    ) {
      return this.hubConnection
        .invoke('LoginSignalR', data)
        .then((res) => {
          console.log(
            'LoginSignalR method invoked successfully with data:',
            data
          );
          return res;
        })
        .catch((err) => {
          console.error('Error invoking LoginSignalR method:', err);
          throw err;
        });
    } else {
      console.error('Hub connection is not active.');
      return Promise.reject('Hub connection is not active.');
    }
  }
}
