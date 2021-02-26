import { Component, HostListener, OnInit } from '@angular/core';
import { SetEntity } from '../../../models/set.model';
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
import { SetService } from '../../../services/set.service';
import {ReviewMode} from '../../../models/review.model';
import { Modal } from '../../../utils/modal';

type Page = 'MODES' | 'UPDATING';

@Component({
    selector: 'app-edit-set-modes-modal',
    templateUrl: './edit-set-modes-modal.component.html',
    styleUrls: ['./edit-set-modes-modal.component.scss'],
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
export class EditSetModesModalComponent
    extends Modal<SetEntity, SetEntity>
    implements OnInit {
    constructor(private setService: SetService) {
        super();
    }
    page: Page = 'MODES';
    modes: ReviewMode[] = ['jpToEn'];
    updateStatus: OperationStatus = 'IDLE';
    errorMessage: string;
    set: SetEntity;

    ngOnInit(): void {}

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeDown($event) {
        this.close();
    }

    initModal(data: SetEntity | undefined) {
        if (!data) {
            console.warn(
                'Attempted to open EditSetModesModal without providing an existing set'
            );
            this.close();
            return;
        }
        this.set = data;
        this.modes = this.set.modes.slice();
    }

    toggleMode(mode: ReviewMode) {
        if (this.modes.includes(mode))
            this.modes = this.modes.filter((m) => m !== mode);
        else this.modes.push(mode);
    }

    async updateSet() {
        if (this.updateStatus === 'IN_PROGRESS') return;
        this.updateStatus = 'IN_PROGRESS';
        this.page = 'UPDATING';
        this.errorMessage = null;
        try {
            const set = await minPromiseDuration(
                this.setService.updateSetModes(this.set.id, this.modes),
                500
            );
            this.updateStatus = 'SUCCESS';
            setTimeout(() => {
                this.emit(set);
                this.close();
            }, 1000);
        } catch (e) {
            this.updateStatus = 'ERROR';
            switch (e instanceof ServiceError ? e.code : '') {
                case 'SERVICE_UNAVAILABLE':
                    this.errorMessage =
                        'Could not reach the server. Please verify your connection, or try again later.';
                    break;
                default:
                    console.error(e);
                    this.errorMessage =
                        'An unknown error occurred while trying to update the set.';
            }
        }
    }
}
