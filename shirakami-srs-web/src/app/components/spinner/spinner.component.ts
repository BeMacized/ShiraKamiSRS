import { Component, Input, OnInit } from '@angular/core';

export type SpinnerSize = 'SMALL' | 'NORMAL' | 'LARGE';

@Component({
    selector: 'app-spinner',
    templateUrl: './spinner.component.html',
    styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent implements OnInit {
    svgSize: number;
    c: number;
    r: number;
    strokeWidth: number;
    dashOffset: number;

    @Input() set size(value: SpinnerSize) {
        switch (value) {
            case 'SMALL':
                this.svgSize = 21;
                this.strokeWidth = 3;
                break;
            case 'NORMAL':
                this.svgSize = 49;
                this.strokeWidth = 6;
                break;
            case 'LARGE':
                this.svgSize = 97;
                this.strokeWidth = 8;
                break;
        }
        this.c = Math.ceil(this.svgSize / 2);
        this.r = Math.ceil(this.svgSize / 2 - this.strokeWidth / 2);
        this.dashOffset = 2 * Math.PI * this.r;
        console.log(this);
    }

    constructor() {
        // this.size = 'NORMAL';
    }

    ngOnInit(): void {}
}
