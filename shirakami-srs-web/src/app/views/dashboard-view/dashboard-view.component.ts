import { Component, OnInit } from '@angular/core';
import { ContextMenuService } from '../../services/context-menu.service';
import { DomComponent } from '../../services/dom.service';
import { ModalService } from '../../services/modal.service';
import { CreateSetModalComponent } from '../../components/modals/create-set-modal/create-set-modal.component';
import { SetEntity } from '../../models/set.model';
import { OperationStatus } from '../../models/operation-status.model';
import { SetService } from '../../services/set.service';
import { minPromiseDuration } from '../../utils/promise-utils';
import { fade, vshrink } from '../../utils/animations';
import { EditSetModesModalComponent } from '../../components/modals/edit-set-modes-modal/edit-set-modes-modal.component';
import { EditSetNameModalComponent } from '../../components/modals/edit-set-name-modal/edit-set-name-modal.component';

@Component({
    selector: 'app-dashboard-view',
    templateUrl: './dashboard-view.component.html',
    styleUrls: ['./dashboard-view.component.scss'],
    animations: [vshrink(), fade()],
})
export class DashboardViewComponent implements OnInit {
    setActionsPopup: DomComponent;
    sets: SetEntity[] = [];
    setsFetchStatus: OperationStatus = 'IDLE';

    constructor(
        private contextMenu: ContextMenuService,
        private modalService: ModalService,
        private setService: SetService
    ) {}

    async ngOnInit() {
        await this.refreshSets();
    }

    async refreshSets() {
        if (this.setsFetchStatus === 'IN_PROGRESS') return;
        this.setsFetchStatus = 'IN_PROGRESS';
        try {
            this.sets = await minPromiseDuration(
                this.setService.getSets(),
                400
            );
            this.setsFetchStatus = 'SUCCESS';
        } catch (e) {
            console.error(e);
            this.setsFetchStatus = 'ERROR';
        }
    }

    openSetActionsModal($event: MouseEvent) {
        if (this.setActionsPopup) {
            this.setActionsPopup.remove();
        } else {
            this.setActionsPopup = this.contextMenu.openMenu(
                {
                    items: [
                        {
                            text: 'Refresh',
                            icon: 'cached',
                            onClick: () => this.refreshSets(),
                        },
                        {
                            text: 'Create Set',
                            icon: 'add',
                            onClick: () => this.createSet(),
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

    createSet = async () => {
        const set = await this.modalService
            .showModal<CreateSetModalComponent>(CreateSetModalComponent)
            .toPromise();
        if (set) await this.refreshSets();
    };

    trackSetBy(index: number, item: SetEntity) {
        return item.id;
    }

    changeSetModes = async (set: SetEntity) => {
        set = await this.modalService
            .showModal<EditSetModesModalComponent, SetEntity, SetEntity>(
                EditSetModesModalComponent,
                set
            )
            .toPromise();
        if (set) await this.refreshSets();
    };

    renameSet = async (set: SetEntity) => {
        set = await this.modalService
            .showModal<EditSetNameModalComponent, SetEntity, SetEntity>(
                EditSetNameModalComponent,
                set
            )
            .toPromise();
        if (set) await this.refreshSets();
    };
}
