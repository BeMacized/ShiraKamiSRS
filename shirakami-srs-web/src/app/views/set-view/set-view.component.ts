import { Component, OnInit } from '@angular/core';
import { SetEntity } from '../../models/set.model';
import { SetService } from '../../services/set.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EditSetModesModalComponent } from '../../components/modals/edit-set-modes-modal/edit-set-modes-modal.component';
import { EditSetNameModalComponent } from '../../components/modals/edit-set-name-modal/edit-set-name-modal.component';
import { DeleteSetModalComponent } from '../../components/modals/delete-set-modal/delete-set-modal.component';
import { ModalService } from '../../services/modal.service';
import { vshrink } from '../../utils/animations';

@Component({
    selector: 'app-set-view',
    templateUrl: './set-view.component.html',
    styleUrls: ['./set-view.component.scss'],
    animations: [vshrink()],
})
export class SetViewComponent implements OnInit {
    set: SetEntity;

    constructor(
        private setService: SetService,
        private route: ActivatedRoute,
        private router: Router,
        private modalService: ModalService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe(async (params) => {
            try {
                if (!params.id) {
                    await this.router.navigate(['dashboard']);
                    return;
                }
                this.set = await this.setService.getSet(params.id);
            } catch (e) {
                console.error(e);
                await this.router.navigate(['dashboard']);
            }
        });
    }

    changeSetModes = async (set: SetEntity) => {
        this.set =
            (await this.modalService
                .showModal<EditSetModesModalComponent, SetEntity, SetEntity>(
                    EditSetModesModalComponent,
                    set
                )
                .toPromise()) || this.set;
    };

    renameSet = async (set: SetEntity) => {
        this.set =
            (await this.modalService
                .showModal<EditSetNameModalComponent, SetEntity, SetEntity>(
                    EditSetNameModalComponent,
                    set
                )
                .toPromise()) || this.set;
    };

    deleteSet = async (set: SetEntity) => {
        const deleted = await this.modalService
            .showModal<DeleteSetModalComponent, SetEntity, boolean>(
                DeleteSetModalComponent,
                set
            )
            .toPromise();
        if (deleted) await this.router.navigate(['dashboard']);
    };

    addCard($event: MouseEvent) {}

    createCard() {}
}
