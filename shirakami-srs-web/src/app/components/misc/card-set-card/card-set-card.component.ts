import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SetEntity } from '../../../models/set.model';
import { ContextMenu } from '../generic-context-menu/generic-context-menu.component';
import { ContextMenuService } from '../../../services/context-menu.service';
import { DomComponent } from '../../../services/dom.service';
import { CreateSetModalComponent } from '../../modals/create-set-modal/create-set-modal.component';

@Component({
    selector: 'app-card-set-card',
    templateUrl: './card-set-card.component.html',
    styleUrls: ['./card-set-card.component.scss'],
})
export class CardSetCardComponent implements OnInit {
    @Input()
    set: SetEntity;

    setActionsPopup: DomComponent;

    @Output()
    changeModes: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    rename: EventEmitter<void> = new EventEmitter<void>();

    constructor(private contextMenu: ContextMenuService) {}

    ngOnInit(): void {}

    openSetActionsModal($event: MouseEvent) {
        if (this.setActionsPopup) {
            this.setActionsPopup.remove();
        } else {
            this.setActionsPopup = this.contextMenu.openMenu(
                {
                    items: [
                        {
                            text: 'Rename',
                            icon: 'text_format',
                            onClick: () => this.rename.emit(),
                        },
                        {
                            text: 'Change Modes',
                            icon: 'edit',
                            onClick: () => this.changeModes.emit(),
                        },
                    ],
                },
                $event
            );
            this.setActionsPopup.on(
                'remove',
                () => (this.setActionsPopup = null)
            );
        }
    }
}
