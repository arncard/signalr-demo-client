import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { SignalRService } from './services/signal-r.service';
import { HttpClient } from '@angular/common/http';
import { SchedulerEvent, CreateFormGroupArgs, SaveEvent, EditMode, SchedulerComponent } from '@progress/kendo-angular-scheduler';
import { sampleData, displayDate } from './events-utc';
import { FormGroup, FormBuilder, Validators, ValidatorFn } from '@angular/forms';
import { EditService } from './edit.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public selectedDate: Date = new Date('2020-06-01T00:00:00');
    public formGroup: FormGroup;
    public events: SchedulerEvent[] = [{
        id: 1,
        title: 'Breakfast',
        start: new Date('2020-06-01T09:00:00'),
        end: new Date('2020-06-01T09:30:00'),
        recurrenceRule: 'FREQ=DAILY;COUNT=5;'
    }];

    constructor(public signalRService: SignalRService, private http: HttpClient, 
                private formBuilder: FormBuilder, public editService: EditService,
                private cd: ChangeDetectorRef) {
        this.createFormGroup = this.createFormGroup.bind(this);
    }

    ngOnInit()
    {
      this.signalRService.data = this.events;
      this.signalRService.startConnection();
      this.signalRService.addTransferCalendarDataListener();
      this.signalRService.addbBroadcastCalendarDataListener();
      this.signalRService.dataListChange$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((dataList: SchedulerEvent[]) => {
        this.updateData(dataList);
      });
      this.startHttpRequest();
    }
    
    private startHttpRequest = () => {
      this.http.get('https://localhost:5001/api/calendar')
        .subscribe(res => {
          console.log(res);
        })
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

    public saveHandler({ sender, formGroup, isNew, dataItem, mode }: SaveEvent): void {
      if (formGroup.valid) {
          const formValue = formGroup.value;
         
          this.signalRService.data.push(<SchedulerEvent> {
            id: formGroup.value.id,
            start: formGroup.value.start,
            end: formGroup.value.end,
            title: formGroup.value.title});
        
          if (isNew) {
              this.editService.create(formValue);
          } else {
              this.handleUpdate(dataItem, formValue, mode);
          }
          this.signalRService.broadcastCalendarData();   
          this.closeEditor(sender);
      }
   }

   public updateData(list: SchedulerEvent[])
   { 
     this.editService.read();
     this.cd.detectChanges();
   }

   private closeEditor(scheduler: SchedulerComponent): void {
      scheduler.closeEvent();

      this.formGroup = undefined;
  }

  private handleUpdate(item: any, value: any, mode?: EditMode): void {
    const service = this.editService;
    if (mode === EditMode.Occurrence) {
        if (service.isException(item)) {
            service.update(item, value);
        } else {
            service.createException(item, value);
        }
    } else {
        // The item is non-recurring or we are editing the entire series.
        service.update(item, value);
    }
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
