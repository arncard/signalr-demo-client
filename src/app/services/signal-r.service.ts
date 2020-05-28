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
    .withUrl('https://localhost:5001/chart')
    .build();

    this.hubConnection
    .start()
    .then(() => console.log('Connection started'))
    .catch(err => console.log('Error while starting connection: ' + err))
  }

  public addTransferChartDataListener = () => {
    this.hubConnection.on('transferchartdata', (data) => {
      this.data = data;
      console.log(this.data);
    })
  }

  public broadcastChartData = () => {
    const data = this.data.map(m => {
      const temp = {
        data: m.data,
        label: m.label
      }
      return temp;
    });

    this.hubConnection.invoke('broadcastchartdata', data)
      .catch(err => console.log(err));
  } 

  public addbBroadcastChartDataListener = () => {
    this.hubConnection.on('broadcastchartdata', (data) => 
    {
      this.broadcastedData = data;
    })
  }
}
