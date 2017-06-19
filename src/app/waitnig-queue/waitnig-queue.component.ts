import {Component, OnInit} from '@angular/core';
import {WaitingQueueService} from "../waiting-queue.service";
import * as _ from 'lodash';

@Component({
    selector: 'app-waiting-queue',
    templateUrl: './waiting-queue.component.html',
    styleUrls: ['./waiting-queue.component.css']
})
export class WaitingQueueComponent implements OnInit {


    waitingList;
    constructor(private waitingQueueService: WaitingQueueService) {

    }

    ngOnInit() {

        this.waitingQueueService.waitingQueueObservable.subscribe(waitingQueue => {

            console.log('next is done => ' , waitingQueue);
            this.waitingList = _.sortBy(waitingQueue , 'priority');
            this.waitingList = _.groupBy(this.waitingList,'doctor');

        });


    }

}
