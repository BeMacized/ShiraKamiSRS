import { Component, Input, OnInit } from '@angular/core';
import { vshrink } from '../../../utils/animations';
import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { SnackbarService } from '../../../services/snackbar.service';

const fbk = '猫じゃないですよ~';

@Component({
    selector: 'app-logo',
    templateUrl: './logo.component.html',
    styleUrls: ['./logo.component.scss'],
    animations: [vshrink('vshrink', '0.5s ease')],
})
export class LogoComponent implements OnInit {
    hover = false;
    fbkActive = false;
    fbkString: string;

    @Input() type: 'HEADER' | 'BANNER' = 'BANNER';

    constructor() {}

    ngOnInit(): void {}

    fbkActivate(event: MouseEvent) {
        if (event.detail !== 3 || this.fbkActive) return;
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
