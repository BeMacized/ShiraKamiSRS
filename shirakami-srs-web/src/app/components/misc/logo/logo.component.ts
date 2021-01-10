import { Component, OnInit } from '@angular/core';
import { hshrink, vshrink } from '../../../utils/animations';
import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';

const fbk = '猫じゃないですよ~';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
    animations: [
        vshrink('vshrink', '0.5s ease'),
        trigger('logo', [
            state(
                '*',
                style({
                    width: 0,
                    'margin-left': 0,
                    'margin-right': 0,
                    'padding-left': 0,
                    'padding-right': 0,
                })
            ),
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
        trigger('logoInv', [
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
    fbkActive = false;
    fbkString: string;

    constructor() {}

    ngOnInit(): void {}

    fbkActivate() {
        if (this.fbkActive) return;
        this.fbkActive = true;
        let totalDelay = 0;
        this.fbkString = '⠀';
        for (let i = 0; i < fbk.length; i++) {
            const delay = Math.random() * 150 + 25;
            totalDelay += delay;
            setTimeout(
                () => (this.fbkString = fbk.substring(0, i + 1)),
                totalDelay
            );
        }
        setTimeout(() => (this.fbkActive = false), totalDelay + 5000);
    }
}
