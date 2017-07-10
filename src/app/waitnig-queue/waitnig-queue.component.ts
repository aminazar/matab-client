import {Component, OnDestroy, OnInit} from '@angular/core';
import {WaitingQueueService} from "../waiting-queue.service";
import * as _ from 'lodash';
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'app-waiting-queue',
    templateUrl: './waiting-queue.component.html',
    styleUrls: ['./waiting-queue.component.css']
})
export class WaitingQueueComponent implements OnInit, OnDestroy {


    private waitingList;
    private waitingQueueSub: Subscription;

    constructor(private waitingQueueService: WaitingQueueService) {

    }

    ngOnInit() {

        this.waitingQueueSub = this.waitingQueueService.waitingQueue$.subscribe(waitingQueue => {

            this.waitingList = _.sortBy(waitingQueue, 'priority');
            this.waitingList = _.groupBy(this.waitingList, 'doctor');

        });


    }

    ngOnDestroy(): void {
        this.waitingQueueSub.unsubscribe();

    }


}
