import { Component, HostListener, OnInit } from '@angular/core';
import { OperationStatus } from '../../../models/operation-status.model';
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
import { minPromiseDuration } from '../../../utils/promise-utils';
import { ServiceError } from '../../../models/service-error.model';

type Page = 'CONFIG' | 'IMPORTING';

@Component({
    selector: 'app-import-set-modal',
    templateUrl: './import-set-modal.component.html',
    styleUrls: ['./import-set-modal.component.scss'],
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
export class ImportSetModalComponent
    extends Modal<void, SetEntity>
    implements OnInit {
    set: SetEntity;
    page: Page = 'CONFIG';
    importErrorMessage: string;
    fileErrorMessage: string;
    importStatus: OperationStatus = 'IDLE';
    includeReviews = false;
    file: File;
    fileData: any;
    shakeFileInput = false;

    constructor(private setService: SetService) {
        super();
    }

    ngOnInit(): void {}

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeDown($event) {
        this.close();
    }

    initModal(data: void | undefined) {}

    importSet = async () => {
        if (this.importStatus === 'IN_PROGRESS') return;
        this.importStatus = 'IN_PROGRESS';
        this.page = 'IMPORTING';
        this.importErrorMessage = null;
        try {
            this.set = await minPromiseDuration(
                this.setService.importSet(this.fileData, this.includeReviews),
                500
            );
            this.importStatus = 'SUCCESS';
            setTimeout(() => {
                this.emit(this.set);
                this.close();
            }, 1500);
        } catch (e) {
            this.importStatus = 'ERROR';
            switch (e instanceof ServiceError ? e.code : '') {
                case 'SERVICE_UNAVAILABLE':
                    this.importErrorMessage =
                        'Could not reach the server. Please verify your connection, or try again later.';
                    break;
                case 'INVALID_IMPORT_DATA':
                    this.importErrorMessage =
                        'The provided file could not be imported, either due to the file not being valid, or due to the current version of this application not supporting it.';
                    break;
                default:
                    console.error(e);
                    this.importErrorMessage =
                        'An unknown error occurred while trying to import the set.';
            }
        }
    };

    async handleFileInput(target: any) {
        const files: FileList = target.files;
        this.fileErrorMessage = null;
        if (!files.length) {
            this.fileData = null;
            this.file = null;
        } else {
            const file = files.item(0);
            if (file.size > 1024 * 1024 * 10) {
                this.shakeInput();
                this.fileErrorMessage = 'Selected file was too large. (>10MB)';
                return;
            }
            try {
                this.fileData = await new Response(file).json();
                this.file = file;
            } catch (e) {
                this.shakeInput();
                this.fileData = null;
                this.file = null;
                this.fileErrorMessage =
                    'The selected file did not contain valid data.';
            }
        }
    }

    shakeInput() {
        this.shakeFileInput = false;
        requestAnimationFrame(() => (this.shakeFileInput = true));
    }
}
