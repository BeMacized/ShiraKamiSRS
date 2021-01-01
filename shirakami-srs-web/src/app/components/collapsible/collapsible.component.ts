import { Component, Input, OnInit } from '@angular/core';
import { triggerChildren, vshrink } from '../../utils/animations';

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
    public isCollapsed: boolean;

    ngOnInit(): void {
        if (this.isCollapsed === undefined) {
            this.isCollapsed = true;
        }
    }

    public toggle(): void {
        this.isCollapsed = !this.isCollapsed;
    }

}
