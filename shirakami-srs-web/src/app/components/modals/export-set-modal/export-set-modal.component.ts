import { Component, HostListener, OnInit } from '@angular/core';
import { Modal } from '../../../utils/modal';
import { SetEntity } from '../../../models/set.model';
import { SetService } from '../../../services/set.service';
import {
    crossFade,
    fade,
    fadeUp,
    hshrink,
    modalPage,
    triggerChildren,
    vshrink,
} from '../../../utils/animations';
import { smoothHeight } from '../../../directives/smooth-height.directive';
import { OperationStatus } from '../../../models/operation-status.model';
import { minPromiseDuration } from '../../../utils/promise-utils';
import { ServiceError } from '../../../models/service-error.model';

type Page = 'CONFIG' | 'EXPORTING';

@Component({
    selector: 'app-export-set-modal',
    templateUrl: './export-set-modal.component.html',
    styleUrls: ['./export-set-modal.component.scss'],
    animations: [
        triggerChildren('triggerModal', '@modal'),
        fade('bg', '0.4s ease'),
        fadeUp('modal', '0.4s ease'),
        smoothHeight('smoothHeight', '.4s ease'),
        modalPage('modalPage', '.4s ease'),
        vshrink(),
        crossFade(),
        hshrink(),
    ],
})
export class ExportSetModalComponent
    extends Modal<SetEntity>
    implements OnInit {
    set: SetEntity;
    page: Page = 'CONFIG';
    exportStatus: OperationStatus = 'IDLE';
    errorMessage: string;
    includeReviews = false;

    constructor(private setService: SetService) {
        super();
    }

    ngOnInit(): void {}

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeDown($event) {
        this.close();
    }

    initModal(data: SetEntity | undefined) {
        if (!data) {
            console.warn(
                'Attempted to open ExportSetModal without providing an existing set'
            );
            this.close();
            return;
        }
        this.set = data;
    }

    async exportSet() {
        if (this.exportStatus === 'IN_PROGRESS') return;
        this.exportStatus = 'IN_PROGRESS';
        this.page = 'EXPORTING';
        this.errorMessage = null;
        try {
            await minPromiseDuration(
                this.setService.exportSet(
                    this.set.id,
                    this.set.name,
                    this.includeReviews
                ),
                500
            );
            this.exportStatus = 'SUCCESS';
            setTimeout(() => {
                this.close();
            }, 1500);
        } catch (e) {
            this.exportStatus = 'ERROR';
            switch (e instanceof ServiceError ? e.code : '') {
                case 'SERVICE_UNAVAILABLE':
                    this.errorMessage =
                        'Could not reach the server. Please verify your connection, or try again later.';
                    break;
                default:
                    console.error(e);
                    this.errorMessage =
                        'An unknown error occurred while trying to export the set.';
            }
        }
    }
}
