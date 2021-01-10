import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Modal } from '../../../services/modal.service';
import { SetEntity, SetMode } from '../../../models/set.model';
import {
    crossFade,
    fade,
    fadeLeft,
    fadeUp, hshrink,
    modalPage,
    triggerChildren,
    vshrink,
} from '../../../utils/animations';
import { smoothHeight } from '../../../directives/smooth-height.directive';
import { SetService } from '../../../services/set.service';
import { OperationStatus } from '../../../models/operation-status.model';
import { HttpErrorResponse } from '@angular/common/http';
import { ServiceError } from '../../../models/service-error.model';
import { minPromiseDuration } from '../../../utils/promise-utils';

type Page = 'NAME' | 'MODES' | 'CREATING';

@Component({
    selector: 'app-create-set-modal',
    templateUrl: './create-set-modal.component.html',
    styleUrls: ['./create-set-modal.component.scss'],
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
export class CreateSetModalComponent
    extends Modal<void, SetEntity>
    implements OnInit {
    page: Page = 'NAME';
    setName = '';
    modes: SetMode[] = ['jpToEn'];
    creationStatus: OperationStatus = 'IDLE';
    errorMessage: string;

    constructor(private setService: SetService) {
        super();
    }

    get isSetNameValid() {
        return (
            this.setName &&
            this.setName.trim().length > 0 &&
            this.setName.trim().length <= 128
        );
    }



    @ViewChild('nameInput') nameInput: ElementRef;

    ngOnInit(): void {
        this.goToPage('NAME');
    }

    initModal(data: void | undefined) {}

    goToPage(page: Page) {
        setTimeout(() => {
            this.page = page;
            switch (page) {
                case 'NAME':
                    setTimeout(() => this.nameInput.nativeElement.focus(), 400);
                    break;
            }
        });
    }

    async createSet() {
        if (this.creationStatus === 'IN_PROGRESS') return;
        this.creationStatus = 'IN_PROGRESS';
        this.page = 'CREATING';
        this.errorMessage = null;
        try {
            const set = await minPromiseDuration(this.setService.createSet(
                this.setName.trim(),
                this.modes
            ), 500);
            this.creationStatus = 'SUCCESS';
            setTimeout(() => {
                this.emit(set);
                this.close();
            }, 1000);
        } catch (e) {
            this.creationStatus = 'ERROR';
            switch (e instanceof ServiceError ? e.code : '') {
                case 'SERVICE_UNAVAILABLE':
                    this.errorMessage =
                        'Could not reach the server. Please verify your connection, or try again later.';
                    break;
                default:
                    this.errorMessage =
                        'An unknown error occurred while trying to create the set.';
            }
        }
    }
}
