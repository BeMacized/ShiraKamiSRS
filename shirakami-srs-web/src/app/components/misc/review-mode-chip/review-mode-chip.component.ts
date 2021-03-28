import { Component, Input, OnInit } from '@angular/core';
import { ReviewMode } from '../../../models/review.model';

@Component({
    selector: 'app-review-mode-chip',
    templateUrl: './review-mode-chip.component.html',
    styleUrls: ['./review-mode-chip.component.scss'],
})
export class ReviewModeChipComponent implements OnInit {
    @Input() mode: ReviewMode;

    constructor() {}

    ngOnInit(): void {}
}
