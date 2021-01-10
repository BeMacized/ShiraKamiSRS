import {
    Component,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
} from '@angular/core';
import { Modal } from '../../../services/modal.service';
import { SetEntity } from '../../../models/set.model';
import { SetService } from '../../../services/set.service';
import { OperationStatus } from '../../../models/operation-status.model';
import { minPromiseDuration } from '../../../utils/promise-utils';
import { ServiceError } from '../../../models/service-error.model';
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

type Page = 'VERIFICATION' | 'DELETION';

@Component({
    selector: 'app-delete-set-modal',
    templateUrl: './delete-set-modal.component.html',
    styleUrls: ['./delete-set-modal.component.scss'],
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
export class DeleteSetModalComponent
    extends Modal<SetEntity, boolean>
    implements OnInit {
    constructor(private setService: SetService) {
        super();
    }

    @ViewChild('nameInput') nameInput: ElementRef;
    page: Page = 'VERIFICATION';
    setName: string;
    deletionStatus: OperationStatus = 'IDLE';
    errorMessage: string;
    set: SetEntity;

    get isSetNameValid() {
        return this.setName === this.set.name;
    }

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeDown($event) {
        this.close();
    }

    ngOnInit(): void {
        this.goToPage('VERIFICATION');
    }

    goToPage(page: Page) {
        setTimeout(() => {
            this.page = page;
            switch (page) {
                case 'VERIFICATION':
                    setTimeout(() => this.nameInput.nativeElement.focus(), 400);
                    break;
            }
        });
    }

    initModal(data: SetEntity | undefined) {
        if (!data) {
            console.warn(
                'Attempted to open DeketeSetModal without providing an existing set'
            );
            this.close();
            return;
        }
        this.set = data;
    }

    async deleteSet() {
        if (this.deletionStatus === 'IN_PROGRESS') return;
        this.deletionStatus = 'IN_PROGRESS';
        this.page = 'DELETION';
        this.errorMessage = null;
        try {
            await minPromiseDuration(
                this.setService.deleteSet(this.set.id),
                500
            );
            this.deletionStatus = 'SUCCESS';
            setTimeout(() => {
                this.emit(true);
                this.close();
            }, 1000);
        } catch (e) {
            this.deletionStatus = 'ERROR';
            switch (e instanceof ServiceError ? e.code : '') {
                case 'SERVICE_UNAVAILABLE':
                    this.errorMessage =
                        'Could not reach the server. Please verify your connection, or try again later.';
                    break;
                default:
                    this.errorMessage =
                        'An unknown error occurred while trying to remove the set.';
            }
        }
    }
}
