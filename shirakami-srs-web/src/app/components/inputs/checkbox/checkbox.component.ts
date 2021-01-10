import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-checkbox',
    templateUrl: './checkbox.component.html',
    styleUrls: ['./checkbox.component.scss'],
})
export class CheckboxComponent implements OnInit {
    @Input() highlighted = false;
    @Input() disabled = false;
    @Input() checked = false;
    @Output()
    checkedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor() {}

    ngOnInit(): void {}

    onCheckChange(value: boolean) {
        const change = value !== this.checked;
        this.checked = value;
        if (change) this.checkedChange.emit(value);
    }

    onLabelClick($event: MouseEvent) {
        $event.stopImmediatePropagation();
    }
}
