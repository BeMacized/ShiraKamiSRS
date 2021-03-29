import { Component, HostListener, OnInit } from '@angular/core';
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
import { Modal } from '../../../utils/modal';
import { SetEntity } from '../../../models/set.model';
import { SetService } from '../../../services/set.service';
import { SetRepositoryService } from '../../../services/set-repository.service';
import { SetRepositoryIndexSetEntity } from '../../../models/set-repository-index.model';
import { SetRepositoryEntity } from '../../../models/set-repository.model';
import { ServiceError } from '../../../models/service-error.model';
import { OperationStatus } from '../../../models/operation-status.model';
import { minPromiseDuration } from '../../../utils/promise-utils';

export interface SetPreviewModalInput {
    repository: SetRepositoryEntity;
    set: SetRepositoryIndexSetEntity;
}

@Component({
    selector: 'app-set-preview-modal',
    templateUrl: './set-preview-modal.component.html',
    styleUrls: ['./set-preview-modal.component.scss'],
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
export class SetPreviewModalComponent
    extends Modal<SetPreviewModalInput, void>
    implements OnInit {
    constructor(private setRepositoryService: SetRepositoryService) {
        super();
    }

    setDataFetchStatus: OperationStatus = 'IDLE';
    errorMessage: string;
    set: SetEntity;

    ngOnInit(): void {}

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeDown($event) {
        this.close();
    }

    async initModal(data: SetPreviewModalInput | undefined) {
        if (this.setDataFetchStatus === 'IN_PROGRESS') return;
        this.setDataFetchStatus = 'IN_PROGRESS';
        // TODO: RESET TO ''
        this.errorMessage =
            'The set could not be fetched from the repository. Please contact the repository administrator.';
        try {
            this.set = await minPromiseDuration(
                this.setRepositoryService.importSet(
                    data.repository,
                    data.set,
                    true
                ),
                400
            );
            this.setDataFetchStatus = 'SUCCESS';
        } catch (e) {
            this.setDataFetchStatus = 'ERROR';
            switch (e instanceof ServiceError ? e.code : '') {
                case 'SERVICE_UNAVAILABLE':
                    this.errorMessage =
                        'Could not reach the server. Please verify your connection, or try again later.';
                    break;
                case 'SET_DATA_UNFETCHABLE':
                    this.errorMessage =
                        'The set could not be fetched from the repository. Please contact the repository administrator.';
                    break;
                case 'INVALID_IMPORT_DATA':
                    this.errorMessage =
                        'The provided set could not be loaded, as the data it contained was invalid.';
                    break;
                default:
                    console.error(e);
                    this.errorMessage =
                        'An unknown error occurred while trying to load the set.';
            }
        }
    }
}
