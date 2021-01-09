import { Component, OnInit } from '@angular/core';
import { hshrink } from '../../../utils/animations';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
    animations: [hshrink()],
})
export class LogoComponent implements OnInit {
    hover = false;

    constructor() {}

    ngOnInit(): void {}
}
