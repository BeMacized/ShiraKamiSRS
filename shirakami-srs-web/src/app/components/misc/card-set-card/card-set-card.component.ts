import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SetEntity } from '../../../models/set.model';
import { ContextMenuService } from '../../../services/context-menu.service';
import { DomComponent } from '../../../services/dom.service';
import { Router } from '@angular/router';
import { SrsService } from '../../../services/srs.service';
import { EditSetNameModalComponent } from '../../modals/edit-set-name-modal/edit-set-name-modal.component';
import { ModalService } from '../../../services/modal.service';
import { EditSetModesModalComponent } from '../../modals/edit-set-modes-modal/edit-set-modes-modal.component';
import { DeleteSetModalComponent } from '../../modals/delete-set-modal/delete-set-modal.component';
import { ExportSetModalComponent } from '../../modals/export-set-modal/export-set-modal.component';

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
    changedModes: EventEmitter<SetEntity> = new EventEmitter<SetEntity>();

    @Output()
    removed: EventEmitter<void> = new EventEmitter<void>();

    @Output()
    renamed: EventEmitter<SetEntity> = new EventEmitter<SetEntity>();

    @Output()
    exported: EventEmitter<void> = new EventEmitter<void>();

    constructor(
        private contextMenu: ContextMenuService,
        private router: Router,
        private modalService: ModalService,
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
                            onClick: this.rename,
                        },
                        {
                            text: 'Change Modes',
                            icon: 'edit',
                            onClick: this.changeModes,
                        },
                        {
                            text: 'Remove',
                            icon: 'delete_forever',
                            onClick: this.remove,
                        },
                        {
                            text: 'Export as File',
                            icon: 'file_download',
                            onClick: this.exportFile,
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

    rename = async () => {
        const set = await this.modalService
            .showModal<EditSetNameModalComponent, SetEntity, SetEntity>(
                EditSetNameModalComponent,
                this.set
            )
            .toPromise();
        if (set) {
            this.set = set;
            this.renamed.emit(set);
        }
    };
    changeModes = async () => {
        const set = await this.modalService
            .showModal<EditSetModesModalComponent, SetEntity, SetEntity>(
                EditSetModesModalComponent,
                this.set
            )
            .toPromise();
        if (set) {
            this.set = set;
            this.changedModes.emit(set);
        }
    };
    remove = async () => {
        const removed = await this.modalService
            .showModal<DeleteSetModalComponent, SetEntity, boolean>(
                DeleteSetModalComponent,
                this.set
            )
            .toPromise();
        if (removed) this.removed.emit();
    };
    exportFile = async () => {
        const exported = await this.modalService
            .showModal<ExportSetModalComponent, SetEntity, boolean>(
                ExportSetModalComponent,
                this.set
            )
            .toPromise();
        if (exported) this.exported.emit();
    };
}
