import {Component, OnInit} from '@angular/core';
import {SafService} from "../saf.service";
import {RestService} from "../rest.service";
import {forEach} from "@angular/router/src/utils/collection";
import {isNullOrUndefined} from "util";

@Component({
    selector: 'app-waitnig-queue',
    templateUrl: './waitnig-queue.component.html',
    styleUrls: ['./waitnig-queue.component.css']
})
export class WaitnigQueueComponent implements OnInit {

    private drWaitingLists = [];

    constructor(private safService: SafService, private restService: RestService) {

    }

    ngOnInit() {

        this.safService.safWaitingReceived.subscribe(safWaiting => {


            for (let key in safWaiting) {
                this.drWaitingLists.push(safWaiting[key]);
            }

            console.log(this.drWaitingLists);


            this.restService.get('active-visits').subscribe(
                data => {



                    data.forEach(d => {

                        this.drWaitingLists.forEach( drWaiting => {

                            if (drWaiting.length > 0 && drWaiting[0].did === d.did){

                                drWaiting.underVisit = d.firstname + " " + d.surname;

                            }


                        });


                    });

                }


            );






        });


    }

}
