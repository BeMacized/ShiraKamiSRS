import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SetEntity } from '../../../models/set.model';
import { ContextMenuService } from '../../../services/context-menu.service';
import { DomComponent } from '../../../services/dom.service';
import { Router } from '@angular/router';
import { SrsService } from '../../../services/srs.service';

export interface CardSetCardConfig {
    showManageAction: boolean;
}

const defaultConfig: CardSetCardConfig = {
    showManageAction: true,
};

@Component({
    selector: 'app-card-set-card',
    templateUrl: './card-set-card.component.html',
    styleUrls: ['./card-set-card.component.scss'],
})
export class CardSetCardComponent implements OnInit {
    @Input()
    set: SetEntity;

    config: CardSetCardConfig = defaultConfig;
    @Input('config')
    set setConfig(config: Partial<CardSetCardConfig>) {
        this.config = { ...defaultConfig, ...config };
    }

    setActionsPopup: DomComponent;

    @Output()
    changeModes: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    rename: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    delete: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private contextMenu: ContextMenuService,
        private router: Router,
        public srsService: SrsService
    ) {}

    ngOnInit(): void {}

    openSetActionsModal($event: MouseEvent) {
        if (this.setActionsPopup) {
            this.setActionsPopup.remove();
        } else {
            this.setActionsPopup = this.contextMenu.openMenu(
                {
                    items: [
                        this.config.showManageAction
                            ? {
                                  text: 'Manage Cards',
                                  icon: 'text_snippet',
                                  onClick: () =>
                                      this.router.navigate([
                                          'set',
                                          this.set.id,
                                      ]),
                              }
                            : null,
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
                        {
                            text: 'Remove',
                            icon: 'delete_forever',
                            onClick: () => this.delete.emit(),
                        },
                    ].filter((i) => !!i),
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
