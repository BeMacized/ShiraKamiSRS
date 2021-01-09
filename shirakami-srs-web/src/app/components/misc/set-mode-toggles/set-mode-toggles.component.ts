import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SetMode } from '../../../models/set.model';
import { vshrink } from '../../../utils/animations';

@Component({
    selector: 'app-set-mode-toggles',
    templateUrl: './set-mode-toggles.component.html',
    styleUrls: ['./set-mode-toggles.component.scss'],
    animations: [vshrink()],
})
export class SetModeTogglesComponent implements OnInit {
    @Input()
    modes: SetMode[] = ['jpToEn'];

    @Output()
    modesChange: EventEmitter<SetMode[]> = new EventEmitter<SetMode[]>();

    constructor() {}

    ngOnInit(): void {}

    toggleMode(mode: SetMode) {
        if (this.modes.includes(mode))
            this.modes = this.modes.filter((m) => m !== mode);
        else this.modes.push(mode);
        this.modesChange.emit(this.modes.slice());
    }

    get valid() {
        return !!this.modes?.length;
    }
}
