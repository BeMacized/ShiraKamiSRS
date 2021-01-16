import { Component, Input, OnInit } from '@angular/core';
import { triggerChildren, vshrink } from '../../../utils/animations';

@Component({
    selector: 'app-collapsible',
    templateUrl: './collapsible.component.html',
    styleUrls: ['./collapsible.component.scss'],
    animations: [vshrink(), triggerChildren()],
})
export class CollapsibleComponent implements OnInit {
    @Input()
    public title: string;
    @Input('collapsed')
    public collapsed: boolean;
    @Input('locked')
    public locked: boolean;

    ngOnInit(): void {
        if (this.collapsed === undefined) {
            this.collapsed = true;
        }
    }

    public toggle(): void {
        if (this.locked) return;
        this.collapsed = !this.collapsed;
    }
}
