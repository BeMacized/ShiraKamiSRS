import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
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
import { SetEntity } from '../../../models/set.model';
import { SetService } from '../../../services/set.service';
import { OperationStatus } from '../../../models/operation-status.model';
import { minPromiseDuration } from '../../../utils/promise-utils';
import { ServiceError } from '../../../models/service-error.model';
import { Modal } from '../../../utils/modal';

type Page = 'NAME' | 'UPDATING';

@Component({
    selector: 'app-edit-set-name-modal',
    templateUrl: './edit-set-name-modal.component.html',
    styleUrls: ['./edit-set-name-modal.component.scss'],
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
export class EditSetNameModalComponent
    extends Modal<SetEntity, SetEntity>
    implements OnInit {
    constructor(private setService: SetService) {
        super();
    }

    @ViewChild('nameInput') nameInput: ElementRef;
    page: Page = 'NAME';
    setName: string;
    updateStatus: OperationStatus = 'IDLE';
    errorMessage: string;
    set: SetEntity;

    get isSetNameValid() {
        return (
            this.setName &&
            this.setName.trim().length > 0 &&
            this.setName.trim().length <= 128
        );
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeDown($event) {
        this.close();
    }

    ngOnInit(): void {
        this.goToPage('NAME');
    }

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

    initModal(data: SetEntity | undefined) {
        if (!data) {
            console.warn(
                'Attempted to open EditSetNameModal without providing an existing set'
            );
            this.close();
            return;
        }
        this.set = data;
        this.setName = this.set.name;
    }

    async updateSet() {
        if (this.updateStatus === 'IN_PROGRESS') return;
        this.updateStatus = 'IN_PROGRESS';
        this.page = 'UPDATING';
        this.errorMessage = null;
        try {
            const set = await minPromiseDuration(
                this.setService.updateSetName(this.set.id, this.setName.trim()),
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
