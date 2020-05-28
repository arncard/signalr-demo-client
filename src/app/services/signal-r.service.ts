import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { ChartModel } from '../_interfaces/chartmodel.model';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  // It holds the data fetched from the server  
  public data: ChartModel[];
  public broadcastedData: ChartModel[];

  private hubConnection: signalR.HubConnection;

  public startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl('https://localhost:5001/calendar')
    .build();

    this.hubConnection
    .start()
    .then(() => console.log('Connection started'))
    .catch(err => console.log('Error while starting connection: ' + err))
  }

  public addTransferCalendarDataListener = () => {
    this.hubConnection.on('transfercalendardata', (data) => {
      this.data = data;
      console.log(this.data);
    })
  }

  public broadcastCalendarData = () => {
    const data = this.data.map(m => {
      const temp = {
        data: m.data,
        label: m.label
      }
      return temp;
    });

    this.hubConnection.invoke('broadcastcalendardata', data)
      .catch(err => console.log(err));
  } 

  public addbBroadcastCalendarDataListener = () => {
    this.hubConnection.on('broadcastcalendardata', (data) => 
    {
      this.broadcastedData = data;
    })
  }
}
