import { Component, OnInit } from '@angular/core';
import { hshrink } from '../../../utils/animations';
import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
    animations: [
        trigger('logo', [
            state(
                'hidden',
                style({
                    width: 0,
                    'margin-left': 0,
                    'margin-right': 0,
                    'padding-left': 0,
                    'padding-right': 0,
                })
            ),
            state('shown', style({})),
            transition('hidden => shown', [animate('0.15s ease')]),
            transition('shown => hidden', [animate('0.15s ease')]),
        ]),
    ],
})
export class LogoComponent implements OnInit {
    hover = false;

    constructor() {}

    ngOnInit(): void {}
}
