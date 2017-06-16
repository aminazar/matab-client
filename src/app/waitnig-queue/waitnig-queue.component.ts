import {Component, OnInit} from '@angular/core';
import {WaitingQueueService} from "../waiting-queue.service";
import {RestService} from "../rest.service";
import {forEach} from "@angular/router/src/utils/collection";
import {isNullOrUndefined} from "util";

@Component({
    selector: 'app-waiting-queue',
    templateUrl: './waiting-queue.component.html',
    styleUrls: ['./waiting-queue.component.css']
})
export class WaitingQueueComponent implements OnInit {

    private drList = [];

    constructor(private safService: WaitingQueueService, private restService: RestService) {

    }

    ngOnInit() {

        this.safService.waitingQueueObservable.subscribe(waitingQueue => {

/*
            for (let key in waitingQueue) {
                this.drList.push(waitingQueue[key]);
            }*/



        });


    }

}
