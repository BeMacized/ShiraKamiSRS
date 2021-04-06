import { Component, HostBinding, Input, OnInit } from '@angular/core';
import { Snackbar } from '../../../services/snackbar.service';

@Component({
    selector: 'app-snackbar',
    templateUrl: './snackbar.component.html',
    styleUrls: ['./snackbar.component.scss'],
    animations: [],
})
export class SnackbarComponent implements OnInit {
    @Input() snackbar: Snackbar;
    barTransitionDuration = '0';
    barWidth = '0';

    constructor() {}

    ngOnInit(): void {
        if (this.snackbar.options.timeout) {
            this.startBar(this.snackbar.options.timeout);
            setTimeout(
                () => this.snackbar.dismiss(),
                this.snackbar.options.timeout
            );
        }
    }

    onTap() {
        if (this.snackbar?.options.tapToDismiss) this.snackbar.dismiss();
    }

    startBar(totalTime: number) {
        this.barTransitionDuration = '0';
        this.barWidth = '0';
        requestAnimationFrame(() => {
            this.barTransitionDuration = totalTime + 'ms';
            this.barWidth = '100%';
        });
    }
}
