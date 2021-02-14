import { Component, OnInit } from '@angular/core';
import { SetEntity } from '../../models/set.model';
import { SetService } from '../../services/set.service';
import { ActivatedRoute, Router } from '@angular/router';
import { EditSetModesModalComponent } from '../../components/modals/edit-set-modes-modal/edit-set-modes-modal.component';
import { EditSetNameModalComponent } from '../../components/modals/edit-set-name-modal/edit-set-name-modal.component';
import { DeleteSetModalComponent } from '../../components/modals/delete-set-modal/delete-set-modal.component';
import { ModalService } from '../../services/modal.service';
import { fadeUp, vshrink } from '../../utils/animations';
import { CardEntity } from '../../models/card.model';
import {
    CreateEditCardModalComponent,
    CreateEditCardModalInput,
} from '../../components/modals/create-edit-card-modal/create-edit-card-modal.component';
import { map, take } from 'rxjs/operators';
import {
    ConfirmationModalComponent,
    ConfirmationModalInput, ConfirmationModalOutput,
} from '../../components/modals/confirmation-modal/confirmation-modal.component';
import { CardService } from '../../services/card.service';

@Component({
    selector: 'app-set-view',
    templateUrl: './set-view.component.html',
    styleUrls: ['./set-view.component.scss'],
    animations: [vshrink(), fadeUp()],
})
export class SetViewComponent implements OnInit {
    set: SetEntity;

    constructor(
        private setService: SetService,
        private route: ActivatedRoute,
        private router: Router,
        private modalService: ModalService,
        private cardService: CardService
    ) {}

    async ngOnInit() {
        await this.fetchSet();
    }

    fetchSet() {
        return this.route.params
            .pipe(
                map(async (params) => {
                    try {
                        if (!params.id) throw null;
                        this.set =
                            (await this.setService.getSet(params.id)) ||
                            this.set;
                        if (!this.set) throw null;
                    } catch (e) {
                        if (e) console.error(e);
                        await this.router.navigate(['dashboard']);
                    }
                }),
                take(1)
            )
            .toPromise();
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

    createCard = () => {
        this.modalService
            .showModal<
                CreateEditCardModalComponent,
                CreateEditCardModalInput,
                CardEntity
            >(CreateEditCardModalComponent, {
                setId: this.set.id,
            })
            .subscribe(async (card) => {
                if (card) {
                    this.set = {
                        ...this.set,
                        cards: [...this.set.cards, card],
                    };
                    await this.fetchSet();
                }
            });
    };

    trackCardBy(index: number, card: CardEntity) {
        return card.id;
    }

    editCard(card: CardEntity) {
        this.modalService
            .showModal<
                CreateEditCardModalComponent,
                CreateEditCardModalInput,
                CardEntity
            >(CreateEditCardModalComponent, {
                setId: this.set.id,
                card,
            })
            .subscribe(async (c) => {
                if (c) {
                    const cards = this.set.cards.slice();
                    const index = cards.findIndex((_c) => _c.id === c.id);
                    if (index >= 0) {
                        cards.splice(index, 1, c);
                        this.set = {
                            ...this.set,
                            cards,
                        };
                    }
                    await this.fetchSet();
                }
            });
    }

    async removeCard(card: CardEntity) {
        const result = await this.modalService
            .showModal<
                ConfirmationModalComponent,
                ConfirmationModalInput,
                ConfirmationModalOutput
            >(ConfirmationModalComponent, {
                title: 'Delete Card',
                message:
                    'Are you sure you want to delete this card? You will lose all your progress for this card. This cannot be undone.',
                confirmText: 'Delete',
                confirmButtonType: 'btn-caution',
            })
            .toPromise();
        if (!result) return;
        try {
            await this.cardService.deleteCard(card.setId, card.id);
        } catch (e) {
            // TODO: Inform user card deletion failed.
            console.error(e);
            return;
        }
        const cards = this.set.cards.slice();
        const index = cards.findIndex((_c) => _c.id === card.id);
        if (index >= 0) {
            cards.splice(index, 1);
            this.set = {
                ...this.set,
                cards,
            };
        }
        await this.fetchSet();
    }
}
