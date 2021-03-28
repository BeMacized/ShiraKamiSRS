import { Component, OnInit } from '@angular/core';
import { ReviewMode } from '../../models/review.model';

@Component({
    selector: 'app-set-browse-view',
    templateUrl: './set-browse-view.component.html',
    styleUrls: ['./set-browse-view.component.scss'],
})
export class SetBrowseViewComponent implements OnInit {
    constructor() {}

    ngOnInit(): void {}

    asReviewMode(mode: string) {
        return mode as ReviewMode;
    }
}
