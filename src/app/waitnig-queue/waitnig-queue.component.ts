import {Component, OnInit} from '@angular/core';
import {SafService} from "../saf.service";

@Component({
    selector: 'app-waitnig-queue',
    templateUrl: './waitnig-queue.component.html',
    styleUrls: ['./waitnig-queue.component.css']
})
export class WaitnigQueueComponent implements OnInit {

    private waitings = {};


    constructor(private safService: SafService) {

    }

    ngOnInit() {

        this.safService.safWaitingReceived.subscribe(safWaitings => {

            this.waitings = safWaitings;

            console.log(this.waitings);


        });


    }

}
