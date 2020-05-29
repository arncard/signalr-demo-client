import { Component, OnInit } from '@angular/core';
import { SignalRService } from './services/signal-r.service';
import { HttpClient } from '@angular/common/http';
import { SchedulerEvent, CreateFormGroupArgs } from '@progress/kendo-angular-scheduler';
import { sampleData, displayDate } from './events-utc';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public selectedDate: Date = new Date('2018-10-22T00:00:00');
    public formGroup: FormGroup;
    public events: SchedulerEvent[] = [{
        id: 1,
        title: 'Breakfast',
        start: new Date('2018-10-22T09:00:00'),
        end: new Date('2018-10-22T09:30:00'),
        recurrenceRule: 'FREQ=DAILY;COUNT=5;'
    }];

    constructor(public signalRService: SignalRService, private http: HttpClient, 
                private formBuilder: FormBuilder) {
        this.createFormGroup = this.createFormGroup.bind(this);
    }

    ngOnInit()
    {
      this.signalRService.startConnection();
      this.signalRService.addTransferCalendarDataListener();
      this.signalRService.addbBroadcastCalendarDataListener();
      this.startHttpRequest();
    }
    
    public createFormGroup(args: CreateFormGroupArgs): FormGroup {
        const dataItem = args.dataItem;

        this.formGroup = this.formBuilder.group({
            'id': args.isNew ? this.getNextId() : dataItem.id,
            'start': [dataItem.start, Validators.required],
            'end': [dataItem.end, Validators.required],
            'startTimezone': [dataItem.startTimezone],
            'endTimezone': [dataItem.endTimezone],
            'isAllDay': dataItem.isAllDay,
            'title': dataItem.title,
            'description': dataItem.description,
            'recurrenceRule': dataItem.recurrenceRule,
            'recurrenceId': dataItem.recurrenceId
        }, {
            validator: this.startEndValidator
        });

        return this.formGroup;
    }

    public getNextId(): number {
        const len = this.events.length;

        return (len === 0) ? 1 : this.events[this.events.length - 1].id + 1;
    }

    public startEndValidator: ValidatorFn = (fg: FormGroup) => {
        const start = fg.get('start').value;
        const end = fg.get('end').value;

        if (start !== null && end !== null && start.getTime() < end.getTime()) {
            return null;
        } else {
            return { range: 'End date must be greater than Start date' };
        }
    }


    
  private startHttpRequest = () => {
    this.http.get('https://localhost:5001/api/calendar')
      .subscribe(res => {
        console.log(res);
      })
  }



  
  // public chartOptions: any = {
  //   scaleShowVerticalLines: true,
  //   responsive: true,
  //   scales: {
  //     yAxes: [{
  //       ticks: {
  //         beginAtZero: true
  //       }
  //     }]
  //   }
  // }
  // public chartLabels: string[] = ['Real time data for the chart'];
  // public chartType: string = 'bar';
  // public chartLegend: boolean = true;
  // public colors: any[] = [  
  //   { backgroundColor: '#5491DA' }, 
  //   { backgroundColor: '#E74C3C' },
  //   { backgroundColor: '#82E0AA' }, 
  //   { backgroundColor: '#E5E7E9' }]

  //constructor(public signalRService: SignalRService, private http: HttpClient) { }

  // ngOnInit()
  // {
  //   this.signalRService.startConnection();
  //   this.signalRService.addTransferCalendarDataListener();
  //   this.signalRService.addbBroadcastCalendarDataListener();
  //   this.startHttpRequest();
  // }

  // private startHttpRequest = () => {
  //   this.http.get('https://localhost:5001/api/calendar')
  //     .subscribe(res => {
  //       console.log(res);
  //     })
  // }

  // public chartClicked = (event) => {
  //   console.log(event);
  //   this.signalRService.broadcastCalendarData();
  // }
}
