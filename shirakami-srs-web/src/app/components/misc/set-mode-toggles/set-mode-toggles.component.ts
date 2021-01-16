import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { vshrink } from '../../../utils/animations';
import {ReviewMode} from '../../../models/review.model';

@Component({
    selector: 'app-set-mode-toggles',
    templateUrl: './set-mode-toggles.component.html',
    styleUrls: ['./set-mode-toggles.component.scss'],
    animations: [vshrink()],
})
export class SetModeTogglesComponent implements OnInit {
    @Input()
    modes: ReviewMode[] = ['jpToEn'];

    @Output()
    modesChange: EventEmitter<ReviewMode[]> = new EventEmitter<ReviewMode[]>();

    constructor() {}

    ngOnInit(): void {}

    toggleMode(mode: ReviewMode) {
        if (this.modes.includes(mode))
            this.modes = this.modes.filter((m) => m !== mode);
        else this.modes.push(mode);
        this.modesChange.emit(this.modes.slice());
    }

    get valid() {
        return !!this.modes?.length;
    }
}
