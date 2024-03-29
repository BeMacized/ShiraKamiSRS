import { Component, OnInit } from '@angular/core';
import { ContextMenuService } from '../../services/context-menu.service';
import { DomComponent } from '../../services/dom.service';
import { ModalService } from '../../services/modal.service';
import { CreateSetModalComponent } from '../../components/modals/create-set-modal/create-set-modal.component';
import { SetEntity, SetSrsStatusEntity } from '../../models/set.model';
import { OperationStatus } from '../../models/operation-status.model';
import { SetService } from '../../services/set.service';
import { minPromiseDuration } from '../../utils/promise-utils';
import { fade, vshrink } from '../../utils/animations';
import { Router } from '@angular/router';
import { SrsService } from '../../services/srs.service';
import { ReviewEntity } from '../../models/review.model';
import { ReviewService } from '../../services/review.service';
import moment from 'moment';
import { ImportSetModalComponent } from '../../components/modals/import-set-modal/import-set-modal.component';

@Component({
    selector: 'app-dashboard-view',
    templateUrl: './dashboard-view.component.html',
    styleUrls: ['./dashboard-view.component.scss'],
    animations: [vshrink(), fade()],
})
export class DashboardViewComponent implements OnInit {
    setActionsPopup: DomComponent;
    refreshStatus: OperationStatus = 'IDLE';

    sets: SetEntity[] = [];
    reviews: ReviewEntity[] = [];
    srsStatus: SetSrsStatusEntity = { lessons: 0, reviews: 0, levelItems: {} };

    constructor(
        private contextMenu: ContextMenuService,
        private modalService: ModalService,
        private setService: SetService,
        private router: Router,
        private reviewService: ReviewService,
        public srsService: SrsService
    ) {}

    async ngOnInit() {
        await this.refreshData();
    }

    refreshData = async () => {
        // Only do one refresh simultaneously
        if (this.refreshStatus === 'IN_PROGRESS') return;
        this.refreshStatus = 'IN_PROGRESS';
        try {
            // Determine the timespan to fetch reviews for
            const reviewTimespan = Math.abs(
                moment()
                    .add(1, 'week')
                    .add(1, 'day')
                    .startOf('day')
                    .diff(moment(), 'seconds')
            );
            // Fetch sets and reviews
            await minPromiseDuration(
                Promise.all([
                    this.setService
                        .getSets()
                        .then((sets) => (this.sets = sets)),
                    this.reviewService
                        .getAvailableReviews({ timespan: reviewTimespan })
                        .then((reviews) => (this.reviews = reviews)),
                ]),
                400
            );
            // Determine the global srs status
            this.srsStatus = this.sets.reduce(
                (acc, e) => {
                    acc.lessons += e.srsStatus.lessons;
                    acc.reviews += e.srsStatus.reviews;
                    for (const entry of Object.entries(
                        e.srsStatus.levelItems
                    )) {
                        acc.levelItems[entry[0]] =
                            (acc.levelItems[entry[0]] || 0) + entry[1];
                    }
                    return acc;
                },
                {
                    lessons: 0,
                    reviews: 0,
                    levelItems: {},
                }
            );
            this.refreshStatus = 'SUCCESS';
        } catch (e) {
            console.error(e);
            this.refreshStatus = 'ERROR';
        }
    };

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
                            onClick: this.refreshData,
                        },
                        {
                            text: 'Create Set',
                            icon: 'add',
                            onClick: this.createSet,
                        },
                        {
                            text: 'Import Set',
                            icon: 'file_upload',
                            onClick: this.importSet,
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
            .showModal<CreateSetModalComponent, void, SetEntity>(
                CreateSetModalComponent
            )
            .toPromise();
        if (set) await this.router.navigate(['set', set.id]);
    };

    importSet = async () => {
        const set = await this.modalService
            .showModal<ImportSetModalComponent, void, SetEntity>(
                ImportSetModalComponent
            )
            .toPromise();
        if (set) await this.router.navigate(['set', set.id]);
    };

    trackSetBy(index: number, item: SetEntity) {
        return item.id;
    }

    updatedSet = async (updatedSet: SetEntity) => {
        const index = this.sets.findIndex(
            (s) => updatedSet && s.id === updatedSet.id
        );
        if (index >= 0) this.sets.splice(index, 1, updatedSet);
        await this.refreshData();
    };

    removedSet = async (set: SetEntity) => {
        const index = this.sets.findIndex((s) => set && s.id === set.id);
        if (index >= 0) this.sets.splice(index, 1);
        await this.refreshData();
    };
}
