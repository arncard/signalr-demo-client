import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { ChartModel } from '../_interfaces/chartmodel.model';
import { SchedulerEvent } from '@progress/kendo-angular-scheduler';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  // It holds the data fetched from the server  
  public data: SchedulerEvent[] = [];
  public broadcastedData: SchedulerEvent[];

  private hubConnection: signalR.HubConnection;

  
  public dataListChange = new BehaviorSubject<SchedulerEvent[]>(this.data);
  dataListChange$ = this.dataListChange.asObservable();

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:5001/calendar')
    .build();

    this.hubConnection
    .start()
    .then(() => console.log('Connection started'))
    .catch(err => console.log('Error while starting connection: ' + err))
  }

  // subscribe to the transfercalendardata event and accept the 
  // data from the server with the data parameter
  public addTransferCalendarDataListener = () => {
    this.hubConnection.on('transfercalendardata', (data) => {
      this.data = data;
      console.log(this.data);
    })
  }

  public broadcastCalendarData = () => {
    // extract only required properties from the data object
    const data = this.data.map(m => {
      const temp = {
        id: m.id,
        title: m.title,
        start: m.start,
        end: m.end,
        recurrenceRule: m.recurrenceRule
      }
      return temp;
    });
    // send data to the hub endpoint
    this.hubConnection.invoke('broadcastcalendardata', data)
      .catch(err => console.log(err));
  } 

  public addbBroadcastCalendarDataListener = () => {
    this.hubConnection.on('broadcastcalendardata', (data) => 
    {
      this.data = data;
      this.broadcastedData = data;
 
      this.dataListChange.next(this.data);
    })
  }




  // It holds the data fetched from the server  
  // public data: ChartModel[];
  // public broadcastedData: ChartModel[];

  // private hubConnection: signalR.HubConnection;

  // public startConnection = () => {
  //   this.hubConnection = new signalR.HubConnectionBuilder()
  //   .withUrl('https://localhost:5001/calendar')
  //   .build();

  //   this.hubConnection
  //   .start()
  //   .then(() => console.log('Connection started'))
  //   .catch(err => console.log('Error while starting connection: ' + err))
  // }

  // public addTransferCalendarDataListener = () => {
  //   this.hubConnection.on('transfercalendardata', (data) => {
  //     this.data = data;
  //     console.log(this.data);
  //   })
  // }

  // public broadcastCalendarData = () => {
  //   const data = this.data.map(m => {
  //     const temp = {
  //       data: m.data,
  //       label: m.label
  //     }
  //     return temp;
  //   });

  //   this.hubConnection.invoke('broadcastcalendardata', data)
  //     .catch(err => console.log(err));
  // } 

  // public addbBroadcastCalendarDataListener = () => {
  //   this.hubConnection.on('broadcastcalendardata', (data) => 
  //   {
  //     this.broadcastedData = data;
  //   })
  // }
}
